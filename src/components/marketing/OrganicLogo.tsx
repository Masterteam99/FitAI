import Link from "next/link";
import { APP_NAME } from "@/content/copy";

// Logo del tema organico: foglia terracotta + wordmark serif.
export function OrganicLogo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-display text-2xl tracking-tight">
      <svg className="w-8 h-8" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <path
          d="M17 2C9 2 3 9 5 18c1.6 7.2 8 14 12 14s7.4-3.5 11-9c3-4.6 2-15-4-19-2.4-1.6-5-2-7-2z"
          fill="var(--organic-terracotta, #c66a4a)"
        />
        <path
          d="M11 19c3-1 6-1 9 0M13 13c2.5-.8 5-.8 7 0"
          stroke={dark ? "#33271f" : "#fbf7f0"}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
      <span>
        {APP_NAME.slice(0, 3)}
        <span style={{ color: dark ? "var(--organic-terracotta-soft, #e4a07e)" : "var(--organic-terracotta, #c66a4a)" }}>
          {APP_NAME.slice(3)}
        </span>
      </span>
    </Link>
  );
}
