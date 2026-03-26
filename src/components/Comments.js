"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Comments({ contentId, contentType }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadComments() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          users:user_id (email)
        `)
        .eq("content_id", contentId)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setComments(data);
      } else {
        console.error("Error loading comments:", error);
      }
      setLoading(false);
    }
    
    loadComments();
  }, [contentId]);

  async function handleSubmitComment(e) {
    e.preventDefault();
    if (!user) {
      setMessage("Please log in to comment");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    if (!newComment.trim()) {
      setMessage("Please enter a comment");
      return;
    }
    
    setSubmitting(true);
    
    const { error } = await supabase
      .from("comments")
      .insert([{
        content_id: contentId,
        content_type: contentType,
        user_id: user.id,
        content: newComment.trim(),
        rating: rating,
      }]);
    
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setNewComment("");
      setRating(5);
      setMessage("✅ Comment added!");
      
      // Reload comments
      const { data } = await supabase
        .from("comments")
        .select(`
          *,
          users:user_id (email)
        `)
        .eq("content_id", contentId)
        .order("created_at", { ascending: false });
      
      if (data) setComments(data);
      setTimeout(() => setMessage(""), 2000);
    }
    
    setSubmitting(false);
  }

  async function handleDeleteComment(commentId) {
    if (!confirm("Delete this comment?")) return;
    
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setComments(comments.filter(c => c.id !== commentId));
      setMessage("✅ Comment deleted");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-6">
        <p className="text-gray-400 text-center">Loading comments...</p>
      </div>
    );
  }

  const averageRating = comments.length > 0 
    ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(1)
    : 0;

  return (
    <div className="rounded-2xl border border-gray-800 bg-zinc-900/50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Comments & Reviews</h3>
        {comments.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-xl">★</span>
            <span className="font-bold">{averageRating}</span>
            <span className="text-gray-400">({comments.length} reviews)</span>
          </div>
        )}
      </div>
      
      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-400">Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-600"} hover:scale-110 transition`}
            >
              ★
            </button>
          ))}
        </div>
        
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Share your thoughts..." : "Log in to leave a comment"}
          disabled={!user}
          rows={3}
          className="w-full rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        
        {user && (
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:scale-105 transition disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        )}
        
        {message && (
          <p className={`mt-2 text-sm ${message.includes("✅") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </form>
      
      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No comments yet. Be the first to review!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-t border-gray-800 pt-4 first:border-t-0 first:pt-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                    {comment.users?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {comment.users?.email?.split("@")[0] || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={`text-xs ${star <= (comment.rating || 0) ? "text-yellow-400" : "text-gray-600"}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-300 pl-11">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}