import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getSession() decodes the JWT locally — no network call, ~5ms.
  // We intentionally never access session.user, which is wrapped in a Proxy
  // that logs a security warning on every property access. Instead we decode
  // app_metadata directly from the access token's JWT payload, which contains
  // the same claims and is signed by Supabase.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let role: string | undefined;
  let isAuthenticated = false;

  if (session?.access_token) {
    try {
      // JWT uses base64url (not standard base64) — must use Buffer, not atob()
      const payload = JSON.parse(
        Buffer.from(session.access_token.split(".")[1], "base64url").toString(),
      );
      isAuthenticated = true;
      role = payload.app_metadata?.role;
    } catch {
      // Malformed token — treat as unauthenticated
    }
  }

  const { pathname } = request.nextUrl;

  // Role-based access
  if (isAuthenticated) {
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(roleHomePath(role), request.url));
    }
    if (pathname.startsWith("/assistent") && role !== "assistent") {
      return NextResponse.redirect(new URL(roleHomePath(role), request.url));
    }
  }

  return supabaseResponse;
}

function roleHomePath(role: string | undefined) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "assistent") return "/assistent/dashboard";
  return "/login";
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
