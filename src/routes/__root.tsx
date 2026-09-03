import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Activity, Boxes, CalendarCheck, Sparkles, User } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LiveRegion } from "../components/LiveRegion";
import { useAppState } from "../lib/app";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-xs text-center">
        <h1 className="screen-title text-3xl text-ink">Страница не найдена</h1>
        <p className="mt-2 text-sm text-ink-2">
          Адрес не существует или раздел перенесён. Вернитесь на Пульс.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-btn bg-blue-btn px-5 text-sm font-bold text-white"
        >
          На Пульс
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-xs text-center">
        <h1 className="screen-title text-2xl text-ink">Данные не загрузились</h1>
        <p className="mt-2 text-sm text-ink-2">
          Причина: {error.message || "нет ответа от сервера"}. Повторите попытку.
        </p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-btn bg-blue-btn px-5 text-sm font-bold text-white"
        >
          Повторить
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "Luvion — продуктивность с нимбом" },
      {
        name: "description",
        content:
          "Luvion — мобильное пространство для личных и командных задач: хабы, доска, фокус-таймер и помощник Луми.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Unbounded:wght@300;700&family=Manrope:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const TABS = [
  { to: "/", label: "Пульс", icon: Activity },
  { to: "/hubs", label: "Хабы", icon: Boxes },
  { to: "/day", label: "Мой день", icon: CalendarCheck },
  { to: "/lumi", label: "Луми", icon: Sparkles },
  { to: "/profile", label: "Профиль", icon: User },
] as const;

function TabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Основная навигация"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center"
    >
      <div
        className="pointer-events-auto mx-3 mb-3 w-full max-w-[406px] rounded-[22px] border border-line bg-paper/95 px-1.5 py-1.5 backdrop-blur"
        style={{
          boxShadow: "var(--shadow-float)",
          marginBottom: "calc(12px + env(safe-area-inset-bottom))",
        }}
      >
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => {
            const active =
              tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
            const Icon = tab.icon;
            return (
              <li key={tab.to}>
                <Link
                  to={tab.to}
                  className="relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[16px] px-1 py-1.5"
                  aria-current={active ? "page" : undefined}
                >
                  {active ? (
                    <span
                      className="bloom absolute inset-0 rounded-[16px]"
                      style={{ background: "color-mix(in oklab, var(--blue) 12%, transparent)" }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.4 : 1.9}
                    className="relative"
                    style={{ color: active ? "var(--blue-ink)" : "var(--ink-3)" }}
                    aria-hidden="true"
                  />
                  <span
                    className="relative text-[11px] font-bold"
                    style={{ color: active ? "var(--blue-ink)" : "var(--ink-3)" }}
                  >
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function ThemeSync() {
  const { data } = useAppState();
  const theme = data?.theme ?? "light";
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const screenKey = pathname.split("/").slice(0, 3).join("/");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <LiveRegion />
      <div id="app-shell" className="min-h-dvh bg-bg">
        <div className="mx-auto w-full max-w-[430px] bg-bg">
          <main
            key={screenKey}
            className="px-4 pt-6"
            style={{ paddingBottom: "calc(104px + env(safe-area-inset-bottom))" }}
          >
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
        </div>
        <TabBar />
      </div>
    </QueryClientProvider>
  );
}
