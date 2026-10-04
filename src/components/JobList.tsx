import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ColumnFilter } from "@/components/ColumnFilter"
import { JobRow } from "@/components/JobRow"
import { scheduleKindOptions, toggle, type JobFilters } from "@/lib/job-filters"
import type { JobListEntry } from "@/types"

type JobListProps = {
  jobs: JobListEntry[]
  // The values offered in the description header menu
  descriptionValues: string[]
  loading: boolean
  filters: JobFilters
  onFiltersChange: (filters: JobFilters) => void
  onStart: (job: JobListEntry) => void
  onStop: (job: JobListEntry) => void
  onRestart: (job: JobListEntry) => void
  onKickstart: (job: JobListEntry) => void
  onDelete: (job: JobListEntry) => void
  onSelect: (job: JobListEntry) => void
  onRevealInFinder: (job: JobListEntry) => void
}

// Keep the menu open after a check, so several values can be picked in one go.
const keepOpen = (event: Event) => event.preventDefault()

type ValueFilterItemsProps = {
  values: string[]
  hidden: string[]
  onHiddenChange: (hidden: string[]) => void
}

/**
 * The value list of a spreadsheet column filter: a search box that narrows the list,
 * "(すべて選択)", then one check per value. Unchecked values are hidden from the rows.
 */
function ValueFilterItems({ values, hidden, onHiddenChange }: ValueFilterItemsProps) {
  const [query, setQuery] = useState("")
  const needle = query.trim().toLowerCase()
  const shown = needle === "" ? values : values.filter((v) => v.toLowerCase().includes(needle))
  // "(すべて選択)" acts on the values the search leaves, as in a spreadsheet.
  const allChecked = shown.every((v) => !hidden.includes(v))

  return (
    <>
      <div className="p-1">
        <Input
          className="h-8"
          placeholder="Search"
          aria-label="Search values"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          // Keep the keys in the box instead of the menu's type-ahead and arrow keys.
          onKeyDown={(event) => event.stopPropagation()}
        />
      </div>
      <div className="max-h-64 max-w-80 overflow-y-auto">
        <DropdownMenuCheckboxItem
          checked={allChecked}
          onCheckedChange={() =>
            onHiddenChange(
              allChecked
                ? [...hidden, ...shown.filter((v) => !hidden.includes(v))]
                : hidden.filter((v) => !shown.includes(v))
            )
          }
          onSelect={keepOpen}
        >
          (すべて選択)
        </DropdownMenuCheckboxItem>
        {shown.map((value) => (
          <DropdownMenuCheckboxItem
            key={value}
            checked={!hidden.includes(value)}
            onCheckedChange={() => onHiddenChange(toggle(hidden, value))}
            onSelect={keepOpen}
            title={value}
          >
            <span className="truncate">{value}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </div>
    </>
  )
}

export function JobList({
  jobs,
  descriptionValues,
  loading,
  filters,
  onFiltersChange,
  onStart,
  onStop,
  onRestart,
  onKickstart,
  onDelete,
  onSelect,
  onRevealInFinder,
}: JobListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        Loading agents...
      </div>
    )
  }

  const descriptionFiltered = filters.hiddenDescriptions.length > 0
  const scheduleFiltered = filters.scheduleKinds.length > 0

  // The header stays even when nothing matches, so the filters can always be undone.
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <ColumnFilter label="Description" active={descriptionFiltered}>
              <ValueFilterItems
                values={descriptionValues}
                hidden={filters.hiddenDescriptions}
                onHiddenChange={(hiddenDescriptions) =>
                  onFiltersChange({ ...filters, hiddenDescriptions })
                }
              />
              {descriptionFiltered && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onFiltersChange({ ...filters, hiddenDescriptions: [] })}
                  >
                    Clear
                  </DropdownMenuItem>
                </>
              )}
            </ColumnFilter>
          </TableHead>
          <TableHead className="w-56">
            <ColumnFilter label="Schedule" active={scheduleFiltered}>
              {scheduleKindOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={filters.scheduleKinds.includes(option.value)}
                  onCheckedChange={() =>
                    onFiltersChange({
                      ...filters,
                      scheduleKinds: toggle(filters.scheduleKinds, option.value),
                    })
                  }
                  onSelect={keepOpen}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
              {scheduleFiltered && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, scheduleKinds: [] })}>
                    Clear
                  </DropdownMenuItem>
                </>
              )}
            </ColumnFilter>
          </TableHead>
          <TableHead className="w-28">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
              No agents found
            </TableCell>
          </TableRow>
        ) : (
          jobs.map((job) => (
            <JobRow
              key={job.plist_path}
              job={job}
              onStart={onStart}
              onStop={onStop}
              onRestart={onRestart}
              onKickstart={onKickstart}
              onDelete={onDelete}
              onSelect={onSelect}
              onRevealInFinder={onRevealInFinder}
            />
          ))
        )}
      </TableBody>
    </Table>
  )
}
