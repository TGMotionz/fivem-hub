"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (!user) {
    return (
      <a href="/login" className="rounded-lg border border-gray-700 px-4 py-2 text-sm">
        Login
      </a>
    );
  }

  return (
    <button onClick={handleLogout} className="rounded-lg border border-gray-700 px-4 py-2 text-sm">
      Logout
    </button>
  );
}