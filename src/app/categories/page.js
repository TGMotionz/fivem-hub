"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function CategoriesPage() {
  const [scripts, setScripts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
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
        const scriptsList = Object.entries(scriptCounts).map(([name, count]) => ({ name, count }));

        // Load vehicles grouped by category
        const { data: vehiclesData } = await supabase
          .from("content_items")
          .select("category")
          .eq("type", "vehicle");
        
        const vehicleCounts = {};
        vehiclesData?.forEach(item => {
          vehicleCounts[item.category] = (vehicleCounts[item.category] || 0) + 1;
        });
        const vehiclesList = Object.entries(vehicleCounts).map(([name, count]) => ({ name, count }));

        setScripts(scriptsList);
        setVehicles(vehiclesList);
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

  // Predefined categories for new types
  const guns = [
    { name: "Pistols", slug: "pistols", icon: "🔫" },
    { name: "Rifles", slug: "rifles", icon: "🔫" },
    { name: "Shotguns", slug: "shotguns", icon: "🔫" },
    { name: "SMGs", slug: "smgs", icon: "🔫" },
    { name: "Sniper", slug: "sniper", icon: "🎯" },
    { name: "Heavy Weapons", slug: "heavy", icon: "💣" },
  ];

  const peds = [
    { name: "Civilian", slug: "civilian", icon: "👤" },
    { name: "Police", slug: "police", icon: "👮" },
    { name: "Emergency", slug: "emergency", icon: "🚑" },
    { name: "Gang", slug: "gang", icon: "😎" },
    { name: "Custom", slug: "custom", icon: "✨" },
  ];

  const maps = [
    { name: "MLOs", slug: "mlos", icon: "🏢" },
    { name: "Interiors", slug: "interiors", icon: "🏠" },
    { name: "Race Tracks", slug: "race", icon: "🏁" },
    { name: "Add-on Maps", slug: "addon", icon: "🗺️" },
    { name: "Misc Maps", slug: "misc", icon: "📍" },
  ];

  const clothing = [
    { name: "Male Clothing", slug: "male", icon: "👨" },
    { name: "Female Clothing", slug: "female", icon: "👩" },
    { name: "Uniforms", slug: "uniforms", icon: "👔" },
    { name: "EUP Packs", slug: "eup", icon: "🎭" },
  ];

  const serverAds = [
    { name: "Free Server Ads", slug: "free", icon: "🎁" },
    { name: "Paid Server Promotion", slug: "paid", icon: "⭐" },
    { name: "Partners", slug: "partners", icon: "🤝" },
  ];

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
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">📜</div>
            <h2 className="text-2xl font-bold">Scripts</h2>
            <span className="text-sm text-gray-400">({scripts.length} categories)</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {scripts.length > 0 ? (
              scripts.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/downloads/scripts/${cat.name}`}
                  className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-4 transition hover:border-indigo-500 hover:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{scriptIcons[cat.name] || "📜"}</div>
                    <div>
                      <h3 className="font-semibold capitalize group-hover:text-indigo-400 transition">{cat.name}</h3>
                      <p className="text-xs text-gray-400">{cat.count} items</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                No scripts yet. Be the first to submit!
              </div>
            )}
          </div>
        </div>

        {/* Vehicles Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">🚗</div>
            <h2 className="text-2xl font-bold">Vehicles</h2>
            <span className="text-sm text-gray-400">({vehicles.length} brands)</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {vehicles.length > 0 ? (
              vehicles.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/downloads/cars/${brand.name}`}
                  className="group rounded-lg border border-gray-800 bg-zinc-900/30 p-3 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
                >
                  <div className="text-2xl mb-1">🚗</div>
                  <span className="text-sm capitalize group-hover:text-indigo-400 transition">{brand.name}</span>
                  <p className="text-xs text-gray-500 mt-1">{brand.count} cars</p>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                No vehicles yet. Be the first to submit!
              </div>
            )}
          </div>
        </div>

        {/* Guns Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">🔫</div>
            <h2 className="text-2xl font-bold">Guns & Weapons</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {guns.map((cat) => (
              <Link
                key={cat.slug}
                href={`/downloads/guns/${cat.slug}`}
                className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-4 transition hover:border-indigo-500 hover:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{cat.icon}</div>
                  <div>
                    <h3 className="font-semibold group-hover:text-indigo-400 transition">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Peds Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">👥</div>
            <h2 className="text-2xl font-bold">Peds & Characters</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {peds.map((cat) => (
              <Link
                key={cat.slug}
                href={`/downloads/peds/${cat.slug}`}
                className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-4 transition hover:border-indigo-500 hover:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{cat.icon}</div>
                  <div>
                    <h3 className="font-semibold group-hover:text-indigo-400 transition">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Maps Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">🗺️</div>
            <h2 className="text-2xl font-bold">Maps & MLOs</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {maps.map((cat) => (
              <Link
                key={cat.slug}
                href={`/downloads/maps/${cat.slug}`}
                className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-4 transition hover:border-indigo-500 hover:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{cat.icon}</div>
                  <div>
                    <h3 className="font-semibold group-hover:text-indigo-400 transition">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Clothing Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">👕</div>
            <h2 className="text-2xl font-bold">Clothing</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {clothing.map((cat) => (
              <Link
                key={cat.slug}
                href={`/downloads/clothing/${cat.slug}`}
                className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-6 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition">{cat.icon}</div>
                <h3 className="font-semibold">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Server Ads Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">📢</div>
            <h2 className="text-2xl font-bold">Server Ads</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {serverAds.map((cat) => (
              <Link
                key={cat.slug}
                href={`/downloads/server-ads/${cat.slug}`}
                className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-8 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition">{cat.icon}</div>
                <h3 className="font-semibold text-lg">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}