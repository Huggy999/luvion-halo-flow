import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type Tier = "free" | "pro" | "team";

export const AI_LIMIT: Record<Tier, number> = { free: 20, pro: 1000, team: 1000 };
export const HUB_LIMIT: Record<Tier, number | null> = { free: 3, pro: null, team: null };
export const BOARD_LIMIT: Record<Tier, number | null> = { free: 1, pro: null, team: null };

export type SubscriberRow = {
  user_id: string;
  email: string;
  tier: Tier;
  stripe_customer_id: string | null;
  subscription_end: string | null;
  ai_calls_used: number;
  ai_calls_reset_at: string;
};

function nextMonthISO() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

/** Возвращает строку подписчика, создаёт её при первом обращении и раз в месяц обнуляет счётчик. */
export async function loadSubscriber(userId: string, email: string): Promise<SubscriberRow> {
  const { data } = await supabaseAdmin
    .from("subscribers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let row = data as SubscriberRow | null;

  if (!row) {
    const created = await supabaseAdmin
      .from("subscribers")
      .insert({ user_id: userId, email })
      .select("*")
      .single();
    if (created.error) throw new Error(created.error.message);
    row = created.data as unknown as SubscriberRow;
  }

  // Срок подписки истёк: тариф возвращается к Free, данные остаются нетронутыми.
  if (row.tier !== "free" && row.subscription_end && new Date(row.subscription_end) < new Date()) {
    const patched = await supabaseAdmin
      .from("subscribers")
      .update({ tier: "free" })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (!patched.error) row = patched.data as unknown as SubscriberRow;
  }

  // Месячный сброс счётчика запросов к Луми выполняется на сервере.
  if (new Date(row.ai_calls_reset_at) < new Date()) {
    const patched = await supabaseAdmin
      .from("subscribers")
      .update({ ai_calls_used: 0, ai_calls_reset_at: nextMonthISO() })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (!patched.error) row = patched.data as unknown as SubscriberRow;
  }

  return row;
}

/** Увеличивает счётчик запросов на сервере. Возвращает false, если лимит исчерпан. */
export async function consumeAiCall(userId: string, email: string) {
  const row = await loadSubscriber(userId, email);
  const limit = AI_LIMIT[row.tier];
  if (row.ai_calls_used >= limit) {
    return { allowed: false as const, used: row.ai_calls_used, limit, tier: row.tier };
  }
  const next = row.ai_calls_used + 1;
  await supabaseAdmin.from("subscribers").update({ ai_calls_used: next }).eq("user_id", userId);
  return { allowed: true as const, used: next, limit, tier: row.tier };
}

export async function setTier(
  userId: string,
  patch: { tier?: Tier; stripe_customer_id?: string | null; subscription_end?: string | null },
) {
  await supabaseAdmin.from("subscribers").update(patch).eq("user_id", userId);
}

/* ---------- Stripe ---------- */

export const PRICE: Record<"pro" | "team", { amount: number; name: string }> = {
  pro: { amount: 69000, name: "Luvion Pro" },
  team: { amount: 149000, name: "Luvion Team" },
};

export function stripeKey() {
  return process.env["STRIPE_SECRET_KEY"] ?? "";
}

export async function stripeCall(
  path: string,
  body?: Record<string, string>,
  method: "GET" | "POST" = "POST",
) {
  const key = stripeKey();
  const qs = body && method === "GET" ? `?${new URLSearchParams(body).toString()}` : "";
  const res = await fetch(`https://api.stripe.com/v1/${path}${qs}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    ...(method === "POST" && body
      ? { body: new URLSearchParams(body).toString() }
      : {}),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const err = json["error"] as { message?: string } | undefined;
    throw new Error(err?.message ?? `Stripe ответил кодом ${res.status}`);
  }
  return json;
}

export async function findOrCreateCustomer(email: string, userId: string) {
  const found = (await stripeCall("customers", { email, limit: "1" }, "GET")) as {
    data?: { id: string }[];
  };
  if (found.data && found.data.length > 0) return found.data[0]!.id;
  const created = (await stripeCall("customers", {
    email,
    "metadata[user_id]": userId,
  })) as { id: string };
  return created.id;
}
