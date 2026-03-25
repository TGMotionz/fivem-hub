"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        setError("Please log in to see your favorites.");
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setFavorites(data || []);
      setLoading(false);
    }

    loadFavorites();
  }, []);

  async function removeFavorite(vehicleSlug) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("vehicle_slug", vehicleSlug);

    if (error) {
      setError(error.message);
      return;
    }

    setFavorites(favorites.filter((fav) => fav.vehicle_slug !== vehicleSlug));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-gray-400">Loading your favorites...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-red-400">{error}</p>
          <Link href="/login" className="mt-4 inline-block rounded-lg bg-white px-6 py-2 text-black">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-4xl font-bold">My Favorites</h1>
        <p className="mt-3 text-gray-400">
          {favorites.length === 0
            ? "You haven't saved any favorites yet. Browse our content and click the heart button!"
            : `You have ${favorites.length} saved ${favorites.length === 1 ? "item" : "items"}.`}
        </p>
      </section>

      {favorites.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-6 transition hover:border-indigo-500"
              >
                <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl">
                  🚗
                </div>
                
                <h2 className="text-xl font-bold capitalize">
                  {favorite.vehicle_name || favorite.vehicle_slug.replace(/-/g, " ")}
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Brand: {favorite.brand || favorite.category || "General"}
                </p>

                <div className="mt-5 flex gap-3">
                  <Link
                    href={favorite.brand ? `/downloads/cars/${favorite.brand}/${favorite.vehicle_slug}` : `/downloads/scripts/${favorite.category}/${favorite.vehicle_slug}`}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => removeFavorite(favorite.vehicle_slug)}
                    className="rounded-lg border border-red-500 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}