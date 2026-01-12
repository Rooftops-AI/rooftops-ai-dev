// app/[locale]/[workspaceid]/creator/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useChatbotUI } from "@/context/context"
import { UpgradeModal } from "@/components/modals/upgrade-modal"
import { EmptyStateAgentsLocked } from "@/components/empty-states/empty-state-agents-locked"

const agents = [
  {
    id: "proposal",
    name: "Dylan the Proposal Expert",
    title: "Roofing Proposal Generator",
    avatarUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Dylan&backgroundColor=3b82f6",
    gradient: "from-blue-500 to-cyan-500",
    description: "Creates professional roofing proposals for customers",
    categories: ["Sales", "Documentation"]
  },
  {
    id: "insurance",
    name: "Claire the Claims Specialist",
    title: "Insurance Claim Assistant",
    avatarUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Claire&backgroundColor=a855f7",
    gradient: "from-purple-500 to-pink-500",
    description: "Generates insurance claim documentation",
    categories: ["Claims", "Documentation"]
  },
  {
    id: "followup",
    name: "Finn the Follow-Up Pro",
    title: "Lead Follow-Up Writer",
    avatarUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Finn&backgroundColor=10b981",
    gradient: "from-green-500 to-emerald-500",
    description: "Writes personalized lead follow-up messages",
    categories: ["Sales", "Communication"]
  },
  {
    id: "jobreport",
    name: "Riley the Project Reporter",
    title: "Job Completion Report",
    avatarUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Riley&backgroundColor=f97316",
    gradient: "from-orange-500 to-amber-500",
    description: "Documents job completions professionally",
    categories: ["Operations", "Documentation"]
  }
]

export default function CreatorStudioPage() {
  // 1) grab params
  const { locale, workspaceid: workspaceId } = useParams() as {
    locale: string
    workspaceid: string
  }

  // 2) track the search term
  const [searchTerm, setSearchTerm] = useState("")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Get user subscription to check tier
  const { userSubscription } = useChatbotUI()
  const userTier =
    userSubscription?.tier || userSubscription?.plan_type || "free"
  const hasAgentAccess = userTier === "premium" || userTier === "business"

  // 3) derive a filtered list
  const filtered = agents.filter(agent => {
    const term = searchTerm.toLowerCase()
    return (
      agent.name.toLowerCase().includes(term) ||
      agent.title.toLowerCase().includes(term) ||
      agent.description.toLowerCase().includes(term) ||
      agent.categories.some(cat => cat.toLowerCase().includes(term))
    )
  })

  return (
    <div className="mx-auto max-w-7xl p-8">
      {/* Hero Section with gradient background */}
      <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-8 dark:from-cyan-500/20 dark:via-blue-500/20 dark:to-purple-500/20">
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 size-64 -translate-y-32 translate-x-32 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-64 -translate-x-32 translate-y-32 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-1.5 text-sm font-medium text-cyan-700 dark:text-cyan-300">
            <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 7H7v6h6V7z" />
              <path
                fillRule="evenodd"
                d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                clipRule="evenodd"
              />
            </svg>
            Powered by AI
          </div>

          <h1 className="mb-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400">
            AI Agent Library
          </h1>

          <p className="text-muted-foreground max-w-2xl text-lg">
            Choose from our collection of specialized AI agents to streamline
            your workflow and boost productivity.
          </p>
        </div>
      </div>

      {/* Show empty state for free users */}
      {!hasAgentAccess ? (
        <EmptyStateAgentsLocked />
      ) : (
        <>
          {/* Search bar */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search agents…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary w-full rounded-xl border py-3 pl-4 pr-12 transition-all duration-200 focus:outline-none focus:ring-2"
              />
              <svg
                className="text-muted-foreground absolute right-4 top-3.5 size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {filtered.map(agent => {
              const handleClick = (e: React.MouseEvent) => {
                if (!hasAgentAccess) {
                  e.preventDefault()
                  setShowUpgradeModal(true)
                }
              }

              return (
                <Link
                  key={agent.id}
                  href={`/${locale}/${workspaceId}/creator/${agent.id}`}
                  onClick={handleClick}
                  className="group block cursor-pointer"
                >
                  <div
                    className={`bg-card border-border hover:border-primary/20 relative h-full overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md ${
                      !hasAgentAccess ? "opacity-60" : ""
                    }`}
                  >
                    {/* Premium Badge */}
                    <div className="absolute right-3 top-3 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
                        <svg
                          className="size-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Premium
                      </span>
                    </div>

                    {/* Lock icon overlay for free users */}
                    {!hasAgentAccess && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="rounded-full bg-gray-900/80 p-4">
                          <svg
                            className="size-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="size-14 shrink-0 overflow-hidden rounded-full shadow-lg">
                          <img
                            src={agent.avatarUrl}
                            alt={agent.name}
                            className="size-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <h2 className="text-foreground text-lg font-bold">
                              {agent.name}
                            </h2>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            >
                              <path
                                d="M5.83331 14.1667L14.1666 5.83334M14.1666 5.83334H5.83331M14.1666 5.83334V14.1667"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <p className="text-primary mb-2 text-sm font-medium">
                            {agent.title}
                          </p>
                          <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                            {agent.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {agent.categories.map(cat => (
                              <span
                                key={cat}
                                className="bg-secondary border-border text-secondary-foreground inline-block rounded-xl border px-2.5 py-1 text-xs font-medium"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        reason="agent_access"
      />
    </div>
  )
}
