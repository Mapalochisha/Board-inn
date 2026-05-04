"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"renter" | "landlord">("renter");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage("Check your email to verify your account.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Create an account</h2>
        <p className="text-sm text-muted-foreground">
          Enter your details to register
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
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>I am a</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={role === "renter" ? "default" : "outline"}
              className={role === "renter" ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => setRole("renter")}
              disabled={loading}
            >
              Student / Renter
            </Button>
            <Button
              type="button"
              variant={role === "landlord" ? "default" : "outline"}
              className={role === "landlord" ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => setRole("landlord")}
              disabled={loading}
            >
              Landlord
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Register
        </Button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-green-600 hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
