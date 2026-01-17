// app/todo/page.tsx

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import TodoClient from "./todo-client";

type Todo = {
  id: string;
  task_id: string;
  title: string;
  description: string | null;
  task_type: "Bug" | "Feature" | "Documentation";
  status: "Todo" | "Backlog" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export default async function TodoPage() {
  const supabase = await createSupabaseServerClient();

  // 🔒 auth check
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth/login");
  }

  // 📦 fetch todos - SIRF APNE TODOS with all new fields
  const { data: todos, error: todosError } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  // Handle fetch error
  if (todosError) {
    console.error("Error fetching todos:", todosError);
  }

  // 🔥 Convert null to undefined for TodoClient compatibility
  const formattedTodos = todos?.map(todo => ({
    ...todo,
    description: todo.description ?? undefined
  })) || [];

  return (
    <div className="flex justify-center pt-10">
      <TodoClient initialTodos={formattedTodos as any} />
    </div>
  );
}

// Optional: Add metadata
export const metadata = {
  title: "Task Manager",
  description: "Manage your tasks efficiently",
};