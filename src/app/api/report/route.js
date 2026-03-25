import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { type, targetId, reason, userId } = await request.json();
    
    const { error } = await supabase
      .from("reports")
      .insert({
        type,
        target_id: targetId,
        reason,
        reporter_id: userId,
        status: "pending",
        created_at: new Date(),
      });
    
    if (error) throw error;
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}