"use client"

import { FC, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  IconCheck,
  IconMessageCircle,
  IconMap,
  IconCrown
} from "@tabler/icons-react"
import { updateProfile } from "@/db/profile"
import { useChatbotUI } from "@/context/context"
import { toast } from "sonner"

interface OnboardingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const OnboardingModal: FC<OnboardingModalProps> = ({
  open,
  onOpenChange
}) => {
  const router = useRouter()
  const { locale, workspaceid: workspaceId } = useParams() as {
    locale: string
    workspaceid: string
  }
  const { profile, setProfile } = useChatbotUI()
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: IconMap,
      title: "Analyze Your First Property",
      description:
        "Get instant AI-powered property reports with roof analysis, condition assessment, and solar potential.",
      buttonText: "Go to Explore",
      route: `/${locale}/${workspaceId}/explore`,
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: IconMessageCircle,
      title: "Try the AI Chat",
      description:
        "Ask questions about roofing, get cost estimates, material recommendations, and expert advice.",
      buttonText: "Open Chat",
      route: `/${locale}/${workspaceId}/chat`,
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: IconCrown,
      title: "Explore Pricing Plans",
      description:
        "Upgrade to Premium for more reports, unlimited chat, web search, and access to our AI agent library.",
      buttonText: "View Pricing",
      route: "/pricing",
      color: "from-amber-500 to-orange-500"
    }
  ]

  const handleNext = async (route?: string) => {
    if (route) {
      await markOnboardingComplete()
      router.push(route)
      onOpenChange(false)
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await markOnboardingComplete()
      onOpenChange(false)
    }
  }

  const handleSkip = async () => {
    await markOnboardingComplete()
    onOpenChange(false)
  }

  const markOnboardingComplete = async () => {
    if (!profile) return

    try {
      const updatedProfile = await updateProfile(profile.id, {
        has_onboarded: true
      })
      setProfile(updatedProfile)
    } catch (error) {
      console.error("Failed to update onboarding status:", error)
      toast.error("Failed to update onboarding status")
    }
  }

  const currentStepData = steps[currentStep]
  const StepIcon = currentStepData.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Welcome to Rooftops AI! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-12 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-blue-600"
                    : index < currentStep
                      ? "bg-green-600"
                      : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-br ${currentStepData.color}`}
            >
              <StepIcon className="size-10 text-white" />
            </div>

            <h3 className="mb-2 text-xl font-bold">{currentStepData.title}</h3>

            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Action buttons */}
            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1" onClick={handleSkip}>
                Skip Tour
              </Button>
              <Button
                className={`flex-1 bg-gradient-to-r ${currentStepData.color} text-white hover:opacity-90`}
                onClick={() => handleNext(currentStepData.route)}
              >
                {currentStepData.buttonText}
              </Button>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-muted-foreground text-center text-sm">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
