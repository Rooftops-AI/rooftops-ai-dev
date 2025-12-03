"use client"

import { FC } from "react"
import { RooftopsSVG } from "../icons/rooftops-svg"

interface BrandProps {
  theme?: "dark" | "light"
  compact?: boolean
}

export const Brand: FC<BrandProps> = ({ theme = "dark", compact = false }) => {
  return (
    <div
      className={`flex cursor-pointer flex-col items-center ${compact ? "" : "mb-2"}`}
    >
      <div className={compact ? "size-8" : ""}>
        <RooftopsSVG
          className={compact ? "size-8" : "size-20"}
          style={{ filter: theme === "dark" ? "none" : "invert(1)" }}
        />
      </div>
    </div>
  )
}
