import { useEffect, useState } from "react";
import { onAnnounce } from "@/lib/app";

export function LiveRegion() {
  const [message, setMessage] = useState("");
  useEffect(() => onAnnounce(setMessage), []);
  return (
    <div aria-live="polite" className="sr-only">
      {message}
    </div>
  );
}
