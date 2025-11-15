import { defineMiddleware } from "astro:middleware";

const SUPPORTED = ["en", "es"] as const;

type Lang = typeof SUPPORTED[number];

function pickLang(acceptLanguage?: string | null): Lang {
  if (!acceptLanguage) return "en";
  const lower = acceptLanguage.toLowerCase();
  if (lower.includes("es")) return "es";
  if (lower.includes("en")) return "en";
  return "en";
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  const [, first] = pathname.split("/");

  // Skip middleware for static assets, API routes, and files with extensions
  const hasExtension = pathname.includes(".") && !pathname.endsWith("/");
  const isStaticAsset = pathname.startsWith("/_astro/") || 
                        pathname.startsWith("/src/") ||
                        pathname.startsWith("/favicon") ||
                        pathname.startsWith("/api/");
  
  if (isStaticAsset || hasExtension) {
    return next();
  }

  // If root path, redirect to preferred locale
  if (pathname === "/" || pathname === "") {
    const lang = pickLang(context.request.headers.get("accept-language"));
    return context.redirect(`/${lang}/`, 307);
  }

  // If path doesn't start with a supported locale, redirect to preferred locale
  if (!SUPPORTED.includes(first as Lang)) {
    const lang = pickLang(context.request.headers.get("accept-language"));
    return context.redirect(`/${lang}${pathname}`, 307);
  }

  // If path starts with a supported lang, set it on locals for convenience
  if (SUPPORTED.includes(first as Lang)) {
    context.locals.lang = first as Lang;
  }

  return next();
});
