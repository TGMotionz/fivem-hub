"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function OnlineUsers() {
  const [onlineCount, setOnlineCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function updateOnlineStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from("public_users")
          .update({ last_active: new Date() })
          .eq("id", user.id);
      }
    }
    
    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadOnlineUsers() {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const { data, error } = await supabase
        .from("public_users")
        .select("id, username, email, avatar_url")
        .gte("last_active", fiveMinutesAgo.toISOString())
        .order("last_active", { ascending: false });
      
      if (!error && data) {
        setOnlineCount(data.length);
        setRecentUsers(data.slice(0, 5));
      }
      setLoading(false);
    }
    
    loadOnlineUsers();
    const interval = setInterval(loadOnlineUsers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-gray-800">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 rounded-xl p-4 border border-gray-800 hover:border-indigo-500 transition">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
        </div>
        <h3 className="text-sm font-semibold text-gray-400">Online Now</h3>
      </div>
      
      <div className="text-3xl font-bold text-white mb-2">{onlineCount}</div>
      <p className="text-xs text-gray-500">active in the last 5 minutes</p>
      
      {recentUsers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2">Recently active:</p>
          <div className="flex -space-x-2">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-black"
                title={user.username || user.email}
              >
                {(user.username || user.email || "U").charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}