import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();

  // 🔥 MAIN FIX: auto-detect site URL
  const origin = new URL(req.url).origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }

  // 🔥 Google consent page redirect
  return NextResponse.redirect(data.url);
}
