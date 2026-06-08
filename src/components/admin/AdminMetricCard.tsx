import { cn } from "@/lib/utils";

export function AdminMetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info" | "premium";
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-green-600 dark:text-green-500",
    warning: "text-amber-600 dark:text-amber-500",
    danger: "text-red-600 dark:text-red-500",
    info: "text-cyan-600 dark:text-cyan-500",
    premium: "text-purple-600 dark:text-purple-500",
  }[tone];

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-2xl font-bold mt-1", toneClass)}>{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
