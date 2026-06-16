"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ARCHETYPES,
  SEGMENTS,
  lerpPose,
  errorJoint,
  type Archetype,
  type ErrorKey,
} from "./pose/poseEngine";

export function ExerciseFormPlayer({
  archetype,
  error,
  errorNote,
  showError = true,
  size = 220,
  period = 2.6,
  className,
}: {
  archetype: Archetype;
  error?: ErrorKey;
  errorNote?: string;
  showError?: boolean;
  size?: number;
  period?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(reduced ? 1 : 0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setT(1);
      return;
    }
    const startedAt = performance.now();
    const tick = (now: number) => {
      const elapsed = ((now - startedAt) / 1000) % period;
      const next = 0.5 - 0.5 * Math.cos((2 * Math.PI * elapsed) / period);
      setT(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduced, period]);

  const conf = ARCHETYPES[archetype];
  const pose = lerpPose(conf.start, conf.end, t);
  const errKey: ErrorKey = error ?? conf.defaultError;
  const marker = showError ? errorJoint(errKey, pose) : null;

  return (
    <svg
      viewBox="0 0 200 300"
      width={size}
      height={size * 1.5}
      className={className}
      role="img"
      aria-label={`Esecuzione stilizzata: ${archetype}${showError ? `, errore evidenziato su ${errKey}` : ""}`}
    >
      <line x1="40" y1="282" x2="160" y2="282" stroke="var(--organic-line)" strokeWidth="3" strokeLinecap="round" />
      {SEGMENTS.map(([from, to]) => (
        <line
          key={`${from}-${to}`}
          x1={pose[from][0]}
          y1={pose[from][1]}
          x2={pose[to][0]}
          y2={pose[to][1]}
          stroke="var(--organic-espresso)"
          strokeWidth="7"
          strokeLinecap="round"
        />
      ))}
      <circle cx={pose.head[0]} cy={pose.head[1]} r="13" fill="var(--organic-espresso)" />
      {marker && (
        <g>
          <circle cx={marker[0]} cy={marker[1]} r="16" fill="none" stroke="var(--energy-hot, #d85a30)" strokeWidth="3" className="wow-pulse" />
          <circle cx={marker[0]} cy={marker[1]} r="5" fill="var(--energy-hot, #d85a30)" />
          {errorNote && (
            <text x={marker[0] + 22} y={marker[1] + 4} fontSize="12" fontWeight="600" fill="var(--energy-hot, #d85a30)">
              {errorNote}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}
