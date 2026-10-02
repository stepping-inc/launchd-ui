import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Funnel } from "lucide-react"

type ColumnFilterProps = {
  label: string
  active: boolean
  children: ReactNode
}

/**
 * A column header with a small filter mark, like the column filter of a spreadsheet.
 * The mark turns blue and filled while the column is filtered.
 */
export function ColumnFilter({ label, active, children }: ColumnFilterProps) {
  return (
    <div className="flex items-center gap-1">
      <span>{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label={`Filter ${label}`}
            data-active={active}
          >
            <Funnel
              className={
                active
                  ? "h-3.5 w-3.5 text-blue-600 fill-current dark:text-blue-400"
                  : "h-3.5 w-3.5 text-muted-foreground"
              }
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">{children}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
