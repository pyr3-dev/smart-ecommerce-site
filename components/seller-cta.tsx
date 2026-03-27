import Link from "next/link";

const STATS = [
  { number: "2.4%", label: "transaction fee, flat" },
  { number: "50+", label: "free product listings" },
  { number: "0 day", label: "payout delay" },
];

export function SellerCta() {
  return (
    <section className="px-8 py-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
      <div className="flex-1">
        <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-grove-sage mb-4">
          For sellers
        </p>
        <h2 className="text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-grove-dark mb-4">
          Your shop.
          <br />
          Your terms.
          <br />
          Your growth.
        </h2>
        <p className="text-sm font-light text-grove-text-muted leading-[1.7] max-w-[360px] mb-7">
          Grove gives independent sellers the tools to run a real business —
          without the complexity or the platform taking the lion&apos;s share.
        </p>
        <Link
          href="/auth/sign-up"
          className="inline-block bg-grove-dark text-grove-base text-sm font-medium px-7 py-3 rounded-[3px] hover:bg-[#3D3D35] transition-colors"
        >
          Open your shop →
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {STATS.map(({ number, label }) => (
          <div key={label} className="bg-grove-muted rounded-lg px-6 py-5 min-w-[160px]">
            <p className="text-3xl font-semibold tracking-[-0.02em] text-grove-dark">
              {number}
            </p>
            <p className="text-[11px] font-light text-grove-text-muted mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
