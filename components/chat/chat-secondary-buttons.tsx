import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { useChatbotUI } from "@/context/context"
import { IconPlus } from "@tabler/icons-react"
import { FC, useContext } from "react"
import { WithTooltip } from "../ui/with-tooltip"

interface ChatSecondaryButtonsProps {}

export const ChatSecondaryButtons: FC<ChatSecondaryButtonsProps> = () => {
  const { selectedChat } = useChatbotUI()

  const { handleNewChat } = useChatHandler()

  return (
    <>
      {selectedChat && (
        <>
          <WithTooltip
            delayDuration={200}
            display={<div>Start a new chat</div>}
            trigger={
              <div className="mt-1">
                <IconPlus
                  className="cursor-pointer hover:opacity-50"
                  size={24}
                  onClick={handleNewChat}
                />
              </div>
            }
          />
        </>
      )}
    </>
  )
}
