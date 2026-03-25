"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function NewsletterSignup() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState({
    new_content: true,
    submission_updates: true,
    weekly_digest: true,
  });
  const [user, setUser] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          const { data } = await supabase
            .from("public_users")
            .select("newsletter_subscribed, email_preferences")
            .eq("id", user.id)
            .single();
          
          setSubscribed(data?.newsletter_subscribed || false);
          if (data?.email_preferences) {
            setPreferences(data.email_preferences);
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsChecking(false);
      }
    }
    getUser();
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    setMessage("");
    
    if (!user) {
      setMessage("Please log in to subscribe");
      setLoading(false);
      return;
    }
    
    const { error } = await supabase
      .from("public_users")
      .update({ 
        newsletter_subscribed: true,
        email_preferences: preferences 
      })
      .eq("id", user.id);
    
    if (error) {
      setMessage("Error subscribing. Please try again.");
    } else {
      setSubscribed(true);
      setMessage("✅ Subscribed to newsletter!");
      
      // Send welcome email to queue
      await supabase
        .from("newsletter_queue")
        .insert([{
          user_id: user.id,
          email: user.email,
          subject: "Welcome to FiveM Free Hub Newsletter!",
          content: `
            <h2>Welcome to the FiveM Free Hub Community!</h2>
            <p>Thanks for subscribing! You'll receive updates about:</p>
            <ul>
              <li>✨ New content releases</li>
              <li>⭐ Featured creations</li>
              <li>🏆 Community highlights</li>
              <li>📧 Weekly digests</li>
            </ul>
            <p>Start exploring: <a href="${window.location.origin}">Visit FiveM Free Hub</a></p>
          `,
        }]);
    }
    
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleUnsubscribe() {
    if (!user) return;
    
    const { error } = await supabase
      .from("public_users")
      .update({ newsletter_subscribed: false })
      .eq("id", user.id);
    
    if (!error) {
      setSubscribed(false);
      setMessage("✅ Unsubscribed from newsletter");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  async function updatePreferences() {
    if (!user) return;
    
    const { error } = await supabase
      .from("public_users")
      .update({ email_preferences: preferences })
      .eq("id", user.id);
    
    if (!error) {
      setMessage("✅ Preferences saved!");
      setTimeout(() => setMessage(""), 2000);
      setShowPreferences(false);
    }
  }

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-6 text-center">
        <div className="text-4xl mb-3">📧</div>
        <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-6 text-center">
        <div className="text-4xl mb-3">📧</div>
        <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
        <p className="text-gray-400 text-sm mb-4">Get weekly updates about new content, featured releases, and community highlights</p>
        <a href="/login" className="inline-block px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold hover:scale-105 transition">
          Log in to Subscribe
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">📧</div>
        <div>
          <h3 className="text-xl font-bold">Newsletter</h3>
          <p className="text-xs text-gray-400">Weekly FiveM updates</p>
        </div>
      </div>
      
      {subscribed ? (
        <div>
          <p className="text-sm text-green-400 mb-3 flex items-center gap-2">
            <span>✓</span> Subscribed to newsletter
          </p>
          
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-sm text-indigo-400 hover:text-indigo-300 mb-2 block"
          >
            ⚙️ Email Preferences
          </button>
          
          {showPreferences && (
            <div className="mt-3 p-3 rounded-lg bg-black/30 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preferences.new_content}
                  onChange={(e) => setPreferences({...preferences, new_content: e.target.checked})}
                  className="rounded"
                />
                New content notifications
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preferences.submission_updates}
                  onChange={(e) => setPreferences({...preferences, submission_updates: e.target.checked})}
                  className="rounded"
                />
                Submission status updates
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preferences.weekly_digest}
                  onChange={(e) => setPreferences({...preferences, weekly_digest: e.target.checked})}
                  className="rounded"
                />
                Weekly digest
              </label>
              <button
                onClick={updatePreferences}
                className="mt-2 text-xs px-3 py-1 rounded bg-indigo-500 text-white"
              >
                Save Preferences
              </button>
            </div>
          )}
          
          <button
            onClick={handleUnsubscribe}
            className="text-sm text-red-400 hover:text-red-300 block mt-2"
          >
            Unsubscribe
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Get the latest content delivered to your inbox</p>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Subscribing..." : "Subscribe to Newsletter"}
          </button>
        </div>
      )}
      
      {message && (
        <p className={`mt-3 text-sm ${message.includes("✅") ? "text-green-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}