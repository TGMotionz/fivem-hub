"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";

export default function AdsAdminPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    slot: 1,
    advertiser_name: "",
    advertiser_website: "",
    end_date: "",
    is_active: true,
  });

  useEffect(() => {
    loadAds();
  }, []);

  async function loadAds() {
    const { data } = await supabase
      .from("ads")
      .select("*")
      .order("slot", { ascending: true });
    
    setAds(data || []);
    setLoading(false);
  }

  async function handleAddAd(e) {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from("ads")
      .insert([{
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        link_url: formData.link_url,
        slot: formData.slot,
        advertiser_name: formData.advertiser_name,
        advertiser_website: formData.advertiser_website,
        end_date: formData.end_date || null,
        is_active: true,
      }]);
    
    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage("✅ Ad added successfully!");
      setShowAddModal(false);
      setFormData({
        title: "",
        description: "",
        image_url: "",
        link_url: "",
        slot: 1,
        advertiser_name: "",
        advertiser_website: "",
        end_date: "",
        is_active: true,
      });
      loadAds();
    }
    
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function toggleAdStatus(id, currentStatus) {
    const { error } = await supabase
      .from("ads")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    
    if (!error) loadAds();
  }

  async function deleteAd(id) {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    
    const { error } = await supabase
      .from("ads")
      .delete()
      .eq("id", id);
    
    if (!error) loadAds();
  }

  const slotColors = {
    1: "border-indigo-500",
    2: "border-purple-500",
    3: "border-pink-500",
    4: "border-blue-500",
  };

  const slotLabels = {
    1: "🥇 Premium Slot",
    2: "🥈 Featured Slot",
    3: "🥉 Standard Slot",
    4: "📌 Basic Slot",
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Advertising Manager</h1>
            <p className="text-gray-400 mt-2">Manage sponsored ads in the 4-slot grid</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:scale-105 transition"
          >
            + Add New Ad
          </button>
        </div>
        
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${message.includes("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {message}
          </div>
        )}

        {/* Ad Slots Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((slot) => {
            const ad = ads.find(a => a.slot === slot);
            return (
              <div key={slot} className={`rounded-xl border-2 ${ad ? slotColors[slot] : "border-gray-700"} bg-zinc-900/30 p-4`}>
                <div className="text-center">
                  <div className="text-lg font-bold mb-1">{slotLabels[slot]}</div>
                  {ad ? (
                    <>
                      <p className="text-sm text-green-400 mb-1">✓ Occupied</p>
                      <p className="text-xs text-gray-400 truncate">{ad.title}</p>
                      <p className="text-xs text-gray-500">Clicks: {ad.clicks || 0} | Impressions: {ad.impressions || 0}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-400 mb-1">Available</p>
                      <p className="text-xs text-gray-500">Ready for advertising</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📢</div>
            <p className="text-gray-400">No ads yet. Create your first ad!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => (
              <div key={ad.id} className={`rounded-xl border-l-4 ${slotColors[ad.slot] || "border-indigo-500"} bg-zinc-900/30 p-4`}>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold">{ad.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{ad.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span>Slot {ad.slot} - {slotLabels[ad.slot]}</span>
                          <span>📊 Clicks: {ad.clicks || 0}</span>
                          <span>👁️ Impressions: {ad.impressions || 0}</span>
                          {ad.advertiser_name && <span>🏢 {ad.advertiser_name}</span>}
                          {ad.end_date && <span>📅 Ends: {new Date(ad.end_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                          className={`px-3 py-1.5 text-sm rounded-lg ${
                            ad.is_active 
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" 
                              : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                          }`}
                        >
                          {ad.is_active ? "Active ✓" : "Inactive"}
                        </button>
                        <button
                          onClick={() => deleteAd(ad.id)}
                          className="px-3 py-1.5 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Ad Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-gray-700 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add New Ad</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleAddAd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Ad Slot *</label>
                <select
                  value={formData.slot}
                  onChange={(e) => setFormData({ ...formData, slot: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                >
                  <option value={1}>Slot 1 - 🥇 Premium (Top Left)</option>
                  <option value={2}>Slot 2 - 🥈 Featured (Top Right)</option>
                  <option value={3}>Slot 3 - 🥉 Standard (Bottom Left)</option>
                  <option value={4}>Slot 4 - 📌 Basic (Bottom Right)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Image URL *</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/ad-banner.jpg"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 300x200px</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Link URL *</label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://discord.gg/..."
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                  required
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold mb-1">Advertiser Name</label>
                  <input
                    type="text"
                    value={formData.advertiser_name}
                    onChange={(e) => setFormData({ ...formData, advertiser_name: e.target.value })}
                    placeholder="Company Name"
                    className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Advertiser Website</label>
                  <input
                    type="url"
                    value={formData.advertiser_website}
                    onChange={(e) => setFormData({ ...formData, advertiser_website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">End Date (optional)</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600"
              >
                {loading ? "Adding..." : "Add Ad"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}