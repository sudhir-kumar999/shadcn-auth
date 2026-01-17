import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Crown, Trash2, Plus, CheckCircle2, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function SuperAdminPage() {
  const supabase = await createSupabaseServerClient();

  // Check authentication
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth/login");
  }

  // Check if user is superadmin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "superadmin") {
    redirect("/admin"); // Not superadmin, redirect to admin
  }

  // Fetch all users
  const { data: users } = await supabase
    .from("profiles")
    .select("id, name, email, role, created_at")
    .order("created_at", { ascending: false });

  // Fetch SuperAdmin's todos
  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  // Server Actions for Users
  async function toggleRole(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const userId = formData.get("userId") as string;
    const currentRole = formData.get("currentRole") as string;

    const newRole = currentRole === "admin" ? "user" : "admin";

    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    revalidatePath("/superadmin");
  }

  async function deleteUser(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const userId = formData.get("userId") as string;

    await supabase.from("todos").delete().eq("user_id", userId);
    await supabase.from("profiles").delete().eq("id", userId);
    revalidatePath("/superadmin");
  }

  async function updateUserName(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;

    await supabase.from("profiles").update({ name }).eq("id", userId);
    revalidatePath("/superadmin");
  }

  // Server Actions for Todos
  async function addTodo(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const title = formData.get("title") as string;
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from("todos").insert({
      title,
      user_id: userData.user.id,
      completed: false,
    });

    revalidatePath("/superadmin");
  }

  async function toggleTodo(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const todoId = formData.get("todoId") as string;
    const completed = formData.get("completed") === "true";

    await supabase
      .from("todos")
      .update({ completed: !completed })
      .eq("id", todoId);

    revalidatePath("/superadmin");
  }

  async function deleteTodo(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const todoId = formData.get("todoId") as string;

    await supabase.from("todos").delete().eq("id", todoId);
    revalidatePath("/superadmin");
  }

  const adminCount = users?.filter((u) => u.role === "admin").length || 0;
  const userCount = users?.filter((u) => u.role === "user").length || 0;
  const superadminCount = users?.filter((u) => u.role === "superadmin").length || 0;
  const completedTodos = todos?.filter((t) => t.completed).length || 0;
  const pendingTodos = todos?.filter((t) => !t.completed).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-yellow-500" />
              SuperAdmin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Manage all users, roles and your todos
            </p>
          </div>
          <Badge variant="destructive" className="text-sm sm:text-base lg:text-lg px-3 sm:px-4 py-1.5 sm:py-2 w-fit">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            SuperAdmin
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-2 border-purple-200">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">{userCount}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Total Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{adminCount}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                SuperAdmins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{superadminCount}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Completed Todos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{completedTodos}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Pending Todos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-orange-600">{pendingTodos}</p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* My Todos Section */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-green-200">
              <Link href="/todo" className="flex justify-center items-center text-2xl font bold bg-black text-white border m-2">My Todo</Link>
              {/* <CardHeader>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  My Todos
                </CardTitle>
              </CardHeader> */}
              <CardContent>
                {/* Add Todo Form */}
                {/* <form action={addTodo} className="mb-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      name="title"
                      placeholder="Add a new todo..."
                      required
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" className="shrink-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </form> */}

                {/* Todos List */}
                {/* <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {todos && todos.length > 0 ? (
                    todos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`flex items-center justify-between p-3 border-2 rounded-lg transition-all ${
                          todo.completed
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <form action={toggleTodo}>
                            <input type="hidden" name="todoId" value={todo.id} />
                            <input type="hidden" name="completed" value={todo.completed.toString()} />
                            <button type="submit" className="shrink-0">
                              {todo.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </form>
                          <span
                            className={`text-sm ${
                              todo.completed
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            } truncate`}
                          >
                            {todo.title}
                          </span>
                        </div>

                        <form action={deleteTodo}>
                          <input type="hidden" name="todoId" value={todo.id} />
                          <Button
                            type="submit"
                            size="sm"
                            variant="ghost"
                            className="shrink-0 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </form>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-8">
                      No todos yet. Add one above!
                    </p>
                  )}
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Users Management Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {users?.map((user) => (
                    <div
                      key={user.id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 border-2 rounded-lg transition-all gap-4 ${
                        user.role === "superadmin"
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300"
                          : user.role === "admin"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <form action={updateUserName} className="flex items-center gap-2 flex-1 min-w-0">
                            <input type="hidden" name="userId" value={user.id} />
                            <input
                              type="text"
                              name="name"
                              defaultValue={user.name}
                              className="text-base sm:text-lg lg:text-xl font-semibold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1 transition-all w-full sm:w-auto min-w-0"
                              disabled={user.role === "superadmin"}
                            />
                            {user.role !== "superadmin" && (
                              <Button type="submit" size="sm" variant="ghost" className="shrink-0">
                                Save
                              </Button>
                            )}
                          </form>

                          <Badge
                            variant={
                              user.role === "superadmin"
                                ? "destructive"
                                : user.role === "admin"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs sm:text-sm w-fit"
                          >
                            {user.role === "superadmin" && <Crown className="w-3 h-3 mr-1" />}
                            {user.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                            {user.role === "user" && <User className="w-3 h-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      {user.role !== "superadmin" && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                          <form action={toggleRole} className="w-full sm:w-auto">
                            <input type="hidden" name="userId" value={user.id} />
                            <input type="hidden" name="currentRole" value={user.role} />
                            <Button
                              type="submit"
                              size="sm"
                              variant={user.role === "admin" ? "outline" : "default"}
                              className="w-full sm:min-w-[140px]"
                            >
                              {user.role === "admin" ? (
                                <>
                                  <User className="w-4 h-4 mr-2" />
                                  Make User
                                </>
                              ) : (
                                <>
                                  <Shield className="w-4 h-4 mr-2" />
                                  Make Admin
                                </>
                              )}
                            </Button>
                          </form>

                          <form action={deleteUser} className="w-full sm:w-auto">
                            <input type="hidden" name="userId" value={user.id} />
                            <Button type="submit" size="sm" variant="destructive" className="w-full">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </form>
                        </div>
                      )}

                      {user.role === "superadmin" && user.id === data.user.id && (
                        <Badge variant="outline" className="text-xs sm:text-sm w-fit">
                          You
                        </Badge>
                      )}

                      {user.role === "superadmin" && user.id !== data.user.id && (
                        <Badge variant="outline" className="text-xs sm:text-sm text-gray-500 w-fit">
                          🔒 Protected
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}