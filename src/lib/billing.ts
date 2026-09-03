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

export const PLANS: {
  key: Tier;
  name: string;
  price: string;
  summary: string;
  includes: string[];
}[] = [
  {
    key: "free",
    name: "Free",
    price: "0 ₽",
    summary: "Личный порядок без оплаты",
    includes: [
      "Три хаба",
      "Одна доска",
      "Двадцать запросов к Луми в месяц",
      "Документы без ограничений",
      "Серия, нимб и фокус-таймер целиком",
      "Экспорт в Markdown и CSV",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "690 ₽ в месяц",
    summary: "Когда направлений становится больше",
    includes: [
      "Хабы без ограничений",
      "Доски без ограничений",
      "Тысяча запросов к Луми в месяц",
      "Экспорт в Markdown и CSV",
      "Тёмная тема с золотым свечением",
      "Серия, нимб и фокус-таймер целиком",
    ],
  },
  {
    key: "team",
    name: "Team",
    price: "1490 ₽ в месяц",
    summary: "Общая работа над одними направлениями",
    includes: [
      "Всё из Pro",
      "Совместные хабы",
      "Роли участников",
      "Общий нимб команды",
      "Тысяча запросов к Луми в месяц",
      "Серия, нимб и фокус-таймер целиком",
    ],
  },
];

/* ---------- сессия ---------- */

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

/* ---------- отложенные карточки границ ---------- */

const KEY = "luvion:boundary-dismissed";

function readMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

/** Карточка границы возвращается не раньше следующего дня после отклонения. */
export function isBoundaryHidden(id: string) {
  return readMap()[id] === todayISO();
}

export function hideBoundaryForToday(id: string) {
  const map = readMap();
  map[id] = todayISO();
  window.localStorage.setItem(KEY, JSON.stringify(map));
}
