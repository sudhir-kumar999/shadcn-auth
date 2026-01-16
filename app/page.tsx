import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <Card className="w-[380px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Welcome 👋
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Login or create a new account to continue
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Login Button */}
          <Link href="/auth/login">
            <Button className="w-full">Login</Button>
          </Link>

          {/* Signup Button */}
          <Link href="/auth/signup">
            <Button variant="outline" className="w-full">
              Sign Up
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
