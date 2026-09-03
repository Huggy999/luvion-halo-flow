/**
 * Service worker registration for offline reading. It never registers in dev,
 * in an iframe, in a Lovable preview host or when the URL carries ?sw=off; in
 * those cases a matching registration is removed instead.
 */
const SESSION_KEY = "luvion.first-session-done";
const PROMPT_KEY = "luvion.install-prompt-shown";

function refused() {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  if (window.top !== window.self) return true;
  const h = window.location.hostname;
  if (h.startsWith("id-preview--") || h.startsWith("preview--")) return true;
  if (h === "lovableproject.com" || h.endsWith(".lovableproject.com")) return true;
  if (h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com")) return true;
  if (h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterApp() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => (r.active?.scriptURL ?? r.waiting?.scriptURL ?? "").endsWith("/sw.js"))
      .map((r) => r.unregister()),
  );
}

export async function setupServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (refused()) {
    await unregisterApp();
    return;
  }
  const { registerSW } = await import("virtual:pwa-register");
  registerSW({ immediate: true });
}

/** The install hint waits for the first finished focus session, then shows once. */
export function markFirstSessionDone() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, "1");
  window.dispatchEvent(new CustomEvent("luvion:first-session"));
}

export function firstSessionDone() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_KEY) === "1";
}

export function installPromptShown() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(PROMPT_KEY) === "1";
}

export function markInstallPromptShown() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROMPT_KEY, "1");
}
