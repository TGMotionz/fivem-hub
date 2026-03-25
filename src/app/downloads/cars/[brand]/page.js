import Link from "next/link";

const brandNames = {
  audi: "Audi",
  dodge: "Dodge",
  ford: "Ford",
  bmw: "BMW",
  toyota: "Toyota",
  chevy: "Chevy",
  lamborghini: "Lamborghini",
  ferrari: "Ferrari",
  koenigsegg: "Koenigsegg",
  mclaren: "McLaren",
  pagani: "Pagani",
  bugatti: "Bugatti",
  "aston-martin": "Aston Martin",
  "rolls-royce": "Rolls-Royce",
  bentley: "Bentley",
  "range-rover": "Range Rover",
  mercedes: "Mercedes",
  porsche: "Porsche",
  nissan: "Nissan",
  subaru: "Subaru",
  mazda: "Mazda",
  tesla: "Tesla",
  honda: "Honda",
  jeep: "Jeep",
  cadillac: "Cadillac",
  lexus: "Lexus",
  lincoln: "Lincoln",
  mitsubishi: "Mitsubishi",
  chrysler: "Chrysler",
  volkswagen: "Volkswagen",
  volvo: "Volvo",
  hummer: "Hummer",
  fiat: "Fiat",
  renault: "Renault",
  peugeot: "Peugeot",
};

const vehiclesByBrand = {
  dodge: [
    {
      name: "Dodge Charger 2018",
      slug: "dodge-charger-2018",
    },
    {
      name: "Dodge Challenger Hellcat",
      slug: "dodge-challenger-hellcat",
    },
    {
      name: "Dodge Durango Police",
      slug: "dodge-durango-police",
    },
  ],
  ferrari: [
    {
      name: "Ferrari 488 GTB",
      slug: "ferrari-488-gtb",
    },
    {
      name: "Ferrari F8 Tributo",
      slug: "ferrari-f8-tributo",
    },
    {
      name: "Ferrari SF90 Stradale",
      slug: "ferrari-sf90-stradale",
    },
  ],
  bmw: [
    {
      name: "BMW M4 Competition",
      slug: "bmw-m4-competition",
    },
    {
      name: "BMW M5 CS",
      slug: "bmw-m5-cs",
    },
    {
      name: "BMW X6M",
      slug: "bmw-x6m",
    },
  ],
  tesla: [
    {
      name: "Tesla Model S Plaid",
      slug: "tesla-model-s-plaid",
    },
    {
      name: "Tesla Model X",
      slug: "tesla-model-x",
    },
    {
      name: "Tesla Cybertruck",
      slug: "tesla-cybertruck",
    },
  ],
};

function formatSlug(text) {
  return text
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function BrandPage({ params }) {
  const resolvedParams = await params;
  const brand = resolvedParams.brand;
  
  const brandName = brandNames[brand] || formatSlug(brand);

  const vehicles = vehiclesByBrand[brand] || [
    {
      name: `${brandName} Vehicle 1`,
      slug: `${brand}-vehicle-1`,
    },
    {
      name: `${brandName} Vehicle 2`,
      slug: `${brand}-vehicle-2`,
    },
    {
      name: `${brandName} Vehicle 3`,
      slug: `${brand}-vehicle-3`,
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 p-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="text-2xl font-bold">
            FiveM Free Hub
          </a>

          <div className="flex gap-3">
            <a
              href="/downloads/cars"
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm"
            >
              ← Back to Cars
            </a>
            <a
              href="/favorites"
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm"
            >
              My Favorites
            </a>
            <a
              href="https://discord.gg/qf367wWS"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Join Discord
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold">{brandName}</h1>
        <p className="mt-3 max-w-2xl text-gray-400">
          Free {brandName} vehicle content from your community.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.slug}
              href={`/downloads/cars/${brand}/${vehicle.slug}`}
              className="rounded-2xl border border-gray-800 bg-zinc-950 p-6 transition hover:border-gray-600 hover:bg-zinc-900"
            >
              <div className="mb-4 h-40 rounded-xl bg-gray-800 flex items-center justify-center text-4xl">
                🚗
              </div>
              <h2 className="text-xl font-bold">{vehicle.name}</h2>
              <p className="mt-2 text-sm text-gray-400">
                Click to view details
              </p>
              <div className="mt-5">
                <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black inline-block">
                  View Details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}