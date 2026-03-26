"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";

export default function SubmitPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [formData, setFormData] = useState({
    type: "vehicle",
    category: "",
    name: "",
    description: "",
    version: "v1.0.0",
    download_url: "",
    image_url: "",
    features: [],
    install_steps: [],
  });
  const [featureInput, setFeatureInput] = useState("");
  const [stepInput, setStepInput] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        
        await supabase
          .from("public_users")
          .update({ last_active: new Date() })
          .eq("id", user.id);
      }
    }
    checkAuth();
  }, [router]);

  const categories = {
    vehicle: [
  "acura", "alfa romeo", "alpine", "aston martin", "audi", "bentley", "bmw", "bugatti",
  "buick", "cadillac", "chevrolet", "chrysler", "citroen", "dacia", "daihatsu", "dodge",
  "ds", "ferrari", "fiat", "ford", "genesis", "gmc", "honda", "hyundai", "infiniti",
  "isuzu", "jaguar", "jeep", "kia", "koenigsegg", "lamborghini", "land rover", "lexus",
  "lincoln", "lotus", "maserati", "mazda", "mclaren", "mercedes", "mg", "mini",
  "mitsubishi", "morgan", "nissan", "pagani", "peugeot", "porsche", "ram", "renault",
  "rolls-royce", "seat", "skoda", "subaru", "suzuki", "tesla", "toyota", "volkswagen", "volvo"
],
    motorcycle: ["sport", "cruiser", "dirt", "touring", "scooter", "atv"],
    boat: ["speed", "yacht", "jetski", "fishing", "police", "cargo"],
    aircraft: ["helicopter", "commercial", "private", "fighter", "prop", "vtol"],
    script: ["inventory", "hud", "menus", "jobs", "heists", "maps", "chats", "loadscreens", "phones", "peds", "guns"],
    clothing: ["male", "female", "uniforms", "eup"],
    server_ad: ["free", "paid", "partners"],
    gun: ["pistols", "rifles", "shotguns", "smgs", "sniper", "heavy"],
    ped: ["civilian", "police", "emergency", "gang", "custom"],
    map: ["mlos", "interiors", "race", "addon", "misc"],
  };

  const typeIcons = {
    vehicle: "🚗",
    motorcycle: "🏍️",
    boat: "⛵",
    aircraft: "✈️",
    script: "📜",
    clothing: "👕",
    server_ad: "📢",
    gun: "🔫",
    ped: "👥",
    map: "🗺️",
  };

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setMessage("❌ Image must be less than 5MB");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      setMessage("❌ Please upload an image file");
      return;
    }
    
    setUploadingImage(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `submissions/${user.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from("content-images")
        .upload(filePath, file);
      
      if (error) {
        setFormData({ ...formData, image_url: imagePreview });
      } else {
        const { data: urlData } = supabase.storage
          .from("content-images")
          .getPublicUrl(filePath);
        
        setFormData({ ...formData, image_url: urlData.publicUrl });
        setMessage("✅ Image uploaded successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("❌ Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!user) {
      setMessage("Please log in to submit content.");
      setLoading(false);
      return;
    }

    if (!formData.name || !formData.category || !formData.description || !formData.download_url) {
      setMessage("❌ Please fill in all required fields");
      setLoading(false);
      return;
    }
    
    if (!formData.image_url && !imagePreview) {
      setMessage("❌ Please upload a preview image");
      setLoading(false);
      return;
    }

    const slug = formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase
      .from("submissions")
      .insert([{
        user_id: user.id,
        type: formData.type,
        category: formData.category,
        name: formData.name,
        description: formData.description,
        version: formData.version,
        download_url: formData.download_url,
        image_url: formData.image_url || imagePreview,
        images: imageUrls,
        features: formData.features,
        install_steps: formData.install_steps,
        status: "pending",
      }]);

    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
      return;
    }

    setMessage("✅ Your submission has been sent for review! An admin will review it soon.");
    setFormData({
      type: "vehicle",
      category: "",
      name: "",
      description: "",
      version: "v1.0.0",
      download_url: "",
      image_url: "",
      features: [],
      install_steps: [],
    });
    setImagePreview(null);
    setImageUrls([]);
    setFeatureInput("");
    setStepInput("");
    setLoading(false);
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

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">Redirecting to login...</div>
      </main>
    );
  }

  const currentCategories = categories[formData.type] || [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Submit Your Content</h1>
          <p className="text-gray-400 mt-2">Share your creations with the FiveM community</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">Content Type *</label>
              <div className="flex flex-wrap gap-4">
                {["vehicle", "motorcycle", "boat", "aircraft", "script", "clothing", "server_ad", "gun", "ped", "map"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, category: "" })}
                      className="w-4 h-4 text-indigo-500"
                    />
                    <span className="capitalize flex items-center gap-1">
                      {typeIcons[type]} {type === "server_ad" ? "Server Ad" : type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-semibold mb-2">Category *</label>
              <div className="relative">
                <div
                  className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white cursor-pointer flex justify-between items-center"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <span>
                    {formData.category 
                      ? formData.category.charAt(0).toUpperCase() + formData.category.slice(1) 
                      : "Select category"}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-700 bg-black/95 backdrop-blur-lg max-h-60 overflow-y-auto">
                    <div className="sticky top-0 p-2 border-b border-gray-700 bg-black">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-black/50 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="py-1">
                      {currentCategories.filter(cat => 
                        cat.toLowerCase().includes(categorySearch.toLowerCase())
                      ).map((cat) => (
                        <div
                          key={cat}
                          className="px-4 py-2 hover:bg-indigo-500/20 cursor-pointer transition capitalize"
                          onClick={() => {
                            setFormData({ ...formData, category: cat });
                            setShowCategoryDropdown(false);
                            setCategorySearch("");
                          }}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </div>
                      ))}
                      {currentCategories.filter(cat => 
                        cat.toLowerCase().includes(categorySearch.toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-2 text-gray-400 text-sm">No categories found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{currentCategories.length} categories available</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Ferrari 488 GTB, Yamaha R6, Speedboat 3000"
                className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Version */}
            <div>
              <label className="block text-sm font-semibold mb-2">Version</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="v1.0.0"
                className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe your content, what it does, and any special features..."
                className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Download URL */}
            <div>
              <label className="block text-sm font-semibold mb-2">Download URL *</label>
              <input
                type="url"
                value={formData.download_url}
                onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                placeholder="https://drive.google.com/your-file-link"
                className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Google Drive, MediaFire, or direct link</p>
            </div>

            {/* Main Image Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">Preview Image *</label>
              <div className="flex flex-col gap-4">
                <div className="flex gap-3 items-center flex-wrap">
                  <label className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 transition text-white px-5 py-2 rounded-xl text-sm font-semibold">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      required={!formData.image_url && !imagePreview}
                    />
                  </label>
                  <span className="text-sm text-gray-400">Max 5MB (JPG, PNG, GIF)</span>
                </div>
                
                {imagePreview && (
                  <div className="mt-2">
                    <div className="rounded-xl overflow-hidden border border-gray-700 w-32 h-32">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-green-400 mt-1">✓ Image ready</p>
                  </div>
                )}
                
                {uploadingImage && (
                  <p className="text-sm text-yellow-400">Uploading image...</p>
                )}
              </div>
            </div>

            {/* Additional Images */}
            <div>
              <label className="block text-sm font-semibold mb-2">Additional Images (Gallery)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 rounded-xl border border-gray-700 bg-black/50 px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="button" onClick={addImage} className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600">
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
              <p className="text-xs text-gray-500 mt-2">{imageUrls.length} additional images</p>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-semibold mb-2">Features</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="e.g., Custom handling, Working lights"
                  className="flex-1 rounded-xl border border-gray-700 bg-black/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <button type="button" onClick={addFeature} className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600">
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                    <span className="text-green-400">✓</span>
                    <span className="flex-1 text-sm">{feature}</span>
                    <button type="button" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-300">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Installation Steps */}
            <div>
              <label className="block text-sm font-semibold mb-2">Installation Steps</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  placeholder="e.g., Download and extract to resources folder"
                  className="flex-1 rounded-xl border border-gray-700 bg-black/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInstallStep())}
                />
                <button type="button" onClick={addInstallStep} className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600">
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.install_steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                    <span className="text-blue-400 font-bold">{i + 1}.</span>
                    <span className="flex-1 text-sm">{step}</span>
                    <button type="button" onClick={() => removeInstallStep(i)} className="text-red-400 hover:text-red-300">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit for Review"}
            </button>

            {message && (
              <div className={`p-4 rounded-xl ${message.includes("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}