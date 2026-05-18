"use client";

import React from "react";
import { Check } from "lucide-react";

interface AnalysisProgressProps {
  steps: { label: string; icon: React.ReactNode }[];
  currentStep: number;
}

export default function AnalysisProgress({ steps, currentStep }: AnalysisProgressProps) {
  return (
    <div className="flex items-center justify-between w-full relative mb-8">
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-muted -z-10" />
      
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        
        return (
          <div key={index} className="flex flex-col items-center gap-2 relative z-10">
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                isCompleted 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : isActive
                  ? "border-primary text-primary bg-background"
                  : "border-muted text-muted-foreground bg-background"
              }`}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : isActive ? (
                <div className="animate-spin">{step.icon}</div>
              ) : (
                step.icon
              )}
            </div>
            <span 
              className={`text-xs font-medium text-center absolute -bottom-6 w-24 left-1/2 -translate-x-1/2 ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
