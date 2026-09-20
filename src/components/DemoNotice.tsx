import { Link } from "@tanstack/react-router";
import { useSessionUser } from "@/lib/billing";

/**
 * Tasks, hubs and notes belong to an account, so a signed-out visitor sees an
 * empty app. The notice says why, once, at the top of every screen.
 */
export function DemoNotice() {
  const { user, ready } = useSessionUser();
  if (!ready || user) return null;

  return (
    <div className="surface-sunk mb-4 flex items-center justify-between gap-3 rounded-btn px-4 py-3">
      <p className="t-aux text-ink-2">You are signed out. Sign in to see your own space.</p>
      <Link
        to="/auth"
        className="shrink-0 rounded-btn bg-[var(--blue-btn)] px-3 py-2 t-aux font-bold text-white"
      >
        Sign in
      </Link>
    </div>
  );
}
