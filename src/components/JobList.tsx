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
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ColumnFilter } from "@/components/ColumnFilter"
import { JobRow } from "@/components/JobRow"
import {
  scheduleKindOptions,
  sourceOptions,
  toggle,
  type JobFilters,
} from "@/lib/job-filters"
import type { JobListEntry } from "@/types"

type JobListProps = {
  jobs: JobListEntry[]
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

export function JobList({
  jobs,
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

  const descriptionFiltered = filters.failedOnly || filters.sources.length > 0
  const scheduleFiltered = filters.scheduleKinds.length > 0

  // The header stays even when nothing matches, so the filters can always be undone.
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <ColumnFilter label="Description" active={descriptionFiltered}>
              <DropdownMenuCheckboxItem
                checked={filters.failedOnly}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, failedOnly: checked === true })
                }
                onSelect={keepOpen}
              >
                直近の失敗だけ
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Source</DropdownMenuLabel>
              {sourceOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={filters.sources.includes(option.value)}
                  onCheckedChange={() =>
                    onFiltersChange({ ...filters, sources: toggle(filters.sources, option.value) })
                  }
                  onSelect={keepOpen}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
              {descriptionFiltered && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onFiltersChange({ ...filters, failedOnly: false, sources: [] })}
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
