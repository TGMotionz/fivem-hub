"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      try {
        // Get users from public_users table
        const { data: usersData, error } = await supabase
          .from("public_users")
          .select("*")
          .order("join_date", { ascending: false });
        
        if (error) {
          console.error("Error loading members:", error);
          setMembers([]);
          setLoading(false);
          return;
        }
        
        if (usersData && usersData.length > 0) {
          // Get favorite counts for each user
          const membersWithStats = await Promise.all(
            usersData.map(async (user) => {
              const { count } = await supabase
                .from("favorites")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);
              
              return {
                ...user,
                favorites: count || 0,
              };
            })
          );
          
          setMembers(membersWithStats);
        } else {
          // If no users in public_users, try to add current user
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const username = user.email.split("@")[0];
            await supabase
              .from("public_users")
              .insert([{
                id: user.id,
                email: user.email,
                username: username,
                join_date: new Date(),
                last_active: new Date(),
              }]);
            
            // Reload
            loadMembers();
            return;
          }
        }
      } catch (error) {
        console.error("Error loading members:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMembers();
  }, []);

  function formatDate(dateString) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
        <Header />
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading members...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Community Members</h1>
        <p className="text-gray-400 mb-8">Meet the FiveM Free Hub community</p>
        
        <div className="grid gap-4 md:grid-cols-2 mb-12">
          <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 text-center">
            <div className="text-3xl font-bold text-indigo-400">{members.length}</div>
            <div className="text-sm text-gray-400 mt-1">Total Members</div>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {members.reduce((sum, m) => sum + (m.favorites || 0), 0)}
            </div>
            <div className="text-sm text-gray-400 mt-1">Total Favorites</div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/profile/${member.id}`}
              className="block rounded-xl border border-gray-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 transition group"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold">
                    {member.username ? member.username.charAt(0).toUpperCase() : (member.email?.charAt(0).toUpperCase() || "U")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold hover:text-indigo-400 transition">
                        {member.username || member.email || "Anonymous"}
                      </span>
                      {member.is_contributor && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                          Contributor
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>Joined {formatDate(member.join_date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-indigo-400">{member.favorites || 0}</div>
                    <div className="text-xs text-gray-500">Favorites</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-400">{member.contributions || 0}</div>
                    <div className="text-xs text-gray-500">Contributions</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {members.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No members yet. Sign up to be the first!
            </div>
          )}
        </div>
      </section>
    </main>
  );
}