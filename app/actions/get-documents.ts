"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getDocuments() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}
