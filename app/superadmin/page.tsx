import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Crown, Trash2 } from "lucide-react";

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

  // Server Actions
  async function toggleRole(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const userId = formData.get("userId") as string;
    const currentRole = formData.get("currentRole") as string;

    // Toggle between user and admin
    const newRole = currentRole === "admin" ? "user" : "admin";

    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    revalidatePath("/superadmin");
  }

  async function deleteUser(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const userId = formData.get("userId") as string;

    // Delete user's todos first
    await supabase.from("todos").delete().eq("user_id", userId);
    // Delete user
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

  const adminCount = users?.filter((u) => u.role === "admin").length || 0;
  const userCount = users?.filter((u) => u.role === "user").length || 0;
  const superadminCount = users?.filter((u) => u.role === "superadmin").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
              <Crown className="w-10 h-10 text-yellow-500" />
              SuperAdmin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage all users and roles</p>
          </div>
          <Badge variant="destructive" className="text-lg px-4 py-2">
            <Shield className="w-5 h-5 mr-2" />
            SuperAdmin
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{userCount}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{adminCount}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                SuperAdmins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{superadminCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users?.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-5 border-2 rounded-lg transition-all ${
                    user.role === "superadmin"
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300"
                      : user.role === "admin"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <form action={updateUserName} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={user.id} />
                        <input
                          type="text"
                          name="name"
                          defaultValue={user.name}
                          className="text-xl font-semibold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1 transition-all"
                          disabled={user.role === "superadmin"}
                        />
                        {user.role !== "superadmin" && (
                          <Button type="submit" size="sm" variant="ghost">
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
                        className="text-sm"
                      >
                        {user.role === "superadmin" && <Crown className="w-3 h-3 mr-1" />}
                        {user.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                        {user.role === "user" && <User className="w-3 h-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions - Only for non-superadmin users */}
                  {user.role !== "superadmin" && (
                    <div className="flex gap-3">
                      {/* Toggle Role */}
                      <form action={toggleRole}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="currentRole" value={user.role} />
                        <Button
                          type="submit"
                          size="sm"
                          variant={user.role === "admin" ? "outline" : "default"}
                          className="min-w-[140px]"
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

                      {/* Delete User */}
                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={user.id} />
                        <Button type="submit" size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Protected Badge for SuperAdmin */}
                  {user.role === "superadmin" && user.id === data.user.id && (
                    <Badge variant="outline" className="text-sm">
                      You
                    </Badge>
                  )}

                  {user.role === "superadmin" && user.id !== data.user.id && (
                    <Badge variant="outline" className="text-sm text-gray-500">
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
  );
}