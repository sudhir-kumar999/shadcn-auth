import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, User, ListTodo, LogOut } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  // 1️⃣ Logged-in user check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 2️⃣ Profile fetch (ADD is_banned)
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, is_banned")
    .eq("id", user.id)
    .single();

  // 🚫 BAN CHECK (IMPORTANT)
  if (profile?.is_banned) {
    await supabase.auth.signOut();
    redirect("/auth/login?error=banned");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your tasks and profile
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg border-2">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl sm:text-3xl">Dashboard</CardTitle>
              <Badge variant="outline" className="text-xs sm:text-sm">
                Active
              </Badge>
            </div>
            <CardDescription className="text-sm sm:text-base">
              Your account information and quick actions
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Profile Info */}
            <div className="space-y-4 bg-gray-50 p-4 sm:p-6 rounded-lg border">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Profile Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-sm sm:text-base break-all">
                      {profile?.email || user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-sm sm:text-base break-words">
                      {profile?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Quick Actions</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild size="lg" className="h-auto py-4">
                  <Link href="/todo" className="flex flex-col items-center gap-2">
                    <ListTodo className="w-6 h-6" />
                    <span className="text-sm sm:text-base">My Todos</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="h-auto py-4">
                  <Link href="/api/auth/logout" className="flex flex-col items-center gap-2">
                    <LogOut className="w-6 h-6" />
                    <span className="text-sm sm:text-base">Logout</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Card */}
            {/* <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">✓</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Active</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl sm:text-3xl font-bold text-green-600">0</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Todos</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200 col-span-2 sm:col-span-1">
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">🎯</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Ready</p>
              </div>
            </div> */}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
          Manage your tasks efficiently with our todo system
        </p>
      </div>
    </div>
  );
}