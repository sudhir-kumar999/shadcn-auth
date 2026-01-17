import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  /* ================= AUTH USER ================= */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* ================= NOT LOGGED IN ================= */
  if (!user) {
    // Redirect to login if accessing protected routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/todo")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Allow access to public routes (login, signup, home, etc.)
    return response;
  }

  /* ================= LOGGED IN USER ================= */
  if (user) {
    // 🔥 NEW: Redirect logged-in users away from auth pages
    if (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Fetch user profile for additional checks
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_banned, role")
      .eq("id", user.id)
      .single();

    /* ===== BANNED USER ===== */
    if (profile?.is_banned) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL("/login?error=banned", request.url)
      );
    }

    /* ===== ADMIN / SUPERADMIN GUARD ===== */
    if (pathname.startsWith("/admin")) {
      if (profile?.role !== "admin" && profile?.role !== "superadmin") {
        return NextResponse.redirect(
          new URL("/dashboard", request.url)
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};