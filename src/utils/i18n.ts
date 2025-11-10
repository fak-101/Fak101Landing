import type { AstroGlobal } from 'astro';

export async function getTranslations(Astro: any, locale: string) {
  try {
    const translations = await import(`../i18n/${locale}.json`);
    return translations.default;
  } catch (error) {
    // Fallback to default locale if translation file not found
    const fallback = await import(`../i18n/en.json`);
    return fallback.default;
  }
}

export function t(translations: any, key: string) {
  return key.split('.').reduce((obj, k) => obj?.[k], translations) || key;
}
