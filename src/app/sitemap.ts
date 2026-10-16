import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/** Публичные страницы портала. Программы сопровождения — динамические, не индексируются списком. */
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/courses", priority: 0.9, changeFrequency: "weekly" },
  { path: "/events/seminar", priority: 0.8, changeFrequency: "weekly" },
  { path: "/events/media", priority: 0.8, changeFrequency: "weekly" },
  { path: "/apply", priority: 0.7, changeFrequency: "monthly" },
  { path: "/info", priority: 0.5, changeFrequency: "monthly" },
  { path: "/muni", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
];

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return PAGES.map((page) => ({
    url: `${base}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
