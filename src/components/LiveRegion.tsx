import { useEffect, useState } from "react";
import { onAnnounce } from "@/lib/app";

export function LiveRegion() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    const off = onAnnounce(setMessage);
    return () => {
      off();
    };
  }, []);
  return (
    <div aria-live="polite" className="sr-only">
      {message}
    </div>
  );
}
