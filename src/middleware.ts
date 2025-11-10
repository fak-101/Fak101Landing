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
  const [, first] = url.pathname.split("/");

  // If root or not a supported locale prefix, and not a file request, redirect to preferred locale
  const isFile = first?.includes(".");
  if ((url.pathname === "/" || (!SUPPORTED.includes(first as Lang) && !isFile)) ) {
    const lang = pickLang(context.request.headers.get("accept-language"));
    return context.redirect(`/${lang}/`, 302);
  }

  // If path starts with a supported lang, set it on locals for convenience
  if (SUPPORTED.includes(first as Lang)) {
    context.locals.lang = first as Lang;
  }

  return next();
});
