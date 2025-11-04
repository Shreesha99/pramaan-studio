export default function BrandStrip() {
  const brands = ["Calvin Klein", "Versace", "Prada", "Zara", "Gucci"];
  return (
    <section className="bg-black text-white py-5 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center gap-8 overflow-x-auto">
        {brands.map((b) => (
          <span
            key={b}
            className="brand-item text-sm font-semibold tracking-wider whitespace-nowrap"
          >
            {b.toUpperCase()}
          </span>
        ))}
      </div>
    </section>
  );
}
