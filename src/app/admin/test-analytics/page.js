"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";

export default function TestAnalyticsPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function addTestData() {
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMessage("❌ Please log in first");
        setLoading(false);
        return;
      }
      
      const contentSlugs = ["dodge-charger-2018", "ferrari-488-gtb", "bmw-m4-competition", "tesla-model-s-plaid"];
      
      // Add a single download record first to test
      const { error: testError } = await supabase
        .from("download_analytics")
        .insert({
          content_slug: contentSlugs[0],
          content_type: "vehicle",
          user_id: user.id,
        });
      
      if (testError) {
        setMessage("❌ Error inserting: " + testError.message);
        setLoading(false);
        return;
      }
      
      setMessage("✅ Test data added successfully! Check the analytics page.");
      
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Error: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Test Analytics Data</h1>
        <p className="text-gray-400 mb-6">Click the button to add a test download record</p>
        
        <button
          onClick={addTestData}
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:scale-105 transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Test Data"}
        </button>
        
        {message && (
          <div className={`mt-6 p-4 rounded-xl max-w-md mx-auto ${message.includes("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}