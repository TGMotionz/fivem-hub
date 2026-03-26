"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function BoatCategoryPage({ params }) {
  const [category, setCategory] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParams() {
      const resolved = await params;
      setCategory(resolved.category);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    async function loadItems() {
      if (!category) return;
      
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "boat")
        .eq("category", category)
        .order("created_at", { ascending: false });
      
      setItems(data || []);
      setLoading(false);
    }
    loadItems();
  }, [category]);

  const categoryNames = {
    speed: "Speed Boats",
    yacht: "Yachts",
    jetski: "Jet Skis",
    fishing: "Fishing Boats",
    police: "Police Boats",
    cargo: "Cargo Ships",
  };

  const displayName = categoryNames[category] || category;

  if (loading) return <main className="min-h-screen bg-black"><Header /><div className="text-center py-20">Loading...</div></main>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/downloads/cars/boats" className="text-gray-400 hover:text-white">← Back to Boats</Link>
          <h1 className="text-3xl font-bold">{displayName}</h1>
          <span className="text-sm text-gray-400">({items.length} items)</span>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-20"><div className="text-6xl mb-4">⛵</div><p className="text-gray-400">No {displayName.toLowerCase()} found yet.</p></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link key={item.id} href={`/downloads/cars/boats/${category}/${item.slug}`} className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-6 transition hover:border-indigo-500">
                <div className="mb-4 h-40 rounded-xl bg-gray-800 flex items-center justify-center text-5xl">{item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : "⛵"}</div>
                <h2 className="text-xl font-bold">{item.name}</h2>
                <div className="mt-4 flex gap-4 text-xs text-gray-500"><span>👁️ {item.views || 0}</span><span>⬇️ {item.downloads || 0}</span></div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}