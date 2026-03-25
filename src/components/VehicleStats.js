"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VehicleStats({ brand, vehicleSlug }) {
  const [stats, setStats] = useState({ views: 0, downloads: 0, download_url: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const { data, error } = await supabase
        .from("vehicle_stats")
        .select("views, downloads, download_url")
        .eq("vehicle_slug", vehicleSlug)
        .maybeSingle();

      if (data) {
        setStats(data);
      }
      setLoading(false);
    }

    loadStats();
  }, [vehicleSlug]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading stats...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-400">👁️</span>
          <span className="font-semibold text-white">{stats.views.toLocaleString()}</span>
          <span className="text-gray-500">views</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">⬇️</span>
          <span className="font-semibold text-white">{stats.downloads.toLocaleString()}</span>
          <span className="text-gray-500">downloads</span>
        </div>
      </div>
      {stats.download_url && (
        <div className="text-xs text-gray-500 break-all">
          🔗 <span className="text-gray-400">Download link saved in admin panel</span>
        </div>
      )}
    </div>
  );
}