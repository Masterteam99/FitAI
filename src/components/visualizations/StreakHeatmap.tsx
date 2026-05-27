"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type DayEntry = { date: string; count: number };

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_LABELS_IT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

function startOfWeekMonday(d: Date): Date {
  const day = d.getDay(); // 0 dom, 1 lun, ..., 6 sab
  const diff = day === 0 ? -6 : 1 - day;
  const r = new Date(d);
  r.setDate(d.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function colorClassForCount(count: number): string {
  if (count <= 0) return "bg-secondary/40";
  if (count === 1) return "bg-energy-cool/40";
  if (count === 2) return "bg-energy-cool/70";
  if (count === 3) return "bg-energy-cool";
  return "bg-energy-warm";
}

export function StreakHeatmap({
  data,
  days = 365,
  className,
  cellSize = 11,
  cellGap = 3,
}: {
  data: DayEntry[];
  days?: number;
  className?: string;
  cellSize?: number;
  cellGap?: number;
}) {
  const grid = useMemo(() => {
    const map = new Map(data.map((d) => [d.date, d.count]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today.getTime() - (days - 1) * DAY_MS);
    const firstSunday = startOfWeekMonday(start);

    // Costruisci colonne (settimane). Ogni colonna ha 7 entry (lun..dom)
    const totalDays = Math.ceil((today.getTime() - firstSunday.getTime()) / DAY_MS) + 1;
    const weeks: Array<Array<{ iso: string; count: number; date: Date; outOfRange: boolean }>> = [];
    let week: Array<{ iso: string; count: number; date: Date; outOfRange: boolean }> = [];

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(firstSunday.getTime() + i * DAY_MS);
      const iso = toISODate(date);
      const outOfRange = date < start || date > today;
      week.push({ iso, count: map.get(iso) ?? 0, date, outOfRange });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) {
        const last = week[week.length - 1].date;
        const next = new Date(last.getTime() + DAY_MS);
        week.push({ iso: toISODate(next), count: 0, date: next, outOfRange: true });
      }
      weeks.push(week);
    }

    // Etichette mesi: mese che inizia in ogni settimana
    const monthLabels: Array<{ weekIndex: number; label: string }> = [];
    let lastMonth = -1;
    weeks.forEach((w, idx) => {
      const firstInWeek = w[0].date;
      if (firstInWeek.getMonth() !== lastMonth && !w[0].outOfRange) {
        monthLabels.push({ weekIndex: idx, label: MONTH_LABELS_IT[firstInWeek.getMonth()] });
        lastMonth = firstInWeek.getMonth();
      }
    });

    return { weeks, monthLabels };
  }, [data, days]);

  const totalWidth = grid.weeks.length * (cellSize + cellGap);

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="inline-block min-w-full">
        {/* Mesi sopra */}
        <div className="relative h-4 mb-1" style={{ width: totalWidth, marginLeft: 26 }}>
          {grid.monthLabels.map((m) => (
            <span
              key={`${m.weekIndex}-${m.label}`}
              className="absolute text-[10px] text-muted-foreground"
              style={{ left: m.weekIndex * (cellSize + cellGap) }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Etichette giorno */}
          <div className="flex flex-col" style={{ gap: cellGap, width: 22 }}>
            {["", "Lun", "", "Mer", "", "Ven", ""].map((l, i) => (
              <span
                key={i}
                className="text-[9px] text-muted-foreground leading-none"
                style={{ height: cellSize }}
              >
                {l}
              </span>
            ))}
          </div>

          {/* Griglia */}
          <div className="flex" style={{ gap: cellGap }}>
            {grid.weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: cellGap }}>
                {week.map((cell) => (
                  <div
                    key={cell.iso}
                    title={
                      cell.outOfRange
                        ? ""
                        : `${new Date(cell.iso).toLocaleDateString("it-IT", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })} — ${cell.count} ${cell.count === 1 ? "sessione" : "sessioni"}`
                    }
                    className={cn(
                      "rounded-[2px] transition-colors",
                      cell.outOfRange ? "bg-transparent" : colorClassForCount(cell.count),
                      cell.count > 0 && "hover:ring-1 hover:ring-primary/60"
                    )}
                    style={{ width: cellSize, height: cellSize }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <span>Meno</span>
          <div className="flex" style={{ gap: 2 }}>
            {[0, 1, 2, 3, 4].map((c) => (
              <div key={c} className={cn("rounded-[2px]", colorClassForCount(c))} style={{ width: cellSize, height: cellSize }} />
            ))}
          </div>
          <span>Più</span>
        </div>
      </div>
    </div>
  );
}
