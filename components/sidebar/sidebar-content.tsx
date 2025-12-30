// components > sidebar > sidebar-content.tsx
import { Tables } from "@/supabase/types"
import { ContentType, DataListType } from "@/types"
import { FC, useState, useTransition } from "react"
import { SidebarCreateButtons } from "./sidebar-create-buttons"
import { SidebarDataList } from "./sidebar-data-list"
import { SidebarSearch } from "./sidebar-search"
import { ConnectionsList } from "./items/tools/connections-list"
import { ReportsList } from "./items/reports/reports-list"
import { usePathname, useRouter } from "next/navigation"
import {
  IconSparkles,
  IconPalette,
  IconCrown,
  IconLoader2
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

interface SidebarContentProps {
  contentType: ContentType
  data: DataListType
  folders: Tables<"folders">[]
  isMobile?: boolean
  toggleSidebar?: () => void
}

export const SidebarContent: FC<SidebarContentProps> = ({
  contentType,
  data,
  folders,
  isMobile,
  toggleSidebar
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNavigating, setIsNavigating] = useState<string | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const workspaceIdMatch = pathname.match(/^\/([^\/]+)/)
  const currentWorkspaceId = workspaceIdMatch ? workspaceIdMatch[1] : ""

  const filteredData: any = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNavigation = (path: string, key: string) => {
    setIsNavigating(key)
    if (isMobile && toggleSidebar) {
      toggleSidebar()
    }
    router.push(path)
  }

  return (
    // Subtract 50px for the height of the workspace settings
    <div className="flex max-h-[calc(100%-10px)] grow flex-col">
      {/* AI Property Reports button - styled like New Chat button with crown badge */}
      <div className="mb-2">
        <Button
          variant="ghost"
          className="hover:border-border h-[36px] w-full justify-start border-0 border-b border-transparent bg-transparent font-semibold hover:bg-transparent"
          style={{ padding: "0px 10px 0px 4px" }}
          onClick={() =>
            handleNavigation(
              currentWorkspaceId
                ? `/${currentWorkspaceId}/explore`
                : "/explore",
              "explore"
            )
          }
          disabled={isNavigating === "explore"}
        >
          {isNavigating === "explore" ? (
            <IconLoader2 size={20} className="mr-2 animate-spin" />
          ) : (
            <IconSparkles size={20} className="mr-2" stroke={2} />
          )}
          <span>AI Property Reports</span>
          <IconCrown
            size={22}
            className="ml-auto opacity-70"
            fill="currentColor"
            stroke={0}
          />
        </Button>
      </div>

      {/* Agent Library button - styled like New Chat button with crown badge */}
      <div className="mb-2">
        <Button
          variant="ghost"
          className="hover:border-border h-[36px] w-full justify-start border-0 border-b border-transparent bg-transparent font-semibold hover:bg-transparent"
          style={{ padding: "0px 10px 0px 4px" }}
          onClick={() =>
            handleNavigation(
              currentWorkspaceId
                ? `/${currentWorkspaceId}/creator`
                : "/creator",
              "creator"
            )
          }
          disabled={isNavigating === "creator"}
        >
          {isNavigating === "creator" ? (
            <IconLoader2 size={20} className="mr-2 animate-spin" />
          ) : (
            <IconPalette size={20} className="mr-2" stroke={2} />
          )}
          <span>Agent Library</span>
          <IconCrown
            size={22}
            className="ml-auto opacity-70"
            fill="currentColor"
            stroke={0}
          />
        </Button>
      </div>

      {contentType !== "reports" && (
        <>
          <div className="flex items-center">
            <SidebarCreateButtons
              contentType={contentType}
              hasData={data.length > 0}
              isMobile={isMobile}
              toggleSidebar={toggleSidebar}
            />
          </div>

          <div className="mt-2">
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
