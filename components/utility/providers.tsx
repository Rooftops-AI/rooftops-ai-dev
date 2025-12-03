// components/utility/providers.tsx
"use client"

import { ThemeProvider } from "next-themes"
import { ChatbotUIProvider } from "@/context/context"
import { CanvasProvider } from "@/context/CanvasContext"

export function Providers({
  attribute,
  defaultTheme,
  children
}: {
  attribute: string
  defaultTheme: string
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute={attribute} defaultTheme={defaultTheme}>
      {/* 🎯 Wrap here so all downstream client components get context */}
      <ChatbotUIProvider>
        <CanvasProvider>{children}</CanvasProvider>
      </ChatbotUIProvider>
    </ThemeProvider>
  )
}
