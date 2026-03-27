import Link from "next/link";

interface GroveLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { icon: 16, text: "text-sm" },
  md: { icon: 22, text: "text-lg" },
  lg: { icon: 28, text: "text-2xl" },
};

export function GroveLogo({
  className,
  showWordmark = true,
  size = "md",
}: GroveLogoProps) {
  const { icon, text } = sizes[size];
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M11 2C11 2 4.5 6.5 4.5 12.5C4.5 16.3 7.4 19.5 11 19.5C14.6 19.5 17.5 16.3 17.5 12.5C17.5 6.5 11 2 11 2Z"
          fill="#7C9A78"
        />
        <path
          d="M11 19.5V22"
          stroke="#2C2C2C"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M8 14C8 14 9.2 12.5 11 12.5C12.8 12.5 14 14 14 14"
          stroke="#F5F2ED"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      {showWordmark && (
        <span
          className={`font-semibold tracking-[0.04em] text-[#2C2C2C] ${text}`}
        >
          grove
        </span>
      )}
    </Link>
  );
}
