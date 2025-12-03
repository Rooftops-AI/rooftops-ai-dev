"use client"

import { AnimatedRooftopsLoader } from "@/components/ui/animated-rooftops-loader"

export default function Loading() {
  return (
    <div className="flex size-full flex-col items-center justify-center">
      <AnimatedRooftopsLoader />
    </div>
  )
}
