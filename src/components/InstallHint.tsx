import { useEffect, useState } from "react";
import {
  firstSessionDone,
  installPromptShown,
  markInstallPromptShown,
  setupServiceWorker,
} from "@/lib/pwa";

type InstallEvent = Event & { prompt: () => Promise<void> };

/**
 * The Add to Home Screen hint appears once, and only after the first finished
 * focus session. It never blocks the screen and can be dismissed.
 */
export function InstallHint() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);

  useEffect(() => {
    void setupServiceWorker();

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const check = () => {
      if (firstSessionDone() && !installPromptShown()) setVisible(true);
    };
    check();
    window.addEventListener("luvion:first-session", check);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("luvion:first-session", check);
    };
  }, []);

  if (!visible) return null;

  const close = () => {
    markInstallPromptShown();
    setVisible(false);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center">
      <div
        className="card pointer-events-auto mx-3 w-full max-w-[406px] p-4"
        style={{ marginBottom: "calc(96px + env(safe-area-inset-bottom))" }}
        role="status"
      >
        <p className="text-[14px] text-ink">
          Luvion can live on your home screen and open without a browser bar. Your tasks stay
          readable offline.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={async () => {
              if (deferred) await deferred.prompt();
              close();
            }}
            className="min-h-11 rounded-btn bg-blue-btn text-sm font-bold text-white"
          >
            Add to home screen
          </button>
          <button
            type="button"
            onClick={close}
            className="min-h-11 rounded-btn border border-line-2 text-sm font-bold text-ink"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
