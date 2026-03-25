"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function ClothingPage() {
  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClothing() {
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "clothing")
        .order("created_at", { ascending: false });
      
      setClothingItems(data || []);
      setLoading(false);
    }
    loadClothing();
  }, []);

  const categories = [
    { name: "Male Clothing", slug: "male", icon: "👨", count: clothingItems.filter(i => i.category === "male").length },
    { name: "Female Clothing", slug: "female", icon: "👩", count: clothingItems.filter(i => i.category === "female").length },
    { name: "Uniforms", slug: "uniforms", icon: "👔", count: clothingItems.filter(i => i.category === "uniforms").length },
    { name: "EUP Packs", slug: "eup", icon: "🎭", count: clothingItems.filter(i => i.category === "eup").length },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
        <Header />
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading clothing...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Free Clothing</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Peds, EUP, and uniform packs for your FiveM server
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/downloads/clothing/${cat.slug}`}
              className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-8 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition">{cat.icon}</div>
              <h2 className="text-xl font-bold">{cat.name}</h2>
              <p className="text-sm text-gray-400 mt-2">{cat.count} items available</p>
            </Link>
          ))}
        </div>

        {/* Show all clothing items if any */}
        {clothingItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">All Clothing Items</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clothingItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/downloads/clothing/${item.category}/${item.slug}`}
                  className="rounded-xl border border-gray-800 p-4 hover:border-indigo-500 transition group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">👕</span>
                    <h3 className="font-semibold group-hover:text-indigo-400 transition">{item.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 capitalize">{item.category}</p>
                  <div className="mt-2 flex gap-3 text-xs text-gray-500">
                    <span>👁️ {item.views || 0}</span>
                    <span>⬇️ {item.downloads || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}