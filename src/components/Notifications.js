"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUser(user);
      
      // Try to load notifications, handle error gracefully
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (fetchError) {
        console.error("Notifications table may not exist:", fetchError);
        setError(true);
        return;
      }
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    }
    
    loadNotifications();
  }, []);

  async function markAsRead(notificationId) {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
    
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => prev - 1);
  }

  if (!user) return null;
  
  if (error) {
    return null; // Hide notifications if table doesn't exist
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-xl p-2 hover:bg-white/10 transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 rounded-xl border border-gray-700 bg-zinc-900 shadow-xl overflow-hidden z-50">
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-800 hover:bg-white/5 transition ${!notif.read ? 'bg-indigo-500/5' : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <Link href={notif.link || '#'} className="block">
                    <div className="flex gap-3">
                      <div className="text-2xl">
                        {notif.type === 'submission_approved' && '✅'}
                        {notif.type === 'submission_rejected' && '❌'}
                        {notif.type === 'badge_earned' && '🏆'}
                        {!notif.type && '🔔'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{notif.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}