"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Notifications from "@/components/Notifications";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const adminEmails = ["kjek98@gmail.com", "your-email@gmail.com", "admin@example.com"];
        setIsAdmin(adminEmails.includes(user.email));
        
        const { data: existing } = await supabase
          .from("public_users")
          .select("id")
          .eq("id", user.id)
          .single();
        
        if (!existing) {
          await supabase
            .from("public_users")
            .insert([{
              id: user.id,
              email: user.email,
              username: user.email.split("@")[0],
              join_date: new Date(),
              last_active: new Date(),
            }]);
        } else {
          await supabase
            .from("public_users")
            .update({ last_active: new Date() })
            .eq("id", user.id);
        }
      }
    }
    getUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 p-4">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hover:opacity-80 transition">
          FiveM Free Hub
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search vehicles, scripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 rounded-xl px-4 py-2 pl-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/downloads" className="rounded-xl border border-gray-700 px-4 py-2 text-sm hover:bg-white/10 transition">
            Downloads
          </Link>
          <Link href="/categories" className="rounded-xl border border-gray-700 px-4 py-2 text-sm hover:bg-white/10 transition">
            📁 Categories
          </Link>
          <Link href="/activity" className="rounded-xl border border-gray-700 px-4 py-2 text-sm hover:bg-white/10 transition">
            📰 Activity
          </Link>
          <Link href="/members" className="rounded-xl border border-gray-700 px-4 py-2 text-sm hover:bg-white/10 transition">
            👥 Members
          </Link>
          <Link href="/favorites" className="rounded-xl border border-gray-700 px-4 py-2 text-sm hover:bg-white/10 transition">
            ❤️ Favorites
          </Link>
          <Link href="/leaderboard" className="rounded-xl border border-gray-700 px-4 py-2 text-sm hover:bg-white/10 transition">
            🏆 Leaderboard
          </Link>
          
          {user && (
            <Link href="/submit" className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm font-semibold hover:scale-105 transition">
              ✨ Submit
            </Link>
          )}
          
          {user && <Notifications />}
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2 text-sm hover:bg-zinc-700/50 transition"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-gray-300 max-w-[100px] truncate">
                  {user.email?.split("@")[0]}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-700 bg-zinc-900 shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-semibold text-white">{user.email?.split("@")[0]}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
                  >
                    <span>👤</span> My Profile
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
                  >
                    <span>❤️</span> My Favorites
                  </Link>
                  <Link
                    href="/submit"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
                  >
                    <span>✨</span> Submit Content
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-800 my-1"></div>
                      <Link
                        href="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-400 hover:bg-white/10 transition"
                      >
                        <span>⚙️</span> Admin Panel
                      </Link>
                      <Link
                        href="/admin/submissions"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-yellow-400 hover:bg-white/10 transition"
                      >
                        <span>📝</span> Pending Submissions
                      </Link>
                      <Link
                        href="/admin/analytics"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-green-400 hover:bg-white/10 transition"
                      >
                        <span>📊</span> Analytics
                      </Link>
                      <Link
                        href="/admin/reports"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 transition"
                      >
                        <span>🚨</span> Reports
                      </Link>
                      <Link
                        href="/admin/ads"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-400 hover:bg-white/10 transition"
                      >
                        <span>📢</span> Advertising
                      </Link>
                    </>
                  )}
                  
                  <div className="border-t border-gray-800 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 transition"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 font-semibold text-sm hover:scale-105 transition">
              Login
            </Link>
          )}

          <a href="https://discord.gg/qf367wWS" target="_blank" rel="noreferrer" className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 font-semibold text-sm hover:scale-105 transition">
            💬 Discord
          </a>
        </div>
      </div>
    </header>
  );
}