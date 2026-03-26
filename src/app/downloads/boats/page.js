"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function BoatsPage() {
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBoats() {
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "boat")
        .order("created_at", { ascending: false });
      
      setBoats(data || []);
      setLoading(false);
    }
    loadBoats();
  }, []);

  const categories = [
    { name: "Speed Boats", slug: "speed", icon: "⛵" },
    { name: "Yachts", slug: "yacht", icon: "🛥️" },
    { name: "Jet Skis", slug: "jetski", icon: "🏄" },
    { name: "Fishing Boats", slug: "fishing", icon: "🎣" },
    { name: "Police Boats", slug: "police", icon: "🚔" },
    { name: "Cargo Ships", slug: "cargo", icon: "🚢" },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/downloads/cars" className="text-gray-400 hover:text-white">
            ← Back to Vehicles
          </Link>
          <div className="text-3xl">⛵</div>
          <h1 className="text-3xl font-bold">Boats & Watercraft</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/downloads/cars/boats/${cat.slug}`}
              className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-6 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">{cat.icon}</div>
              <h2 className="font-semibold text-lg">{cat.name}</h2>
              <p className="text-xs text-gray-500 mt-2">
                {boats.filter(b => b.category === cat.slug).length} items
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}