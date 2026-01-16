"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push("/auth/signup");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[450px] text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">404 - Page Not Found</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-600">
            The page you're looking for doesn't exist.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to signup page in 3 seconds...
          </p>

          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={() => router.push("/auth/signup")}
              className="min-w-[120px]"
            >
              Go to Signup
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/auth/login")}
              className="min-w-[120px]"
            >
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}