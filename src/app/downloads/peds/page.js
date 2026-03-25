"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function PedsPage() {
  const [peds, setPeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPeds() {
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "ped")
        .order("created_at", { ascending: false });
      
      setPeds(data || []);
      setLoading(false);
    }
    loadPeds();
  }, []);

  const categories = [
    { name: "Civilian Peds", slug: "civilian", icon: "👤", count: peds.filter(p => p.category === "civilian").length },
    { name: "Police Peds", slug: "police", icon: "👮", count: peds.filter(p => p.category === "police").length },
    { name: "Emergency Peds", slug: "emergency", icon: "🚑", count: peds.filter(p => p.category === "emergency").length },
    { name: "Gang Peds", slug: "gang", icon: "😎", count: peds.filter(p => p.category === "gang").length },
    { name: "Custom Peds", slug: "custom", icon: "✨", count: peds.filter(p => p.category === "custom").length },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
        <Header />
        <div className="text-center py-20">Loading peds...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Free Peds & Characters</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Custom ped models and character skins for FiveM
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/downloads/peds/${cat.slug}`}
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