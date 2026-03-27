import Link from "next/link";

export function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-8 pt-16 pb-12">
      <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#7C9A78] mb-5">
        Independent shops · Conscious commerce
      </p>
      <h1 className="text-5xl lg:text-[52px] font-medium leading-[1.08] tracking-[-0.03em] text-[#2C2C2C] mb-5 max-w-2xl">
        A marketplace worth{" "}
        <em className="not-italic font-light text-[#7C9A78]">caring about.</em>
      </h1>
      <p className="text-base font-light text-[#6B6B5E] leading-[1.7] max-w-[460px] mb-9">
        Discover products from independent sellers who build with care. Shop
        with intention. Sell with purpose.
      </p>
      <div className="flex gap-3 items-center flex-wrap justify-center">
        <Link
          href="/auth/sign-up"
          className="bg-[#2C2C2C] text-[#F5F2ED] text-sm font-medium px-7 py-3 rounded-[3px] hover:bg-[#3D3D35] transition-colors"
        >
          Start selling free
        </Link>
        <Link
          href="/marketplace"
          className="text-sm font-normal text-[#2C2C2C] px-5 py-3 border-b border-[#2C2C2C]/30 hover:border-[#2C2C2C] transition-colors"
        >
          Browse the marketplace →
        </Link>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#2C2C2C]/10 to-transparent mt-12" />
    </section>
  );
}
