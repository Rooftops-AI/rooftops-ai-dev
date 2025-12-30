// app/[locale]/[workspaceid]/creator/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import {
  IconMail,
  IconFileText,
  IconClipboardData,
  IconUsers,
  IconClipboard,
  IconBulb,
  IconFileInvoice
} from "@tabler/icons-react"
import { useParams } from "next/navigation"

const tools = [
  {
    id: "marketing",
    title: "Marketing Email",
    icon: IconMail,
    description: "Generate a sales or marketing email",
    categories: ["Sales", "Outbound"]
  },
  {
    id: "contract",
    title: "Contract Draft",
    icon: IconFileText,
    description: "Create a service agreement template",
    categories: ["Legal", "Agreements"]
  },
  {
    id: "invoice",
    title: "Invoice Template",
    icon: IconClipboardData,
    description: "Build a simple invoice",
    categories: ["Finance", "Billing"]
  },
  {
    id: "hr",
    title: "HR Policy",
    icon: IconUsers,
    description: "Generate an employee handbook snippet",
    categories: ["HR", "Policies"]
  },
  {
    id: "recruit",
    title: "Job Posting",
    icon: IconClipboard,
    description: "Write a job ad to recruit staff",
    categories: ["HR", "Hiring"]
  },
  {
    id: "admin",
    title: "Office Memo",
    icon: IconBulb,
    description: "Produce an internal memo or SOP",
    categories: ["Operations", "Internal"]
  },
  {
    id: "workorder",
    title: "Work Order",
    icon: IconFileInvoice,
    description: "Generate a customizable work order form",
    categories: ["Operations", "Field"]
  },
  {
    id: "servicequote",
    title: "Service Quote",
    icon: IconFileInvoice,
    description: "Create a detailed service quote template",
    categories: ["Sales", "Quoting"]
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

  // 3) derive a filtered list
  const filtered = tools.filter(tool => {
    const term = searchTerm.toLowerCase()
    return (
      tool.title.toLowerCase().includes(term) ||
      tool.description.toLowerCase().includes(term) ||
      tool.categories.some(cat => cat.toLowerCase().includes(term))
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

      {/* Search bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tools…"
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(tool => (
          <Link
            key={tool.id}
            href={`/${locale}/${workspaceId}/creator/${tool.id}`}
            className="group block"
          >
            <div className="bg-card border-border hover:border-primary/20 h-full overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="bg-primary/10 rounded-xl p-2.5">
                    <tool.icon
                      size={24}
                      className="text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
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

                <h2 className="text-foreground mb-1 mt-4 text-lg font-medium">
                  {tool.title}
                </h2>
                <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
                  {tool.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {tool.categories.map(cat => (
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
          </Link>
        ))}
      </div>
    </div>
  )
}
