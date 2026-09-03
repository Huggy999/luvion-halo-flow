import { useEffect, useState } from "react";

/** Returns true only when `active` has stayed true for longer than `delay` ms. */
export function useDelayedFlag(active: boolean, delay = 150) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const t = window.setTimeout(() => setShown(true), delay);
    return () => window.clearTimeout(t);
  }, [active, delay]);

  return shown && active;
}
