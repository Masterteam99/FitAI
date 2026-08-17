"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ARCHETYPES,
  lerpPose,
  errorJoint,
  type Archetype,
  type ErrorKey,
  type Pose,
} from "./pose/poseEngine";

// Spessori dei singoli segmenti — un "personaggio pieno" invece dello scheletro
// a linee sottili: capsule arrotondate spesse, non più semplici tratti.
const LIMB_WIDTH = 22;
const TORSO_WIDTH = 34;
const HEAD_R = 20;

function mid(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

export function AnimatedFormCharacter({
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
  const pose: Pose = lerpPose(conf.start, conf.end, t);
  const errKey: ErrorKey = error ?? conf.defaultError;
  const marker = showError ? errorJoint(errKey, pose) : null;

  const torsoMidTop = mid(pose.head, pose.shoulder);
  const hipMid = pose.hip;

  return (
    <svg
      viewBox="0 0 200 300"
      width={size}
      height={size * 1.5}
      className={className}
      role="img"
      aria-label={`Esecuzione animata: ${archetype}${showError ? `, errore evidenziato su ${errKey}` : ""}`}
    >
      <defs>
        <linearGradient id="afc-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3b28c" />
          <stop offset="1" stopColor="#cf9a72" />
        </linearGradient>
        <linearGradient id="afc-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--organic-sage-deep, #4fd1c5)" />
          <stop offset="1" stopColor="var(--organic-sage, #3a8f86)" />
        </linearGradient>
        <linearGradient id="afc-shorts" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--organic-espresso, #16213e)" />
          <stop offset="1" stopColor="#0e1730" />
        </linearGradient>
        <radialGradient id="afc-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ombra a terra */}
      <ellipse cx="105" cy="284" rx="46" ry="9" fill="url(#afc-shadow)" />

      {/* Gamba posteriore (dietro al busto, leggermente sfalsata per dare profondità) */}
      <g opacity="0.85">
        <line x1={pose.hip[0] - 6} y1={pose.hip[1]} x2={pose.knee[0] - 4} y2={pose.knee[1]} stroke="url(#afc-shorts)" strokeWidth={LIMB_WIDTH - 4} strokeLinecap="round" />
        <line x1={pose.knee[0] - 4} y1={pose.knee[1]} x2={pose.ankle[0] - 4} y2={pose.ankle[1]} stroke="url(#afc-skin)" strokeWidth={LIMB_WIDTH - 6} strokeLinecap="round" />
      </g>

      {/* Braccio posteriore */}
      <g opacity="0.85">
        <line x1={pose.shoulder[0] - 4} y1={pose.shoulder[1]} x2={pose.elbow[0] - 6} y2={pose.elbow[1] - 4} stroke="url(#afc-top)" strokeWidth={LIMB_WIDTH - 8} strokeLinecap="round" />
        <line x1={pose.elbow[0] - 6} y1={pose.elbow[1] - 4} x2={pose.hand[0] - 6} y2={pose.hand[1] - 4} stroke="url(#afc-skin)" strokeWidth={LIMB_WIDTH - 10} strokeLinecap="round" />
      </g>

      {/* Gamba anteriore */}
      <line x1={pose.hip[0]} y1={pose.hip[1]} x2={pose.knee[0]} y2={pose.knee[1]} stroke="url(#afc-shorts)" strokeWidth={LIMB_WIDTH} strokeLinecap="round" />
      <line x1={pose.knee[0]} y1={pose.knee[1]} x2={pose.ankle[0]} y2={pose.ankle[1]} stroke="url(#afc-skin)" strokeWidth={LIMB_WIDTH - 2} strokeLinecap="round" />
      {/* Scarpa */}
      <ellipse cx={pose.foot[0]} cy={pose.foot[1]} rx="16" ry="8" fill="var(--organic-terracotta, #c8f751)" />

      {/* Busto (capsula piena tronco-bacino) */}
      <line x1={torsoMidTop[0]} y1={torsoMidTop[1]} x2={hipMid[0]} y2={hipMid[1]} stroke="url(#afc-top)" strokeWidth={TORSO_WIDTH} strokeLinecap="round" />

      {/* Braccio anteriore */}
      <line x1={pose.shoulder[0]} y1={pose.shoulder[1]} x2={pose.elbow[0]} y2={pose.elbow[1]} stroke="url(#afc-top)" strokeWidth={LIMB_WIDTH - 4} strokeLinecap="round" />
      <line x1={pose.elbow[0]} y1={pose.elbow[1]} x2={pose.hand[0]} y2={pose.hand[1]} stroke="url(#afc-skin)" strokeWidth={LIMB_WIDTH - 6} strokeLinecap="round" />
      <circle cx={pose.hand[0]} cy={pose.hand[1]} r="7" fill="url(#afc-skin)" />

      {/* Testa con volto semplice */}
      <circle cx={pose.head[0]} cy={pose.head[1]} r={HEAD_R} fill="url(#afc-skin)" />
      <circle cx={pose.head[0] + 6} cy={pose.head[1] - 3} r="2.2" fill="var(--organic-espresso, #16213e)" />
      <path
        d={`M ${pose.head[0] - 2} ${pose.head[1] + 6} Q ${pose.head[0] + 6} ${pose.head[1] + 10} ${pose.head[0] + 11} ${pose.head[1] + 4}`}
        stroke="var(--organic-espresso, #16213e)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Ciuffo/fascia per dare carattere */}
      <path
        d={`M ${pose.head[0] - HEAD_R + 2} ${pose.head[1] - 6} A ${HEAD_R} ${HEAD_R} 0 0 1 ${pose.head[0] + HEAD_R - 2} ${pose.head[1] - 6}`}
        fill="none"
        stroke="var(--organic-terracotta, #c8f751)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {marker && (
        <g>
          <circle cx={marker[0]} cy={marker[1]} r="18" fill="none" stroke="var(--energy-hot, #d85a30)" strokeWidth="3" className="wow-pulse" />
          <circle cx={marker[0]} cy={marker[1]} r="5" fill="var(--energy-hot, #d85a30)" />
          {errorNote && (
            <g>
              <rect x={marker[0] + 16} y={marker[1] - 14} width={errorNote.length * 6.4 + 16} height="22" rx="11" fill="var(--energy-hot, #d85a30)" />
              <text x={marker[0] + 24} y={marker[1] + 1} fontSize="12" fontWeight="700" fill="#fff">
                {errorNote}
              </text>
            </g>
          )}
        </g>
      )}
    </svg>
  );
}
