"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useConnectionState,
  useLocalParticipant,
  useRoomContext
} from "@livekit/components-react"
import {
  ConnectionState,
  RoomEvent,
  TranscriptionSegment
} from "livekit-client"
import { IconX, IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { GalaxyBackground } from "./GalaxyBackground"
import { DotsCluster } from "./DotsCluster"
import { VoiceTranscript } from "./VoiceTranscript"
import { createMessage, getMessagesByChatId } from "@/db/messages"
import { useChatbotUI } from "@/context/context"
import { toast } from "sonner"
import "@livekit/components-styles"

interface VoiceModeProps {
  onClose?: () => void
  chatId?: string
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

function VoiceAssistantControls({ onClose, chatId }: VoiceModeProps) {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant()
  const connectionState = useConnectionState()
  const { localParticipant } = useLocalParticipant()
  const room = useRoomContext()
  const { profile } = useChatbotUI()
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const audioLevelInterval = useRef<NodeJS.Timeout>()
  const [messageSequence, setMessageSequence] = useState(0)
  const processedSegmentIds = useRef<Set<string>>(new Set())
  const lastAgentTranscript = useRef<string>("")

  const toggleMute = useCallback(async () => {
    if (localParticipant) {
      const micEnabled = localParticipant.isMicrophoneEnabled
      await localParticipant.setMicrophoneEnabled(!micEnabled)
      setIsMuted(micEnabled)
    }
  }, [localParticipant])

  // Load existing messages on mount
  useEffect(() => {
    if (!chatId) return

    const loadMessages = async () => {
      try {
        const existingMessages = await getMessagesByChatId(chatId)
        const formattedMessages: Message[] = existingMessages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.created_at)
        }))
        setMessages(formattedMessages)
        setMessageSequence(existingMessages.length)
      } catch (error) {
        console.error("Failed to load existing messages:", error)
      }
    }

    loadMessages()
  }, [chatId])

  // Enable microphone automatically when connected
  useEffect(() => {
    if (connectionState === ConnectionState.Connected && localParticipant) {
      localParticipant.setMicrophoneEnabled(true).catch(err => {
        console.error("Failed to enable microphone:", err)
      })
    }
  }, [connectionState, localParticipant])

  // Monitor audio level for reactive animations
  useEffect(() => {
    if (audioTrack && state === "listening") {
      audioLevelInterval.current = setInterval(() => {
        const level = audioTrack.getAudioLevel?.() || 0
        setAudioLevel(level)
      }, 100)
    } else {
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current)
      }
      setAudioLevel(0)
    }

    return () => {
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current)
      }
    }
  }, [audioTrack, state])

  // Save message to database and update local state
  const saveMessage = useCallback(
    async (role: "user" | "assistant", content: string, skipDb = false) => {
      if (!content.trim()) return

      const newMessage: Message = {
        role,
        content: content.trim(),
        timestamp: new Date()
      }

      // Update local UI immediately
      setMessages(prev => [...prev, newMessage])

      // Save to database if we have required info
      if (!skipDb && chatId && profile?.user_id) {
        try {
          await createMessage({
            chat_id: chatId,
            user_id: profile.user_id,
            role,
            content: content.trim(),
            model: "voice-assistant",
            sequence_number: messageSequence,
            image_paths: []
          })
          setMessageSequence(prev => prev + 1)
        } catch (error) {
          console.error("Failed to save message:", error)
        }
      }
    },
    [chatId, messageSequence, profile?.user_id]
  )

  // Listen for agent transcriptions
  useEffect(() => {
    if (!agentTranscriptions || agentTranscriptions.length === 0) return

    const latestTranscription =
      agentTranscriptions[agentTranscriptions.length - 1]

    if (latestTranscription?.final && latestTranscription.text?.trim()) {
      const text = latestTranscription.text.trim()

      // Only save if it's different from the last one
      if (text !== lastAgentTranscript.current) {
        lastAgentTranscript.current = text
        saveMessage("assistant", text)
      }
    }
  }, [agentTranscriptions, saveMessage])

  // Listen for ALL room transcriptions (to capture user speech)
  useEffect(() => {
    if (!room) return

    const handleTranscription = (
      segments: TranscriptionSegment[],
      participant?: any,
      publication?: any
    ) => {
      segments.forEach(segment => {
        if (!segment.final || !segment.text?.trim()) return

        const segmentId = `${participant?.sid || "unknown"}-${segment.id}`
        if (processedSegmentIds.current.has(segmentId)) return

        processedSegmentIds.current.add(segmentId)
        const text = segment.text.trim()

        // Check if this is the user (not the agent)
        const isUser =
          participant?.identity &&
          !participant.identity.toLowerCase().includes("agent")

        if (isUser) {
          console.log("User transcription:", text)
          saveMessage("user", text)
        }
      })
    }

    room.on(RoomEvent.TranscriptionReceived, handleTranscription)

    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription)
    }
  }, [room, saveMessage])

  const getStateLabel = () => {
    if (connectionState !== ConnectionState.Connected) {
      return "connecting"
    }
    return state || "idle"
  }

  const stateLabel = getStateLabel()

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      {/* Galaxy Background */}
      <GalaxyBackground />

      {/* Close button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute right-6 top-6 z-50 size-12 rounded-full bg-white/5 text-gray-300 backdrop-blur-sm hover:bg-white/10"
      >
        <IconX size={24} />
      </Button>

      {/* Transcript Display - Top area */}
      <div className="relative z-10 overflow-hidden" style={{ height: "55%" }}>
        <VoiceTranscript messages={messages} />
      </div>

      {/* State Label and Dots Cluster - Bottom area */}
      <div
        className="relative z-10 flex flex-col items-center justify-center pb-20"
        style={{ height: "45%" }}
      >
        {/* State Label */}
        <div className="mb-8 text-center">
          <p className="text-sm font-light uppercase tracking-widest text-gray-400">
            {stateLabel}
          </p>
        </div>

        {/* Dots Cluster */}
        <DotsCluster state={(state as any) || "idle"} audioLevel={audioLevel} />

        {/* Controls */}
        <div className="mt-12 flex items-center gap-6">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="icon"
            className={`size-14 rounded-full backdrop-blur-sm transition-all ${
              isMuted
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
            disabled={connectionState !== ConnectionState.Connected}
          >
            {isMuted ? (
              <IconMicrophoneOff size={24} />
            ) : (
              <IconMicrophone size={24} />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function VoiceMode({ onClose, chatId }: VoiceModeProps) {
  const [token, setToken] = useState<string>("")
  const [connecting, setConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getToken() {
      try {
        // Generate unique room name using chatId if provided
        const roomName = chatId
          ? `voice-chat-${chatId}`
          : `voice-room-${Date.now()}`

        const response = await fetch(
          `/api/livekit/token?roomName=${roomName}&participantName=user-${Date.now()}`
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to get LiveKit token")
        }

        const data = await response.json()
        setToken(data.token)
        setConnecting(false)
      } catch (err: any) {
        console.error("Error getting token:", err)
        setError(err.message || "Failed to connect to voice assistant")
        setConnecting(false)
      }
    }

    getToken()
  }, [chatId])

  if (connecting) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-gray-400">
            Connecting to voice assistant...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
        <div className="max-w-md text-center">
          <div className="mb-4 text-red-500">
            <IconX size={48} className="mx-auto" />
          </div>
          <p className="mb-4 text-sm text-gray-400">{error}</p>
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-lg border-gray-700 bg-white/5 text-gray-300 hover:bg-white/10"
          >
            Close
          </Button>
        </div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      audio={true}
      video={false}
      className="size-full"
    >
      <VoiceAssistantControls onClose={onClose} chatId={chatId} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  )
}
