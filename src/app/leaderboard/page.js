"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("creators");

  useEffect(() => {
    async function loadLeaderboard() {
      // Load users sorted by contributions
      const { data: users } = await supabase
        .from("public_users")
        .select("*")
        .order("contributions", { ascending: false })
        .limit(50);
      
      if (users) {
        // Get additional stats for each user
        const usersWithStats = await Promise.all(
          users.map(async (user) => {
            const { data: badges } = await supabase
              .from("user_badges")
              .select("badge_id")
              .eq("user_id", user.id);
            
            const { data: downloads } = await supabase
              .from("content_items")
              .select("downloads")
              .eq("author_id", user.id);
            
            const totalDownloads = downloads?.reduce((sum, d) => sum + (d.downloads || 0), 0) || 0;
            
            return {
              ...user,
              badge_count: badges?.length || 0,
              total_downloads: totalDownloads,
            };
          })
        );
        
        setLeaders(usersWithStats);
      }
      
      // Load all badges
      const { data: allBadges } = await supabase
        .from("badges")
        .select("*")
        .order("requirement_value", { ascending: true });
      
      if (allBadges) setBadges(allBadges);
      
      setLoading(false);
    }
    
    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
        <Header />
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading leaderboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">🏆 Leaderboard</h1>
          <p className="text-gray-400 mt-2">Top contributors and creators in our community</p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab("creators")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === "creators"
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🎨 Top Creators
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === "badges"
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🏅 All Badges
          </button>
        </div>
        
        {activeTab === "creators" ? (
          <div className="space-y-3">
            {leaders.map((user, index) => (
              <div
                key={user.id}
                className="rounded-xl border border-gray-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center">
                    {index === 0 && <span className="text-3xl">🥇</span>}
                    {index === 1 && <span className="text-3xl">🥈</span>}
                    {index === 2 && <span className="text-3xl">🥉</span>}
                    {index > 2 && <span className="text-xl font-bold text-gray-500">#{index + 1}</span>}
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold">
                    {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  
                  <div className="flex-1">
                    <Link href={`/profile/${user.id}`} className="font-semibold hover:text-indigo-400 transition">
                      {user.username || user.email?.split("@")[0] || "Anonymous"}
                    </Link>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>📦 {user.contributions || 0} submissions</span>
                      <span>⬇️ {user.total_downloads || 0} downloads</span>
                      <span>🏅 {user.badge_count || 0} badges</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-400">{user.reputation || 0}</div>
                    <div className="text-xs text-gray-500">reputation</div>
                  </div>
                </div>
              </div>
            ))}
            
            {leaders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No creators yet. Be the first to contribute!
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => {
              const colors = {
                green: "from-green-500/20 to-green-600/20 border-green-500/50",
                blue: "from-blue-500/20 to-blue-600/20 border-blue-500/50",
                gold: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50",
                orange: "from-orange-500/20 to-orange-600/20 border-orange-500/50",
                purple: "from-purple-500/20 to-purple-600/20 border-purple-500/50",
                pink: "from-pink-500/20 to-pink-600/20 border-pink-500/50",
                red: "from-red-500/20 to-red-600/20 border-red-500/50",
                teal: "from-teal-500/20 to-teal-600/20 border-teal-500/50",
              };
              const colorClass = colors[badge.color] || colors.purple;
              
              return (
                <div
                  key={badge.id}
                  className={`rounded-xl border bg-gradient-to-br ${colorClass} p-4 text-center`}
                >
                  <div className="text-5xl mb-3">{badge.icon}</div>
                  <h3 className="font-bold text-lg">{badge.name}</h3>
                  <p className="text-sm text-gray-300 mt-1">{badge.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Requirement: {badge.requirement_value} {badge.requirement_type}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}