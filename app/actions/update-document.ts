"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateDocument(id: string, text: string) {
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("documents")
    .update({ extracted_text: text })
    .eq("id", id);
}
