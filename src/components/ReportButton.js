"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReportButton({ type, targetId, targetName }) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function submitReport() {
    if (!reason.trim()) {
      setMessage("Please provide a reason");
      return;
    }
    
    setSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setMessage("Please log in to report");
      setSubmitting(false);
      return;
    }
    
    const { error } = await supabase
      .from("reports")
      .insert({
        type,
        target_id: targetId,
        target_name: targetName,
        reason: reason,
        reporter_id: user.id,
        status: "pending",
      });
    
    if (error) {
      setMessage("Error submitting report");
    } else {
      setMessage("Report submitted! Thank you for helping keep the community safe.");
      setTimeout(() => {
        setShowModal(false);
        setReason("");
        setMessage("");
      }, 2000);
    }
    
    setSubmitting(false);
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs text-gray-400 hover:text-red-400 transition"
      >
        🚨 Report
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Report Content</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">Reporting: <span className="text-white">{targetName}</span></p>
            
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you're reporting this content..."
              rows={4}
              className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={submitReport}
                disabled={submitting}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-700 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
            
            {message && (
              <p className={`mt-3 text-sm ${message.includes("Thank") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}