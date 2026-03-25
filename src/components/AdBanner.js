"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdBanner({ position }) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAd() {
      const { data } = await supabase
        .from("ads")
        .select("*")
        .eq("position", position)
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        setAd(data[0]);
        // Track impression
        await supabase
          .from("ads")
          .update({ impressions: (data[0].impressions || 0) + 1 })
          .eq("id", data[0].id);
      }
      setLoading(false);
    }
    
    loadAd();
  }, [position]);

  async function handleClick() {
    if (ad) {
      await supabase
        .from("ads")
        .update({ clicks: (ad.clicks || 0) + 1 })
        .eq("id", ad.id);
      window.open(ad.link_url, "_blank");
    }
  }

  if (loading || !ad) return null;

  return (
    <div className="my-4">
      <a
        href="#"
        onClick={handleClick}
        className="block rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-500 transition group"
      >
        <img src={ad.image_url} alt={ad.title} className="w-full object-cover" />
        {ad.description && (
          <div className="p-3 bg-black/50 text-center">
            <p className="text-sm text-gray-300">{ad.description}</p>
          </div>
        )}
      </a>
    </div>
  );
}