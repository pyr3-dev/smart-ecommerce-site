import Link from "next/link";

export function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-8 pt-16 pb-12">
      <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-grove-sage mb-5">
        Independent shops · Conscious commerce
      </p>
      <h1 className="text-5xl lg:text-[52px] font-medium leading-[1.08] tracking-[-0.03em] text-grove-dark mb-5 max-w-2xl">
        A marketplace worth{" "}
        <em className="not-italic font-light text-grove-sage">caring about.</em>
      </h1>
      <p className="text-base font-light text-grove-text-muted leading-[1.7] max-w-[460px] mb-9">
        Discover products from independent sellers who build with care. Shop
        with intention. Sell with purpose.
      </p>
      <div className="flex gap-3 items-center flex-wrap justify-center">
        <Link
          href="/auth/sign-up"
          className="bg-grove-dark text-grove-base text-sm font-medium px-7 py-3 rounded-[3px] hover:bg-grove-dark-hover transition-colors"
        >
          Start selling free
        </Link>
        <Link
          href="/marketplace"
          className="text-sm font-normal text-grove-dark px-5 py-3 border-b border-grove-dark/30 hover:border-grove-dark transition-colors"
        >
          Browse the marketplace →
        </Link>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-grove-dark/10 to-transparent mt-12" />
    </section>
  );
}
