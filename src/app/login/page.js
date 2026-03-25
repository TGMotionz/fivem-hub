"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("✅ Account created! You can now log in.");
    setLoading(false);
  }

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("✅ Logged in successfully! Redirecting...");
    
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  }

  async function signInWithDiscord() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center px-6">
        <div className="w-full rounded-2xl border border-gray-800 bg-zinc-900/50 p-8">
          <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
          <p className="mt-2 text-center text-sm text-gray-400">
            Create an account to save your favorite vehicles and scripts.
          </p>

          <div className="mt-8 space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <div className="flex gap-3">
              <button
                onClick={signIn}
                disabled={loading}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 font-semibold text-white hover:scale-105 transition disabled:opacity-50"
              >
                {loading ? "Please wait..." : "Login"}
              </button>

              <button
                onClick={signUp}
                disabled={loading}
                className="flex-1 rounded-xl border border-gray-700 py-3 font-semibold hover:bg-white/10 transition disabled:opacity-50"
              >
                Register
              </button>
            </div>

            {/* Discord Login */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={signInWithDiscord}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#5865F2] text-white font-semibold hover:scale-105 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515c-.21.38-.456.9-.623 1.3a18.27 18.27 0 0 0-5.585 0c-.167-.4-.413-.92-.623-1.3a19.75 19.75 0 0 0-4.885 1.515c-2.944 4.435-3.746 8.756-3.35 12.992a20.22 20.22 0 0 0 6.144 3.087c.495-.669.935-1.38 1.313-2.13a13.214 13.214 0 0 1-2.066-1.008c.174-.124.342-.253.503-.384 3.952 1.82 8.23 1.82 12.15 0 .16.13.33.26.503.384a13.07 13.07 0 0 1-2.067 1.008c.378.75.818 1.461 1.313 2.13a20.22 20.22 0 0 0 6.144-3.087c.462-4.752-.73-9.052-3.35-12.992zM8.293 13.516c-1.11 0-2.013-1.007-2.013-2.244 0-1.237.903-2.244 2.013-2.244 1.11 0 2.013 1.007 2.013 2.244 0 1.237-.903 2.244-2.013 2.244zm7.414 0c-1.11 0-2.013-1.007-2.013-2.244 0-1.237.903-2.244 2.013-2.244 1.11 0 2.013 1.007 2.013 2.244 0 1.237-.903 2.244-2.013 2.244z"/>
              </svg>
              Continue with Discord
            </button>

            {message && (
              <p className={`text-sm text-center ${message.includes("✅") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}