import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // allow static
  if (
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // allow login
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // allow auth api
  if (pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  const session = request.cookies.get("session");
  const role = request.cookies.get("role")?.value;

  // not login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ================= RBAC =================

  if (role === "DEFLASHING") {
    // hanya boleh dashboard/deflashing
    if (!pathname.startsWith("/dashboard/deflashing")) {
      return NextResponse.redirect(
        new URL("/dashboard/deflashing", request.url)
      );
    }
  }

  // prevent login reopen
  if (session && pathname === "/login") {
    if (role === "DEFLASHING") {
      return NextResponse.redirect(
        new URL("/dashboard/deflashing", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};