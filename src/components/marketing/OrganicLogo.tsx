import Link from "next/link";
import { APP_NAME } from "@/content/copy";

// Logo Motion Insight: mark navy con "onda di movimento" lime + wordmark
// (prima parola ink, seconda in teal). Split sullo spazio del brand.
export function OrganicLogo({ dark = false }: { dark?: boolean }) {
  const [first, ...rest] = APP_NAME.split(" ");
  const second = rest.join(" ");
  return (
    <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight">
      <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="10" fill="var(--primary, #16213e)" />
        <path
          d="M8 23c3.2-10 6-10 7-4.5s3.8 5.5 7-6c1.5-5.4 4-5 6-1"
          stroke="var(--organic-green-soft, #c6f135)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span style={{ color: dark ? "#ffffff" : "var(--foreground)" }}>
        {first}
        {second && (
          <span style={{ color: dark ? "var(--organic-green-soft, #c6f135)" : "var(--organic-green, #0f9e99)" }}>
            {" "}
            {second}
          </span>
        )}
      </span>
    </Link>
  );
}
