import Image from "next/image";

const categories = [
  {
    title: "Formal",
    img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Casual",
    img: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Gym",
    img: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Party",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  },
];

export default function NewCollection() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold uppercase mb-8 text-center">
        New Collection
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div
            key={c.title}
            className="relative group overflow-hidden rounded-lg transition-transform duration-500 hover:scale-[1.03]"
          >
            <Image
              src={c.img}
              alt={c.title}
              width={400}
              height={400}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="text-white font-semibold text-lg">
                {c.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
