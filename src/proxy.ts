import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin pages only (see `config.matcher`; never the website, /api or static files).
 *
 * Someone opening an admin page with no sign-in cookie is sent to the sign-in
 * page, which then brings them back to the page they asked for. This only looks
 * for the cookie: whether a sign-in is still good is checked on the server by
 * every admin page, action and API route (src/lib/admin/auth.ts), never here.
 *
 * Other admin requests go on with the page's address in a header, so a page that
 * finds the sign-in has ended (signed out elsewhere, or the password changed) can
 * also send the person back to it after they sign in again.
 */

/** The same names as in src/lib/admin/auth.ts. */
const SESSION_COOKIE = "sartorial_admin";
const PATH_HEADER = "x-sartorial-admin-path";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) return NextResponse.next();

  const query = new URLSearchParams(searchParams);
  query.delete("_rsc"); // the router's own marker, not part of the page's address
  const search = query.toString();
  const here = `${pathname}${search ? `?${search}` : ""}`;
  // Only a plain path inside the admin is passed on (signing in checks it again).
  const safe = here.length <= 1000 && !here.includes("//") && !here.includes("\\");

  if (!request.cookies.has(SESSION_COOKIE) && (request.method === "GET" || request.method === "HEAD")) {
    const login = new URL("/admin/login", request.url);
    if (safe && here !== "/admin") login.searchParams.set("next", here);
    return NextResponse.redirect(login);
  }

  const headers = new Headers(request.headers);
  if (safe) headers.set(PATH_HEADER, here);
  else headers.delete(PATH_HEADER);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
