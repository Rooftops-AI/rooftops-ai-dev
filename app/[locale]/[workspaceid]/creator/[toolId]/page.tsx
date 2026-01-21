// @ts-nocheck
// app/[locale]/[workspaceid]/creator/[toolId]/page.tsx
"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toolSchemas } from "@/lib/creatorSchemas"
import { supabase } from "@/lib/supabase/browser-client"
import { IconLoader2, IconSparkles } from "@tabler/icons-react"
import { toast } from "sonner"
import { ArtifactViewer } from "@/components/agents/artifact-viewer"
import { useChatbotUI } from "@/context/context"
import { UpgradeModal } from "@/components/modals/upgrade-modal"

// Map agent IDs to their metadata
const agentMetadata: Record<
  string,
  { name: string; avatar: string; gradient: string; title: string }
> = {
  marcus: {
    name: "Marcus",
    avatar: "/agents/marcus.svg",
    gradient: "from-blue-600 to-indigo-600",
    title: "Sales Specialist"
  },
  elena: {
    name: "Elena",
    avatar: "/agents/elena.svg",
    gradient: "from-purple-600 to-violet-600",
    title: "Estimating Expert"
  },
  jordan: {
    name: "Jordan",
    avatar: "/agents/jordan.svg",
    gradient: "from-orange-600 to-amber-600",
    title: "Project Coordinator"
  },
  sophia: {
    name: "Sophia",
    avatar: "/agents/sophia.svg",
    gradient: "from-green-600 to-emerald-600",
    title: "Customer Service Representative"
  },
  ryan: {
    name: "Ryan",
    avatar: "/agents/ryan.svg",
    gradient: "from-red-600 to-rose-600",
    title: "Insurance Claims Specialist"
  },
  aisha: {
    name: "Aisha",
    avatar: "/agents/aisha.svg",
    gradient: "from-pink-600 to-fuchsia-600",
    title: "Marketing Manager"
  },
  derek: {
    name: "Derek",
    avatar: "/agents/derek.svg",
    gradient: "from-yellow-500 to-orange-500",
    title: "Safety & Compliance Officer"
  },
  nina: {
    name: "Nina",
    avatar: "/agents/nina.svg",
    gradient: "from-gray-600 to-slate-600",
    title: "Business Manager"
  },
  // Legacy agents (keeping for backward compatibility)
  proposal: {
    name: "Dylan",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Dylan&backgroundColor=3b82f6",
    gradient: "from-blue-500 to-cyan-500",
    title: "Proposal Expert"
  },
  insurance: {
    name: "Claire",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Claire&backgroundColor=a855f7",
    gradient: "from-purple-500 to-pink-500",
    title: "Claims Specialist"
  },
  followup: {
    name: "Finn",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Finn&backgroundColor=10b981",
    gradient: "from-green-500 to-emerald-500",
    title: "Follow-Up Pro"
  },
  jobreport: {
    name: "Riley",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Riley&backgroundColor=f97316",
    gradient: "from-orange-500 to-amber-500",
    title: "Project Reporter"
  }
}

