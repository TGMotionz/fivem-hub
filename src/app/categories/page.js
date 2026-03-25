"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function CategoriesPage() {
  const [categories, setCategories] = useState({
    scripts: [],
    vehicles: [],
    clothing: [],
    serverAds: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        // Load scripts grouped by category
        const { data: scriptsData } = await supabase
          .from("content_items")
          .select("category")
          .eq("type", "script");
        
        const scriptCounts = {};
        scriptsData?.forEach(item => {
          scriptCounts[item.category] = (scriptCounts[item.category] || 0) + 1;
        });
        const scripts = Object.entries(scriptCounts).map(([name, count]) => ({ name, count }));

        // Load vehicles grouped by category
        const { data: vehiclesData } = await supabase
          .from("content_items")
          .select("category")
          .eq("type", "vehicle");
        
        const vehicleCounts = {};
        vehiclesData?.forEach(item => {
          vehicleCounts[item.category] = (vehicleCounts[item.category] || 0) + 1;
        });
        const vehicles = Object.entries(vehicleCounts).map(([name, count]) => ({ name, count }));

        // Clothing categories
        const clothingCategories = [
          { name: "Male Clothing", slug: "male", icon: "👨", count: 25 },
          { name: "Female Clothing", slug: "female", icon: "👩", count: 28 },
          { name: "Uniforms", slug: "uniforms", icon: "👔", count: 15 },
          { name: "EUP Packs", slug: "eup", icon: "🎭", count: 12 },
        ];

        // Server ad categories
        const serverAdCategories = [
          { name: "Free Server Ads", slug: "free", icon: "🎁", description: "Promote your server for free" },
          { name: "Paid Server Promotion", slug: "paid", icon: "⭐", description: "Featured listings" },
          { name: "Partners", slug: "partners", icon: "🤝", description: "Partner with us" },
        ];

        setCategories({
          scripts: scripts,
          vehicles: vehicles,
          clothing: clothingCategories,
          serverAds: serverAdCategories,
        });
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const scriptIcons = {
    inventory: "📦", hud: "📊", menus: "📋", jobs: "💼", heists: "💰",
    maps: "🗺️", chats: "💬", loadscreens: "⏳", phones: "📱", peds: "👥", guns: "🔫",
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
        <Header />
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading categories...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Browse Categories</h1>
          <p className="text-gray-400 mt-2">Explore content by category</p>
        </div>

        {/* Scripts Section */}
        {categories.scripts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">📜</div>
              <h2 className="text-2xl font-bold">Scripts</h2>
              <span className="text-sm text-gray-400">({categories.scripts.length} categories)</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.scripts.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/downloads/scripts/${cat.name}`}
                  className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-4 transition hover:border-indigo-500 hover:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{scriptIcons[cat.name] || "📜"}</div>
                    <div>
                      <h3 className="font-semibold capitalize group-hover:text-indigo-400 transition">{cat.name}</h3>
                      <p className="text-xs text-gray-400">{cat.count} item{cat.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Vehicles Section */}
        {categories.vehicles.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">🚗</div>
              <h2 className="text-2xl font-bold">Vehicles</h2>
              <span className="text-sm text-gray-400">({categories.vehicles.length} brands)</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.vehicles.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/downloads/cars/${brand.name}`}
                  className="group rounded-lg border border-gray-800 bg-zinc-900/30 p-3 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
                >
                  <div className="text-2xl mb-1">🚗</div>
                  <span className="text-sm capitalize group-hover:text-indigo-400 transition">{brand.name}</span>
                  <p className="text-xs text-gray-500 mt-1">{brand.count} car{brand.count !== 1 ? 's' : ''}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Clothing Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">👕</div>
            <h2 className="text-2xl font-bold">Clothing</h2>
            <span className="text-sm text-gray-400">Peds & EUP</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {categories.clothing.map((cat) => (
              <Link
                key={cat.slug}
                href={`/downloads/clothing/${cat.slug}`}
                className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-6 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition">{cat.icon}</div>
                <h3 className="font-semibold">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.count} items</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Server Ads Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">📢</div>
            <h2 className="text-2xl font-bold">Server Ads</h2>
            <span className="text-sm text-gray-400">Promote your server</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {categories.serverAds.map((cat) => (
              <Link
                key={cat.slug}
                href={`/downloads/server-ads/${cat.slug}`}
                className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-8 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition">{cat.icon}</div>
                <h3 className="font-semibold text-lg">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-2">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Show message if no content yet */}
        {categories.scripts.length === 0 && categories.vehicles.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No content yet</h3>
            <p className="text-gray-400">Be the first to submit content!</p>
            <Link href="/submit" className="inline-block mt-4 px-6 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600">
              Submit Content →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}