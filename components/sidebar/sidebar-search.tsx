import { ContentType } from "@/types"
import { FC } from "react"
import { Input } from "../ui/input"
import { IconSearch } from "@tabler/icons-react"

interface SidebarSearchProps {
  contentType: ContentType
  searchTerm: string
  setSearchTerm: Function
}

export const SidebarSearch: FC<SidebarSearchProps> = ({
  contentType,
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="relative">
      <IconSearch
        size={18}
        className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2"
      />
      <Input
        placeholder={`Search ${contentType}...`}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="border-0 bg-transparent pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  )
}
