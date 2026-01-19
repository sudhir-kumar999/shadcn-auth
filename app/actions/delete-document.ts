"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseStorageServer } from "@/lib/supabase/storage-server";

export async function deleteDocument(id: string, filePath: string) {
  const supabase = await createSupabaseServerClient();

  // 🗑️ delete from storage
  await supabaseStorageServer.storage
    .from("documents")
    .remove([filePath]);

  // 🗑️ delete from DB
  await supabase.from("documents").delete().eq("id", id);
}
