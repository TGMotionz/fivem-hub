"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function ServerAdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAds() {
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "server_ad")
        .order("created_at", { ascending: false });
      
      setAds(data || []);
      setLoading(false);
    }
    loadAds();
  }, []);

  const categories = [
    { name: "Free Server Ads", slug: "free", icon: "🎁", description: "Promote your server for free" },
    { name: "Paid Server Promotion", slug: "paid", icon: "⭐", description: "Featured listings & premium spots" },
    { name: "Partners", slug: "partners", icon: "🤝", description: "Partner with us for mutual growth" },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
        <Header />
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading server ads...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Server Ads</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Promote your FiveM server to our growing community
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/downloads/server-ads/${cat.slug}`}
              className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-8 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition">{cat.icon}</div>
              <h2 className="text-xl font-bold">{cat.name}</h2>
              <p className="text-sm text-gray-400 mt-2">{cat.description}</p>
            </Link>
          ))}
        </div>

        {/* Show all server ads if any */}
        {ads.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Latest Server Ads</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ads.map((ad) => (
                <Link
                  key={ad.id}
                  href={`/downloads/server-ads/${ad.category}/${ad.slug}`}
                  className="rounded-xl border border-gray-800 p-4 hover:border-indigo-500 transition group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📢</span>
                    <h3 className="font-semibold group-hover:text-indigo-400 transition">{ad.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 capitalize">{ad.category}</p>
                  <div className="mt-2 flex gap-3 text-xs text-gray-500">
                    <span>👁️ {ad.views || 0}</span>
                    <span>⬇️ {ad.downloads || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Submit Ad Button */}
        <div className="mt-12 text-center">
          <Link
            href="/submit"
            className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:scale-105 transition"
          >
            Submit Your Server Ad →
          </Link>
        </div>
      </section>
    </main>
  );
}