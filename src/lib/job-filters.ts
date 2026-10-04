import type { JobListEntry } from "@/types"
import { scheduleKinds, type ScheduleKind } from "@/lib/schedule-summary"

/**
 * The filters set from the column headers. An empty list means "no filter".
 */
export type JobFilters = {
  scheduleKinds: ScheduleKind[]
  // Description values unchecked in the header menu, so every other value stays shown.
  hiddenDescriptions: string[]
}

export const noFilters: JobFilters = { scheduleKinds: [], hiddenDescriptions: [] }

export const scheduleKindOptions: Array<{ value: ScheduleKind; label: string }> = [
  { value: "daily", label: "daily" },
  { value: "weekly", label: "weekly" },
  { value: "monthly", label: "monthly" },
  { value: "interval", label: "間隔" },
  { value: "keepalive", label: "常駐" },
  { value: "login", label: "ログイン時" },
  { value: "launch", label: "起動のみ" },
]

// The value that stands for every job without a description, as in a spreadsheet filter.
export const blankDescription = "(空白)"

/**
 * True when the last run ended with a non-zero exit code.
 */
export function hasFailedRun(job: JobListEntry): boolean {
  return job.last_exit_code !== null && job.last_exit_code !== 0
}

/**
 * The description as the list shows it, or the blank value when there is none.
 */
export function descriptionValue(job: JobListEntry): string {
  return job.description?.trim() ? job.description : blankDescription
}

/**
 * The distinct description values of the jobs in ascending order, with the blank value last.
 */
export function descriptionValues(jobs: JobListEntry[]): string[] {
  const values = [...new Set(jobs.map(descriptionValue))]
  return values.sort((a, b) => {
    if (a === blankDescription) return 1
    if (b === blankDescription) return -1
    return a.localeCompare(b, "ja")
  })
}

/**
 * Add the value when it is missing, remove it when it is there.
 */
export function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
}

/**
 * Apply the column header filters. A job passes the schedule filter when any of its
 * kinds is selected, so a job that runs daily and at login shows under either.
 */
export function filterJobs(jobs: JobListEntry[], filters: JobFilters): JobListEntry[] {
  return jobs.filter((job) => {
    const matchesSchedule =
      filters.scheduleKinds.length === 0 ||
      scheduleKinds(job).some((kind) => filters.scheduleKinds.includes(kind))
    const matchesDescription = !filters.hiddenDescriptions.includes(descriptionValue(job))
    return matchesSchedule && matchesDescription
  })
}
