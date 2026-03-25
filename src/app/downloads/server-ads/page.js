import Link from "next/link";
import Header from "@/components/Header";

export default function ServerAdsPage() {
  const categories = [
    { name: "Free Server Ads", slug: "free", icon: "🎁", description: "Promote your server for free", count: "Unlimited" },
    { name: "Paid Server Promotion", slug: "paid", icon: "⭐", description: "Featured listings & premium spots", count: "Limited" },
    { name: "Partners", slug: "partners", icon: "🤝", description: "Partner with us for mutual growth", count: "Apply" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Server Ads</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Promote your FiveM server to our growing community
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/downloads/server-ads/${cat.slug}`}
              className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-8 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition">{cat.icon}</div>
              <h2 className="text-xl font-bold">{cat.name}</h2>
              <p className="text-sm text-gray-400 mt-2">{cat.description}</p>
              <div className="mt-3 text-xs text-indigo-400">{cat.count} available</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}