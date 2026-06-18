import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const currentLocale = await requestLocale;
  const locale = hasLocale(routing.locales, currentLocale) ? currentLocale : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
