"use client";

import { useEffect, useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import { supabase } from "@/lib/supabase";

function formatSlug(text) {
  return text
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPlatformIcon(url) {
  if (!url) return null;
  if (url.includes("drive.google.com")) return "📁 Google Drive";
  if (url.includes("discord.com") || url.includes("discord.gg")) return "💬 Discord";
  if (url.includes("mediafire.com")) return "🔥 MediaFire";
  if (url.includes("mega.nz")) return "📦 Mega";
  if (url.includes("github.com")) return "🐙 GitHub";
  return "🔗 External Link";
}

async function trackScriptView(scriptSlug, category) {
  try {
    const { data: existing } = await supabase
      .from("script_stats")
      .select("views")
      .eq("script_slug", scriptSlug)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("script_stats")
        .update({ views: existing.views + 1, updated_at: new Date() })
        .eq("script_slug", scriptSlug);
    } else {
      await supabase
        .from("script_stats")
        .insert({ script_slug: scriptSlug, category: category, views: 1, downloads: 0 });
    }
  } catch (error) {
    console.error("Error tracking script view:", error);
  }
}

async function trackScriptDownload(scriptSlug, category) {
  try {
    const { data: existing } = await supabase
      .from("script_stats")
      .select("downloads")
      .eq("script_slug", scriptSlug)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("script_stats")
        .update({ downloads: existing.downloads + 1, updated_at: new Date() })
        .eq("script_slug", scriptSlug);
    } else {
      await supabase
        .from("script_stats")
        .insert({ script_slug: scriptSlug, category: category, views: 0, downloads: 1 });
    }
  } catch (error) {
    console.error("Error tracking script download:", error);
  }
}

export default function ScriptDetailPage({ params }) {
  const [category, setCategory] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(true);
  const [scriptStats, setScriptStats] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setCategory(resolvedParams.category);
      setScript(resolvedParams.script);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    async function loadScriptData() {
      if (!script || !category) return;

      // Load stats from Supabase
      const { data, error } = await supabase
        .from("script_stats")
        .select("*")
        .eq("script_slug", script)
        .maybeSingle();

      if (data) {
        setScriptStats(data);
        setDownloadUrl(data.download_url || "");
      } else {
        setDownloadUrl("");
      }
      
      setLoading(false);
      trackScriptView(script, category);
    }

    if (script && category) {
      loadScriptData();
    }
  }, [script, category]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  const categoryName = formatSlug(category);
  
  // Default script info
  const scriptInfo = {
    name: formatSlug(script),
    version: "v1.0",
    author: "FiveM Free Hub",
    updated: new Date().toLocaleDateString(),
    description: "Free FiveM script. Add your description here.",
    features: [
      "Feature 1: Add your features",
      "Feature 2: Customize this page",
      "Feature 3: Update via admin panel",
    ],
    installSteps: [
      "Download the script file",
      "Add to your server resources folder",
      "Add `ensure " + script + "` to your server.cfg",
      "Configure settings in config.lua",
      "Restart your server",
    ],
  };

  const platform = getPlatformIcon(downloadUrl);

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 p-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="text-2xl font-bold">
            FiveM Free Hub
          </a>

          <div className="flex gap-3">
            <a
              href={`/downloads/scripts/${category}`}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm"
            >
              Back to {categoryName}
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
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="rounded-2xl border border-gray-800 bg-zinc-950 p-4">
              <div className="flex h-[320px] items-center justify-center rounded-xl bg-gray-800 text-gray-400">
                📜 Script Preview
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm uppercase tracking-widest text-gray-400">
              {categoryName} Script
            </p>
            <h1 className="mt-2 text-4xl font-bold">{scriptInfo.name}</h1>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-800 bg-zinc-950 p-4">
                <p className="text-sm text-gray-400">Version</p>
                <p className="mt-1 font-semibold">{scriptInfo.version}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-zinc-950 p-4">
                <p className="text-sm text-gray-400">Updated</p>
                <p className="mt-1 font-semibold">{scriptInfo.updated}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-zinc-950 p-4">
                <p className="text-sm text-gray-400">Author</p>
                <p className="mt-1 font-semibold">{scriptInfo.author}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-zinc-950 p-4">
                <p className="text-sm text-gray-400">Category</p>
                <p className="mt-1 font-semibold">{categoryName}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-zinc-950 p-4">
                <p className="text-sm text-gray-400">Statistics</p>
                <div className="mt-1 space-y-1">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">👁️</span>
                      <span className="font-semibold text-white">{scriptStats?.views?.toLocaleString() || 0}</span>
                      <span className="text-gray-500">views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">⬇️</span>
                      <span className="font-semibold text-white">{scriptStats?.downloads?.toLocaleString() || 0}</span>
                      <span className="text-gray-500">downloads</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-gray-300">{scriptInfo.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {downloadUrl && downloadUrl !== "#" && downloadUrl !== "" ? (
                <a
                  href={downloadUrl}
                  onClick={() => trackScriptDownload(script, category)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gray-200 transition inline-flex items-center gap-2"
                >
                  ⬇️ Download Script
                  {platform && platform !== "🔗 External Link" && (
                    <span className="text-xs text-gray-600 font-normal">
                      ({platform})
                    </span>
                  )}
                </a>
              ) : (
                <button
                  disabled
                  className="rounded-lg bg-gray-700 px-5 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed"
                >
                  ⬇️ Coming Soon
                </button>
              )}
              <a
                href="https://discord.gg/qf367wWS"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-gray-700 px-5 py-3 text-sm hover:bg-white/10 transition"
              >
                💬 Get Support in Discord
              </a>
              
              <FavoriteButton
                brand={category}
                vehicleSlug={script}
                vehicleName={scriptInfo.name}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold">✨ Features</h2>
            <ul className="mt-4 space-y-3 text-gray-300">
              {scriptInfo.features.map((feature) => (
                <li key={feature} className="rounded-lg bg-black/30 px-4 py-3">
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold">📦 Installation</h2>
            <div className="mt-4 space-y-3 text-gray-300">
              {scriptInfo.installSteps.map((step, index) => (
                <p key={index} className="rounded-lg bg-black/30 px-4 py-3">
                  {index + 1}. {step}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}