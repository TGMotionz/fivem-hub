"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("vehicles");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [formData, setFormData] = useState({
    type: "vehicle",
    name: "",
    category: "",
    slug: "",
    description: "",
    version: "v1.0.0",
    download_url: "",
    image_url: "",
    images: [],
    features: [],
    install_steps: [],
  });
  const [featureInput, setFeatureInput] = useState("");
  const [stepInput, setStepInput] = useState("");

  const adminEmails = ["kjek98@gmail.com", "your-email@gmail.com", "admin@example.com"];

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user && adminEmails.includes(user.email)) {
        setIsAdmin(true);
        loadContent();
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [activeTab]);

  async function loadContent() {
    setLoading(true);
    let type = "";
    if (activeTab === "vehicles") type = "vehicle";
    else if (activeTab === "scripts") type = "script";
    else if (activeTab === "guns") type = "gun";
    else if (activeTab === "peds") type = "ped";
    else if (activeTab === "maps") type = "map";
    else if (activeTab === "clothing") type = "clothing";
    else if (activeTab === "server-ads") type = "server_ad";
    
    const { data, error } = await supabase
      .from("content_items")
      .select("*")
      .eq("type", type)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    } else {
      console.error("Error loading content:", error);
      setItems([]);
    }
    setLoading(false);
  }

  async function handleDelete(item) {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This cannot be undone.`)) return;
    
    setLoading(true);
    
    const { error } = await supabase
      .from("content_items")
      .delete()
      .eq("id", item.id);
    
    if (error) {
      setMessage(`❌ Error deleting: ${error.message}`);
    } else {
      setMessage(`✅ Deleted "${item.name}" successfully!`);
      await loadContent();
    }
    
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleFeaturedToggle(itemId, isFeatured) {
    const { error } = await supabase
      .from("content_items")
      .update({ is_featured: !isFeatured })
      .eq("id", itemId);
    
    if (!error) {
      await loadContent();
      setMessage(isFeatured ? "⭐ Removed from featured" : "⭐ Added to featured!");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  async function handleAddContent(e) {
    e.preventDefault();
    setLoading(true);
    
    const slug = formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    const { error } = await supabase
      .from("content_items")
      .insert([{
        type: formData.type,
        category: formData.category.toLowerCase(),
        slug: slug,
        name: formData.name,
        description: formData.description,
        version: formData.version,
        download_url: formData.download_url,
        image_url: formData.image_url,
        images: imageUrls,
        features: formData.features,
        install_steps: formData.install_steps,
        views: 0,
        downloads: 0,
        created_at: new Date(),
      }]);
    
    if (error) {
      setMessage(`❌ Error adding: ${error.message}`);
    } else {
      setMessage(`✅ Added "${formData.name}" successfully!`);
      setShowAddModal(false);
      resetForm();
      await loadContent();
    }
    
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setFormData({
      type: item.type,
      name: item.name,
      category: item.category,
      slug: item.slug,
      description: item.description || "",
      version: item.version || "v1.0.0",
      download_url: item.download_url || "",
      image_url: item.image_url || "",
      images: item.images || [],
      features: item.features || [],
      install_steps: item.install_steps || [],
    });
    setImageUrls(item.images || []);
    setShowEditModal(true);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from("content_items")
      .update({
        name: formData.name,
        category: formData.category,
        slug: formData.slug,
        description: formData.description,
        version: formData.version,
        download_url: formData.download_url,
        image_url: formData.image_url,
        images: imageUrls,
        features: formData.features,
        install_steps: formData.install_steps,
        updated_at: new Date(),
      })
      .eq("id", editingItem.id);
    
    if (error) {
      setMessage(`❌ Error updating: ${error.message}`);
    } else {
      setMessage(`✅ Updated "${formData.name}" successfully!`);
      await loadContent();
      setShowEditModal(false);
      setEditingItem(null);
      resetForm();
    }
    
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  }

  function resetForm() {
    setFormData({
      type: "vehicle",
      name: "",
      category: "",
      slug: "",
      description: "",
      version: "v1.0.0",
      download_url: "",
      image_url: "",
      images: [],
      features: [],
      install_steps: [],
    });
    setImageUrls([]);
    setNewImageUrl("");
    setFeatureInput("");
    setStepInput("");
  }

  function addImage() {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  }

  function removeImage(index) {
    const newImages = [...imageUrls];
    newImages.splice(index, 1);
    setImageUrls(newImages);
  }

  function addFeature() {
    if (featureInput.trim()) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
      setFeatureInput("");
    }
  }

  function removeFeature(index) {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  }

  function addInstallStep() {
    if (stepInput.trim()) {
      setFormData({ ...formData, install_steps: [...formData.install_steps, stepInput.trim()] });
      setStepInput("");
    }
  }

  function removeInstallStep(index) {
    const newSteps = [...formData.install_steps];
    newSteps.splice(index, 1);
    setFormData({ ...formData, install_steps: newSteps });
  }

  if (!user || !isAdmin) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">
          <p className="text-red-400">Access Denied</p>
          <Link href="/" className="mt-4 inline-block text-indigo-400">Go Home</Link>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: "vehicles", label: "🚗 Vehicles" },
    { id: "scripts", label: "📜 Scripts" },
    { id: "guns", label: "🔫 Guns" },
    { id: "peds", label: "👥 Peds" },
    { id: "maps", label: "🗺️ Maps" },
    { id: "clothing", label: "👕 Clothing" },
    { id: "server-ads", label: "📢 Server Ads" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Content Manager</h1>
            <p className="text-gray-400 mt-2">Manage, edit, and feature your content</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:scale-105 transition"
          >
            + Add New Content
          </button>
        </div>
        
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${message.includes("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setLoading(true); }}
              className={`px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-indigo-500 text-indigo-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label} ({items.filter(i => 
                tab.id === "vehicles" ? i.type === "vehicle" :
                tab.id === "scripts" ? i.type === "script" :
                tab.id === "guns" ? i.type === "gun" :
                tab.id === "peds" ? i.type === "ped" :
                tab.id === "maps" ? i.type === "map" :
                tab.id === "clothing" ? i.type === "clothing" : i.type === "server_ad"
              ).length})
            </button>
          ))}
        </div>

        {/* Content List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Loading content...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-400">No content found. Click "Add New Content" to add some!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 transition">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {item.images && item.images.length > 0 ? (
                    <div className="flex gap-1">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      {item.images.length > 1 && (
                        <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                          +{item.images.length - 1}
                        </div>
                      )}
                    </div>
                  ) : item.image_url ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center text-2xl">
                      {item.type === "vehicle" ? "🚗" : item.type === "script" ? "📜" : "📦"}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold">{item.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 capitalize">{item.category}</span>
                      <span className="text-xs text-gray-500">v{item.version}</span>
                      {item.is_featured && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">⭐ Featured</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>👁️ {item.views || 0}</span>
                      <span>⬇️ {item.downloads || 0}</span>
                      <span>📷 {item.images?.length || 0} images</span>
                      <span>📅 {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 text-sm rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleFeaturedToggle(item.id, item.is_featured)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition ${
                        item.is_featured 
                          ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" 
                          : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                      }`}
                    >
                      {item.is_featured ? "⭐ Featured" : "☆ Make Featured"}
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1.5 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Add New Content</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <form onSubmit={handleAddContent} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                    required
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Category *</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value.toLowerCase() })}
                      placeholder="e.g., dodge, inventory, pistols"
                      className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Version</label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Download URL</label>
                    <input
                      type="url"
                      value={formData.download_url}
                      onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Main Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                    />
                  </div>
                </div>
                
                {/* Multiple Images Section */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Additional Images (Gallery)</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 rounded-lg border border-gray-700 bg-black px-4 py-2 text-white text-sm"
                    />
                    <button type="button" onClick={addImage} className="px-4 py-2 rounded-lg bg-indigo-500 text-white">
                      Add
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {imageUrls.map((url, i) => (
                      <div key={i} className="relative group">
                        <div className="h-20 rounded-lg overflow-hidden bg-gray-800">
                          <img src={url} alt={`Image ${i+1}`} className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{imageUrls.length} images in gallery</p>
                </div>
                
                {/* Features */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Features</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Add a feature"
                      className="flex-1 rounded-lg border border-gray-700 bg-black px-4 py-2 text-white text-sm"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    />
                    <button type="button" onClick={addFeature} className="px-4 py-2 rounded-lg bg-indigo-500 text-white">Add</button>
                  </div>
                  <div className="space-y-1">
                    {formData.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1">
                        <span className="flex-1 text-sm">{f}</span>
                        <button type="button" onClick={() => removeFeature(i)} className="text-red-400">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Installation Steps */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Installation Steps</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={stepInput}
                      onChange={(e) => setStepInput(e.target.value)}
                      placeholder="Add installation step"
                      className="flex-1 rounded-lg border border-gray-700 bg-black px-4 py-2 text-white text-sm"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInstallStep())}
                    />
                    <button type="button" onClick={addInstallStep} className="px-4 py-2 rounded-lg bg-indigo-500 text-white">Add</button>
                  </div>
                  <div className="space-y-1">
                    {formData.install_steps.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1">
                        <span className="text-blue-400 text-sm font-bold">{i+1}.</span>
                        <span className="flex-1 text-sm">{s}</span>
                        <button type="button" onClick={() => removeInstallStep(i)} className="text-red-400">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Content"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Edit Content</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                    required
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value.toLowerCase() })}
                      className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Slug (URL)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                      className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Version</label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Download URL</label>
                    <input
                      type="url"
                      value={formData.download_url}
                      onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Main Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                  />
                </div>
                
                {/* Multiple Images Section */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Additional Images (Gallery)</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 rounded-lg border border-gray-700 bg-black px-4 py-2 text-white text-sm"
                    />
                    <button type="button" onClick={addImage} className="px-4 py-2 rounded-lg bg-indigo-500 text-white">
                      Add
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {imageUrls.map((url, i) => (
                      <div key={i} className="relative group">
                        <div className="h-20 rounded-lg overflow-hidden bg-gray-800">
                          <img src={url} alt={`Image ${i+1}`} className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{imageUrls.length} images in gallery</p>
                </div>
                
                {/* Features */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Features</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Add a feature"
                      className="flex-1 rounded-lg border border-gray-700 bg-black px-4 py-2 text-white text-sm"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    />
                    <button type="button" onClick={addFeature} className="px-4 py-2 rounded-lg bg-indigo-500 text-white">Add</button>
                  </div>
                  <div className="space-y-1">
                    {formData.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1">
                        <span className="flex-1 text-sm">{f}</span>
                        <button type="button" onClick={() => removeFeature(i)} className="text-red-400">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Installation Steps */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Installation Steps</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={stepInput}
                      onChange={(e) => setStepInput(e.target.value)}
                      placeholder="Add installation step"
                      className="flex-1 rounded-lg border border-gray-700 bg-black px-4 py-2 text-white text-sm"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInstallStep())}
                    />
                    <button type="button" onClick={addInstallStep} className="px-4 py-2 rounded-lg bg-indigo-500 text-white">Add</button>
                  </div>
                  <div className="space-y-1">
                    {formData.install_steps.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1">
                        <span className="text-blue-400 text-sm font-bold">{i+1}.</span>
                        <span className="flex-1 text-sm">{s}</span>
                        <button type="button" onClick={() => removeInstallStep(i)} className="text-red-400">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}