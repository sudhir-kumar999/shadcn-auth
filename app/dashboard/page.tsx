import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Dashboard</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm">
            <p>
              <span className="font-medium">Email:</span>{" "}
              {profile?.email || user.email}
            </p>
            <p>
              <span className="font-medium">Name:</span>{" "}
              {profile?.name || "N/A"}
            </p>
          </div>

          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href="/todo">
                Go to My Todo
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
