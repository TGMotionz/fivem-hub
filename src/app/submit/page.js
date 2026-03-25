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
        
        // Update last active
        await supabase
          .from("public_users")
          .update({ last_active: new Date() })
          .eq("id", user.id);
      }
    }
    checkAuth();
  }, [router]);

  const categories = {
    vehicle: ["dodge", "ferrari", "bmw", "tesla", "audi", "mercedes", "porsche", "lamborghini", "ford", "chevrolet"],
    script: ["inventory", "hud", "menus", "jobs", "heists", "maps", "chats", "loadscreens", "phones", "peds", "guns"],
    clothing: ["male", "female", "uniforms", "eup"],
  };

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("❌ Image must be less than 5MB");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      setMessage("❌ Please upload an image file");
      return;
    }
    
    setUploadingImage(true);
    
    try {
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `submissions/${user.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from("content-images")
        .upload(filePath, file);
      
      if (error) {
        console.error("Upload error:", error);
        // Still use base64 preview as fallback
        setFormData({ ...formData, image_url: imagePreview });
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from("content-images")
          .getPublicUrl(filePath);
        
        setFormData({ ...formData, image_url: urlData.publicUrl });
        setMessage("✅ Image uploaded successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
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

    // Validate required fields - IMAGE IS NOW REQUIRED
    if (!formData.name || !formData.category || !formData.description || !formData.download_url) {
      setMessage("❌ Please fill in all required fields (Name, Category, Description, Download URL)");
      setLoading(false);
      return;
    }
    
    if (!formData.image_url && !imagePreview) {
      setMessage("❌ Please upload a preview image");
      setLoading(false);
      return;
    }

    // Create submission
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
              <div className="flex gap-4">
                {["vehicle", "script", "clothing"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, category: "" })}
                      className="w-4 h-4 text-indigo-500"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select category</option>
                {categories[formData.type]?.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Ferrari 488 GTB, Advanced Inventory System"
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

            {/* Image Upload - REQUIRED */}
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
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-2">
                    <div className="rounded-xl overflow-hidden border border-gray-700 w-32 h-32">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-green-400 mt-1">✓ Image ready</p>
                  </div>
                )}
                
                {!imagePreview && formData.image_url && (
                  <div className="mt-2">
                    <div className="rounded-xl overflow-hidden border border-gray-700 w-32 h-32">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                
                {uploadingImage && (
                  <p className="text-sm text-yellow-400">Uploading image...</p>
                )}
              </div>
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