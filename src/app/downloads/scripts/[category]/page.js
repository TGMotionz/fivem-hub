"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function ScriptCategoryPage({ params }) {
  const [category, setCategory] = useState("");
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParams() {
      const resolved = await params;
      setCategory(resolved.category || "");
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    async function loadScripts() {
      if (!category) {
        setLoading(false);
        return;
      }
      
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "script")
        .eq("category", category)
        .order("created_at", { ascending: false });
      
      if (data) {
        setScripts(data);
      }
      setLoading(false);
    }
    
    loadScripts();
  }, [category]);

  const categoryNames = {
    inventory: "Inventory",
    hud: "HUD",
    menus: "Menus",
    jobs: "Jobs",
    heists: "Heists",
    maps: "Maps",
    chats: "Chats",
    loadscreens: "Loadscreens",
    phones: "Phones",
    peds: "Peds",
    guns: "Guns",
  };

  const displayName = categoryNames[category] || (category ? category.charAt(0).toUpperCase() + category.slice(1) : "Scripts");

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading scripts...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/downloads/scripts" className="text-gray-400 hover:text-white">
            ← Back to Scripts
          </Link>
          <h1 className="text-3xl font-bold">{displayName}</h1>
          <span className="text-sm text-gray-400">({scripts.length} scripts)</span>
        </div>

        {scripts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-gray-400">No scripts found in {displayName}.</p>
            <Link href="/submit" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
              Be the first to submit a script!
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scripts.map((script) => (
              <Link
                key={script.id}
                href={`/downloads/scripts/${category}/${script.slug}`}
                className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-6 transition hover:border-indigo-500 hover:bg-zinc-900"
              >
                <div className="mb-4 h-40 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-5xl group-hover:scale-110 transition overflow-hidden">
                  {script.image_url ? (
                    <img src={script.image_url} alt={script.name} className="w-full h-full object-cover" />
                  ) : (
                    "📜"
                  )}
                </div>
                <h2 className="text-xl font-bold">{script.name}</h2>
                <p className="mt-2 text-sm text-gray-400 line-clamp-2">{script.description}</p>
                <div className="mt-4 flex gap-4 text-xs text-gray-500">
                  <span>👁️ {script.views || 0}</span>
                  <span>⬇️ {script.downloads || 0}</span>
                </div>
                <div className="mt-4">
                  <span className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black group-hover:bg-gray-200 transition">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}