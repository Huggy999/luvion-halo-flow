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
import { CreateMenu } from "../components/CreateMenu";
import { InstallHint } from "../components/InstallHint";
import { UndoToast } from "../components/UndoToast";
import { STREAK_EVENT, useAppState } from "../lib/app";
import { haptic } from "../lib/haptics";


function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-xs text-center">
        <h1 className="t-screen text-ink">Page not found</h1>
        <p className="mt-2 t-body font-normal text-ink-2">
          This address does not exist or the section moved. Go back to Pulse.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-btn ring-on-solid bg-blue-btn px-5 text-sm font-bold text-white"
        >
          Go to Pulse
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
        <h1 className="t-screen text-ink">The data did not load</h1>
        <p className="mt-2 t-body font-normal text-ink-2">
          Cause: {error.message || "no response from the server"}. Try again.
        </p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-btn ring-on-solid bg-blue-btn px-5 text-sm font-bold text-white"
        >
          Try again
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
      { name: "theme-color", content: "#027EFC" },

      { title: "Luvion — structure with a halo" },
      {
        name: "description",
        content:
          "Luvion is a mobile space for personal and team work: hubs, a board, a focus timer and Lumi. Less chaos. More structure.",
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
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },

    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
  { to: "/", label: "Pulse", icon: Activity },
  { to: "/hubs", label: "Hubs", icon: Boxes },
  { to: "/day", label: "Today", icon: CalendarCheck },
  { to: "/lumi", label: "Lumi", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function TabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Main navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center"
    >
      <div
        className="shadow-float pointer-events-auto mx-3 mb-3 w-full max-w-[406px] rounded-[22px] border border-line bg-paper/95 px-1.5 py-1.5 backdrop-blur"
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
                    className="relative label-xs font-bold"
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

function StreakHaptics() {
  const { data } = useAppState();
  const enabled = data?.streaks_enabled ?? true;
  useEffect(() => {
    const onUp = () => {
      if (enabled) haptic([12, 40, 18]);
    };
    window.addEventListener(STREAK_EVENT, onUp);
    return () => window.removeEventListener(STREAK_EVENT, onUp);
  }, [enabled]);
  return null;
}


function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <StreakHaptics />
      <LiveRegion />
      <AppFrame />
    </QueryClientProvider>
  );
}

function AppFrame() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const screenKey = pathname.split("/").slice(0, 3).join("/");
  const { data: state } = useAppState();
  const welcome = state !== undefined && !state.onboarded && pathname === "/";
  const chrome = !welcome && pathname !== "/onboarding" && pathname !== "/auth";

  return (
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
      {chrome ? (
        <>
          <CreateMenu />
          <InstallHint />
          <UndoToast />
          <TabBar />
        </>
      ) : null}
    </div>
  );
}