export default function ToolPage() {
  const {
    locale,
    workspaceid: workspaceId,
    toolId
  } = useParams() as {
    locale: string
    workspaceid: string
    toolId: string
  }

  const schema = toolSchemas[toolId]
  const agent = agentMetadata[toolId] || {
    name: "Agent",
    avatar: "",
    gradient: "from-blue-500 to-indigo-500",
    title: schema?.title || "Assistant"
  }

  const initialState: Record<string, any> = schema
    ? Object.fromEntries(schema.fields.map(f => [f.name, ""]))
    : {}
  const [values, setValues] = useState<Record<string, any>>(initialState)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string>("")
  const [showArtifact, setShowArtifact] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const storageKey = `recent-tool-inputs:${workspaceId}:${toolId}`
  const router = useRouter()
  const { userSubscription } = useChatbotUI()

  useEffect(() => {
    if (userSubscription) {
      const userTier =
        userSubscription.tier || userSubscription.plan_type || "free"
      const hasAccess = userTier === "premium" || userTier === "business"

      if (!hasAccess) {
        toast.error("Agents are available on Premium and Business plans")
        router.push(`/${locale}/${workspaceId}/creator`)
      }
    }
  }, [userSubscription, router, locale, workspaceId])

  useEffect(() => {
    if (!schema) return
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsedValues = JSON.parse(saved)
        setValues(parsedValues)
        if (parsedValues.companyLogo) {
          setLogoPreview(parsedValues.companyLogo)
        }
      } catch {}
    }
  }, [storageKey, schema])

  useEffect(() => {
    if (!schema) return
    localStorage.setItem(storageKey, JSON.stringify(values))
  }, [values, storageKey, schema])

  if (!schema) {
    return <p className="p-6">Unknown tool: {toolId}</p>
  }

  const handleChange = (name: string, val: any) =>
    setValues(prev => ({ ...prev, [name]: val }))

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setLogoPreview(base64)
        handleChange("companyLogo", base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setGeneratedContent("")
    setShowArtifact(true)

    try {
      const prompt = schema.buildPrompt(values)

      const response = await fetch("/api/agents/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          companyLogo: values.companyLogo || null
        })
      })

      if (!response.ok) {
        const error = await response.json()

        if (error.error === "PREMIUM_REQUIRED") {
          setShowArtifact(false)
          setShowUpgradeModal(true)
          return
        }

        throw new Error(error.message || "Failed to generate content")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let content = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        content += chunk
        setGeneratedContent(content)
      }

      toast.success("Content generated successfully!")
    } catch (error: any) {
      console.error("Generation error:", error)
      toast.error(error.message || "Failed to generate content")
      setShowArtifact(false)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveAsTemplate = async () => {
    const name = window.prompt("Template name:")
    if (!name) return
    const prompt = schema.buildPrompt(values)
    const { error } = await (supabase.from("presets") as any).insert([
      {
        workspace_id: workspaceId,
        name,
        prompt,
        model: "",
        temperature: 0.5,
        include_profile_context: false,
        include_workspace_instructions: false
      }
    ])
    if (error) {
      console.error(error)
      return alert("Failed to save template.")
    }
    alert("Template saved!")
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${agent.gradient} px-6 py-12 text-white`}
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
            {/* Agent Avatar */}
            <div className="shrink-0">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-white/20 blur-xl"></div>
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="relative size-32 rounded-full bg-white/10 p-2 shadow-2xl ring-4 ring-white/30 md:size-40"
                />
              </div>
            </div>

            {/* Agent Info */}
            <div className="flex-1 text-center md:text-left">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white/80">
                AI Agent
              </p>
              <h1 className="mb-2 text-4xl font-bold md:text-5xl">
                {agent.name}
              </h1>
              <p className="mb-4 text-xl font-medium text-white/95 md:text-2xl">
                {agent.title}
              </p>
              <p className="max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
                {schema.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="mx-auto max-w-5xl px-6 py-12 pb-32">
        <form onSubmit={handleSubmit} className="space-y-6">
          {schema.fields.map(field => (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {field.label}
              </label>

              {field.type === "logo" && (
                <div className="space-y-3">
                  {logoPreview && (
                    <div className="flex items-center gap-3">
                      <img
                        src={logoPreview}
                        alt="Company Logo"
                        className="h-16 w-auto rounded border-2 border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview("")
                          setLogoFile(null)
                          handleChange("companyLogo", "")
                        }}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Upload your company logo (will be saved for future use)
                  </p>
                </div>
              )}

              {field.type === "text" && (
                <Input
                  value={values[field.name]}
                  onChange={e => handleChange(field.name, e.target.value)}
                  className="text-base"
                />
              )}
              {field.type === "number" && (
                <Input
                  type="number"
                  value={values[field.name]}
                  onChange={e => handleChange(field.name, e.target.value)}
                  className="text-base"
                />
              )}
              {field.type === "date" && (
                <Input
                  type="date"
                  value={values[field.name]}
                  onChange={e => handleChange(field.name, e.target.value)}
                  className="text-base"
                />
              )}
              {field.type === "textarea" && (
                <Textarea
                  className="min-h-32 text-base"
                  value={values[field.name]}
                  onChange={e =>
                    handleChange(field.name, e.currentTarget.value)
                  }
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              )}
              {field.type === "select" && (
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                  value={values[field.name]}
                  onChange={e => handleChange(field.name, e.target.value)}
                >
                  <option value="" disabled>
                    Select {field.label}
                  </option>
                  {field.options!.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isGenerating}
              size="lg"
              className="flex-1 md:flex-none"
            >
              {isGenerating ? (
                <>
                  <IconLoader2 className="mr-2 animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <IconSparkles className="mr-2" size={20} />
                  Generate with {agent.name}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsTemplate}
              disabled={isGenerating}
              size="lg"
            >
              Save as template
            </Button>
          </div>
        </form>
      </div>

      {/* Artifact Viewer */}
      <ArtifactViewer
        content={generatedContent}
        title={schema.title}
        isOpen={showArtifact}
        onClose={() => setShowArtifact(false)}
        companyLogo={values.companyLogo}
        isGenerating={isGenerating}
        onContentChange={setGeneratedContent}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        reason="agent_access"
      />
    </div>
  )
}
