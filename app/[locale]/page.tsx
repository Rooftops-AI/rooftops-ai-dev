"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { IconSearch, IconMapPin } from "@tabler/icons-react"
import { createClient } from "@/lib/supabase/client"

export default function LandingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (session) {
        // User is authenticated, redirect to their home workspace
        const { data: homeWorkspace } = await supabase
          .from("workspaces")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("is_home", true)
          .single()

        if (homeWorkspace) {
          router.push(`/${homeWorkspace.id}/chat`)
        }
      } else {
        // User is not authenticated, show landing page
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleInputClick = () => {
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-y-auto bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Map-like background pattern */}
      <div className="fixed inset-0 opacity-20 dark:opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-400"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Blur overlay */}
      <div className="fixed inset-0 backdrop-blur-[2px]"></div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/rooftops-logo-gr-black.png"
            alt="Rooftops AI"
            width={200}
            height={47}
            className="dark:hidden"
            priority
          />
          <Image
            src="/rooftops-logo-gr-master.png"
            alt="Rooftops AI"
            width={200}
            height={47}
            className="hidden dark:block"
            priority
          />
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Instant property intelligence for roofing professionals
          </p>
        </div>

        {/* Main Input Area */}
        <div className="w-full max-w-2xl">
          <div
            onClick={handleInputClick}
            className="group relative cursor-pointer"
          >
            {/* Fake Input Box - styled like ChatInput */}
            <div className="flex w-full items-center gap-3 rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 shadow-lg transition-all duration-200 hover:border-blue-500 hover:shadow-xl dark:border-gray-700 dark:bg-slate-900 sm:px-6 sm:py-5">
              {/* Icon */}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 sm:size-12">
                <IconMapPin className="size-5 text-white sm:size-6" />
              </div>

              {/* Input Placeholder */}
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-base font-medium text-gray-900 dark:text-white sm:text-lg">
                  Enter a property address
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Generate instant property reports with AI
                </span>
              </div>

              {/* Arrow Icon */}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-blue-100 dark:bg-slate-800 dark:group-hover:bg-slate-700 sm:size-12">
                <IconSearch className="size-5 text-gray-600 dark:text-gray-400 sm:size-6" />
              </div>
            </div>

            {/* Hover effect hint */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                Sign up to get started →
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white/80 p-4 text-center backdrop-blur-sm dark:bg-slate-900/80 sm:p-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600">
              <IconMapPin className="size-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Property Reports
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Comprehensive property analysis in seconds
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl bg-white/80 p-4 text-center backdrop-blur-sm dark:bg-slate-900/80 sm:p-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600">
              <svg
                className="size-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              AI-Powered
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Advanced AI for accurate insights
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl bg-white/80 p-4 text-center backdrop-blur-sm dark:bg-slate-900/80 sm:p-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600">
              <svg
                className="size-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Instant Results
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              No more waiting days for reports
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mb-8 mt-4 text-center">
          <button
            onClick={handleInputClick}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-cyan-600 hover:to-blue-700 hover:shadow-xl"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  )
}
