import { useEffect } from "react";

type Props = {
  title: string;
  description?: string;
  image?: string | null;
  url?: string;
  type?: "website" | "article" | "profile";
};

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [k, v] = selector.replace(/[\[\]"]/g, "").split("=");
    el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export const SocialMeta = ({ title, description, image, url, type = "website" }: Props) => {
  useEffect(() => {
    const fullUrl = url || window.location.href;
    const resolvedImage = image || `${window.location.origin}/og-default.jpg`;
    const prevTitle = document.title;
    document.title = title;
    if (description) setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    if (description) setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", type);
    setMeta('meta[property="og:url"]', "content", fullUrl);
    setMeta('meta[property="og:image"]', "content", resolvedImage);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", title);
    if (description) setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", resolvedImage);
    setLink("canonical", fullUrl);
    return () => { document.title = prevTitle; };
  }, [title, description, image, url, type]);
  return null;
};
