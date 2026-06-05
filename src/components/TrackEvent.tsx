"use client";

import { useEffect } from "react";

export function TrackEvent({ type, path, entitySlug }: { type: string; path: string; entitySlug?: string }) {
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, path, entitySlug, referrer: document.referrer }),
    }).catch(() => {});
  }, [type, path, entitySlug]);

  return null;
}
