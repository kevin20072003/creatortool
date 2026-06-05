import type { Metadata } from "next";
import React from "react";
import { siteUrl, type SettingMap } from "./settings";

type SeoInput = {
  title?: string | null;
  description?: string | null;
  path?: string;
  image?: string | null;
  settings?: SettingMap;
  type?: "website" | "article";
};

export function createMetadata(input: SeoInput): Metadata {
  const siteName = input.settings?.siteName || "CreatorTools.in";
  const title = input.title || input.settings?.globalTitle || `${siteName} - Free Creator Tools`;
  const description =
    input.description ||
    input.settings?.globalDescription ||
    "Free calculators and generators for YouTubers, editors, videographers, streamers, and content creators.";
  const url = siteUrl(input.path || "/");
  const image = input.image || input.settings?.ogImage || "/og-default.png";

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: ["YouTube tools", "video calculator", "creator tools", "thumbnail tools", "streaming tools"],
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: input.type || "website",
      images: [{ url: image.startsWith("http") ? image : siteUrl(image), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.startsWith("http") ? image : siteUrl(image)],
    },
    robots: input.settings?.robots || "index,follow",
  };
}

export function jsonLd(data: object) {
  return React.createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}
