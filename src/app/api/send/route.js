import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { type, contentId } = await request.json();
    
    // Get all subscribed users
    const { data: users } = await supabase
      .from("public_users")
      .select("id, email")
      .eq("newsletter_subscribed", true);
    
    if (!users || users.length === 0) {
      return Response.json({ success: true, message: "No subscribers" });
    }
    
    // Get content if provided
    let content = null;
    if (contentId) {
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("id", contentId)
        .single();
      content = data;
    }
    
    // Create email content based on type
    for (const user of users) {
      let subject = "";
      let emailContent = "";
      
      if (type === "new_content" && content) {
        subject = `✨ New Content: ${content.name}`;
        emailContent = `
          <h2>New Content Available!</h2>
          <p><strong>${content.name}</strong> has been added to FiveM Free Hub.</p>
          <p>${content.description || "Check it out now!"}</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/downloads/${content.type}s/${content.category}/${content.slug}" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">View Content →</a>
        `;
      } else if (type === "weekly_digest") {
        // Get latest content from last week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: newContent } = await supabase
          .from("content_items")
          .select("*")
          .gte("created_at", weekAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(10);
        
        subject = "📧 Weekly FiveM Digest";
        emailContent = `
          <h2>This Week in FiveM Free Hub</h2>
          <p>Here's what's new this week:</p>
          <ul>
            ${newContent?.map(item => `
              <li>
                <strong>${item.name}</strong> - ${item.type} (${item.category})
                <br/><a href="${process.env.NEXT_PUBLIC_SITE_URL}/downloads/${item.type}s/${item.category}/${item.slug}">View →</a>
              </li>
            `).join('') || '<li>No new content this week</li>'}
          </ul>
          <p style="margin-top: 20px;">Keep creating and sharing!</p>
        `;
      }
      
      if (subject && emailContent) {
        await supabase
          .from("newsletter_queue")
          .insert([{
            user_id: user.id,
            email: user.email,
            subject: subject,
            content: emailContent,
          }]);
      }
    }
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}