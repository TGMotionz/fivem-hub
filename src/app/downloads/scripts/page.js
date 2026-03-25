"use client";

import Link from "next/link";
import Header from "@/components/Header";

export default function ScriptsPage() {
  const scriptCategories = [
    { name: "Inventory", slug: "inventory", icon: "📦", description: "Inventory systems and UI" },
    { name: "HUD", slug: "hud", icon: "📊", description: "Heads-up displays" },
    { name: "Menus", slug: "menus", icon: "📋", description: "Interactive menu systems" },
    { name: "Jobs", slug: "jobs", icon: "💼", description: "Job and career systems" },
    { name: "Heists", slug: "heists", icon: "💰", description: "Heist and robbery scripts" },
    { name: "Maps", slug: "maps", icon: "🗺️", description: "Map modifications" },
    { name: "Chats", slug: "chats", icon: "💬", description: "Chat systems" },
    { name: "Loadscreens", slug: "loadscreens", icon: "⏳", description: "Loading screens" },
    { name: "Phones", slug: "phones", icon: "📱", description: "In-game phone systems" },
    { name: "Peds", slug: "peds", icon: "👥", description: "Pedestrian models" },
    { name: "Guns", slug: "guns", icon: "🔫", description: "Weapon scripts" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Free Scripts</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Browse script categories. Find inventory systems, HUDs, menus, and more.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {scriptCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/downloads/scripts/${category.slug}`}
              className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-6 transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">{category.icon}</div>
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <p className="mt-2 text-sm text-gray-400">{category.description}</p>
              <div className="mt-4 text-xs text-indigo-400">0 scripts available</div>
              <div className="mt-5">
                <span className="inline-flex items-center gap-2 text-indigo-400 group-hover:gap-3 transition">
                  Browse scripts →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}