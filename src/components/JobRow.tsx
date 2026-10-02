import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableCell, TableRow } from "@/components/ui/table"
import type { JobListEntry } from "@/types"
import { formatScheduleSummary } from "@/lib/schedule-summary"
import { hasFailedRun } from "@/lib/job-filters"
import {
  Play,
  Square,
  RotateCw,
  MoreHorizontal,
  Trash2,
  FileText,
  FolderOpen,
  Zap,
} from "lucide-react"

type JobRowProps = {
  job: JobListEntry
  onStart: (job: JobListEntry) => void
  onStop: (job: JobListEntry) => void
  onRestart: (job: JobListEntry) => void
  onKickstart: (job: JobListEntry) => void
  onDelete: (job: JobListEntry) => void
  onSelect: (job: JobListEntry) => void
  onRevealInFinder: (job: JobListEntry) => void
}

export function JobRow({
  job,
  onStart,
  onStop,
  onRestart,
  onKickstart,
  onDelete,
  onSelect,
  onRevealInFinder,
}: JobRowProps) {
  const isUserAgent = job.source === "UserAgent"
  // The list keeps only the columns that say what a job is and when it runs. The label
  // stands in, dimmed, for a job without a description, and a failed last run is marked
  // in front of it; the rest is in the detail view.
  const failed = hasFailedRun(job)
  const schedule = formatScheduleSummary(job)

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onSelect(job)}
    >
      <TableCell className="truncate max-w-0" title={job.label}>
        {failed && (
          <span
            className="inline-block h-2 w-2 rounded-full bg-destructive mr-2 align-middle"
            title={`Last exit code: ${job.last_exit_code}`}
            aria-label={`Last exit code: ${job.last_exit_code}`}
          />
        )}
        {job.description ?? (
          <span className="text-muted-foreground">{job.label}</span>
        )}
      </TableCell>
      <TableCell className="truncate max-w-0" title={schedule}>
        {schedule}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {job.status === "Running" ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onStop(job)}
              disabled={!isUserAgent}
              title={isUserAgent ? "Stop" : "Cannot stop system agents"}
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : job.status === "Loaded" ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onStop(job)}
              disabled={!isUserAgent}
              title={isUserAgent ? "Unload" : "Cannot unload system agents"}
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onStart(job)}
              disabled={!isUserAgent}
              title={isUserAgent ? "Load" : "Cannot load system agents"}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          {job.status !== "Unloaded" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onRestart(job)}
              disabled={!isUserAgent}
              title={isUserAgent ? "Restart" : "Cannot restart system agents"}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          )}
          {(job.status === "Running" || job.status === "Loaded") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onKickstart(job)}
              disabled={!isUserAgent}
              aria-label={isUserAgent ? "Run now" : "Cannot run system agents"}
              title={isUserAgent ? "Run now" : "Cannot run system agents"}
            >
              <Zap className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onKickstart(job)}>
                <Zap className="mr-2 h-4 w-4" />
                Test Run
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelect(job)}>
                <FileText className="mr-2 h-4 w-4" />
                Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRevealInFinder(job)}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Reveal in Finder
              </DropdownMenuItem>
              {isUserAgent && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(job)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}
