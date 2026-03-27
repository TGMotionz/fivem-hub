"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Header from "@/components/Header";
import ReputationBadge from "@/components/ReputationBadge";

export default function UserProfilePage({ params }) {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [userDownloads, setUserDownloads] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    discord: "",
    twitter: "",
    github: "",
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadParams() {
      const resolved = await params;
      setUserId(resolved.userId);
    }
    loadParams();
    
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    getCurrentUser();
  }, [params]);

  useEffect(() => {
    async function loadUserData() {
      if (!userId) return;
      
      try {
        // Get user info from public_users table
        const { data: userData, error } = await supabase
          .from("public_users")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (error) throw error;
        
        if (userData) {
          // Get user's favorites
          const { data: userFavorites } = await supabase
            .from("favorites")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
          
          // Get user's approved submissions (published content)
          const { data: submissions } = await supabase
            .from("content_items")
            .select("*")
            .eq("author_id", userId)
            .order("created_at", { ascending: false });
          
          // Get user's downloads
          const { data: downloads } = await supabase
            .from("download_analytics")
            .select("*")
            .eq("user_id", userId)
            .order("downloaded_at", { ascending: false })
            .limit(10);
          
          setUser(userData);
          setFavorites(userFavorites || []);
          setUserSubmissions(submissions || []);
          setUserDownloads(downloads || []);
          setEditForm({
            username: userData.username || "",
            bio: userData.bio || "",
            discord: userData.social_links?.discord || "",
            twitter: userData.social_links?.twitter || "",
            github: userData.social_links?.github || "",
          });
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) loadUserData();
  }, [userId]);

  // STEP 4: Load user badges
  useEffect(() => {
    async function loadUserBadges() {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from("user_badges")
        .select(`
          *,
          badges (
            name,
            description,
            icon,
            color
          )
        `)
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });
      
      if (error) {
        console.error("Error loading badges:", error);
      }
      
      if (data && data.length > 0) {
        const formattedBadges = data.map(b => ({
          id: b.id,
          name: b.badges.name,
          description: b.badges.description,
          icon: b.badges.icon,
          color: b.badges.color,
          earned_at: b.earned_at,
        }));
        setUserBadges(formattedBadges);
      }
    }
    
    if (userId) loadUserBadges();
  }, [userId]);

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setMessage("❌ Image must be less than 2MB");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      setMessage("❌ Please upload an image file");
      return;
    }
    
    setUploading(true);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from("public_users")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", userId);
      
      if (updateError) throw updateError;
      
      setUser({ ...user, avatar_url: urlData.publicUrl });
      setMessage("✅ Avatar updated!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdateProfile() {
    setLoading(true);
    
    const { error } = await supabase
      .from("public_users")
      .update({
        username: editForm.username,
        bio: editForm.bio,
        social_links: {
          discord: editForm.discord,
          twitter: editForm.twitter,
          github: editForm.github,
        },
      })
      .eq("id", userId);
    
    if (error) {
      setMessage("❌ Error updating profile");
    } else {
      setUser({
        ...user,
        username: editForm.username,
        bio: editForm.bio,
        social_links: {
          discord: editForm.discord,
          twitter: editForm.twitter,
          github: editForm.github,
        },
      });
      setMessage("✅ Profile updated!");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
        <Header />
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
        <Header />
        <div className="text-center py-20">
          <p className="text-red-400">User not found</p>
          <Link href="/members" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
            ← Back to Members
          </Link>
        </div>
      </main>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${message.includes("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {message}
          </div>
        )}
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                (user.username || user.email || "U").charAt(0).toUpperCase()
              )}
            </div>
            {isOwnProfile && (
              <label className="absolute bottom-0 right-0 cursor-pointer bg-indigo-500 rounded-full p-2 hover:bg-indigo-600 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? "⏳" : "📸"}
              </label>
            )}
          </div>
          
          <div className="flex-1">
            {!isEditing ? (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold">{user.username || user.email?.split("@")[0]}</h1>
                  <ReputationBadge reputation={user.reputation || 0} />
                  {user.is_contributor && (
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400">
                      Contributor
                    </span>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>
                <p className="text-gray-400 mt-1">Member since {new Date(user.join_date).toLocaleDateString()}</p>
                {user.bio && (
                  <p className="mt-3 text-gray-300 max-w-2xl">{user.bio}</p>
                )}
                
                {(user.social_links?.discord || user.social_links?.twitter || user.social_links?.github) && (
                  <div className="flex gap-3 mt-4">
                    {user.social_links?.discord && (
                      <a href={user.social_links.discord} target="_blank" className="text-gray-400 hover:text-white transition">
                        💬 Discord
                      </a>
                    )}
                    {user.social_links?.twitter && (
                      <a href={user.social_links.twitter} target="_blank" className="text-gray-400 hover:text-white transition">
                        🐦 Twitter
                      </a>
                    )}
                    {user.social_links?.github && (
                      <a href={user.social_links.github} target="_blank" className="text-gray-400 hover:text-white transition">
                        🐙 GitHub
                      </a>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="Username"
                  className="w-full max-w-md rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full max-w-md rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                />
                <input
                  type="url"
                  value={editForm.discord}
                  onChange={(e) => setEditForm({ ...editForm, discord: e.target.value })}
                  placeholder="Discord invite link"
                  className="w-full max-w-md rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                />
                <input
                  type="url"
                  value={editForm.twitter}
                  onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                  placeholder="Twitter profile URL"
                  className="w-full max-w-md rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                />
                <input
                  type="url"
                  value={editForm.github}
                  onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                  placeholder="GitHub profile URL"
                  className="w-full max-w-md rounded-lg border border-gray-700 bg-black px-4 py-2 text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4 mb-12">
          <div className="rounded-xl border border-gray-800 bg-zinc-900/30 p-4 text-center">
            <div className="text-2xl font-bold text-indigo-400">{favorites.length}</div>
            <div className="text-sm text-gray-400">Favorites</div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-zinc-900/30 p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{userSubmissions.length}</div>
            <div className="text-sm text-gray-400">Contributions</div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-zinc-900/30 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{user.reputation || 0}</div>
            <div className="text-sm text-gray-400">Reputation</div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-zinc-900/30 p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{user.level || 1}</div>
            <div className="text-sm text-gray-400">Level</div>
          </div>
        </div>

        {/* STEP 5: Badges Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold">🏅 Badges</h2>
            <span className="text-sm text-gray-400">Achievements earned</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {userBadges && userBadges.length > 0 ? (
              userBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl border border-gray-800 bg-zinc-900/50 p-4 text-center hover:border-indigo-500 transition group"
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h3 className="font-semibold text-sm">{badge.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                  <p className="text-xs text-indigo-400 mt-2">
                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">🏅</div>
                <p>No badges earned yet. Keep contributing to unlock badges!</p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>Badges you can earn:</p>
                  <ul className="mt-2 space-y-1">
                    <li>🎁 First Upload - Submit your first content</li>
                    <li>⭐ Rising Creator - Submit 5 pieces of content</li>
                    <li>🏆 Master Creator - Submit 20 pieces of content</li>
                    <li>🔥 Popular Creator - Get 100+ total downloads</li>
                    <li>❤️ Collector - Save 10 favorites</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User's Published Content */}
        {userSubmissions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">📦 Published Content</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userSubmissions.map((item) => (
                <Link
                  key={item.id}
                  href={
                    item.type === 'vehicle' ? `/downloads/cars/${item.category}/${item.slug}` :
                    item.type === 'motorcycle' ? `/downloads/cars/motorcycles/${item.category}/${item.slug}` :
                    item.type === 'boat' ? `/downloads/cars/boats/${item.category}/${item.slug}` :
                    item.type === 'aircraft' ? `/downloads/cars/aircraft/${item.category}/${item.slug}` :
                    `/downloads/scripts/${item.category}/${item.slug}`
                  }
                  className="rounded-xl border border-gray-800 p-4 hover:border-indigo-500 transition group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {item.type === "vehicle" && "🚗"}
                      {item.type === "script" && "📜"}
                      {item.type === "motorcycle" && "🏍️"}
                      {item.type === "boat" && "⛵"}
                      {item.type === "aircraft" && "✈️"}
                    </span>
                    <h3 className="font-semibold group-hover:text-indigo-400 transition truncate">{item.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 capitalize">{item.category}</p>
                  <div className="mt-2 flex gap-3 text-xs text-gray-500">
                    <span>⬇️ {item.downloads || 0}</span>
                    <span>👁️ {item.views || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* User's Favorites */}
        {favorites.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">❤️ Favorite Items</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((fav) => (
                <Link
                  key={fav.id}
                  href={fav.brand ? `/downloads/cars/${fav.brand}/${fav.vehicle_slug}` : `/downloads/scripts/${fav.category}/${fav.vehicle_slug}`}
                  className="rounded-xl border border-gray-800 p-4 hover:border-indigo-500 transition"
                >
                  <h3 className="font-semibold capitalize">{fav.vehicle_name || fav.vehicle_slug.replace(/-/g, " ")}</h3>
                  <p className="text-sm text-gray-400 mt-1 capitalize">{fav.brand || fav.category}</p>
                  <p className="text-xs text-gray-500 mt-2">Saved {new Date(fav.created_at).toLocaleDateString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {userDownloads.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">📰 Recent Activity</h2>
            <div className="space-y-3">
              {userDownloads.map((download, i) => (
                <div key={i} className="rounded-lg border border-gray-800 bg-zinc-900/30 p-3 hover:bg-zinc-900/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⬇️</span>
                    <div>
                      <p className="text-sm">
                        Downloaded <Link href={`/downloads/vehicles/${download.content_slug}`} className="text-indigo-400 hover:text-indigo-300">
                          {download.content_slug.replace(/-/g, " ")}
                        </Link>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(download.downloaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {favorites.length === 0 && userSubmissions.length === 0 && userDownloads.length === 0 && userBadges.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No activity yet. Start exploring and saving content!
          </div>
        )}
      </section>
    </main>
  );
}