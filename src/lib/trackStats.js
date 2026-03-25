import { supabase } from "./supabase";

export async function trackView(vehicleSlug, brand) {
  try {
    // Update or insert view count
    const { data: existing } = await supabase
      .from("vehicle_stats")
      .select("views")
      .eq("vehicle_slug", vehicleSlug)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("vehicle_stats")
        .update({ views: existing.views + 1, updated_at: new Date() })
        .eq("vehicle_slug", vehicleSlug);
    } else {
      await supabase
        .from("vehicle_stats")
        .insert({ vehicle_slug: vehicleSlug, brand: brand, views: 1, downloads: 0 });
    }

    // Optional: Log view for detailed analytics
    await supabase.from("vehicle_view_logs").insert({
      vehicle_slug: vehicleSlug,
      viewer_ip: "client-side", // You can add IP tracking later
    });
  } catch (error) {
    console.error("Error tracking view:", error);
  }
}

export async function trackDownload(vehicleSlug, brand) {
  try {
    const { data: existing } = await supabase
      .from("vehicle_stats")
      .select("downloads")
      .eq("vehicle_slug", vehicleSlug)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("vehicle_stats")
        .update({ downloads: existing.downloads + 1, updated_at: new Date() })
        .eq("vehicle_slug", vehicleSlug);
    } else {
      await supabase
        .from("vehicle_stats")
        .insert({ vehicle_slug: vehicleSlug, brand: brand, views: 0, downloads: 1 });
    }
  } catch (error) {
    console.error("Error tracking download:", error);
  }
}