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
              Manage all users and roles
            </p>
          </div>
          <Badge variant="destructive" className="text-sm sm:text-base lg:text-lg px-3 sm:px-4 py-1.5 sm:py-2 w-fit">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            SuperAdmin
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

          <Card className="border-2 border-yellow-200 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                SuperAdmins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{superadminCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
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

                  {/* Actions - Only for non-superadmin users */}
                  {user.role !== "superadmin" && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                      {/* Toggle Role */}
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

                      {/* Delete User */}
                      <form action={deleteUser} className="w-full sm:w-auto">
                        <input type="hidden" name="userId" value={user.id} />
                        <Button type="submit" size="sm" variant="destructive" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Protected Badge for SuperAdmin */}
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
  );
}