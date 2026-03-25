"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAdmin(user?.email === "kjek98@gmail.com");
      if (user?.email === "kjek98@gmail.com") {
        loadReports();
      }
    }
    checkAuth();
  }, []);

  async function loadReports() {
    const { data } = await supabase
      .from("reports")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    setReports(data || []);
    setLoading(false);
  }

  async function handleAction(reportId, action) {
    await supabase
      .from("reports")
      .update({ status: action, resolved_at: new Date() })
      .eq("id", reportId);
    
    loadReports();
  }

  if (!user || !isAdmin) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="text-center py-20">Access Denied</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Reports</h1>
        
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No pending reports</div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="rounded-xl border border-gray-800 bg-zinc-900/30 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{report.type}: {report.target_name}</p>
                    <p className="text-sm text-gray-400 mt-1">Reason: {report.reason}</p>
                    <p className="text-xs text-gray-500 mt-2">Reported: {new Date(report.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(report.id, "dismissed")}
                      className="px-3 py-1 rounded-lg bg-gray-600 text-white"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleAction(report.id, "action_taken")}
                      className="px-3 py-1 rounded-lg bg-red-500 text-white"
                    >
                      Take Action
                    </button>
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