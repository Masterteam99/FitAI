import { cn } from "@/lib/utils";

type MuscleClassMap = Partial<Record<
  "CHEST" | "SHOULDERS" | "BICEPS" | "FOREARMS" | "CORE" | "QUADRICEPS" | "CALVES",
  string
>>;

const DEFAULT_FILL = "fill-muted-foreground/10";
const OUTLINE_STROKE = "stroke-muted-foreground/40";
const BODY_FILL = "fill-secondary/30";

export function AnatomyFront({
  className,
  muscleClasses,
}: {
  className?: string;
  muscleClasses?: MuscleClassMap | Record<string, string>;
}) {
  const m = (key: keyof MuscleClassMap) => cn(DEFAULT_FILL, muscleClasses?.[key]);

  return (
    <svg
      viewBox="0 0 200 480"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-auto", className)}
      role="img"
      aria-label="Anatomia frontale"
    >
      {/* Silhouette esterna — outline */}
      <path
        className={cn(BODY_FILL, OUTLINE_STROKE)}
        strokeWidth="1.5"
        d="
          M100 22
          C 113 22, 124 33, 124 47
          C 124 60, 116 70, 110 74
          L 112 90
          C 122 92, 134 96, 145 105
          C 155 113, 162 124, 165 138
          L 170 175
          C 172 190, 168 205, 161 218
          L 155 232
          L 152 252
          L 150 270
          L 144 295
          L 138 330
          L 135 360
          L 132 390
          L 128 425
          L 125 455
          L 120 465
          L 108 465
          L 105 442
          L 102 410
          L 100 380
          L 98 410
          L 95 442
          L 92 465
          L 80 465
          L 75 455
          L 72 425
          L 68 390
          L 65 360
          L 62 330
          L 56 295
          L 50 270
          L 48 252
          L 45 232
          L 39 218
          C 32 205, 28 190, 30 175
          L 35 138
          C 38 124, 45 113, 55 105
          C 66 96, 78 92, 88 90
          L 90 74
          C 84 70, 76 60, 76 47
          C 76 33, 87 22, 100 22 Z
        "
      />

      {/* Linea centrale per ritmo */}
      <line
        x1="100" y1="100" x2="100" y2="270"
        className="stroke-muted-foreground/15"
        strokeWidth="0.5"
        strokeDasharray="2 3"
      />

      {/* CHEST — pettorali */}
      <path
        data-muscle="CHEST"
        className={cn(m("CHEST"), "transition-colors duration-300")}
        d="
          M 100 105
          C 90 105, 78 110, 72 122
          C 70 132, 75 142, 85 144
          L 97 142
          L 100 140
          Z
          M 100 105
          C 110 105, 122 110, 128 122
          C 130 132, 125 142, 115 144
          L 103 142
          L 100 140
          Z
        "
      />

      {/* SHOULDERS — deltoidi frontali */}
      <path
        data-muscle="SHOULDERS"
        className={cn(m("SHOULDERS"), "transition-colors duration-300")}
        d="
          M 56 108
          C 50 112, 44 122, 42 134
          C 48 140, 60 138, 68 130
          C 70 122, 64 112, 56 108 Z
          M 144 108
          C 150 112, 156 122, 158 134
          C 152 140, 140 138, 132 130
          C 130 122, 136 112, 144 108 Z
        "
      />

      {/* BICEPS */}
      <path
        data-muscle="BICEPS"
        className={cn(m("BICEPS"), "transition-colors duration-300")}
        d="
          M 38 142
          C 34 152, 33 168, 36 184
          C 40 188, 48 188, 52 180
          C 53 168, 51 152, 47 142
          C 44 140, 41 140, 38 142 Z
          M 162 142
          C 166 152, 167 168, 164 184
          C 160 188, 152 188, 148 180
          C 147 168, 149 152, 153 142
          C 156 140, 159 140, 162 142 Z
        "
      />

      {/* FOREARMS */}
      <path
        data-muscle="FOREARMS"
        className={cn(m("FOREARMS"), "transition-colors duration-300")}
        d="
          M 36 195
          C 33 215, 32 235, 34 255
          C 38 258, 46 258, 50 252
          C 51 232, 50 212, 48 195
          C 44 193, 40 193, 36 195 Z
          M 164 195
          C 167 215, 168 235, 166 255
          C 162 258, 154 258, 150 252
          C 149 232, 150 212, 152 195
          C 156 193, 160 193, 164 195 Z
        "
      />

      {/* CORE — addome */}
      <path
        data-muscle="CORE"
        className={cn(m("CORE"), "transition-colors duration-300")}
        d="
          M 82 148
          L 118 148
          C 122 158, 122 168, 120 178
          L 116 195
          C 114 210, 110 222, 108 232
          L 92 232
          C 90 222, 86 210, 84 195
          L 80 178
          C 78 168, 78 158, 82 148 Z
        "
      />

      {/* Bacino — passaggio (no muscolo) */}
      <path
        className={cn(BODY_FILL, "opacity-60")}
        d="
          M 76 234
          L 124 234
          L 130 258
          L 70 258 Z
        "
      />

      {/* QUADRICEPS */}
      <path
        data-muscle="QUADRICEPS"
        className={cn(m("QUADRICEPS"), "transition-colors duration-300")}
        d="
          M 70 262
          C 66 285, 64 312, 66 340
          C 72 342, 84 342, 94 338
          L 97 318
          L 99 290
          L 96 268
          C 89 262, 80 261, 70 262 Z
          M 130 262
          C 134 285, 136 312, 134 340
          C 128 342, 116 342, 106 338
          L 103 318
          L 101 290
          L 104 268
          C 111 262, 120 261, 130 262 Z
        "
      />

      {/* CALVES — polpacci frontali (tibia/peroneo area) */}
      <path
        data-muscle="CALVES"
        className={cn(m("CALVES"), "transition-colors duration-300")}
        d="
          M 73 365
          C 70 385, 70 410, 73 432
          C 78 434, 88 434, 93 428
          L 95 405
          L 96 380
          L 93 362
          C 86 360, 79 361, 73 365 Z
          M 127 365
          C 130 385, 130 410, 127 432
          C 122 434, 112 434, 107 428
          L 105 405
          L 104 380
          L 107 362
          C 114 360, 121 361, 127 365 Z
        "
      />

      {/* Volto: nessun dettaglio, solo silhouette pulita */}
    </svg>
  );
}
