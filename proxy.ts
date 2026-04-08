import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

type UserRole = "CUSTOMER" | "OWNER" | "ADMIN";

export default async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  if (!token) {
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  const role = token.role as UserRole | undefined;

  if (nextUrl.pathname.startsWith("/dashboard/owner") && role !== "OWNER") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (nextUrl.pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/owner/:path*", "/dashboard/admin/:path*"],
};
