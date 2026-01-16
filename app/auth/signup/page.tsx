"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Mail, Lock, User, AlertCircle, Chrome, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      setSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Signup failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name && email && password) {
      handleSignup();
    }
  };

  const isPasswordStrong = password.length >= 6;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <div className="mb-6 text-center">
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            ← Back to Home
          </Link>
        </div>

        <Card className="shadow-2xl border-2">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <UserPlus className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base">
              Sign up to get started with your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-11"
                />
              </div>
              {password && (
                <div className="flex items-center gap-2 text-xs">
                  <div className={`h-1 flex-1 rounded-full ${isPasswordStrong ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={isPasswordStrong ? 'text-green-600' : 'text-red-600'}>
                    {isPasswordStrong ? 'Strong' : 'Weak (min 6 chars)'}
                  </span>
                </div>
              )}
            </div>

            {/* Success Alert */}
            {success && (
              <Alert className="bg-green-50 border-green-200 animate-in fade-in-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Account created successfully! Check your email and redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="animate-in fade-in-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Signup Button */}
            <Button
              className="w-full h-11 text-base font-semibold"
              onClick={handleSignup}
              disabled={loading || !name || !email || !password || !isPasswordStrong}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </div>
              )}
            </Button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Signup */}
            <Button
              variant="outline"
              className="w-full h-11 text-base font-semibold"
              onClick={() => {
                window.location.href = "/api/auth/google";
              }}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            {/* Login Redirect */}
            <div className="pt-4 text-center border-t">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}