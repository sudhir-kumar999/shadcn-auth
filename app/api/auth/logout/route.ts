import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// POST method add karo
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  const origin = new URL(req.url).origin;

  return NextResponse.redirect(new URL("/auth/login", origin));
}

// Ya dono methods support karo
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  const origin = new URL(req.url).origin;

  return NextResponse.redirect(new URL("/auth/login", origin));
}