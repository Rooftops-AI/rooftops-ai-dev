"use client"

import { useCallback, useEffect, useState, startTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { useChatbotUI } from "@/context/context"
import { ProfileSettings } from "@/components/utility/profile-settings"
import { SidebarContent } from "./sidebar-content"
import { RooftopsSVG } from "@/components/icons/rooftops-svg"
import {
  IconMessageCircle,
  IconSparkles,
  IconPalette,
  IconFolders,
  IconStack2,
  IconRobotFace,
  IconPlugConnected,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMenu2,
  IconCrown,
  IconLoader2,
  IconHome,
  IconWand,
  IconChevronDown,
  IconDots,
  IconGrid3x3
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { ContentType } from "@/types"

const SIDEBAR_ICON_SIZE = 20
const BADGE_ICON_SIZE = 18
const NAV_ITEM_HEIGHT = 40

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string; stroke?: number }>
  route?: (workspaceId: string) => string
  tab?: string
  badge?: "premium" | "pro"
}

interface UnifiedSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const primaryNavigationItems: NavItem[] = [
  {
    id: "chat",
    label: "Chat",
    icon: IconMessageCircle,
    route: (workspaceId: string) => `/${workspaceId}/chat`
  },
  {
    id: "explore",
    label: "AI Property Reports",
    icon: IconHome,
    route: (workspaceId: string) => `/${workspaceId}/explore`,
    badge: "premium"
  },
  {
    id: "creator",
    label: "Agent Library",
    icon: IconWand,
    route: (workspaceId: string) => `/${workspaceId}/creator`,
    badge: "premium"
  }
]

const secondaryNavigationItems: NavItem[] = [
  {
    id: "files",
    label: "Files",
    icon: IconFolders,
    tab: "files"
  },
  {
    id: "collections",
    label: "Collections",
    icon: IconStack2,
    tab: "collections"
  },
  {
    id: "assistants",
    label: "Assistants",
    icon: IconRobotFace,
    tab: "assistants"
  },
  {
    id: "connectors",
    label: "Connectors",
    icon: IconPlugConnected,
    tab: "tools"
  }
]

