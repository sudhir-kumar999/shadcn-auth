import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no_code", req.url));
  }

  const supabase = await createSupabaseServerClient();

  // Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/auth/login?error=auth_failed", req.url));
  }

  // Check user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_banned")
    .eq("id", data.user.id)
    .single();

  // If banned, logout and redirect
  if (profile?.is_banned) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/auth/login?error=banned", req.url)
    );
  }

  // Redirect based on role
  if (profile?.role === "superadmin") {
    return NextResponse.redirect(new URL("/superadmin", req.url));
  } else if (profile?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  } else {
    return NextResponse.redirect(new URL("/todo", req.url));
  }
}