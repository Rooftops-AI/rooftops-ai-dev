"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export interface Artifact {
  id: string
  type: "document" | "code" | "markdown"
  title: string
  content: string
  language?: string // For code artifacts
  createdAt: Date
  updatedAt: Date
}

interface CanvasContextType {
  artifacts: Artifact[]
  currentArtifact: Artifact | null
  isCanvasOpen: boolean
  addArtifact: (
    artifact: Omit<Artifact, "id" | "createdAt" | "updatedAt">
  ) => void
  updateArtifact: (id: string, updates: Partial<Artifact>) => void
  setCurrentArtifact: (artifact: Artifact | null) => void
  openCanvas: () => void
  closeCanvas: () => void
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null)
  const [isCanvasOpen, setIsCanvasOpen] = useState(false)

  const addArtifact = (
    artifactData: Omit<Artifact, "id" | "createdAt" | "updatedAt">
  ) => {
    const now = new Date()
    const newArtifact: Artifact = {
      ...artifactData,
      id: `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    }

    setArtifacts(prev => [...prev, newArtifact])
    setCurrentArtifact(newArtifact)
    // Don't auto-open - let the caller decide when to open
  }

  const updateArtifact = (id: string, updates: Partial<Artifact>) => {
    setArtifacts(prev =>
      prev.map(artifact =>
        artifact.id === id
          ? { ...artifact, ...updates, updatedAt: new Date() }
          : artifact
      )
    )

    if (currentArtifact?.id === id) {
      setCurrentArtifact(prev =>
        prev ? { ...prev, ...updates, updatedAt: new Date() } : null
      )
    }
  }

  const openCanvas = () => setIsCanvasOpen(true)
  const closeCanvas = () => setIsCanvasOpen(false)

  return (
    <CanvasContext.Provider
      value={{
        artifacts,
        currentArtifact,
        isCanvasOpen,
        addArtifact,
        updateArtifact,
        setCurrentArtifact,
        openCanvas,
        closeCanvas
      }}
    >
      {children}
    </CanvasContext.Provider>
  )
}

export function useCanvas() {
  const context = useContext(CanvasContext)
  if (context === undefined) {
    throw new Error("useCanvas must be used within a CanvasProvider")
  }
  return context
}
