import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, isBanned } = await req.json();

  // Prevent banning yourself
  if (userId === user.id) {
    return NextResponse.json({ error: "Cannot ban yourself" }, { status: 400 });
  }

  // Prevent banning superadmin
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (targetUser?.role === "superadmin") {
    return NextResponse.json({ error: "Cannot ban superadmin" }, { status: 403 });
  }

  // Update ban status
  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: isBanned })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}