import Link from "next/link";
import Header from "@/components/Header";

export default function DownloadsPage() {
  const sections = [
    {
      title: "Free Scripts",
      slug: "scripts",
      icon: "📜",
      description: "Inventory, HUD, Menus, Jobs & more",
      items: ["Inventory", "HUD", "Menus", "Jobs", "Heists", "Maps", "Chats", "Loadscreens", "Phones"],
    },
    {
      title: "Free Cars",
      slug: "cars",
      icon: "🚗",
      description: "35+ vehicle brands",
      items: ["Audi", "Dodge", "Ford", "BMW", "Toyota", "Chevy", "Lamborghini", "Ferrari", "Tesla"],
    },
    {
      title: "Free Guns",
      slug: "guns",
      icon: "🔫",
      description: "Weapons, firearms & gun scripts",
      items: ["Pistols", "Rifles", "Shotguns", "SMGs", "Sniper", "Heavy Weapons"],
    },
    {
      title: "Free Peds",
      slug: "peds",
      icon: "👥",
      description: "Character models & skins",
      items: ["Civilian", "Police", "Emergency", "Gang", "Custom"],
    },
    {
      title: "Free Maps",
      slug: "maps",
      icon: "🗺️",
      description: "MLOs, interiors & locations",
      items: ["MLOs", "Interiors", "Race Tracks", "Add-on Maps"],
    },
    {
      title: "Free Clothing",
      slug: "clothing",
      icon: "👕",
      description: "Peds, EUP & Uniforms",
      items: ["Male Clothing", "Female Clothing", "Uniforms", "EUP Packs"],
    },
    {
      title: "Server Ads",
      slug: "server-ads",
      icon: "📢",
      description: "Promote your FiveM server",
      items: ["Free Server Ads", "Paid Server Promotion", "Partners"],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Downloads</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Browse your free FiveM content by category. Click any section to explore.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={`/downloads/${section.slug}`}
              className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-6 transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl group-hover:scale-110 transition">{section.icon}</div>
                <div className="text-right">
                  <h2 className="text-xl font-bold">{section.title}</h2>
                  <p className="text-xs text-gray-400">{section.description}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {section.items.slice(0, 5).map((item) => (
                  <div key={item} className="rounded-lg bg-gray-800/50 px-2 py-1 text-xs">
                    {item}
                  </div>
                ))}
                {section.items.length > 5 && (
                  <div className="rounded-lg bg-indigo-500/20 px-2 py-1 text-xs text-indigo-400">
                    +{section.items.length - 5} more
                  </div>
                )}
              </div>

              <div className="mt-4">
                <span className="inline-flex items-center gap-2 text-indigo-400 group-hover:gap-3 transition text-sm">
                  Browse {section.title.toLowerCase()} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}