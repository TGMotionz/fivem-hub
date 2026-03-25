"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const categoryData = {
  inventory: {
    name: "Inventory",
    scripts: [
      { name: "Advanced Inventory System", slug: "advanced-inventory", version: "v2.0", downloads: 1250 },
      { name: "Simple Inventory UI", slug: "simple-inventory", version: "v1.5", downloads: 890 },
      { name: "Weight-Based Inventory", slug: "weight-inventory", version: "v1.2", downloads: 560 },
    ],
  },
  hud: {
    name: "HUD",
    scripts: [
      { name: "Modern Speedometer HUD", slug: "modern-speedometer", version: "v1.0", downloads: 2100 },
      { name: "Minimalist HUD", slug: "minimalist-hud", version: "v2.1", downloads: 1540 },
      { name: "Racing HUD", slug: "racing-hud", version: "v1.8", downloads: 890 },
    ],
  },
  menus: {
    name: "Menus",
    scripts: [
      { name: "Interactive Radial Menu", slug: "radial-menu", version: "v3.0", downloads: 3200 },
      { name: "Vehicle Spawner Menu", slug: "vehicle-spawner", version: "v1.2", downloads: 1870 },
    ],
  },
  jobs: {
    name: "Jobs",
    scripts: [
      { name: "Taxi Job System", slug: "taxi-job", version: "v1.0", downloads: 950 },
      { name: "Mechanic Job", slug: "mechanic-job", version: "v2.3", downloads: 1430 },
      { name: "Police Job", slug: "police-job", version: "v1.5", downloads: 2100 },
    ],
  },
};

function formatSlug(text) {
  return text
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function ScriptCategoryPage({ params }) {
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setCategory(resolvedParams.category);
      setLoading(false);
    }
    loadParams();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  const categoryInfo = categoryData[category] || {
    name: formatSlug(category),
    scripts: [
      { name: `${formatSlug(category)} Script 1`, slug: `${category}-script-1`, version: "v1.0", downloads: 0 },
      { name: `${formatSlug(category)} Script 2`, slug: `${category}-script-2`, version: "v1.0", downloads: 0 },
    ],
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 p-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="text-2xl font-bold">
            FiveM Free Hub
          </a>

          <div className="flex gap-3">
            <a
              href="/downloads/scripts"
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm"
            >
              ← Back to Scripts
            </a>
            <a
              href="/favorites"
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm"
            >
              My Favorites
            </a>
            <a
              href="https://discord.gg/qf367wWS"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Join Discord
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold">{categoryInfo.name}</h1>
        <p className="mt-3 max-w-2xl text-gray-400">
          Free {categoryInfo.name.toLowerCase()} scripts for your FiveM server.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categoryInfo.scripts.map((script) => (
            <Link
              key={script.slug}
              href={`/downloads/scripts/${category}/${script.slug}`}
              className="rounded-2xl border border-gray-800 bg-zinc-950 p-6 transition hover:border-gray-600 hover:bg-zinc-900"
            >
              <div className="mb-4 h-32 rounded-xl bg-gray-800 flex items-center justify-center text-4xl">
                📜
              </div>
              <h2 className="text-xl font-bold">{script.name}</h2>
              <p className="mt-2 text-sm text-gray-400">
                Version: {script.version}
              </p>
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <span>⬇️ {script.downloads.toLocaleString()} downloads</span>
              </div>
              <div className="mt-5">
                <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black inline-block">
                  View Details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}