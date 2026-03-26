"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import Header from "@/components/Header";
import Comments from "@/components/Comments";
import ShareButtons from "@/components/ShareButtons";

const brandNames = {
  dodge: "Dodge", ferrari: "Ferrari", bmw: "BMW", tesla: "Tesla",
  audi: "Audi", mercedes: "Mercedes", porsche: "Porsche",
  lamborghini: "Lamborghini", ford: "Ford", chevrolet: "Chevrolet",
  hyundai: "Hyundai", kia: "Kia", suzuki: "Suzuki", subaru: "Subaru",
  honda: "Honda", nissan: "Nissan", toyota: "Toyota", volkswagen: "Volkswagen",
  volvo: "Volvo", mazda: "Mazda", mitsubishi: "Mitsubishi"
};

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
    }
    
    await supabase
      .from("view_analytics")
      .insert({
        content_slug: slug,
        content_type: "vehicle",
        user_id: userId || null,
        viewed_at: new Date(),
      });
  } catch (error) {
    console.error("Error tracking view:", error);
  }
}

async function trackDownload(slug, userId) {
  try {
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
    const { error: analyticsError } = await supabase
      .from("download_analytics")
      .insert({
        content_slug: slug,
        content_type: "vehicle",
        user_id: userId || null,
        downloaded_at: new Date(),
      });
    
    if (analyticsError) {
      console.error("Error tracking download:", analyticsError);
    }
  } catch (error) {
    console.error("Error tracking download:", error);
  }
}

export default function VehicleDetailPage({ params }) {
  const [brand, setBrand] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [content, setContent] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function loadParams() {
      const resolved = await params;
      setBrand(resolved.brand || "");
      setVehicle(resolved.vehicle || "");
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
      if (!vehicle) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("slug", vehicle)
        .eq("type", "vehicle")
        .maybeSingle();
      
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      setContent(data);
      setSelectedImage(data.image_url);
      
      // Load author info
      if (data.author_id) {
        const { data: authorData } = await supabase
          .from("public_users")
          .select("*")
          .eq("id", data.author_id)
          .single();
        setAuthor(authorData);
      }
      
      setLoading(false);
      trackView(vehicle, userId);
    }
    
    if (vehicle) loadContent();
  }, [vehicle, userId]);

  const getBrandName = () => {
    if (!brand) return "";
    return brandNames[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
  };

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

  if (notFound || !content) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold mb-2">Vehicle Not Found</h1>
          <p className="text-gray-400">The vehicle you're looking for doesn't exist or has been removed.</p>
          <Link href="/downloads/cars" className="mt-6 inline-block text-indigo-400 hover:text-indigo-300">
            ← Browse All Vehicles
          </Link>
        </div>
      </main>
    );
  }

  const brandName = getBrandName();
  const platform = getPlatformIcon(content.download_url);
  
  const allImages = [content.image_url, ...(content.images || [])].filter(Boolean);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image Gallery Section */}
          <div className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-4">
            <div className="flex h-[320px] items-center justify-center rounded-xl bg-gray-800 overflow-hidden mb-4">
              {selectedImage ? (
                <img src={selectedImage} alt={content.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">🚗</span>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 transition ${
                      selectedImage === img ? 'ring-2 ring-indigo-500' : 'hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt={`${content.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div>
            <p className="text-sm uppercase tracking-widest text-gray-400">{brandName}</p>
            <h1 className="mt-2 text-4xl font-bold">{content.name}</h1>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400">Version</p>
                <p className="font-semibold">{content.version || "v1.0.0"}</p>
              </div>
              <div className="rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400">Category</p>
                <p className="font-semibold capitalize">{content.category}</p>
              </div>
              <div className="rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400">Uploaded by</p>
                {author ? (
                  <Link 
                    href={`/profile/${author.id}`}
                    className="font-semibold text-white hover:text-indigo-400 transition inline-flex items-center gap-1"
                  >
                    {author.username || author.email?.split("@")[0] || "Community Creator"}
                    <span className="text-xs text-gray-500">→</span>
                  </Link>
                ) : (
                  <p className="font-semibold text-gray-400">Community Creator</p>
                )}
              </div>
              <div className="rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400">Statistics</p>
                <div className="flex gap-4 mt-1">
                  <span>👁️ {content.views || 0}</span>
                  <span>⬇️ {content.downloads || 0}</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-gray-300">{content.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {content.download_url ? (
                <a
                  href={content.download_url}
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
              <FavoriteButton brand={brand} vehicleSlug={vehicle} vehicleName={content.name} />
            </div>

            {/* Share Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400 mb-2">Share this content:</p>
              <ShareButtons title={content.name} url={`/downloads/cars/${brand}/${vehicle}`} />
            </div>
          </div>
        </div>

        {/* Features and Installation */}
        <div className="grid gap-8 lg:grid-cols-2 mt-12">
          <div className="rounded-2xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold">✨ Features</h2>
            <ul className="mt-4 space-y-2">
              {(content.features || []).map((f, i) => (
                <li key={i} className="rounded-lg bg-black/30 px-4 py-2">✓ {f}</li>
              ))}
              {(!content.features || content.features.length === 0) && (
                <li className="text-gray-400">No features listed yet.</li>
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold">📦 Installation</h2>
            <div className="mt-4 space-y-2">
              {(content.install_steps || []).map((s, i) => (
                <p key={i} className="rounded-lg bg-black/30 px-4 py-2">{i+1}. {s}</p>
              ))}
              {(!content.install_steps || content.install_steps.length === 0) && (
                <p className="text-gray-400">No installation steps provided yet.</p>
              )}
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