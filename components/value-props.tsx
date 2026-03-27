function ZeroFeesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="#7C9A78" strokeWidth="1.5" />
      <path
        d="M10 16C10 12.7 12.7 10 16 10C19.3 10 22 12.7 22 16"
        stroke="#F5F2ED"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 16V22"
        stroke="#7C9A78"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PayoutsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="8" width="24" height="18" rx="2" stroke="#7C9A78" strokeWidth="1.5" />
      <path d="M4 13H28" stroke="#F5F2ED" strokeWidth="1.5" />
      <path
        d="M10 18H14"
        stroke="#7C9A78"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 4L20 12H28L22 17.5L24.5 26L16 21L7.5 26L10 17.5L4 12H12L16 4Z"
        stroke="#7C9A78"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const VALUES = [
  {
    Icon: ZeroFeesIcon,
    title: "Zero listing fees",
    desc: "Open your shop and list your first 50 products for free. Pay only when you sell.",
  },
  {
    Icon: PayoutsIcon,
    title: "Instant payouts",
    desc: "Revenue lands in your account the same day. No holds, no waiting periods.",
  },
  {
    Icon: AnalyticsIcon,
    title: "Built-in analytics",
    desc: "Understand your buyers, track what sells, and grow with data you can actually use.",
  },
];

export function ValueProps() {
  return (
    <section className="bg-grove-dark px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
      {VALUES.map(({ Icon, title, desc }) => (
        <div key={title}>
          <Icon />
          <h3 className="text-[15px] font-medium text-grove-base mt-4 mb-2">
            {title}
          </h3>
          <p className="text-[13px] font-light text-grove-text-dim leading-relaxed">
            {desc}
          </p>
        </div>
      ))}
    </section>
  );
}
