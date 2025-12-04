import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  IconSparkles,
  IconClock,
  IconCurrencyDollar,
  IconChartBar
} from "@tabler/icons-react"
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
      className="max-h-[calc(100vh-60px)] w-full max-w-[700px] overflow-auto px-4 sm:px-0"
      onKeyDown={handleKeyDown}
    >
      {showHeroSection && (
        <div className="border-b bg-white px-8 py-12 dark:bg-zinc-950">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-3 text-center text-5xl font-bold tracking-tight">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Roofing Business
              </span>{" "}
              with AI
            </h1>

            <p className="mb-10 text-center text-xl text-zinc-600 dark:text-zinc-400">
              We&apos;re bringing AI to your service business so you can
              skyrocket efficiency and profits and reach{" "}
              <span className="font-semibold italic">every rooftop</span> with
              AI tailored for your business.
            </p>

            <div className="mb-12 grid gap-6 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                  <IconClock className="size-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Save Time</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Instant property analysis and estimates in seconds
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                  <IconCurrencyDollar
                    className="size-8 text-white"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Cut Costs</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Reduce site visits and manual measurements
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                  <IconChartBar className="size-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Win More</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Professional reports that close deals faster
                </p>
              </div>
            </div>

            <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
              No Credit Card Required
            </p>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex justify-between">
          <div>{stepTitle}</div>

          <div className="text-sm">
            {stepNum} / {SETUP_STEP_COUNT}
          </div>
        </CardTitle>

        <CardDescription>{stepDescription}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">{children}</CardContent>

      <CardFooter className="flex justify-between">
        <div>
          {showBackButton && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onShouldProceed(false)}
            >
              Back
            </Button>
          )}
        </div>

        <div>
          {showNextButton && (
            <Button
              ref={buttonRef}
              size="sm"
              onClick={() => onShouldProceed(true)}
            >
              Next
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
