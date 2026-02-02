"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        className:
          "bg-white text-gray-900 border border-gray-200 shadow-lg rounded-xl px-4 py-3",
        descriptionClassName: "text-gray-600"
      }}
      {...props}
    />
  )
}

export { Toaster }
