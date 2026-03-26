import Link from "next/link";
import Header from "@/components/Header";

export default function VehiclesPage() {
  // Vehicle categories
  const categories = [
    {
      title: "Cars",
      slug: "cars-list",
      icon: "🚗",
      description: "All car brands",
      items: ["60+ brands including Audi, BMW, Ferrari, Tesla, Hyundai, Kia, Suzuki, and more"],
      link: "/downloads/cars/cars-list",
    },
    {
      title: "Motorcycles",
      slug: "motorcycles",
      icon: "🏍️",
      description: "Sport bikes, cruisers, dirt bikes",
      items: ["Sport Bikes", "Cruisers", "Dirt Bikes", "Touring", "Scooters", "ATVs"],
      link: "/downloads/cars/motorcycles",
    },
    {
      title: "Boats",
      slug: "boats",
      icon: "⛵",
      description: "Speed boats, yachts, jet skis",
      items: ["Speed Boats", "Yachts", "Jet Skis", "Fishing Boats", "Police Boats"],
      link: "/downloads/cars/boats",
    },
    {
      title: "Aircraft",
      slug: "aircraft",
      icon: "✈️",
      description: "Helicopters, jets, planes",
      items: ["Helicopters", "Commercial Jets", "Private Jets", "Fighter Jets", "Prop Planes"],
      link: "/downloads/cars/aircraft",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Vehicles</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Browse cars, motorcycles, boats, and aircraft for your FiveM server
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.link}
              className="group rounded-2xl border border-gray-800 bg-zinc-900/50 p-8 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition">{cat.icon}</div>
              <h2 className="text-xl font-bold">{cat.title}</h2>
              <p className="text-sm text-gray-400 mt-2">{cat.description}</p>
              <div className="mt-3 flex flex-wrap gap-1 justify-center">
                {cat.items.slice(0, 3).map((item, i) => (
                  <span key={i} className="text-xs text-gray-500">• {item}</span>
                ))}
              </div>
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 text-indigo-400 group-hover:gap-3 transition text-sm">
                  Browse {cat.title.toLowerCase()} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}