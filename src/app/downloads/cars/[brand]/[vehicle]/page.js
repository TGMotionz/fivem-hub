"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FavoriteButton from "@/components/FavoriteButton";
import Header from "@/components/Header";
import Comments from "@/components/Comments";
import ShareButtons from "@/components/ShareButtons";

const brandNames = {
  dodge: "Dodge", ferrari: "Ferrari", bmw: "BMW", tesla: "Tesla",
  audi: "Audi", mercedes: "Mercedes", porsche: "Porsche",
  lamborghini: "Lamborghini", ford: "Ford", chevrolet: "Chevrolet",
};

function formatSlug(text) {
  return text.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function getPlatformIcon(url) {
  if (!url) return null;
  if (url.includes("drive.google.com")) return "📁 Google Drive";
  if (url.includes("discord.com") || url.includes("discord.gg")) return "💬 Discord";
  if (url.includes("mediafire.com")) return "🔥 MediaFire";
  if (url.includes("mega.nz")) return "📦 Mega";
  return "🔗 External";
}

async function trackView(slug, userId) {
  try {
    // Update content item view count
    const { data: existing } = await supabase
      .from("content_items")
      .select("views")
      .eq("slug", slug)
      .maybeSingle();
    
    if (existing) {
      await supabase
        .from("content_items")
        .update({ views: (existing.views || 0) + 1 })
        .eq("slug", slug);
    } else {
      await supabase
        .from("content_items")
        .insert({
          slug: slug,
          type: "vehicle",
          name: formatSlug(slug),
          views: 1,
        });
    }
    
    // Record view analytics
    await supabase
      .from("view_analytics")
      .insert({
        content_slug: slug,
        content_type: "vehicle",
        user_id: userId || null,
        ip_address: "client-side",
        viewed_at: new Date(),
      });
  } catch (error) {
    console.error("Error tracking view:", error);
  }
}

async function trackDownload(slug, userId) {
  try {
    // Update content item download count
    const { data: existing } = await supabase
      .from("content_items")
      .select("downloads")
      .eq("slug", slug)
      .maybeSingle();
    
    if (existing) {
      await supabase
        .from("content_items")
        .update({ downloads: (existing.downloads || 0) + 1 })
        .eq("slug", slug);
    }
    
    // Record download analytics
    await supabase
      .from("download_analytics")
      .insert({
        content_slug: slug,
        content_type: "vehicle",
        user_id: userId || null,
        ip_address: "client-side",
        downloaded_at: new Date(),
      });
  } catch (error) {
    console.error("Error tracking download:", error);
  }
}

export default function VehicleDetailPage({ params }) {
  const [brand, setBrand] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function loadParams() {
      const resolved = await params;
      setBrand(resolved.brand);
      setVehicle(resolved.vehicle);
    }
    loadParams();
    
    async function getUserId() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    }
    getUserId();
  }, [params]);

  useEffect(() => {
    async function loadContent() {
      if (!vehicle) return;
      
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("slug", vehicle)
        .eq("type", "vehicle")
        .maybeSingle();
      
      setContent(data);
      setLoading(false);
      if (data) trackView(vehicle, userId);
    }
    
    if (vehicle) loadContent();
  }, [vehicle, userId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  const brandName = brandNames[brand] || formatSlug(brand);
  const item = content || {
    name: formatSlug(vehicle),
    version: "v1.0",
    author: "FiveM Free Hub",
    description: "Content coming soon!",
    features: ["Coming soon"],
    install_steps: ["Download", "Add to resources", "Configure"],
    download_url: null,
    image_url: null,
    views: 0,
    downloads: 0,
  };

  const platform = getPlatformIcon(item.download_url);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image Section */}
          <div className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-4">
            <div className="flex h-[320px] items-center justify-center rounded-xl bg-gray-800 overflow-hidden">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">🚗</span>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div>
            <p className="text-sm uppercase tracking-widest text-gray-400">{brandName}</p>
            <h1 className="mt-2 text-4xl font-bold">{item.name}</h1>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400">Version</p>
                <p className="font-semibold">{item.version}</p>
              </div>
              <div className="rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400">Author</p>
                <p className="font-semibold">{item.author}</p>
              </div>
              <div className="rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400">Category</p>
                <p className="font-semibold">{brandName}</p>
              </div>
              <div className="rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400">Statistics</p>
                <div className="flex gap-4 mt-1">
                  <span>👁️ {item.views || 0}</span>
                  <span>⬇️ {item.downloads || 0}</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-gray-300">{item.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {item.download_url ? (
                <a
                  href={item.download_url}
                  onClick={() => trackDownload(vehicle, userId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-white px-5 py-3 text-black font-semibold hover:bg-gray-200 transition inline-flex items-center gap-2"
                >
                  ⬇️ Download {platform && <span className="text-xs text-gray-600">({platform})</span>}
                </a>
              ) : (
                <button disabled className="rounded-lg bg-gray-700 px-5 py-3 text-gray-400 cursor-not-allowed">
                  ⬇️ Coming Soon
                </button>
              )}
              <a href="https://discord.gg/qf367wWS" target="_blank" className="rounded-lg border border-gray-700 px-5 py-3 hover:bg-white/10">
                💬 Support
              </a>
              <FavoriteButton brand={brand} vehicleSlug={vehicle} vehicleName={item.name} />
            </div>

            {/* Share Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400 mb-2">Share this content:</p>
              <ShareButtons title={item.name} url={`/downloads/cars/${brand}/${vehicle}`} />
            </div>
          </div>
        </div>

        {/* Features and Installation */}
        <div className="grid gap-8 lg:grid-cols-2 mt-12">
          <div className="rounded-2xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold">✨ Features</h2>
            <ul className="mt-4 space-y-2">
              {(item.features || []).map((f, i) => (
                <li key={i} className="rounded-lg bg-black/30 px-4 py-2">✓ {f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold">📦 Installation</h2>
            <div className="mt-4 space-y-2">
              {(item.install_steps || []).map((s, i) => (
                <p key={i} className="rounded-lg bg-black/30 px-4 py-2">{i+1}. {s}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <div className="mx-auto max-w-7xl px-6 pb-20">
        <Comments contentId={vehicle} contentType="vehicle" />
      </div>
    </main>
  );
}