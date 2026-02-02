"use client"

import { useState, useEffect } from "react"
import { IconX, IconMail, IconRocket } from "@tabler/icons-react"

interface ExitIntentPopupProps {
  onSignup: () => void
}

export function ExitIntentPopup({ onSignup }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let shown = false
    
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from the top of the page
      if (e.clientY <= 0 && !shown && !submitted) {
        shown = true
        setIsVisible(true)
      }
    }

    // Also trigger on scroll up when near top
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY < lastScrollY && currentScrollY < 100 && !shown && !submitted) {
        shown = true
        setIsVisible(true)
      }
      lastScrollY = currentScrollY
    }

    document.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [submitted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // In production, send to your email service
      setSubmitted(true)
      setTimeout(() => {
        setIsVisible(false)
        onSignup()
      }, 2000)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -right-2 -top-2 z-10 rounded-full bg-white p-1 shadow-lg ring-1 ring-gray-100 transition-transform hover:scale-110"
        >
          <IconX className="size-5 text-gray-500" />
        </button>

        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-[#24BDEB] to-[#4FEBBC] p-6 text-center">
            <IconRocket className="mx-auto mb-3 size-10 text-white" />
            <h3 className="text-xl font-bold text-white">
              Wait! Don't Leave Empty-Handed
            </h3>
            <p className="mt-1 text-sm text-white/90">
              Get 5 free roof reports + our AI Roofing Toolkit
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {!submitted ? (
              <>
                <div className="mb-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded-full bg-green-100">
                      <svg className="size-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>5 free AI roof reports (no credit card)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded-full bg-green-100">
                      <svg className="size-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>The 7-Day Roofing AI Quick-Start Guide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded-full bg-green-100">
                      <svg className="size-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Proposal templates that close deals</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <IconMail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#24BDEB] focus:ring-2 focus:ring-[#24BDEB]/20"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-gradient-to-r from-[#24BDEB] to-[#4FEBBC] py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg"
                  >
                    Send Me The Free Toolkit
                  </button>
                </form>

                <p className="mt-3 text-center text-xs text-gray-400">
                  No spam. Unsubscribe anytime.
                </p>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                  <svg className="size-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900">You're In!</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Check your email for your free toolkit and 5 roof report credits.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}