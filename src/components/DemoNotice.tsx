import { Link } from "@tanstack/react-router";
import { useSessionUser } from "@/lib/billing";

/**
 * Visitors read a shared demo space. Nothing can be changed until they sign in,
 * so the app says so once, at the top, instead of failing on the first tap.
 */
export function DemoNotice() {
  const { user, ready } = useSessionUser();
  if (!ready || user) return null;

  return (
    <div className="surface-sunk mb-4 flex items-center justify-between gap-3 rounded-btn px-4 py-3">
      <p className="t-aux text-ink-2">Demo space. Sign in to keep your own tasks.</p>
      <Link
        to="/auth"
        className="shrink-0 rounded-btn bg-[var(--blue-btn)] px-3 py-2 t-aux font-bold text-white"
      >
        Sign in
      </Link>
    </div>
  );
}
