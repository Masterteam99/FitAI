import { cn } from "@/lib/utils";

type Intensity = "low" | "medium" | "high";
type Palette = "cool" | "warm" | "hot" | "rainbow";

const INTENSITY_OPACITY: Record<Intensity, number> = {
  low: 0.18,
  medium: 0.32,
  high: 0.5,
};

const PALETTE_COLORS: Record<Palette, [string, string, string]> = {
  cool: ["var(--energy-cool)", "var(--energy-cold)", "var(--energy-cool)"],
  warm: ["var(--energy-warm)", "var(--energy-cool)", "var(--energy-warm)"],
  hot: ["var(--energy-hot)", "var(--energy-warm)", "var(--energy-hot)"],
  rainbow: ["var(--energy-cool)", "var(--energy-warm)", "var(--energy-hot)"],
};

export function GradientMesh({
  intensity = "medium",
  palette = "cool",
  className,
  fixed = false,
}: {
  intensity?: Intensity;
  palette?: Palette;
  className?: string;
  fixed?: boolean;
}) {
  const opacity = INTENSITY_OPACITY[intensity];
  const [c1, c2, c3] = PALETTE_COLORS[palette];

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none overflow-hidden",
        fixed ? "fixed inset-0 -z-10" : "absolute inset-0 -z-0",
        className,
      )}
    >
      <div
        className="mesh-blob absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${c1}, transparent 60%)`,
          opacity,
          filter: "blur(80px)",
          animation: "mesh-drift-a 22s ease-in-out infinite",
        }}
      />
      <div
        className="mesh-blob absolute top-1/4 right-0 w-[55vw] h-[55vw] rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${c2}, transparent 60%)`,
          opacity: opacity * 0.9,
          filter: "blur(90px)",
          animation: "mesh-drift-b 28s ease-in-out infinite",
        }}
      />
      <div
        className="mesh-blob absolute bottom-0 left-1/3 w-[50vw] h-[50vw] rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${c3}, transparent 60%)`,
          opacity: opacity * 0.85,
          filter: "blur(100px)",
          animation: "mesh-drift-c 32s ease-in-out infinite",
        }}
      />
    </div>
  );
}
