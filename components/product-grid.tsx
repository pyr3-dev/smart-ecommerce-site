const FEATURED_PRODUCTS = [
  {
    shop: "Terra Studio",
    name: "Linen throw, natural",
    price: "$48",
    bg: "from-[#D4C5A9] to-[#C4B49A]",
  },
  {
    shop: "Bough & Co.",
    name: "Sage candle set",
    price: "$34",
    bg: "from-[#7C9A78] to-[#5C7A58]",
  },
  {
    shop: "Darkwood Craft",
    name: "Walnut serving board",
    price: "$92",
    bg: "from-[#2C2C2C] to-[#1A1A1A]",
  },
  {
    shop: "Mend Supply",
    name: "Ceramic mug, oat",
    price: "$26",
    bg: "from-[#B8A898] to-[#A09080]",
  },
];

export function ProductGrid() {
  return (
    <section className="px-8 pb-12">
      <div className="flex items-center gap-4 mb-5">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#6B6B5E] shrink-0">
          Featured from the marketplace
        </p>
        <div className="flex-1 h-px bg-[#2C2C2C]/10" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FEATURED_PRODUCTS.map((product) => (
          <div
            key={product.name}
            className="rounded-md overflow-hidden bg-[#EAE7E0]"
          >
            <div
              className={`aspect-[3/4] bg-gradient-to-br ${product.bg}`}
            />
            <div className="p-3">
              <p className="text-[9px] font-medium tracking-[0.1em] uppercase text-[#7C9A78] mb-1">
                {product.shop}
              </p>
              <p className="text-xs font-normal text-[#2C2C2C] mb-0.5">
                {product.name}
              </p>
              <p className="text-xs font-medium text-[#2C2C2C]">
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
