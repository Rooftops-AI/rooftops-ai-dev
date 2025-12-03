"use client"

import { useChatbotUI } from "@/context/context"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { LLMID } from "@/types"
import { IconChevronDown } from "@tabler/icons-react"
import { FC } from "react"
import { ModelIcon } from "../models/model-icon"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../ui/tooltip"
import { cn } from "@/lib/utils"

// Only show these models that are integrated and working
const AVAILABLE_MODELS = [
  "gpt-5-mini",
  "gpt-4o",
  "gpt-4-turbo-preview",
  "gpt-3.5-turbo"
]

interface ModelSelectorProps {
  className?: string
}

export const ModelSelector: FC<ModelSelectorProps> = ({ className }) => {
  const { chatSettings, setChatSettings } = useChatbotUI()

  const currentModel = LLM_LIST.find(llm => llm.modelId === chatSettings?.model)

  const handleModelSelect = (modelId: LLMID) => {
    if (!chatSettings) return

    setChatSettings({
      ...chatSettings,
      model: modelId
    })
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hover:bg-accent h-8 gap-2 px-2 text-sm font-medium",
                  className
                )}
              >
                {currentModel && (
                  <>
                    <ModelIcon
                      provider={currentModel.provider}
                      width={16}
                      height={16}
                    />
                    <span className="max-w-[120px] truncate">
                      {currentModel.modelName}
                    </span>
                    <IconChevronDown size={14} />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <DropdownMenuContent align="start" className="w-[250px]">
            {LLM_LIST.filter(llm => AVAILABLE_MODELS.includes(llm.modelId)).map(
              model => (
                <DropdownMenuItem
                  key={model.modelId}
                  onClick={() => handleModelSelect(model.modelId as LLMID)}
                  className="flex items-center gap-2"
                >
                  <ModelIcon provider={model.provider} width={18} height={18} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{model.modelName}</div>
                    {model.description && (
                      <div className="text-muted-foreground text-xs">
                        {model.description}
                      </div>
                    )}
                  </div>
                  {chatSettings?.model === model.modelId && (
                    <div className="text-primary text-xs">✓</div>
                  )}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p>Select model</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
