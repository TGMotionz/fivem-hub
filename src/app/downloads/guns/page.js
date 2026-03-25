import Link from "next/link";
import Header from "@/components/Header";

export default function GunsPage() {
  const categories = [
    { name: "Pistols", slug: "pistols", icon: "🔫", description: "Handguns and sidearms" },
    { name: "Rifles", slug: "rifles", icon: "🔫", description: "Assault rifles and carbines" },
    { name: "Shotguns", slug: "shotguns", icon: "🔫", description: "Close-range weapons" },
    { name: "SMGs", slug: "smgs", icon: "🔫", description: "Submachine guns" },
    { name: "Sniper", slug: "sniper", icon: "🎯", description: "Long-range precision rifles" },
    { name: "Heavy Weapons", slug: "heavy", icon: "💣", description: "Explosives and heavy guns" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Free Guns & Weapons</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Custom weapons and gun scripts for FiveM
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/downloads/guns/${cat.slug}`}
              className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-8 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition">{cat.icon}</div>
              <h2 className="text-xl font-bold">{cat.name}</h2>
              <p className="text-sm text-gray-400 mt-2">{cat.description}</p>
              <p className="text-xs text-indigo-400 mt-3">0 items available</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}