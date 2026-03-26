"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function MotorcyclesPage() {
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMotorcycles() {
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "motorcycle")
        .order("created_at", { ascending: false });
      
      setMotorcycles(data || []);
      setLoading(false);
    }
    loadMotorcycles();
  }, []);

  const categories = [
    { name: "Sport Bikes", slug: "sport", icon: "🏍️" },
    { name: "Cruisers", slug: "cruiser", icon: "🛵" },
    { name: "Dirt Bikes", slug: "dirt", icon: "🏁" },
    { name: "Touring", slug: "touring", icon: "🛣️" },
    { name: "Scooters", slug: "scooter", icon: "🛴" },
    { name: "ATVs", slug: "atv", icon: "🚜" },
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
          <div className="text-3xl">🏍️</div>
          <h1 className="text-3xl font-bold">Motorcycles</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/downloads/cars/motorcycles/${cat.slug}`}
              className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-6 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">{cat.icon}</div>
              <h2 className="font-semibold text-lg">{cat.name}</h2>
              <p className="text-xs text-gray-500 mt-2">
                {motorcycles.filter(m => m.category === cat.slug).length} items
              </p>
            </Link>
          ))}
        </div>

        {motorcycles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Recent Motorcycles</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {motorcycles.slice(0, 6).map((bike) => (
                <Link
                  key={bike.id}
                  href={`/downloads/cars/motorcycles/${bike.category}/${bike.slug}`}
                  className="rounded-xl border border-gray-800 p-4 hover:border-indigo-500 transition"
                >
                  <h3 className="font-semibold">{bike.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">{bike.category}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}