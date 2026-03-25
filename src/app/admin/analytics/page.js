"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalDownloads: 0,
    totalViews: 0,
    topContent: [],
    dailyStats: [],
    popularCategories: [],
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [timeRange, setTimeRange] = useState("week"); // week, month, all

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAdmin(user?.email === "kjek98@gmail.com");
      if (user?.email === "kjek98@gmail.com") {
        loadAnalytics();
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [timeRange]);

  async function loadAnalytics() {
    setLoading(true);
    
    try {
      // Get total downloads
      const { count: totalDownloads, error: downloadError } = await supabase
        .from("download_analytics")
        .select("*", { count: "exact", head: true });
      
      if (downloadError) console.error("Download error:", downloadError);
      
      // Get total views
      const { count: totalViews, error: viewError } = await supabase
        .from("view_analytics")
        .select("*", { count: "exact", head: true });
      
      if (viewError) console.error("View error:", viewError);
      
      // Get top downloaded content
      const { data: downloads, error: topError } = await supabase
        .from("download_analytics")
        .select("content_slug");
      
      if (topError) console.error("Top content error:", topError);
      
      const slugCounts = {};
      downloads?.forEach(item => {
        slugCounts[item.content_slug] = (slugCounts[item.content_slug] || 0) + 1;
      });
      
      const topContent = Object.entries(slugCounts)
        .map(([slug, count]) => ({ slug, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Get names for slugs
      const { data: items } = await supabase
        .from("content_items")
        .select("slug, name")
        .in("slug", topContent.map(t => t.slug));
      
      const topContentWithNames = topContent.map(t => ({
        ...t,
        name: items?.find(i => i.slug === t.slug)?.name || t.slug,
        content_type: "vehicle",
      }));
      
      // Get daily stats
      const { data: dailyStats, error: dailyError } = await supabase
        .from("daily_stats")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);
      
      if (dailyError) console.error("Daily stats error:", dailyError);
      
      // Get popular categories
      const { data: allDownloads, error: allError } = await supabase
        .from("download_analytics")
        .select("content_slug")
        .limit(500);
      
      if (allError) console.error("All downloads error:", allError);
      
      const slugs = allDownloads?.map(d => d.content_slug) || [];
      const { data: categoryItems } = await supabase
        .from("content_items")
        .select("category, type")
        .in("slug", slugs);
      
      const categoryCounts = {};
      categoryItems?.forEach(item => {
        const key = `${item.type}/${item.category}`;
        categoryCounts[key] = (categoryCounts[key] || 0) + 1;
      });
      
      const popularCategories = Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setStats({
        totalDownloads: totalDownloads || 0,
        totalViews: totalViews || 0,
        topContent: topContentWithNames,
        dailyStats: dailyStats || [],
        popularCategories: popularCategories || [],
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">
          <p className="text-red-400">Please log in</p>
          <Link href="/login" className="mt-4 inline-block text-indigo-400">Go to Login</Link>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">
          <p className="text-red-400">You don't have permission to access this page.</p>
          <Link href="/" className="mt-4 inline-block text-indigo-400">Go Home</Link>
        </div>
      </main>
    );
  }

  const maxDailyDownloads = Math.max(...(stats.dailyStats.map(d => d.total_downloads) || [0]), 1);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-2">Track downloads, views, and popular content</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange("week")}
              className={`px-3 py-1 rounded-lg text-sm ${timeRange === "week" ? "bg-indigo-500" : "bg-gray-700"}`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange("month")}
              className={`px-3 py-1 rounded-lg text-sm ${timeRange === "month" ? "bg-indigo-500" : "bg-gray-700"}`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange("all")}
              className={`px-3 py-1 rounded-lg text-sm ${timeRange === "all" ? "bg-indigo-500" : "bg-gray-700"}`}
            >
              All Time
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="rounded-xl border border-gray-800 bg-zinc-900/30 p-6 text-center">
                <div className="text-3xl font-bold text-indigo-400">{stats.totalDownloads.toLocaleString()}</div>
                <div className="text-sm text-gray-400 mt-1">Total Downloads</div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-zinc-900/30 p-6 text-center">
                <div className="text-3xl font-bold text-green-400">{stats.totalViews.toLocaleString()}</div>
                <div className="text-sm text-gray-400 mt-1">Total Views</div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-zinc-900/30 p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {stats.topContent[0]?.count || 0}
                </div>
                <div className="text-sm text-gray-400 mt-1">Most Downloaded</div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-zinc-900/30 p-6 text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {stats.totalViews > 0 ? ((stats.totalDownloads / stats.totalViews) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-400 mt-1">Download Rate</div>
              </div>
            </div>

            {/* Top Content */}
            <div className="grid gap-8 lg:grid-cols-2 mb-8">
              <div className="rounded-xl border border-gray-800 bg-zinc-900/30 p-6">
                <h2 className="text-xl font-bold mb-4">🔥 Top Downloaded Content</h2>
                <div className="space-y-3">
                  {stats.topContent.map((item, index) => (
                    <div key={item.slug} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                        <Link 
                          href={`/downloads/cars/${item.slug.split('-')[0]}/${item.slug}`}
                          className="hover:text-indigo-400 transition truncate max-w-[200px]"
                        >
                          {item.name}
                        </Link>
                      </div>
                      <span className="text-sm text-indigo-400">{item.count} downloads</span>
                    </div>
                  ))}
                  {stats.topContent.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No downloads yet. Add test data to see analytics!</p>
                  )}
                </div>
              </div>

              {/* Popular Categories */}
              <div className="rounded-xl border border-gray-800 bg-zinc-900/30 p-6">
                <h2 className="text-xl font-bold mb-4">📊 Popular Categories</h2>
                <div className="space-y-3">
                  {stats.popularCategories.map((cat, index) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                        <span className="capitalize">{cat.name}</span>
                      </div>
                      <span className="text-sm text-green-400">{cat.count} downloads</span>
                    </div>
                  ))}
                  {stats.popularCategories.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No data yet. Add test data to see categories!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Stats Chart */}
            <div className="rounded-xl border border-gray-800 bg-zinc-900/30 p-6">
              <h2 className="text-xl font-bold mb-4">📈 Daily Downloads</h2>
              <div className="space-y-2">
                {stats.dailyStats.length > 0 ? (
                  stats.dailyStats.slice(0, 14).map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="text-sm text-gray-400 w-24">{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex-1 h-8 bg-gray-800 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-lg transition-all duration-300"
                          style={{ width: `${Math.min(100, (day.total_downloads / maxDailyDownloads) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-16 text-right">{day.total_downloads}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No download data yet. <Link href="/admin/test-analytics" className="text-indigo-400 hover:text-indigo-300">Add test data →</Link></p>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}