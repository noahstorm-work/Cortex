import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const i18nResponse = handleI18nRouting(request);

  const supabaseResponse = await updateSession(request);

  if (i18nResponse?.status === 307 || i18nResponse?.status === 308) {
    return i18nResponse;
  }

  supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
    i18nResponse?.cookies.set(name, value);
  });

  return i18nResponse ?? supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
