"use client";

import { useMemo, useState } from "react";
import { ToolCard } from "./ToolCard";

type ToolItem = {
  name: string;
  slug: string;
  description: string;
  category?: string | null;
  featured?: boolean;
  popular?: boolean;
  iconName?: string | null;
};

export function SearchTools({ tools }: { tools: ToolItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const value = query.toLowerCase().trim();
    if (!value) return tools;
    return tools.filter((tool) => `${tool.name} ${tool.description} ${tool.category || ""}`.toLowerCase().includes(value));
  }, [query, tools]);

  function logSearch(value: string) {
    const q = value.trim();
    if (q.length < 2) return;
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, results: filtered.length }),
    }).catch(() => {});
  }

  return (
    <div className="grid gap-6">
      <div className="sticky top-16 z-30 rounded-none border-y border-[var(--border)] bg-[var(--background)] py-3 md:static md:border-0 md:bg-transparent md:py-0">
        <label className="label">
          Search creator tools
          <input
            className="input"
            value={query}
            onBlur={(event) => logSearch(event.target.value)}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search storage, bitrate, subtitles, thumbnails..."
          />
        </label>
      </div>
      <div className="grid-auto">
        {filtered.map((tool) => (
          <ToolCard key={tool.slug} {...tool} />
        ))}
      </div>
      {!filtered.length ? <p className="card p-6 text-center muted">No tools found. Try a broader creator keyword.</p> : null}
    </div>
  );
}
