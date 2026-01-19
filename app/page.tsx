import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Shield, Zap } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server"; // ✅ IMPORTANT

export default async function Home() {
  // 🔐 AUTH CHECK
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Agar user logged in hai → dashboard
  if (user) {
    redirect("/dashboard");
  }

  // ❌ Agar logged in nahi hai → same landing page
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Hero Content */}
        <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Welcome to Your App
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            Manage Your Tasks Efficiently
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
            A powerful and intuitive platform to organize your work, collaborate with your team, and boost productivity.
          </p>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            <div className="flex items-start gap-3 text-left">
              <div className="rounded-lg bg-primary/10 p-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Easy to Use</h3>
                <p className="text-xs text-muted-foreground">Simple & intuitive interface</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left">
              <div className="rounded-lg bg-primary/10 p-2">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Secure</h3>
                <p className="text-xs text-muted-foreground">Your data is protected</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left">
              <div className="rounded-lg bg-primary/10 p-2">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Fast</h3>
                <p className="text-xs text-muted-foreground">Lightning quick performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Card */}
        <div className="order-1 lg:order-2 flex justify-center">
          <Card className="w-full max-w-md shadow-2xl border-2">
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl">
                Welcome 👋
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Login or create a new account to continue
              </p>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 pt-2">
              <Link href="/auth/login" className="w-full">
                <Button className="w-full h-11 text-base font-semibold">
                  Login
                </Button>
              </Link>

              <Link href="/auth/signup" className="w-full">
                <Button variant="outline" className="w-full h-11 text-base font-semibold">
                  Sign Up
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
