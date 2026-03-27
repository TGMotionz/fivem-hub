"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";
import NewsletterSignup from "@/components/NewsletterSignup";
import AdGrid from "@/components/AdGrid";
import OnlineUsers from "@/components/OnlineUsers";

export default function HomePage() {
  const [popularVehicles, setPopularVehicles] = useState([]);
  const [popularScripts, setPopularScripts] = useState([]);
  const [latestContent, setLatestContent] = useState([]);
  const [featuredContent, setFeaturedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const scriptCategories = [
    "Inventory", "HUD", "Menus", "Jobs", "Heists", "Maps",
    "Chats", "Loadscreens", "Phones", "Peds", "Guns"
  ];

  const vehicleBrands = [
    "Audi","Dodge","Ford","BMW","Toyota","Chevy","Lamborghini","Ferrari",
    "Koenigsegg","McLaren","Pagani","Bugatti","Aston Martin","Rolls-Royce",
    "Bentley","Range Rover","Mercedes","Porsche","Nissan","Subaru","Mazda",
    "Tesla","Honda","Jeep","Cadillac","Lexus","Lincoln","Mitsubishi",
    "Chrysler","Volkswagen","Volvo","Hummer","Fiat","Renault","Peugeot"
  ];

  useEffect(() => {
    async function loadContent() {
      // Load popular vehicles - SORT BY DOWNLOADS
      const { data: vehicles } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "vehicle")
        .order("downloads", { ascending: false })
        .limit(4);

      // Load popular scripts - SORT BY DOWNLOADS
      const { data: scripts } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "script")
        .order("downloads", { ascending: false })
        .limit(4);

      // Load latest content
      const { data: latest } = await supabase
        .from("content_items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

      // Load featured content
      const { data: featured } = await supabase
        .from("content_items")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(4);

      // Check admin status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const adminEmails = ["kjek98@gmail.com", "your-email@gmail.com"];
        setIsAdmin(adminEmails.includes(user.email));
      }

      if (vehicles) setPopularVehicles(vehicles);
      if (scripts) setPopularScripts(scripts);
      if (latest) setLatestContent(latest);
      if (featured) setFeaturedContent(featured);
      setLoading(false);
    }

    loadContent();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-300 to-gray-400 bg-clip-text text-transparent">
            Your FiveM Content Hub
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Browse thousands of free scripts, vehicles, and mods. Everything organized from your Discord community.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/downloads" className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 transition">
              Browse All Content
            </Link>
            <a href="https://discord.gg/qf367wWS" target="_blank" className="border border-gray-600 px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition">
              Join Community
            </a>
          </div>
        </div>
      </section>

      {/* Sponsored Ads Section */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold">📢 Sponsored Content</h3>
          <p className="text-sm text-gray-400">Support our community partners</p>
        </div>
        <AdGrid />
      </section>

      {/* Featured Content Section */}
      {!loading && featuredContent.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-3xl font-bold">⭐ Featured Content</h3>
                <p className="text-gray-400 mt-1">Hand-picked highlights from our community</p>
              </div>
              {isAdmin && (
                <Link href="/admin" className="text-sm text-yellow-400 hover:text-yellow-300">
                  ⚙️ Manage Featured
                </Link>
              )}
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredContent.map((item) => (
                <Link
                  key={item.id}
                  href={item.type === 'vehicle' ? `/downloads/cars/${item.category}/${item.slug}` : `/downloads/scripts/${item.category}/${item.slug}`}
                  className="group rounded-2xl border border-indigo-500/50 bg-zinc-900/50 p-4 transition hover:border-indigo-500 hover:bg-zinc-900 hover:scale-105"
                >
                  <div className="mb-3 h-32 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      item.type === 'vehicle' ? '🚗' : '📜'
                    )}
                  </div>
                  <h4 className="font-bold capitalize truncate">{item.name}</h4>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{item.category}</p>
                  <div className="mt-2 flex gap-3 text-xs text-gray-500">
                    <span>⬇️ {item.downloads || 0}</span>
                    <span>👁️ {item.views || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Uploads */}
      {!loading && latestContent.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-3xl font-bold">🆕 Latest Uploads</h3>
              <p className="text-gray-400 mt-1">Fresh content added recently</p>
            </div>
            <Link href="/downloads" className="text-indigo-400 hover:text-indigo-300">
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {latestContent.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={item.type === 'vehicle' ? `/downloads/cars/${item.category}/${item.slug}` : `/downloads/scripts/${item.category}/${item.slug}`}
                className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-4 transition hover:border-indigo-500 hover:bg-zinc-900"
              >
                <div className="mb-3 h-32 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    item.type === 'vehicle' ? '🚗' : '📜'
                  )}
                </div>
                <h4 className="font-bold capitalize truncate">{item.name}</h4>
                <p className="text-xs text-gray-400 mt-1 capitalize">{item.category}</p>
                <div className="mt-2 flex gap-3 text-xs text-gray-500">
                  <span>⬇️ {item.downloads || 0}</span>
                  <span>👁️ {item.views || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Most Popular Vehicles - SORTED BY DOWNLOADS */}
      {!loading && popularVehicles.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-3xl font-bold">🔥 Most Popular Vehicles</h3>
              <p className="text-gray-400 mt-1">Top downloaded vehicles</p>
            </div>
            <Link href="/downloads/cars" className="text-indigo-400 hover:text-indigo-300">
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {popularVehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/downloads/cars/${vehicle.category}/${vehicle.slug}`}
                className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-6 transition hover:border-indigo-500 hover:bg-zinc-900"
              >
                <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-5xl group-hover:scale-110 transition overflow-hidden">
                  {vehicle.image_url ? (
                    <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover" />
                  ) : (
                    '🚗'
                  )}
                </div>
                <h3 className="text-lg font-bold capitalize truncate">{vehicle.name}</h3>
                <p className="mt-1 text-sm text-gray-400 capitalize">{vehicle.category}</p>
                <div className="mt-4 flex gap-4 text-xs text-gray-500">
                  <span>⬇️ {vehicle.downloads?.toLocaleString() || 0} downloads</span>
                  <span>👁️ {vehicle.views?.toLocaleString() || 0} views</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Most Popular Scripts - SORTED BY DOWNLOADS */}
      {!loading && popularScripts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-3xl font-bold">📜 Trending Scripts</h3>
              <p className="text-gray-400 mt-1">Most downloaded scripts</p>
            </div>
            <Link href="/downloads/scripts" className="text-indigo-400 hover:text-indigo-300">
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {popularScripts.map((script) => (
              <Link
                key={script.id}
                href={`/downloads/scripts/${script.category}/${script.slug}`}
                className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-6 transition hover:border-indigo-500 hover:bg-zinc-900"
              >
                <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-5xl group-hover:scale-110 transition overflow-hidden">
                  {script.image_url ? (
                    <img src={script.image_url} alt={script.name} className="w-full h-full object-cover" />
                  ) : (
                    '📜'
                  )}
                </div>
                <h3 className="text-lg font-bold capitalize truncate">{script.name}</h3>
                <p className="mt-1 text-sm text-gray-400 capitalize">{script.category}</p>
                <div className="mt-4 flex gap-4 text-xs text-gray-500">
                  <span>⬇️ {script.downloads?.toLocaleString() || 0} downloads</span>
                  <span>👁️ {script.views?.toLocaleString() || 0} views</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h3 className="text-3xl font-bold mb-8 text-center">Browse Categories</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/downloads/scripts" className="rounded-2xl border border-gray-800 bg-gradient-to-br from-zinc-900 to-black p-8 text-center hover:border-indigo-500 transition">
            <div className="text-5xl mb-4">📜</div>
            <h4 className="text-xl font-bold">Scripts</h4>
            <p className="text-sm text-gray-400 mt-2">11+ Categories</p>
          </Link>
          <Link href="/downloads/cars" className="rounded-2xl border border-gray-800 bg-gradient-to-br from-zinc-900 to-black p-8 text-center hover:border-indigo-500 transition">
            <div className="text-5xl mb-4">🚗</div>
            <h4 className="text-xl font-bold">Vehicles</h4>
            <p className="text-sm text-gray-400 mt-2">60+ Brands</p>
          </Link>
          <Link href="/downloads/clothing" className="rounded-2xl border border-gray-800 bg-gradient-to-br from-zinc-900 to-black p-8 text-center hover:border-indigo-500 transition">
            <div className="text-5xl mb-4">👕</div>
            <h4 className="text-xl font-bold">Clothing</h4>
            <p className="text-sm text-gray-400 mt-2">Peds & EUP</p>
          </Link>
          <Link href="/downloads/server-ads" className="rounded-2xl border border-gray-800 bg-gradient-to-br from-zinc-900 to-black p-8 text-center hover:border-indigo-500 transition">
            <div className="text-5xl mb-4">📢</div>
            <h4 className="text-xl font-bold">Server Ads</h4>
            <p className="text-sm text-gray-400 mt-2">Promote your server</p>
          </Link>
        </div>
      </section>

      {/* Script Categories Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h3 className="text-2xl font-bold mb-6">Script Categories</h3>
        <div className="flex flex-wrap gap-3">
          {scriptCategories.map((item) => (
            <Link
              key={item}
              href={`/downloads/scripts/${item.toLowerCase()}`}
              className="bg-gray-800/50 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm transition"
            >
              {item}
            </Link>
          ))}
        </div>
      </section>

      {/* Vehicle Brands Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h3 className="text-2xl font-bold mb-6">Vehicle Brands</h3>
        <div className="flex flex-wrap gap-2">
          {vehicleBrands.map((item) => (
            <Link
              key={item}
              href={`/downloads/cars/${item.toLowerCase()}`}
              className="bg-gray-800/30 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs transition"
            >
              {item}
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 mt-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 max-w-md mx-auto">
            <OnlineUsers />
          </div>
          <div className="mb-8 max-w-md mx-auto">
            <NewsletterSignup />
          </div>
          <div className="text-center text-gray-500">
            <p>© 2026 FiveM Free Hub — Built for your Discord community</p>
            <p className="text-sm mt-2">
              <Link href="/" className="hover:text-white">Home</Link> • 
              <Link href="/downloads" className="hover:text-white ml-2">Downloads</Link> • 
              <Link href="/favorites" className="hover:text-white ml-2">Favorites</Link> • 
              <Link href="/leaderboard" className="hover:text-white ml-2">Leaderboard</Link>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}