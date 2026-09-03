import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getBilling } from "@/lib/billing.functions";
import { todayISO } from "@/lib/app";

export type Tier = "free" | "pro" | "team";

export type Billing = {
  tier: Tier;
  aiUsed: number;
  aiLimit: number;
  resetAt: string | null;
  subscriptionEnd: string | null;
  stripeConfigured: boolean;
  signedIn: boolean;
};

export const ANON_BILLING: Billing = {
  tier: "free",
  aiUsed: 0,
  aiLimit: 20,
  resetAt: null,
  subscriptionEnd: null,
  stripeConfigured: false,
  signedIn: false,
};

export const LIMITS: Record<Tier, { hubs: number | null; boards: number | null; ai: number }> = {
  free: { hubs: 3, boards: 1, ai: 20 },
  pro: { hubs: null, boards: null, ai: 1000 },
  team: { hubs: null, boards: null, ai: 1000 },
};

export const TIER_LABEL: Record<Tier, string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
};

/** Currency follows the user region: euro inside the EU, dollar elsewhere. */
export function regionCurrency(): "usd" | "eur" {
  const EU = new Set([
    "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
    "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO",
  ]);
  const locale =
    typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US";
  const region = new Intl.Locale(locale).maximize().region ?? "US";
  return EU.has(region) ? "eur" : "usd";
}

export function formatPrice(amountMinor: number, currency: "usd" | "eur") {
  const locale = typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}

export const PLAN_AMOUNT: Record<Tier, Record<"usd" | "eur", number>> = {
  free: { usd: 0, eur: 0 },
  pro: { usd: 900, eur: 900 },
  team: { usd: 1900, eur: 1900 },
};

export const PLANS: {
  key: Tier;
  name: string;
  summary: string;
  includes: string[];
}[] = [
  {
    key: "free",
    name: "Free",
    summary: "Personal structure at no cost",
    includes: [
      "Three hubs",
      "One board",
      "Twenty Lumi requests a month",
      "Unlimited docs",
      "The halo, the streak and the focus timer in full",
      "Export to JSON, Markdown and CSV",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    summary: "When the number of directions grows",
    includes: [
      "Unlimited hubs",
      "Unlimited boards",
      "A thousand Lumi requests a month",
      "Export to JSON, Markdown and CSV",
      "Dark theme with the gold glow",
      "The halo, the streak and the focus timer in full",
    ],
  },
  {
    key: "team",
    name: "Team",
    summary: "Shared work on the same directions",
    includes: [
      "Everything in Pro",
      "Shared hubs",
      "Member roles",
      "A shared team halo",
      "A thousand Lumi requests a month",
      "The halo, the streak and the focus timer in full",
    ],
  },
];

/* ---------- session ---------- */

export type SessionUser = { id: string; email: string } | null;

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const u = data.session?.user;
      setUser(u ? { id: u.id, email: u.email ?? "" } : null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email ?? "" } : null);
      setReady(true);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, ready };
}

export function useBilling() {
  const { user, ready } = useSessionUser();
  const query = useQuery({
    queryKey: ["billing", user?.id ?? "anon"],
    enabled: ready,
    queryFn: async (): Promise<Billing> => {
      if (!user) return ANON_BILLING;
      const res = await getBilling();
      return { ...res, signedIn: true } as Billing;
    },
  });
  return { billing: query.data ?? ANON_BILLING, ready: ready && !query.isLoading, refetch: query.refetch };
}

/* ---------- deferred boundary cards ---------- */

const KEY = "luvion:boundary-dismissed";

function readMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

/** A dismissed boundary card comes back no earlier than the next day. */
export function isBoundaryHidden(id: string) {
  return readMap()[id] === todayISO();
}

export function hideBoundaryForToday(id: string) {
  const map = readMap();
  map[id] = todayISO();
  window.localStorage.setItem(KEY, JSON.stringify(map));
}
