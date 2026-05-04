"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: window.location.origin + "/reset-password",
      }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("Password reset email sent. Check your inbox.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Reset Password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email address to receive a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20 text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800 text-center">
            {message}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>
      </form>

      <div className="text-center text-sm">
        Remember your password?{" "}
        <Link href="/login" className="text-green-600 hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
