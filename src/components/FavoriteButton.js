"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FavoriteButton({ brand, vehicleSlug, vehicleName }) {
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUserAndFavorite() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("vehicle_slug", vehicleSlug)
        .maybeSingle();

      setSaved(!!data);
      setLoading(false);
    }

    loadUserAndFavorite();
  }, [vehicleSlug]);

  async function toggleFavorite() {
    if (!user) {
      setMessage("Please log in to save favorites.");
      return;
    }

    if (saved) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("vehicle_slug", vehicleSlug);

      if (error) {
        setMessage(error.message);
        return;
      }

      setSaved(false);
      setMessage("Removed from favorites.");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      brand,
      vehicle_slug: vehicleSlug,
      vehicle_name: vehicleName,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setSaved(true);
    setMessage("Saved to favorites!");
    setTimeout(() => setMessage(""), 2000);
  }

  if (loading) {
    return (
      <button className="rounded-lg border border-gray-700 px-5 py-3 text-sm">
        Loading...
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={toggleFavorite}
        className={`rounded-lg border px-5 py-3 text-sm transition ${
          saved
            ? "border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20"
            : "border-gray-700 hover:border-gray-500"
        }`}
      >
        {saved ? "❤️ Saved to Favorites" : "♡ Save to Favorites"}
      </button>
      {message && <p className="mt-2 text-sm text-gray-400">{message}</p>}
    </div>
  );
}