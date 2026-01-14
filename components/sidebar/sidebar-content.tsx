// components > sidebar > sidebar-content.tsx
import { Tables } from "@/supabase/types"
import { ContentType, DataListType } from "@/types"
import { FC, useState, memo } from "react"
import { SidebarCreateButtons } from "./sidebar-create-buttons"
import { SidebarDataList } from "./sidebar-data-list"
import { SidebarSearch } from "./sidebar-search"
import { ConnectionsList } from "./items/tools/connections-list"
import { ReportsList } from "./items/reports/reports-list"

interface SidebarContentProps {
  contentType: ContentType
  data: DataListType
  folders: Tables<"folders">[]
  isMobile?: boolean
  toggleSidebar?: () => void
}

const SidebarContentComponent: FC<SidebarContentProps> = ({
  contentType,
  data,
  folders,
  isMobile,
  toggleSidebar
}) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData: any = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    // Subtract 50px for the height of the workspace settings
    <div className="flex max-h-[calc(100%-10px)] grow flex-col">
      {contentType !== "reports" && (
        <>
          <div className="flex items-center px-2">
            <SidebarCreateButtons
              contentType={contentType}
              hasData={data.length > 0}
              isMobile={isMobile}
              toggleSidebar={toggleSidebar}
            />
          </div>

          <div className="mt-2 px-2">
            <SidebarSearch
              contentType={contentType}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        </>
      )}

      {contentType === "tools" && (
        <div className="mt-2">
          <div className="text-muted-foreground mb-2 px-2 text-xs font-semibold">
            CONNECTIONS
          </div>
          <ConnectionsList />
        </div>
      )}

      {contentType === "reports" ? (
        <div className="mt-2 flex-1 overflow-y-auto">
          <ReportsList />
        </div>
      ) : (
        <SidebarDataList
          contentType={contentType}
          data={filteredData}
          folders={folders}
        />
      )}
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export const SidebarContent = memo(SidebarContentComponent)
