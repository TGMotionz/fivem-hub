"use client";

import { useState } from "react";

export default function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);
  
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  
  const shareLinks = {
    discord: `https://discord.com/channels/@me?q=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?title=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => window.open(shareLinks.discord, '_blank')}
        className="px-3 py-1.5 rounded-lg bg-[#5865F2] text-white text-sm hover:opacity-80 transition flex items-center gap-1"
      >
        💬 Discord
      </button>
      <button
        onClick={() => window.open(shareLinks.twitter, '_blank')}
        className="px-3 py-1.5 rounded-lg bg-[#1DA1F2] text-white text-sm hover:opacity-80 transition flex items-center gap-1"
      >
        🐦 X
      </button>
      <button
        onClick={() => window.open(shareLinks.reddit, '_blank')}
        className="px-3 py-1.5 rounded-lg bg-[#FF4500] text-white text-sm hover:opacity-80 transition flex items-center gap-1"
      >
        🤖 Reddit
      </button>
      <button
        onClick={copyToClipboard}
        className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-600 transition flex items-center gap-1"
      >
        {copied ? '✅ Copied!' : '🔗 Copy Link'}
      </button>
    </div>
  );
}