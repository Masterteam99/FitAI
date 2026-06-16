"use client";

import { PageTransition } from "@/components/motion/MotionPrimitives";

export default function MarketingTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
