"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type TaskType = "Bug" | "Feature" | "Documentation";
type TaskStatus = "Todo" | "Backlog" | "In Progress" | "Done";
type TaskPriority = "Low" | "Medium" | "High";

/* ================= GENERATE TASK ID ================= */
async function generateTaskId(supabase: any): Promise<string> {
  // Get ALL task_ids and find the highest number
  const { data, error } = await supabase
    .from("todos")
    .select("task_id")
    .order("task_id", { ascending: false });

  if (error) {
    console.error("Error fetching task IDs:", error);
    // Fallback to timestamp-based unique ID
    return `T-${Date.now().toString().slice(-6)}`;
  }

  if (!data || data.length === 0) {
    return "T-001";
  }

  // Extract all numbers from task_ids and find max
  const numbers = data
    .map((todo: any) => {
      const match = todo.task_id?.match(/T-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter((num: number) => !isNaN(num) && num > 0);

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const newNumber = maxNumber + 1;
  
  return `T-${newNumber.toString().padStart(3, '0')}`;
}

/* ================= ADD TODO ================= */
export async function addTodoAction(data: {
  title: string;
  description?: string;
  task_type: TaskType;
  priority: TaskPriority;
}) {
  if (!data.title || !data.title.trim()) {
    throw new Error("Title is required");
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Generate task ID
  const taskId = await generateTaskId(supabase);

  const { error } = await supabase.from("todos").insert({
    task_id: taskId,
    title: data.title.trim(),
    description: data.description?.trim() || null,
    task_type: data.task_type,
    priority: data.priority,
    status: "Todo",
    completed: false,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/todo");
  return { success: true, taskId };
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
export async function updateTodoAction(
  id: string,
  data: {
    title?: string;
    description?: string;
    task_type?: TaskType;
    status?: TaskStatus;
    priority?: TaskPriority;
  }
) {
  if (!id) {
    throw new Error("Todo id is required");
  }

  if (data.title !== undefined && !data.title.trim()) {
    throw new Error("Title cannot be empty");
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Build update object
  const updateData: any = {};
  
  if (data.title !== undefined) {
    updateData.title = data.title.trim();
  }
  if (data.description !== undefined) {
    updateData.description = data.description?.trim() || null;
  }
  if (data.task_type !== undefined) {
    updateData.task_type = data.task_type;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
    // Auto-update completed based on status
    updateData.completed = data.status === "Done";
  }
  if (data.priority !== undefined) {
    updateData.priority = data.priority;
  }

  const { error } = await supabase
    .from("todos")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/todo");
  return { success: true };
}

/* ================= TOGGLE TODO COMPLETION ================= */
export async function toggleTodoAction(id: string, completed: boolean) {
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
    .update({ 
      completed,
      status: completed ? "Done" : "Todo"
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/todo");
  return { success: true };
}

/* ================= BULK UPDATE STATUS ================= */
export async function bulkUpdateStatusAction(
  ids: string[],
  status: TaskStatus
) {
  if (!ids || ids.length === 0) {
    throw new Error("Todo ids are required");
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
    .update({
      status,
      completed: status === "Done",
    })
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/todo");
  return { success: true };
}