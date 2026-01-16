import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* ---------------- POST: Add Todo ---------------- */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { title } = await req.json();

  // ✅ validation
  if (!title || !title.trim()) {
    return NextResponse.json(
      { message: "Title is required" },
      { status: 400 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("todos")
    .insert({
      title: title.trim(),
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ todo: data }, { status: 201 });
}

/* ---------------- DELETE: Remove Todo ---------------- */
export async function DELETE(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // ✅ id validation
  if (!id) {
    return NextResponse.json(
      { message: "Todo id is required" },
      { status: 400 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
