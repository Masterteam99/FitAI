"use client";

import React, { useState, useEffect } from "react";

interface CountdownCircleProps {
  seconds: number;
  onComplete: () => void;
  subtitle?: string;
}

export default function CountdownCircle({ seconds, onComplete, subtitle }: CountdownCircleProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (elapsed >= seconds) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [elapsed, seconds, onComplete]);

  const remaining = Math.max(0, seconds - elapsed);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (elapsed / seconds) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="text-muted stroke-current"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="text-primary stroke-current transition-all duration-1000 ease-linear"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-5xl font-bold text-foreground absolute">{remaining}</span>
      </div>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground font-medium text-center">{subtitle}</p>}
    </div>
  );
}
