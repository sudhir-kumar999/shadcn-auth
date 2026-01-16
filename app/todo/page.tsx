import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import TodoClient from "./todo-client";

export default async function TodoPage() {
  const supabase = await createSupabaseServerClient();

  // 🔒 auth check
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth/login");
  }

  // 📦 fetch todos - SIRF APNE TODOS
  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", data.user.id) // ✅ YEH ADD KARO
    .order("created_at", { ascending: false });

  return (
    <div className="flex justify-center pt-10">
      <TodoClient
        initialTodos={todos || []}
        userId={data.user.id}
      />
    </div>
  );
}