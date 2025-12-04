import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Brand } from "@/components/ui/brand"
import { IconFileText, IconMessageCircle } from "@tabler/icons-react"
import { FC, useRef } from "react"

export const SETUP_STEP_COUNT = 2

interface StepContainerProps {
  stepDescription: string
  stepNum: number
  stepTitle: string
  onShouldProceed: (shouldProceed: boolean) => void
  children?: React.ReactNode
  showBackButton?: boolean
  showNextButton?: boolean
}

export const StepContainer: FC<StepContainerProps> = ({
  stepDescription,
  stepNum,
  stepTitle,
  onShouldProceed,
  children,
  showBackButton = false,
  showNextButton = true
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (buttonRef.current) {
        buttonRef.current.click()
      }
    }
  }

  // Only show hero section on first step
  const showHeroSection = stepNum === 1

  return (
    <Card
      className="w-full max-w-[700px] border-zinc-800 bg-black px-4 shadow-xl sm:px-0"
      onKeyDown={handleKeyDown}
    >
      {showHeroSection && (
        <div className="bg-black px-6 py-12">
          <div className="mx-auto max-w-2xl">
            {/* Logo */}
            <div className="mb-8">
              <Brand theme="light" />
            </div>

            {/* Main Heading */}
            <h1 className="mb-10 text-center text-4xl font-bold tracking-tight text-white">
              Welcome to the future of roofing
            </h1>

            {/* Features */}
            <div className="mb-12 space-y-6 text-left">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600">
                  <IconFileText className="size-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    Instant Roof Reports
                  </h3>
                  <p className="text-sm text-zinc-400">
                    No more waiting days or hours for information your team
                    needs now.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600">
                  <IconMessageCircle
                    className="size-6 text-white"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    AI Chat Tailored for Roofers
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Refine strategy, analyze results, create documents.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Section Heading */}
            <h2 className="mb-6 text-center text-2xl font-semibold text-white">
              Let&apos;s create your profile
            </h2>
          </div>
        </div>
      )}

      <CardContent className="space-y-6 bg-black px-6 pb-8">
        {children}
      </CardContent>

      <CardFooter className="bg-black p-6">
        <div className="w-full space-y-3">
          {showNextButton && (
            <Button
              ref={buttonRef}
              size="lg"
              onClick={() => onShouldProceed(true)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-600 hover:to-blue-700"
            >
              Next
            </Button>
          )}
          {showBackButton && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => onShouldProceed(false)}
              className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              Back
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
