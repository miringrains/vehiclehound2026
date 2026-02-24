import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const STOREFRONT_HOST = "vhlist.com";
const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "app", "mail", "smtp", "ftp", "ns1", "ns2"]);

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const bare = hostname.split(":")[0];

  if (bare === STOREFRONT_HOST) {
    const url = request.nextUrl.clone();
    url.pathname = "/s-landing";
    return NextResponse.rewrite(url);
  }

  if (bare.endsWith(`.${STOREFRONT_HOST}`)) {
    const sub = bare.replace(`.${STOREFRONT_HOST}`, "");
    if (!sub || RESERVED_SUBDOMAINS.has(sub)) {
      const url = request.nextUrl.clone();
      url.pathname = "/s-landing";
      return NextResponse.rewrite(url);
    }
    const { pathname } = request.nextUrl;
    if (pathname.startsWith(`/s/${sub}`)) {
      return NextResponse.rewrite(request.nextUrl);
    }
    const url = request.nextUrl.clone();
    url.pathname = `/s/${sub}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logos/|fonts/|widgets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css)$).*)",
  ],
};
