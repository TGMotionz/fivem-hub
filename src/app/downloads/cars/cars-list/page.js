import Link from "next/link";
import Header from "@/components/Header";

export default function CarsListPage() {
  // All vehicle brands
  const brands = [
    "Acura", "Alfa Romeo", "Alpine", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti",
    "Buick", "Cadillac", "Chevrolet", "Chrysler", "Citroen", "Dacia", "Daihatsu", "Dodge",
    "DS", "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "Infiniti",
    "Isuzu", "Jaguar", "Jeep", "Kia", "Koenigsegg", "Lamborghini", "Land Rover", "Lexus",
    "Lincoln", "Lotus", "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "MG", "Mini",
    "Mitsubishi", "Morgan", "Nissan", "Pagani", "Peugeot", "Porsche", "Ram", "Renault",
    "Rolls-Royce", "SEAT", "Skoda", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo"
  ];

  const sortedBrands = [...new Set(brands)].sort();
  const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/downloads/cars" className="text-gray-400 hover:text-white">
            ← Back to Vehicles
          </Link>
          <h1 className="text-3xl font-bold">Car Brands</h1>
          <span className="text-sm text-gray-400">({sortedBrands.length} brands)</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {sortedBrands.map((brand) => (
            <Link
              key={brand}
              href={`/downloads/cars/${slugify(brand)}`}
              className="group rounded-lg border border-gray-800 bg-zinc-900/30 p-3 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-2xl mb-1">🚗</div>
              <span className="text-xs capitalize group-hover:text-indigo-400 transition">{brand}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}