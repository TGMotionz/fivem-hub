"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [vehicles, setVehicles] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function search() {
      if (!query) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Search vehicles
      const { data: vehicleData } = await supabase
        .from("vehicle_stats")
        .select("*")
        .or(`vehicle_slug.ilike.%${query}%, brand.ilike.%${query}%`)
        .limit(10);

      // Search scripts
      const { data: scriptData } = await supabase
        .from("script_stats")
        .select("*")
        .or(`script_slug.ilike.%${query}%, category.ilike.%${query}%`)
        .limit(10);

      setVehicles(vehicleData || []);
      setScripts(scriptData || []);
      setLoading(false);
    }

    search();
  }, [query]);

  const totalResults = vehicles.length + scripts.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-400 mb-8">
          Found {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
        </p>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Searching...</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-gray-400">
              Try searching for something else or browse our categories.
            </p>
            <Link
              href="/downloads"
              className="inline-block mt-6 rounded-xl bg-indigo-500 px-6 py-2 text-white hover:bg-indigo-600 transition"
            >
              Browse All Content
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Vehicles Section */}
            {vehicles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>🚗</span> Vehicles ({vehicles.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {vehicles.map((vehicle) => (
                    <Link
                      key={vehicle.id}
                      href={`/downloads/cars/${vehicle.brand}/${vehicle.vehicle_slug}`}
                      className="rounded-xl border border-gray-800 bg-zinc-900/50 p-4 transition hover:border-indigo-500 hover:bg-zinc-900"
                    >
                      <h3 className="font-bold capitalize">
                        {vehicle.vehicle_slug.replace(/-/g, " ")}
                      </h3>
                      <p className="text-sm text-gray-400">{vehicle.brand}</p>
                      <div className="mt-2 flex gap-3 text-xs text-gray-500">
                        <span>👁️ {vehicle.views}</span>
                        <span>⬇️ {vehicle.downloads}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Scripts Section */}
            {scripts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>📜</span> Scripts ({scripts.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {scripts.map((script) => (
                    <Link
                      key={script.id}
                      href={`/downloads/scripts/${script.category}/${script.script_slug}`}
                      className="rounded-xl border border-gray-800 bg-zinc-900/50 p-4 transition hover:border-indigo-500 hover:bg-zinc-900"
                    >
                      <h3 className="font-bold capitalize">
                        {script.script_slug.replace(/-/g, " ")}
                      </h3>
                      <p className="text-sm text-gray-400">{script.category}</p>
                      <div className="mt-2 flex gap-3 text-xs text-gray-500">
                        <span>👁️ {script.views}</span>
                        <span>⬇️ {script.downloads}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">Loading...</div>
      </main>
    }>
      <SearchResults />
    </Suspense>
  );
}