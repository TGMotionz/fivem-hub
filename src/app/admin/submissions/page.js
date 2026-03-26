"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAdmin(user?.email === "kjek98@gmail.com");
      
      if (user?.email === "kjek98@gmail.com") {
        loadSubmissions();
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  async function loadSubmissions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("submissions")
      .select(`
        *,
        public_users (
          username,
          email
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSubmissions(data);
    }
    setLoading(false);
  }

  async function handleApprove(submission) {
    setProcessingId(submission.id);
    setMessage("");
    
    let slug = submission.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    const { data: existing } = await supabase
      .from("content_items")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }
    
    // Update submission to approved
    const { error: updateError } = await supabase
      .from("submissions")
      .update({ status: "approved", updated_at: new Date() })
      .eq("id", submission.id);
    
    if (updateError) {
      setMessage(`❌ Error updating: ${updateError.message}`);
      setProcessingId(null);
      return;
    }
    
    // Create content item with author_id
    const { error: contentError } = await supabase
      .from("content_items")
      .insert([{
        type: submission.type,
        category: submission.category,
        slug: slug,
        name: submission.name,
        description: submission.description,
        version: submission.version || "v1.0.0",
        download_url: submission.download_url,
        image_url: submission.image_url,
        images: submission.images || [],
        features: submission.features || [],
        install_steps: submission.install_steps || [],
        author_id: submission.user_id,  // This sets the original creator
        views: 0,
        downloads: 0,
        created_at: new Date(),
      }]);
    
    if (contentError) {
      setMessage(`❌ Error creating content: ${contentError.message}`);
    } else {
      // Update user's contribution count
      const { data: userData } = await supabase
        .from("public_users")
        .select("contributions")
        .eq("id", submission.user_id)
        .single();
      
      if (userData) {
        await supabase
          .from("public_users")
          .update({ contributions: (userData.contributions || 0) + 1 })
          .eq("id", submission.user_id);
      }
      
      setMessage(`✅ Approved "${submission.name}"!`);
      await loadSubmissions();
    }
    
    setProcessingId(null);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleReject(submission) {
    setProcessingId(submission.id);
    
    const { error } = await supabase
      .from("submissions")
      .update({ status: "rejected", updated_at: new Date() })
      .eq("id", submission.id);
    
    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage(`❌ Rejected "${submission.name}"`);
      await loadSubmissions();
    }
    
    setProcessingId(null);
    setTimeout(() => setMessage(""), 3000);
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">
          <p className="text-red-400">Please log in</p>
          <Link href="/login" className="mt-4 inline-block text-indigo-400">Go to Login</Link>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">
          <p className="text-red-400">Admin access required</p>
          <Link href="/" className="mt-4 inline-block text-indigo-400">Go Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Pending Submissions</h1>
            <p className="text-gray-400 mt-2">{submissions.length} submissions waiting for review</p>
          </div>
          <Link href="/admin" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Admin
          </Link>
        </div>
        
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${message.includes("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-400">No pending submissions. All caught up!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((sub) => (
              <div key={sub.id} className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {sub.image_url && (
                    <div className="lg:w-48 h-48 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                      <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-2xl font-bold">{sub.name}</h2>
                          <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400 capitalize">
                            {sub.type}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300 capitalize">
                            {sub.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Submitted by: {sub.public_users?.username || sub.public_users?.email?.split("@")[0] || "Anonymous"} • {new Date(sub.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(sub)}
                          disabled={processingId === sub.id}
                          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50"
                        >
                          {processingId === sub.id ? "Processing..." : "✓ Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(sub)}
                          disabled={processingId === sub.id}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
                        >
                          {processingId === sub.id ? "Processing..." : "✗ Reject"}
                        </button>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-gray-300">{sub.description}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      {sub.version && <span>📦 Version: {sub.version}</span>}
                      {sub.download_url && (
                        <a href={sub.download_url} target="_blank" className="text-indigo-400 hover:text-indigo-300">
                          🔗 Download Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}