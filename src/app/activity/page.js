"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      // Get recent downloads
      const { data: downloads } = await supabase
        .from("download_analytics")
        .select("content_slug, downloaded_at, user_id")
        .order("downloaded_at", { ascending: false })
        .limit(30);
      
      // Get recent submissions
      const { data: submissions } = await supabase
        .from("content_items")
        .select("name, slug, type, category, author_id, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      
      // Get recent badge earns
      const { data: badges } = await supabase
        .from("user_badges")
        .select("user_id, badge_id, earned_at")
        .order("earned_at", { ascending: false })
        .limit(20);
      
      // Get badge names
      const { data: badgeNames } = await supabase
        .from("badges")
        .select("id, name, icon");
      
      // Combine all activities
      const allActivities = [];
      
      submissions?.forEach(sub => {
        allActivities.push({
          type: "submission",
          user_id: sub.author_id,
          content_name: sub.name,
          content_slug: sub.slug,
          content_type: sub.type,
          category: sub.category,
          created_at: sub.created_at,
        });
      });
      
      downloads?.forEach(download => {
        allActivities.push({
          type: "download",
          user_id: download.user_id,
          content_slug: download.content_slug,
          created_at: download.downloaded_at,
        });
      });
      
      badges?.forEach(badge => {
        const badgeInfo = badgeNames?.find(b => b.id === badge.badge_id);
        allActivities.push({
          type: "badge",
          user_id: badge.user_id,
          badge_name: badgeInfo?.name,
          badge_icon: badgeInfo?.icon,
          created_at: badge.earned_at,
        });
      });
      
      // Sort by date
      allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Get user names
      const userIds = [...new Set(allActivities.map(a => a.user_id).filter(Boolean))];
      const { data: users } = await supabase
        .from("public_users")
        .select("id, username, email")
        .in("id", userIds);
      
      const activitiesWithUsers = allActivities.map(activity => ({
        ...activity,
        user: users?.find(u => u.id === activity.user_id),
      }));
      
      setActivities(activitiesWithUsers.slice(0, 50));
      setLoading(false);
    }
    
    loadActivities();
  }, []);

  function getActivityIcon(type) {
    switch(type) {
      case "submission": return "✨";
      case "download": return "⬇️";
      case "badge": return "🏆";
      default: return "📢";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
        <Header />
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading activity...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Community Activity</h1>
          <p className="text-gray-400 mt-2">What's happening in the community</p>
        </div>
        
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="rounded-xl border border-gray-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 transition">
              <div className="flex items-center gap-4">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-gray-300">
                    <Link href={`/profile/${activity.user_id}`} className="font-semibold text-white hover:text-indigo-400">
                      {activity.user?.username || activity.user?.email?.split("@")[0] || "Someone"}
                    </Link>
                    {activity.type === "submission" && (
                      <> submitted new content <Link href={`/downloads/${activity.content_type}s/${activity.category}/${activity.content_slug}`} className="text-indigo-400 hover:text-indigo-300">{activity.content_name}</Link></>
                    )}
                    {activity.type === "download" && (
                      <> downloaded <Link href={`/downloads/vehicles/${activity.content_slug}`} className="text-indigo-400 hover:text-indigo-300">{activity.content_slug}</Link></>
                    )}
                    {activity.type === "badge" && (
                      <> earned the <span className="text-yellow-400">{activity.badge_icon} {activity.badge_name}</span> badge!</>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.created_at).toLocaleDateString()} at {new Date(activity.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}