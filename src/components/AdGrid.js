"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdGrid() {
  const [ads, setAds] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAds() {
      const { data } = await supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString())
        .order("slot", { ascending: true });
      
      const adsBySlot = {};
      data?.forEach(ad => {
        adsBySlot[ad.slot] = ad;
      });
      
      setAds(adsBySlot);
      setLoading(false);
      
      data?.forEach(async (ad) => {
        await supabase
          .from("ads")
          .update({ impressions: (ad.impressions || 0) + 1 })
          .eq("id", ad.id);
      });
    }
    
    loadAds();
  }, []);

  async function handleClick(ad) {
    await supabase
      .from("ads")
      .update({ clicks: (ad.clicks || 0) + 1 })
      .eq("id", ad.id);
    window.open(ad.link_url, "_blank");
  }

  if (loading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
      {[1, 2, 3, 4].map((slot) => {
        const ad = ads[slot];
        if (!ad) {
          return (
            <Link
              key={slot}
              href="/contact"
              className="rounded-xl border-2 border-dashed border-gray-700 bg-zinc-900/30 p-6 text-center hover:border-indigo-500 transition group"
            >
              <div className="text-4xl mb-3 opacity-50">📢</div>
              <p className="text-sm text-gray-400">Ad Space Available</p>
              <p className="text-xs text-gray-500 mt-2">Slot {slot}</p>
              <span className="inline-block mt-3 text-xs text-indigo-400 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition">
                Advertise Here →
              </span>
            </Link>
          );
        }
        
        return (
          <div
            key={slot}
            onClick={() => handleClick(ad)}
            className="group cursor-pointer rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-500 transition hover:scale-105 bg-zinc-900/50"
          >
            <div className="relative">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/70 text-xs text-gray-400 px-2 py-1 rounded">
                Ad
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white group-hover:text-indigo-400 transition">
                {ad.title}
              </h3>
              {ad.description && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{ad.description}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                {ad.advertiser_name && (
                  <span className="text-xs text-gray-500">Sponsored by {ad.advertiser_name}</span>
                )}
                <span className="text-xs text-indigo-400 group-hover:translate-x-1 transition">
                  Learn More →
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}