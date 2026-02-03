"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  IconCheck, 
  IconHome, 
  IconCalculator, 
  IconFileText,
  IconRobot,
  IconMail,
  IconPhone,
  IconTrendingUp,
  IconTarget,
  IconClock,
  IconArrowRight,
  IconDownload,
  IconPrinter
} from "@tabler/icons-react"

export default function QuickstartGuidePage() {
  const [completedDays, setCompletedDays] = useState<number[]>([])

  const toggleDay = (day: number) => {
    setCompletedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const days = [
    {
      day: 1,
      title: "Set Up Your AI Command Center",
      icon: IconHome,
      color: "cyan",
      duration: "30 minutes",
      tasks: [
        "Create your Rooftops AI account",
        "Complete your company profile",
        "Add your logo and branding",
        "Set your default pricing (materials, labor rates)",
        "Connect your email for AI follow-ups"
      ],
      tip: "The more accurate your pricing setup, the better your AI estimates will be.",
      action: "Start with 3 free roof reports on properties you know well."
    },
    {
      day: 2,
      title: "Master Multi-Agent Roof Analysis",
      icon: IconRobot,
      color: "green",
      duration: "45 minutes",
      tasks: [
        "Learn how AI analyzes properties from multiple angles",
        "Understand satellite imagery + drone data fusion",
        "Review AI-generated measurements vs. manual measurements",
        "Test on 5 different roof types (gable, hip, flat, etc.)",
        "Check AI accuracy on properties you've recently measured"
      ],
      tip: "Rooftops AI uses multiple AI agents that each analyze different aspects: roof geometry, damage detection, material identification, and solar potential.",
      action: "Run reports on your last 3 completed jobs. Compare AI measurements to what you actually used."
    },
    {
      day: 3,
      title: "Generate Your First AI Estimates",
      icon: IconCalculator,
      color: "cyan",
      duration: "60 minutes",
      tasks: [
        "Enter your material costs and markups",
        "Set up labor rates by crew type",
        "Add overhead and profit margins",
        "Generate 3 complete estimates using AI reports",
        "Customize proposal templates with your branding"
      ],
      tip: "AI estimates include material calculations, waste factors, and labor hours based on roof complexity.",
      action: "Create an estimate for a current prospect and send it same-day."
    },
    {
      day: 4,
      title: "Deploy AI Sales Proposals",
      icon: IconFileText,
      color: "green",
      duration: "45 minutes",
      tasks: [
        "Generate professional PDF proposals",
        "Add before/after satellite imagery",
        "Include material specifications",
        "Set up automated follow-up sequences",
        "Create proposal templates for different job types"
      ],
      tip: "Proposals with satellite imagery and AI analysis close 40% faster than text-only quotes.",
      action: "Send your first AI-powered proposal to a hot lead today."
    },
    {
      day: 5,
      title: "Activate AI Lead Follow-Up",
      icon: IconMail,
      color: "cyan",
      duration: "30 minutes",
      tasks: [
        "Set up AI email follow-up sequences",
        "Create SMS follow-up templates",
        "Configure response triggers",
        "Test AI responses to common objections",
        "Connect your CRM or calendar"
      ],
      tip: "AI employees work 24/7. They never forget to follow up and respond in under 60 seconds.",
      action: "Let AI handle follow-ups on 5 older leads. Watch the responses roll in."
    },
    {
      day: 6,
      title: "Build Custom AI Tools",
      icon: IconRobot,
      color: "green",
      duration: "60 minutes",
      tasks: [
        "Create AI assistants for specific tasks",
        "Build a 'Code Compliance Checker'",
        "Set up a 'Material Alternatives' tool",
        "Create 'Weather Impact Analyzer'",
        "Train AI on your specific roofing terminology"
      ],
      tip: "You can build micro-apps with AI that do one thing really well. No coding required.",
      action: "Build one custom AI tool your team will use daily."
    },
    {
      day: 7,
      title: "Scale and Systematize",
      icon: IconTrendingUp,
      color: "cyan",
      duration: "45 minutes",
      tasks: [
        "Review your week's metrics (time saved, deals closed)",
        "Document your AI workflows",
        "Train your team on the system",
        "Set weekly AI usage goals",
        "Plan your next AI enhancement"
      ],
      tip: "The roofers seeing 10x ROI use AI for every property, every estimate, every follow-up.",
      action: "Commit to using AI on 100% of new leads this week."
    }
  ]

  const progress = Math.round((completedDays.length / days.length) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Image
            src="/rooftops-logo-gr-black.png"
            alt="Rooftops AI"
            width={160}
            height={40}
            className="h-7 w-auto"
          />
          <div className="text-sm text-gray-500">Free Resource</div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-100 to-green-100 px-4 py-2">
            <IconClock className="size-4 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-700">7-Day Program</span>
          </div>
          
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            The 7-Day Roofing AI Quick-Start Guide
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Transform your roofing business with AI in just one week. Follow this day-by-day 
            guide to go from zero to AI-powered operations.
          </p>

          {/* Progress Bar */}
          <div className="mx-auto mt-8 max-w-md">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-600">Your Progress</span>
              <span className="font-medium text-cyan-600">{progress}% Complete</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Check off days as you complete them to track your progress
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              <IconPrinter className="size-4" />
              Print Guide
            </button>
            <a 
              href="/login"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-green-500 px-6 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
            >
              Start Your Free Trial
              <IconArrowRight className="size-4" />
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mb-1 text-3xl font-bold text-cyan-600">5+</div>
            <div className="text-sm text-gray-600">Hours Saved Daily</div>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mb-1 text-3xl font-bold text-green-600">40%</div>
            <div className="text-sm text-gray-600">Faster Deal Closes</div>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mb-1 text-3xl font-bold text-cyan-600">24/7</div>
            <div className="text-sm text-gray-600">AI Working For You</div>
          </div>
        </div>

        {/* Day Cards */}
        <div className="space-y-6">
          {days.map((day) => {
            const Icon = day.icon
            const isCompleted = completedDays.includes(day.day)
            
            return (
              <div 
                key={day.day}
                className={`rounded-xl border bg-white p-6 shadow-sm transition-all ${
                  isCompleted ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex size-12 items-center justify-center rounded-xl ${
                      day.color === 'cyan' ? 'bg-cyan-100' : 'bg-green-100'
                    }`}>
                      <Icon className={`size-6 ${
                        day.color === 'cyan' ? 'text-cyan-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Day {day.day}</div>
                      <h3 className="text-xl font-bold text-gray-900">{day.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <IconClock className="size-4" />
                      {day.duration}
                    </div>
                    <button
                      onClick={() => toggleDay(day.day)}
                      className={`flex size-8 items-center justify-center rounded-full transition-all ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'border-2 border-gray-300 text-gray-300 hover:border-cyan-500 hover:text-cyan-500'
                      }`}
                    >
                      <IconCheck className="size-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Today's Tasks:</h4>
                    <ul className="space-y-2">
                      {day.tasks.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                          <span className="mt-1.5 size-1.5 rounded-full bg-cyan-500" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-4">
                    <div className="mb-1 font-semibold text-amber-800">💡 Pro Tip</div>
                    <p className="text-sm text-amber-700">{day.tip}</p>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-50 to-green-50 p-4">
                    <IconTarget className="size-5 text-cyan-600" />
                    <span className="font-medium text-cyan-800">Action Item:</span>
                    <span className="text-cyan-700">{day.action}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Completion Section */}
        {progress === 100 && (
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-green-500 to-cyan-500 p-8 text-center text-white">
            <div className="mb-4 text-5xl">🎉</div>
            <h2 className="mb-2 text-2xl font-bold">Congratulations!</h2>
            <p className="mb-6">
              You've completed the 7-day AI transformation. Your roofing business is now 
              equipped with cutting-edge AI tools.
            </p>
            <a 
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-cyan-600 shadow-lg transition-all hover:shadow-xl"
            >
              Upgrade to Premium
              <IconArrowRight className="size-5" />
            </a>
          </div>
        )}

        {/* Resources */}
        <div className="mt-12 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Additional Resources</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <a href="/pricing" className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-all hover:border-cyan-500 hover:bg-cyan-50">
              <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-100">
                <IconTrendingUp className="size-5 text-cyan-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">View Pricing</div>
                <div className="text-sm text-gray-500">Choose the right plan for your business</div>
              </div>
            </a>
            <a href="mailto:sb@rooftops.ai" className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-all hover:border-cyan-500 hover:bg-cyan-50">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                <IconMail className="size-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Get Help</div>
                <div className="text-sm text-gray-500">Email us with questions</div>
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2024 Rooftops AI. Free resource for roofing contractors.</p>
          <p className="mt-2">
            Questions? Email sb@rooftops.ai
          </p>
        </footer>
      </main>
    </div>
  )
}