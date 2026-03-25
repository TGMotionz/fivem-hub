"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function MapsPage() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMaps() {
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "map")
        .order("created_at", { ascending: false });
      
      setMaps(data || []);
      setLoading(false);
    }
    loadMaps();
  }, []);

  const categories = [
    { name: "MLOs", slug: "mlos", icon: "🏢", count: maps.filter(m => m.category === "mlos").length },
    { name: "Interiors", slug: "interiors", icon: "🏠", count: maps.filter(m => m.category === "interiors").length },
    { name: "Race Tracks", slug: "race", icon: "🏁", count: maps.filter(m => m.category === "race").length },
    { name: "Add-on Maps", slug: "addon", icon: "🗺️", count: maps.filter(m => m.category === "addon").length },
    { name: "Misc Maps", slug: "misc", icon: "📍", count: maps.filter(m => m.category === "misc").length },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
        <Header />
        <div className="text-center py-20">Loading maps...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Free Maps & MLOs</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Custom maps, MLOs, and locations for FiveM
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/downloads/maps/${cat.slug}`}
              className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-8 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition">{cat.icon}</div>
              <h2 className="text-xl font-bold">{cat.name}</h2>
              <p className="text-sm text-gray-400 mt-2">{cat.count} items</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}