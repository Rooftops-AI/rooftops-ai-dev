"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-zinc-900 group-[.toaster]:text-zinc-900 dark:group-[.toaster]:text-zinc-100 group-[.toaster]:border group-[.toaster]:border-zinc-200 dark:group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:min-h-[60px] group-[.toaster]:w-[90vw] md:group-[.toaster]:w-[80vw] group-[.toaster]:max-w-2xl group-[.toaster]:mx-auto group-[.toaster]:text-base group-[.toaster]:font-medium",
          description:
            "group-[.toast]:text-zinc-700 dark:group-[.toast]:text-zinc-300 group-[.toast]:text-base group-[.toast]:leading-relaxed group-[.toast]:mt-1 group-[.toast]:group-data-[type=error]:text-white group-[.toast]:group-data-[type=success]:text-white group-[.toast]:group-data-[type=warning]:text-white group-[.toast]:group-data-[type=info]:text-white",
          actionButton:
            "group-[.toast]:bg-zinc-900 dark:group-[.toast]:bg-zinc-100 group-[.toast]:text-white dark:group-[.toast]:text-zinc-900 group-[.toast]:rounded-md group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:hover:bg-zinc-800 dark:group-[.toast]:hover:bg-zinc-200 group-[.toast]:transition-colors",
          cancelButton:
            "group-[.toast]:bg-zinc-100 dark:group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-900 dark:group-[.toast]:text-zinc-100 group-[.toast]:rounded-md group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:hover:bg-zinc-200 dark:group-[.toast]:hover:bg-zinc-700 group-[.toast]:transition-colors",
          error:
            "group-[.toaster]:bg-red-500 dark:group-[.toaster]:bg-red-600 group-[.toaster]:text-white dark:group-[.toaster]:text-white group-[.toaster]:border-red-500 dark:group-[.toaster]:border-red-600",
          success:
            "group-[.toaster]:bg-emerald-500 dark:group-[.toaster]:bg-emerald-600 group-[.toaster]:text-white dark:group-[.toaster]:text-white group-[.toaster]:border-emerald-500 dark:group-[.toaster]:border-emerald-600",
          warning:
            "group-[.toaster]:bg-amber-500 dark:group-[.toaster]:bg-amber-600 group-[.toaster]:text-white dark:group-[.toaster]:text-white group-[.toaster]:border-amber-500 dark:group-[.toaster]:border-amber-600",
          info: "group-[.toaster]:bg-blue-500 dark:group-[.toaster]:bg-blue-600 group-[.toaster]:text-white dark:group-[.toaster]:text-white group-[.toaster]:border-blue-500 dark:group-[.toaster]:border-blue-600"
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
