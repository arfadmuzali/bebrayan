import { getRequestConfig } from "next-intl/server";
import { getUserLocale, setUserLocale } from "./locale";
import { defaultLocale, Locale, locales } from "./config";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  let locale: string = await getUserLocale();

  if (!locales.includes(locale as unknown as Locale)) {
    locale = defaultLocale;
    await setUserLocale(defaultLocale);
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
