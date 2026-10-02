import type { JobListEntry, SourceFilter } from "@/types"
import { scheduleKinds, type ScheduleKind } from "@/lib/schedule-summary"

export type ScheduleFilter = ScheduleKind | "All"

export type JobFilters = {
  search: string
  sourceFilter: SourceFilter
  scheduleFilter: ScheduleFilter
  failedOnly: boolean
}

/**
 * True when the last run ended with a non-zero exit code.
 */
export function hasFailedRun(job: JobListEntry): boolean {
  return job.last_exit_code !== null && job.last_exit_code !== 0
}

/**
 * Apply the toolbar filters. The search matches the description as well as the label,
 * because the list shows the description in place of the label.
 */
export function filterJobs(jobs: JobListEntry[], filters: JobFilters): JobListEntry[] {
  const term = filters.search.toLowerCase()
  return jobs.filter((job) => {
    const matchesSearch =
      term === "" ||
      job.label.toLowerCase().includes(term) ||
      (job.service_description ?? "").toLowerCase().includes(term)
    const matchesSource =
      filters.sourceFilter === "All"
        ? true
        : filters.sourceFilter === "Home"
          ? job.is_home_agent
          : job.source === filters.sourceFilter
    const matchesSchedule =
      filters.scheduleFilter === "All" || scheduleKinds(job).includes(filters.scheduleFilter)
    const matchesFailed = !filters.failedOnly || hasFailedRun(job)
    return matchesSearch && matchesSource && matchesSchedule && matchesFailed
  })
}
