import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check } from "lucide-react";
import { Lumi } from "@/components/Lumi";
import { PLANS, TIER_LABEL, useBilling, type Tier } from "@/lib/billing";
import { checkSubscription, createCheckout, customerPortal } from "@/lib/billing.functions";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Тарифы — Luvion" },
      {
        name: "description",
        content:
          "Тарифы Luvion: Free, Pro и Team. Серия, нимб и фокус-таймер бесплатны всегда, экспорт доступен на любом тарифе.",
      },
      { property: "og:title", content: "Тарифы — Luvion" },
      {
        property: "og:description",
        content: "Что входит в Free, Pro и Team и что происходит при отмене подписки.",
      },
    ],
  }),
  component: PricingScreen,
});

function PricingScreen() {
  const { billing, refetch } = useBilling();
  const checkout = useServerFn(createCheckout);
  const portal = useServerFn(customerPortal);
  const check = useServerFn(checkSubscription);
  const [busy, setBusy] = useState<Tier | "portal" | "check" | null>(null);
  const [message, setMessage] = useState("");

  const start = async (tier: "pro" | "team") => {
    setMessage("");
    if (!billing.signedIn) {
      setMessage("Сначала войдите: подписку нужно привязать к аккаунту.");
      return;
    }
    setBusy(tier);
    try {
      const res = await checkout({ data: { tier } });
      if (res.url) window.location.href = res.url;
      else setMessage(res.message);
    } catch (e) {
      setMessage(`Оплата не открылась: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="cascade space-y-4">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <Lumi variant="idle" size={52} className="shrink-0" />
        <div className="min-w-0">
          <p className="label-xs text-ink-3">Текущий тариф · {TIER_LABEL[billing.tier]}</p>
          <h1 className="screen-title text-[26px] leading-tight text-ink">Тарифы</h1>
        </div>
      </header>

      <p className="px-1 text-[14px] leading-relaxed text-ink-2">
        Серия, нимб и фокус-таймер бесплатны на любом тарифе и никогда не станут платными.
        Платные границы касаются только количества хабов, досок и запросов к Луми.
      </p>

      {!billing.stripeConfigured ? (
        <p className="card p-4 text-[14px] leading-relaxed text-ink-2">
          Оплата ещё не подключена: владелец приложения пока не добавил ключ Stripe. Экран
          тарифов работает, а кнопка оплаты сообщит об этом честно вместо ошибки.
        </p>
      ) : null}

      {message ? (
        <p className="card p-4 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          {message}
        </p>
      ) : null}

      <div className="space-y-3">
        {PLANS.map((plan) => {
          const current = billing.tier === plan.key;
          return (
            <section
              key={plan.key}
              aria-label={`Тариф ${plan.name}`}
              className="card p-4"
              style={
                current
                  ? { borderColor: "var(--blue)", boxShadow: "var(--shadow-float)" }
                  : undefined
              }
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <h2 className="screen-title text-[20px] text-ink">{plan.name}</h2>
                  <p className="mt-1 text-[13px] text-ink-2">{plan.summary}</p>
                </div>
                {current ? (
                  <span
                    className="shrink-0 rounded-chip px-3 py-1 text-[12px] font-bold"
                    style={{
                      background: "color-mix(in oklab, var(--blue) 12%, transparent)",
                      color: "var(--blue-ink)",
                    }}
                  >
                    Ваш тариф
                  </span>
                ) : null}
              </div>

              <p className="num mt-3 text-xl font-bold text-ink">{plan.price}</p>

              <ul className="mt-3 space-y-2">
                {plan.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[14px] text-ink">
                    <Check
                      size={16}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0"
                      style={{ color: "var(--mint-tx)" }}
                    />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>

              {plan.key !== "free" && !current ? (
                <button
                  type="button"
                  disabled={busy === plan.key}
                  onClick={() => start(plan.key as "pro" | "team")}
                  className="mt-4 min-h-12 w-full rounded-btn bg-blue-btn text-sm font-bold text-white disabled:opacity-60"
                >
                  {busy === plan.key ? "Открываем оплату" : `Перейти на ${plan.name}`}
                </button>
              ) : null}
            </section>
          );
        })}
      </div>

      <section className="card p-4" aria-label="Что происходит при отмене">
        <h2 className="text-base font-extrabold text-ink">Что происходит при отмене</h2>
        <ul className="mt-2 space-y-2 text-[14px] leading-relaxed text-ink-2">
          <li>Данные остаются полностью читаемыми навсегда.</li>
          <li>
            Экспорт в Markdown и CSV работает всегда, включая просроченную подписку.
          </li>
          <li>
            Ограничивается только создание нового сверх лимитов и запросы к Луми.
            Существующие хабы, доски и документы открываются и редактируются.
          </li>
          <li>
            Отписка делается здесь же, в два нажатия: кнопка ниже открывает управление
            подпиской. Через поддержку писать не нужно.
          </li>
        </ul>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy === "portal"}
            onClick={async () => {
              setMessage("");
              if (!billing.signedIn) {
                setMessage("Войдите, чтобы открыть управление подпиской.");
                return;
              }
              setBusy("portal");
              try {
                const res = await portal();
                if (res.url) window.location.href = res.url;
                else setMessage(res.message);
              } catch (e) {
                setMessage(`Не открылось: ${(e as Error).message}`);
              } finally {
                setBusy(null);
              }
            }}
            className="min-h-11 rounded-btn border border-line-2 text-sm font-bold"
            style={{ color: "var(--blue-ink)" }}
          >
            Управление подпиской
          </button>
          <button
            type="button"
            disabled={busy === "check"}
            onClick={async () => {
              setMessage("");
              if (!billing.signedIn) {
                setMessage("Войдите, чтобы проверить подписку.");
                return;
              }
              setBusy("check");
              try {
                const res = await check();
                await refetch();
                setMessage(res.message || `Актуальный тариф: ${TIER_LABEL[res.tier as Tier]}.`);
              } catch (e) {
                setMessage(`Проверка не удалась: ${(e as Error).message}`);
              } finally {
                setBusy(null);
              }
            }}
            className="min-h-11 rounded-btn border border-line-2 text-sm font-bold"
            style={{ color: "var(--blue-ink)" }}
          >
            Проверить подписку
          </button>
        </div>
      </section>

      {!billing.signedIn ? (
        <p className="px-1 text-[13px] text-ink-2">
          Подписка привязывается к аккаунту.{" "}
          <Link to="/auth" style={{ color: "var(--blue-ink)" }}>
            Войти или создать аккаунт
          </Link>
        </p>
      ) : null}
    </div>
  );
}
