"use client";

import { NextIntlClientProvider } from "next-intl";
import { useMessages } from "next-intl";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const messages = useMessages();
  if (!messages) {
    return <>{children}</>;
  }
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
