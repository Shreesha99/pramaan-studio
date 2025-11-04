import Image from "next/image";

export default function ExploreSection() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div>
        <Image
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80"
          alt="Explore"
          width={600}
          height={500}
          className="rounded-lg object-cover"
        />
      </div>
      <div>
        <h2 className="text-3xl font-bold uppercase mb-4">
          Explore Our Latest Collection
        </h2>
        <p className="text-gray-600 mb-6">
          Explore our latest collection, filled with modern designs and timeless
          wardrobe essentials. Refresh your wardrobe with classic pieces for a
          bold new look.
        </p>
        <button className="px-6 py-3 border border-black rounded-full font-semibold">
          Explore Latest Collection
        </button>
      </div>
    </section>
  );
}
