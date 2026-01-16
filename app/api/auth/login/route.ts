import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const supabase = await createSupabaseServerClient();

    // Sign in user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get user profile with role and ban status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_banned")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { message: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    // Check if user is banned
    if (profile?.is_banned) {
      // Logout banned user
      await supabase.auth.signOut();
      return NextResponse.json(
        { message: "Your account has been banned" },
        { status: 403 }
      );
    }

    // Return role for redirect
    return NextResponse.json({
      success: true,
      role: profile?.role || "user",
      is_banned: profile?.is_banned || false,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}