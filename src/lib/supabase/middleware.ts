import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "arete_session_id";

/**
 * Refreshes the Supabase Auth session on every request, ensures
 * every visitor has a guest session_id cookie (used to scope cart
 * and wishlist rows), and protects the /admin/* area.
 * Unauthenticated visitors trying to reach any /admin route (other
 * than /admin/login) are redirected to the login page.
 *
 * Setting the session_id cookie here — rather than only in the
 * cart/wishlist Route Handlers — guarantees it exists *before* any
 * Server Component runs, since Server Components can only read
 * cookies, not write them.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);
  const sessionId = hasSessionCookie
    ? request.cookies.get(SESSION_COOKIE)!.value
    : crypto.randomUUID();

  if (!hasSessionCookie) {
    request.cookies.set(SESSION_COOKIE, sessionId);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("[middleware] getUser error:", error.message);
    }
    user = data.user;
  } catch (err) {
    console.error("[middleware] getUser threw:", err);
  }

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  console.log(
    `[middleware] path=${pathname} isAdminRoute=${isAdminRoute} isLoginRoute=${isLoginRoute} hasUser=${!!user}`
  );

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    if (!hasSessionCookie) {
      redirectResponse.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
    return redirectResponse;
  }

  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (!hasSessionCookie) {
    supabaseResponse.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return supabaseResponse;
}
