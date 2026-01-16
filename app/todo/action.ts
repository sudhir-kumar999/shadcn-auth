"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/* ================= ADD TODO ================= */
export async function addTodoAction(title: string) {
  if (!title || !title.trim()) {
    throw new Error("Title is required");
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("todos").insert({
    title: title.trim(),
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  // 🔄 refresh SSR data
  revalidatePath("/todo");
}

/* ================= DELETE TODO ================= */
export async function deleteTodoAction(id: string) {
  if (!id) {
    throw new Error("Todo id is required");
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/todo");
}

/* ================= UPDATE TODO ================= */
export async function updateTodoAction(id: string, title: string) {
  if (!id) {
    throw new Error("Todo id is required");
  }

  if (!title || !title.trim()) {
    throw new Error("Title cannot be empty");
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("todos")
    .update({ title: title.trim() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/todo");

  return { success: true };
}
