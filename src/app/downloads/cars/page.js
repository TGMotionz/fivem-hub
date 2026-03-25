import Link from "next/link";
import Header from "@/components/Header";

export default function CarsPage() {
  // All vehicle brands
  const brands = [
    "Audi", "BMW", "Chevrolet", "Dodge", "Ferrari", "Ford", "Honda", 
    "Jeep", "Koenigsegg", "Lamborghini", "Mazda", "McLaren", "Mercedes", 
    "Mitsubishi", "Nissan", "Pagani", "Porsche", "Subaru", "Tesla", 
    "Toyota", "Volkswagen", "Volvo"
  ];

  const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-");

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">Free Cars</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Browse your free vehicle brands. Click any brand to explore available vehicles.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {brands.map((brand) => (
            <Link
              key={brand}
              href={`/downloads/cars/${slugify(brand)}`}
              className="group rounded-xl border border-gray-800 bg-zinc-900/50 p-5 text-center transition hover:border-indigo-500 hover:bg-zinc-900"
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition">🚗</div>
              <h2 className="text-lg font-bold">{brand}</h2>
              <p className="text-xs text-gray-400 mt-1">View vehicles</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}