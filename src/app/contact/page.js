"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Save contact message to database
      const { error } = await supabase
        .from("contact_messages")
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          created_at: new Date(),
        }]);

      if (error) throw error;

      setMessage("✅ Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setMessage("❌ Error sending message. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have questions about advertising, partnerships, or just want to say hello? We'd love to hear from you!
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-12">
          <div className="rounded-xl border border-gray-800 bg-zinc-900/50 p-6 text-center">
            <div className="text-4xl mb-3">📧</div>
            <h3 className="font-semibold mb-2">Email</h3>
            <a href="mailto:hello@fivemhub.com" className="text-indigo-400 hover:text-indigo-300 text-sm">
              hello@fivemhub.com
            </a>
          </div>
          <div className="rounded-xl border border-gray-800 bg-zinc-900/50 p-6 text-center">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-semibold mb-2">Discord</h3>
            <a href="https://discord.gg/qf367wWS" target="_blank" className="text-indigo-400 hover:text-indigo-300 text-sm">
              Join our Discord
            </a>
          </div>
          <div className="rounded-xl border border-gray-800 bg-zinc-900/50 p-6 text-center">
            <div className="text-4xl mb-3">📢</div>
            <h3 className="font-semibold mb-2">Advertising</h3>
            <p className="text-sm text-gray-400">Contact us for ad space</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-8">
          <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
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