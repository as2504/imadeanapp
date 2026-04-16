import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  jsonLd?: Record<string, any>;
}

const DEFAULTS = {
  title: "imadeanapp (I Made An App) – Discover & Publish AI-Crafted Apps",
  description: "imadeanapp (I Made An App) is a curated platform to discover, publish, and showcase vibe-coded and AI-crafted applications.",
  image: "https://imadeanapp.com/logos/IMAAx512x512b.png",
};

const upsertMeta = (selector: string, attr: string, key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const SEO = ({ title, description, canonical, image, type = "website", jsonLd }: SEOProps) => {
  useEffect(() => {
    const finalTitle = title || DEFAULTS.title;
    const finalDesc = (description || DEFAULTS.description).slice(0, 160);
    const finalImage = image || DEFAULTS.image;
    const finalCanonical = canonical || (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "https://imadeanapp.com/");

    document.title = finalTitle;
    upsertMeta('meta[name="description"]', "name", "description", finalDesc);
    upsertLink("canonical", finalCanonical);

    upsertMeta('meta[property="og:title"]', "property", "og:title", finalTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", finalDesc);
    upsertMeta('meta[property="og:url"]', "property", "og:url", finalCanonical);
    upsertMeta('meta[property="og:image"]', "property", "og:image", finalImage);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);

    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", finalTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", finalDesc);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", finalImage);

    let ldEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      ldEl = document.createElement("script");
      ldEl.type = "application/ld+json";
      ldEl.setAttribute("data-seo-dynamic", "true");
      ldEl.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(ldEl);
    }
    return () => {
      if (ldEl && ldEl.parentNode) ldEl.parentNode.removeChild(ldEl);
    };
  }, [title, description, canonical, image, type, JSON.stringify(jsonLd)]);

  return null;
};

export default SEO;
