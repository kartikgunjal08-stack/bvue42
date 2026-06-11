"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Mail, Lock, Loader2, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Login Error: " + error.message);
    } else {
      window.location.href = "/dashboard"; // Redirect after successful login
    }
    setLoading(false);
  };

  // Handle Sign Up (No automatic redirect)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      // Removed emailRedirectTo so the user stays on this page after clicking sign up
    });
    if (error) {
      alert("Sign Up Error: " + error.message);
    } else {
      alert("Success! Please check your email to confirm your account before logging in.");
    }
    setLoading(false);
  };

  // Handle Reset Password
  const handleResetPassword = async () => {
    if (!email) return alert("Please enter your email to reset password.");
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert(error.message);
    else alert("Check your email for the password reset link.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card className="w-full max-w-sm bg-white/70 backdrop-blur-xl shadow-2xl rounded-[2rem] p-4">
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-3xl font-bold">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
          <CardDescription>{isSignUp ? "Join BVUE42 today" : "Sign in to your account"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                <Input type="email" placeholder="name@example.com" required onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl bg-zinc-100 border-none" />
              </div>
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && <button type="button" onClick={handleResetPassword} className="text-xs text-blue-600 hover:underline">Forgot?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" required onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12 rounded-xl bg-zinc-100 border-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-zinc-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="h-12 rounded-xl bg-zinc-900 text-white font-semibold">
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
            
            <div className="text-center text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"} 
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="ml-1 font-semibold text-blue-600 hover:underline">
                {isSignUp ? "Sign In" : "Sign up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}