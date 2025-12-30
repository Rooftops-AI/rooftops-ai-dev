import { ContentType } from "@/types"
import { FC } from "react"
import { TabsTrigger } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"

interface SidebarSwitchItemProps {
  contentType: ContentType
  icon: React.ReactNode
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitchItem: FC<SidebarSwitchItemProps> = ({
  contentType,
  icon,
  onContentTypeChange
}) => {
  return (
    <WithTooltip
      display={
        <div>{contentType[0].toUpperCase() + contentType.substring(1)}</div>
      }
      trigger={
        <TabsTrigger
          className="size-10 rounded-[5px] transition-all hover:bg-gray-800/50 data-[state=active]:bg-gray-900"
          value={contentType}
          onClick={() => onContentTypeChange(contentType as ContentType)}
        >
          <div className="text-gray-200">{icon}</div>
        </TabsTrigger>
      }
    />
  )
}