export function UnifiedSidebar({ isCollapsed, onToggle }: UnifiedSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const {
    selectedWorkspace,
    userSubscription,
    folders,
    chats,
    presets,
    prompts,
    files,
    collections,
    assistants,
    tools,
    models
  } = useChatbotUI()
  const [isNavigating, setIsNavigating] = useState<string | null>(null)
  const [showHamburger, setShowHamburger] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMore, setShowMore] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Premium subscription detection
  const isPremium =
    userSubscription?.plan_type === "premium" &&
    userSubscription?.status === "active"
  const hasActiveSubscription = userSubscription?.status === "active"

  const workspaceId = selectedWorkspace?.id || ""

  // Check if nav item is active
  const isNavItemActive = useCallback(
    (item: NavItem): boolean => {
      // Route-based navigation
      if (item.route) {
        const targetRoute = item.route(workspaceId)
        // Exact match
        if (targetRoute === pathname) return true
        // Base route match (e.g., /chat matches /chat/123)
        if (pathname.startsWith(targetRoute + "/")) return true
        // For explore route, also check if we're on explore without a tab param
        if (
          targetRoute.includes("/explore") &&
          pathname.includes("/explore") &&
          !searchParams.get("tab")
        ) {
          return true
        }
        return false
      }

      // Tab-based navigation
      if (item.tab) {
        return searchParams.get("tab") === item.tab
      }

      return false
    },
    [pathname, searchParams, workspaceId]
  )

  // Get current content type based on route and tab
  const getCurrentContentType = (): ContentType => {
    const tab = searchParams.get("tab")
    if (tab === "files") return "files"
    if (tab === "collections") return "collections"
    if (tab === "assistants") return "assistants"
    if (tab === "tools") return "tools"
    return "chats" // Default to chats
  }

  // Prefetch routes on component mount for instant navigation
  useEffect(() => {
    if (workspaceId) {
      primaryNavigationItems.forEach(item => {
        if (item.route) {
          router.prefetch(item.route(workspaceId))
        }
      })
    }
  }, [workspaceId, router])

  // Handle navigation click
  const handleNavClick = useCallback(
    (item: NavItem) => {
      // Set loading state immediately for instant visual feedback
      setIsNavigating(item.id)

      // If sidebar is collapsed and this is a tab-based item, expand sidebar first
      if (isCollapsed && item.tab) {
        onToggle()
      }

      // Use startTransition to keep UI responsive during navigation
      startTransition(() => {
        if (item.route) {
          router.push(item.route(workspaceId))
        } else if (item.tab) {
          const newUrl = `${pathname}?tab=${item.tab}`
          router.push(newUrl)
        }
      })

      // Close mobile sidebar if open
      if (isMobile && !isCollapsed) {
        onToggle()
      }
    },
    [router, pathname, workspaceId, isMobile, isCollapsed, onToggle]
  )

  // Prefetch on hover for even faster perceived performance
  const handleNavHover = useCallback(
    (item: NavItem) => {
      if (item.route) {
        router.prefetch(item.route(workspaceId))
      }
    },
    [router, workspaceId]
  )

  // Reset navigation state when pathname changes
  useEffect(() => {
    setIsNavigating(null)
  }, [pathname, searchParams])

  // Render nav item
  const renderNavItem = (item: NavItem) => {
    const isActive = isNavItemActive(item)
    const isLoading = isNavigating === item.id
    const Icon = item.icon

    const content = (
      <button
        onClick={() => handleNavClick(item)}
        onMouseEnter={() => handleNavHover(item)}
        disabled={isLoading}
        className={cn(
          "relative flex items-center rounded-lg transition-all duration-150",
          isCollapsed
            ? "justify-center w-10 h-10"
            : "justify-start gap-3 px-3 w-full h-10",
          isActive
            ? "bg-gray-100 text-gray-900 font-medium"
            : "text-gray-700 hover:bg-gray-50",
          isLoading && "opacity-70"
        )}
      >
        {isLoading ? (
          <IconLoader2 size={SIDEBAR_ICON_SIZE} className="animate-spin flex-shrink-0" />
        ) : (
          <Icon size={SIDEBAR_ICON_SIZE} stroke={2} className="flex-shrink-0" />
        )}

        {!isCollapsed && (
          <>
            <span className="flex-1 text-left text-sm font-medium transition-opacity duration-200">
              {item.label}
            </span>
            {item.badge && (
              <IconCrown
                size={BADGE_ICON_SIZE}
                className="ml-auto opacity-60 flex-shrink-0"
                fill="currentColor"
                stroke={0}
              />
            )}
          </>
        )}
      </button>
    )

    // Wrap with tooltip when collapsed
    if (isCollapsed) {
      return (
        <div key={item.id} className="flex w-full justify-center">
          <WithTooltip
            delayDuration={0}
            side="right"
            display={<div className="text-sm">{item.label}</div>}
            trigger={content}
          />
        </div>
      )
    }

    return <div key={item.id} className="w-full">{content}</div>
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Mobile hamburger button */}
      {isMobile && isCollapsed && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        >
          <IconMenu2 size={24} className="text-gray-700" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col bg-white border-r border-gray-200 h-screen transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[60px]" : "w-[280px]",
          isMobile && !isCollapsed && "fixed left-0 top-0 z-50",
          isMobile && isCollapsed && "hidden"
        )}
        onMouseEnter={() => {
          if (isCollapsed && !isMobile) {
            setShowHamburger(true)
          }
        }}
        onMouseLeave={() => {
          if (isCollapsed && !isMobile) {
            setShowHamburger(false)
          }
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0">
          <div className={cn("flex items-center", isCollapsed ? "justify-center p-3" : "justify-between p-3")}>
            {/* Logo */}
            {isCollapsed ? (
              <div
                className="relative flex items-center justify-center cursor-pointer"
                onClick={onToggle}
              >
                <RooftopsSVG width="36" height="36" />
                {showHamburger && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-lg transition-opacity duration-150">
                    <IconMenu2 size={20} className="text-gray-700" />
                  </div>
                )}
              </div>
            ) : (
              <>
                <img
                  src="https://uploads-ssl.webflow.com/64e9150f53771ac56ef528b7/64ee16bb300d3e08d25a03ac_rooftops-logo-gr-black.png"
                  alt="Rooftops AI"
                  className="h-7 w-auto dark:invert"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="flex-shrink-0 h-8 w-8"
                >
                  <IconLayoutSidebarLeftCollapse size={20} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-shrink-0 p-2 space-y-1">
          {/* Primary Navigation Items */}
          {primaryNavigationItems.map(renderNavItem)}

          {/* More Button / Secondary Items */}
          {!isCollapsed && (
            <>
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <IconGrid3x3 size={SIDEBAR_ICON_SIZE} stroke={2} />
                  <span className="font-medium">More</span>
                </div>
                {showMore ? (
                  <IconChevronDown size={16} stroke={2} />
                ) : (
                  <IconDots size={16} stroke={2} />
                )}
              </button>

              {/* Secondary Navigation Items - Collapsible */}
              {showMore && (
                <div className="space-y-1 pl-2">
                  {secondaryNavigationItems.map(renderNavItem)}
                </div>
              )}
            </>
          )}

          {/* When collapsed, show all items with tooltips */}
          {isCollapsed && secondaryNavigationItems.map(renderNavItem)}
        </nav>

        {/* Content Section - Dynamic based on route */}
        {!isCollapsed && (
          <div className="flex-1 overflow-auto">
            {(() => {
              const contentType = getCurrentContentType()
              const chatFolders = folders.filter(f => f.type === "chats")
              const filesFolders = folders.filter(f => f.type === "files")
              const collectionFolders = folders.filter(f => f.type === "collections")
              const assistantFolders = folders.filter(f => f.type === "assistants")
              const toolFolders = folders.filter(f => f.type === "tools")

              // Show content only for specific routes/tabs
              if (pathname.includes("/chat") && !searchParams.get("tab")) {
                return (
                  <SidebarContent
                    contentType="chats"
                    data={chats}
                    folders={chatFolders}
                    isMobile={isMobile}
                    toggleSidebar={onToggle}
                  />
                )
              }

              if (pathname.includes("/explore") && !searchParams.get("tab")) {
                return (
                  <SidebarContent
                    contentType="reports"
                    data={[]}
                    folders={[]}
                    isMobile={isMobile}
                    toggleSidebar={onToggle}
                  />
                )
              }

              if (searchParams.get("tab") === "files") {
                return (
                  <SidebarContent
                    contentType="files"
                    data={files}
                    folders={filesFolders}
                    isMobile={isMobile}
                    toggleSidebar={onToggle}
                  />
                )
              }

              if (searchParams.get("tab") === "collections") {
                return (
                  <SidebarContent
                    contentType="collections"
                    data={collections}
                    folders={collectionFolders}
                    isMobile={isMobile}
                    toggleSidebar={onToggle}
                  />
                )
              }

              if (searchParams.get("tab") === "assistants") {
                return (
                  <SidebarContent
                    contentType="assistants"
                    data={assistants}
                    folders={assistantFolders}
                    isMobile={isMobile}
                    toggleSidebar={onToggle}
                  />
                )
              }

              if (searchParams.get("tab") === "tools") {
                return (
                  <SidebarContent
                    contentType="tools"
                    data={tools}
                    folders={toolFolders}
                    isMobile={isMobile}
                    toggleSidebar={onToggle}
                  />
                )
              }

              return null
            })()}
          </div>
        )}

        {/* Footer Section */}
        <div className={cn(
          "flex-shrink-0 mt-auto",
          isCollapsed ? "p-2 flex justify-center" : "p-3"
        )}>
          {/* Upgrade button for free users */}
          {!isCollapsed && !hasActiveSubscription && (
            <Link href="/pricing">
              <Button className="h-[36px] w-full mb-3 bg-gradient-to-r from-[#ffd700] via-[#ffb700] to-[#ff8c00] text-gray-900 font-semibold hover:opacity-90 transition-opacity">
                <IconCrown
                  size={20}
                  className="mr-2"
                  fill="currentColor"
                  stroke={0}
                />
                Upgrade to Pro
              </Button>
            </Link>
          )}

          {/* Profile button */}
          <ProfileSettings />
        </div>
      </div>
    </>
  )
}
