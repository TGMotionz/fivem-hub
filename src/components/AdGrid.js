"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdGrid() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAds() {
      // Get all active ads (end_date is either null OR not expired)
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .or("end_date.is.null,end_date.gt." + new Date().toISOString())
        .order("slot", { ascending: true });
      
      if (!error && data) {
        setAds(data);
        
        // Track impressions for each ad
        data.forEach(async (ad) => {
          await supabase
            .from("ads")
            .update({ impressions: (ad.impressions || 0) + 1 })
            .eq("id", ad.id);
        });
      } else {
        console.error("Error loading ads:", error);
      }
      setLoading(false);
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-gray-800 bg-zinc-900/30 p-6 animate-pulse">
            <div className="h-48 bg-gray-800 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Create an array of 4 slots, filling with ads where available
  const slots = [1, 2, 3, 4].map(slot => {
    const ad = ads.find(a => a.slot === slot);
    return { slot, ad };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
      {slots.map(({ slot, ad }) => {
        // If no ad for this slot, show placeholder
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
        
        // Show the real ad
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
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x250/1f2937/6366f1?text=Ad+Image';
                }}
              />
              <div className="absolute top-2 right-2 bg-black/70 text-xs text-gray-400 px-2 py-1 rounded">
                Sponsored
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