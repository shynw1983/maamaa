import type { Locale } from "@/data/locales";

export type BrandSiteSection = {
  id: string;
  brandId: string;
  pageKey: string;
  sectionKey: string;
  sectionType: string;
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  actionLabel: string;
  actionUrl: string;
  tags: string[];
  titleDisplayNames?: Record<string, string>;
  subtitleDisplayNames?: Record<string, string>;
  bodyDisplayNames?: Record<string, string>;
  actionLabelDisplayNames?: Record<string, string>;
  tagDisplayNames?: Record<string, Record<string, string>>;
};

const osBaseUrl =
  process.env.FOUNDR1_OS_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_FOUNDR1_OS_PUBLIC_BASE_URL ||
  "https://foundr1.jp";

const normalizeUrl = (url = "") => String(url || "").replace(/\/$/, "");

function localizeSection(section: BrandSiteSection, language: Locale): BrandSiteSection {
  if (language === "ja") return section;
  const tagDisplayNames = section.tagDisplayNames || {};
  return {
    ...section,
    title: section.titleDisplayNames?.[language] || section.title,
    subtitle: section.subtitleDisplayNames?.[language] || section.subtitle,
    body: section.bodyDisplayNames?.[language] || section.body,
    actionLabel: section.actionLabelDisplayNames?.[language] || section.actionLabel,
    tags: Array.isArray(section.tags)
      ? section.tags.map((tag, index) => tagDisplayNames[index]?.[language] || tag)
      : section.tags,
  };
}

export async function getBrandSiteSections(brand = "maamaa", language: Locale = "ja") {
  const baseUrl = normalizeUrl(osBaseUrl);
  if (!baseUrl) return [] as BrandSiteSection[];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(`${baseUrl}/api/public/brand-sites?brand=${encodeURIComponent(brand)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return [] as BrandSiteSection[];
    const body = (await response.json()) as { sections?: BrandSiteSection[] };
    const sections = Array.isArray(body.sections) ? body.sections : [];
    return sections.map((section) => localizeSection(section, language));
  } catch {
    return [] as BrandSiteSection[];
  } finally {
    clearTimeout(timeout);
  }
}

export function findBrandSiteSection(sections: BrandSiteSection[], sectionKey: string) {
  return sections.find((section) => section.sectionKey === sectionKey);
}
