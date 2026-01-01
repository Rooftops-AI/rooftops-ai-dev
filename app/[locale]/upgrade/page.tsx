"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { STRIPE_PRICE_IDS } from "@/lib/stripe-config"
import { toast } from "sonner"
import { useChatbotUI } from "@/context/context"

export default function UpgradePage() {
  const router = useRouter()
  const { profile } = useChatbotUI()
  const [activeTab, setActiveTab] = useState<"premium" | "business">("premium")
  const [loading, setLoading] = useState(false)

  const handleCheckout = async (priceId: string, planType: string) => {
    setLoading(true)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          priceId,
          planType
        })
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Failed to create checkout session")
        setLoading(false)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    // Get home workspace and redirect to chat
    const { getHomeWorkspaceByUserId } = await import("@/db/workspaces")
    const { supabase } = await import("@/lib/supabase/browser-client")

    const session = (await supabase.auth.getSession()).data.session
    if (session) {
      const homeWorkspaceId = await getHomeWorkspaceByUserId(session.user.id)
      router.push(`/${homeWorkspaceId}/chat`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white">
            Unlock Premium Features
          </h1>
          <p className="text-gray-300">
            Get access to exclusive agents and advanced features
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-lg bg-slate-800/50 p-1">
          <button
            onClick={() => setActiveTab("premium")}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "premium"
                ? "bg-white text-gray-900 shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Premium
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "business"
                ? "bg-white text-gray-900 shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Business
          </button>
        </div>

        {/* Pricing Card */}
        <div className="rounded-xl bg-white p-6 shadow-2xl">
          {activeTab === "premium" ? (
            <>
              {/* Premium Plan */}
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  Premium Agents
                </h2>
                <p className="text-sm text-gray-600">
                  Perfect for individual contractors
                </p>
              </div>

              {/* Features */}
              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-3 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700">
                    1,000 chat messages per month
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-3 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700">
                    20 property reports per month
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-3 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    Premium Agent Library
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-3 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700">
                    Advanced AI models
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-3 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700">
                    Priority support
                  </span>
                </div>
              </div>

              {/* Pricing Options */}
              <div className="mb-6 space-y-3">
                <Button
                  onClick={() =>
                    handleCheckout(
                      STRIPE_PRICE_IDS.premium_monthly,
                      "premium_monthly"
                    )
                  }
                  disabled={loading}
                  className="w-full bg-gray-900 py-6 text-base font-semibold hover:bg-gray-800"
                >
                  <div className="flex w-full items-center justify-between">
                    <span>Monthly</span>
                    <span>$29/month</span>
                  </div>
                </Button>
                <Button
                  onClick={() =>
                    handleCheckout(
                      STRIPE_PRICE_IDS.premium_annual,
                      "premium_annual"
                    )
                  }
                  disabled={loading}
                  variant="outline"
                  className="group relative w-full border-2 border-green-600 py-6 text-base font-semibold hover:bg-green-50"
                >
                  <div className="absolute -top-2 right-4 rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                    Save $48
                  </div>
                  <div className="flex w-full items-center justify-between text-green-700">
                    <span>Annual</span>
                    <span>$25/month</span>
                  </div>
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Business Plan */}
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  Business Agents
                </h2>
                <p className="text-sm text-gray-600">
                  For growing roofing businesses
                </p>
              </div>

              {/* Features */}
              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-3 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700">
                    5,000 chat messages per month
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-3 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700">
                    100 property reports per month
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-3 text-green-600" strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      Exclusive Business Agents
                    </span>
                    <span className="text-xs text-gray-500">
                      all premium agents included
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-3 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700">
                    Team collaboration tools
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-3 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700">
                    Unlimited document generations
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-3 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700">
                    Dedicated support
                  </span>
                </div>
              </div>

              {/* Pricing Options */}
              <div className="mb-6 space-y-3">
                <Button
                  onClick={() =>
                    handleCheckout(
                      STRIPE_PRICE_IDS.business_monthly,
                      "business_monthly"
                    )
                  }
                  disabled={loading}
                  className="w-full bg-gray-900 py-6 text-base font-semibold hover:bg-gray-800"
                >
                  <div className="flex w-full items-center justify-between">
                    <span>Monthly</span>
                    <span>$99/month</span>
                  </div>
                </Button>
                <Button
                  onClick={() =>
                    handleCheckout(
                      STRIPE_PRICE_IDS.business_annual,
                      "business_annual"
                    )
                  }
                  disabled={loading}
                  variant="outline"
                  className="group relative w-full border-2 border-green-600 py-6 text-base font-semibold hover:bg-green-50"
                >
                  <div className="absolute -top-2 right-4 rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                    Save $180
                  </div>
                  <div className="flex w-full items-center justify-between text-green-700">
                    <span>Annual</span>
                    <span>$84/month</span>
                  </div>
                </Button>
              </div>
            </>
          )}

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Continue with Free Plan
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          You can upgrade or downgrade at any time
        </p>
      </div>
    </div>
  )
}
