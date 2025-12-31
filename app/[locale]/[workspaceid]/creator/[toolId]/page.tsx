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
import { IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"
import { ArtifactViewer } from "@/components/agents/artifact-viewer"

export default function ToolPage() {
  // grab exactly the params Next gives us
  const {
    locale,
    workspaceid: workspaceId,
    toolId
  } = useParams() as {
    locale: string
    workspaceid: string
    toolId: string
  }

  // find our tool's schema
  const schema = toolSchemas[toolId]

  // build initial empty values object
  const initialState: Record<string, any> = schema
    ? Object.fromEntries(schema.fields.map(f => [f.name, ""]))
    : {}
  const [values, setValues] = useState<Record<string, any>>(initialState)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string>("")
  const [showArtifact, setShowArtifact] = useState(false)

  // localStorage key for "recent inputs"
  const storageKey = `recent-tool-inputs:${workspaceId}:${toolId}`
  const router = useRouter()

  // hydrate from localStorage once
  useEffect(() => {
    if (!schema) return
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsedValues = JSON.parse(saved)
        setValues(parsedValues)
        // Load logo preview if exists
        if (parsedValues.companyLogo) {
          setLogoPreview(parsedValues.companyLogo)
        }
      } catch {}
    }
  }, [storageKey, schema])

  // save whenever values change
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
        throw new Error(error.message || "Failed to generate content")
      }

      // Handle streaming response
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
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">{schema.title}</h1>
      <p className="text-gray-600">{schema.description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {schema.fields.map(field => (
          <div key={field.name}>
            <label className="mb-1 block font-medium">{field.label}</label>

            {field.type === "logo" && (
              <div className="space-y-2">
                {logoPreview && (
                  <div className="mb-2 flex items-center gap-2">
                    <img
                      src={logoPreview}
                      alt="Company Logo"
                      className="h-16 w-auto rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview("")
                        setLogoFile(null)
                        handleChange("companyLogo", "")
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
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
                <p className="text-xs text-gray-500">
                  Upload your company logo (will be saved for future use)
                </p>
              </div>
            )}

            {field.type === "text" && (
              <Input
                value={values[field.name]}
                onChange={e => handleChange(field.name, e.target.value)}
              />
            )}
            {field.type === "number" && (
              <Input
                type="number"
                value={values[field.name]}
                onChange={e => handleChange(field.name, e.target.value)}
              />
            )}
            {field.type === "date" && (
              <Input
                type="date"
                value={values[field.name]}
                onChange={e => handleChange(field.name, e.target.value)}
              />
            )}
            {field.type === "textarea" && (
              <Textarea
                className="h-24"
                value={values[field.name]}
                onChange={e => handleChange(field.name, e.currentTarget.value)}
              />
            )}
            {field.type === "select" && (
              <select
                className="w-full rounded border px-2 py-1"
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

        <div className="mt-4 flex gap-2">
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <IconLoader2 className="mr-2 animate-spin" size={18} />
                Generating...
              </>
            ) : (
              `Generate ${schema.title}`
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveAsTemplate}
            disabled={isGenerating}
          >
            Save as template
          </Button>
        </div>
      </form>

      {/* Artifact Viewer */}
      <ArtifactViewer
        content={
          generatedContent ||
          "# Generating your content...\n\nPlease wait while we create your professional document..."
        }
        title={schema.title}
        isOpen={showArtifact}
        onClose={() => setShowArtifact(false)}
        companyLogo={values.companyLogo}
        isGenerating={isGenerating}
      />
    </div>
  )
}
