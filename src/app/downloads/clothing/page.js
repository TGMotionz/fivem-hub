import Link from "next/link";
import Header from "@/components/Header";

export default function ClothingPage() {
  const categories = [
    { name: "Male Clothing", slug: "male", icon: "👨", count: 25, description: "Tops, pants, shoes & accessories" },
    { name: "Female Clothing", slug: "female", icon: "👩", count: 28, description: "Dresses, tops, pants & more" },
    { name: "Uniforms", slug: "uniforms", icon: "👔", count: 15, description: "Police, EMS, firefighter" },
    { name: "EUP Packs", slug: "eup", icon: "🎭", count: 12, description: "Emergency uniforms pack" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Free Clothing</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Peds, EUP, and uniform packs for your FiveM server
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/downloads/clothing/${cat.slug}`}
              className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-8 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition">{cat.icon}</div>
              <h2 className="text-xl font-bold">{cat.name}</h2>
              <p className="text-sm text-gray-400 mt-2">{cat.description}</p>
              <div className="mt-3 text-xs text-indigo-400">{cat.count} items</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}