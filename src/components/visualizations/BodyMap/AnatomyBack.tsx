import { cn } from "@/lib/utils";

type MuscleClassMap = Partial<Record<
  "SHOULDERS" | "BACK" | "TRICEPS" | "FOREARMS" | "GLUTES" | "HAMSTRINGS" | "CALVES",
  string
>>;

const DEFAULT_FILL = "fill-muted-foreground/10";
const OUTLINE_STROKE = "stroke-muted-foreground/40";
const BODY_FILL = "fill-secondary/30";

export function AnatomyBack({
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
      aria-label="Anatomia posteriore"
    >
      {/* Silhouette esterna posteriore — outline */}
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

      {/* Linea centrale spina dorsale */}
      <line
        x1="100" y1="100" x2="100" y2="270"
        className="stroke-muted-foreground/15"
        strokeWidth="0.5"
        strokeDasharray="2 3"
      />

      {/* SHOULDERS — deltoidi posteriori */}
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

      {/* BACK — trapezio + dorsali (lats) */}
      <path
        data-muscle="BACK"
        className={cn(m("BACK"), "transition-colors duration-300")}
        d="
          M 100 100
          L 86 102
          C 76 105, 72 115, 73 128
          L 75 150
          L 78 170
          L 82 190
          L 90 210
          L 100 220
          L 110 210
          L 118 190
          L 122 170
          L 125 150
          L 127 128
          C 128 115, 124 105, 114 102
          L 100 100 Z
        "
      />

      {/* TRICEPS */}
      <path
        data-muscle="TRICEPS"
        className={cn(m("TRICEPS"), "transition-colors duration-300")}
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

      {/* GLUTES */}
      <path
        data-muscle="GLUTES"
        className={cn(m("GLUTES"), "transition-colors duration-300")}
        d="
          M 72 232
          C 68 240, 68 252, 74 262
          C 82 268, 92 268, 98 262
          L 100 250
          C 96 240, 86 232, 72 232 Z
          M 128 232
          C 132 240, 132 252, 126 262
          C 118 268, 108 268, 102 262
          L 100 250
          C 104 240, 114 232, 128 232 Z
        "
      />

      {/* HAMSTRINGS */}
      <path
        data-muscle="HAMSTRINGS"
        className={cn(m("HAMSTRINGS"), "transition-colors duration-300")}
        d="
          M 70 272
          C 66 295, 64 322, 66 348
          C 72 350, 84 350, 94 346
          L 97 326
          L 99 298
          L 96 278
          C 89 272, 80 271, 70 272 Z
          M 130 272
          C 134 295, 136 322, 134 348
          C 128 350, 116 350, 106 346
          L 103 326
          L 101 298
          L 104 278
          C 111 272, 120 271, 130 272 Z
        "
      />

      {/* CALVES — polpacci (gastrocnemio, ben visibili back) */}
      <path
        data-muscle="CALVES"
        className={cn(m("CALVES"), "transition-colors duration-300")}
        d="
          M 73 365
          C 69 380, 68 405, 72 425
          C 78 430, 90 430, 95 422
          L 97 400
          L 96 378
          L 92 362
          C 86 360, 78 361, 73 365 Z
          M 127 365
          C 131 380, 132 405, 128 425
          C 122 430, 110 430, 105 422
          L 103 400
          L 104 378
          L 108 362
          C 114 360, 122 361, 127 365 Z
        "
      />
    </svg>
  );
}
