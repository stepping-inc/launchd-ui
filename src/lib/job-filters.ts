import type { JobListEntry, JobSource } from "@/types"
import { scheduleKinds, type ScheduleKind } from "@/lib/schedule-summary"

/**
 * The filters set from the column headers. An empty list means "no filter".
 */
export type JobFilters = {
  scheduleKinds: ScheduleKind[]
  sources: JobSource[]
  failedOnly: boolean
}

export const noFilters: JobFilters = { scheduleKinds: [], sources: [], failedOnly: false }

export const scheduleKindOptions: Array<{ value: ScheduleKind; label: string }> = [
  { value: "daily", label: "daily" },
  { value: "weekly", label: "weekly" },
  { value: "monthly", label: "monthly" },
  { value: "interval", label: "間隔" },
  { value: "keepalive", label: "常駐" },
  { value: "login", label: "ログイン時" },
  { value: "launch", label: "起動のみ" },
]

export const sourceOptions: Array<{ value: JobSource; label: string }> = [
  { value: "UserAgent", label: "User" },
  { value: "SystemAgent", label: "System" },
  { value: "SystemDaemon", label: "Daemon" },
]

/**
 * True when the last run ended with a non-zero exit code.
 */
export function hasFailedRun(job: JobListEntry): boolean {
  return job.last_exit_code !== null && job.last_exit_code !== 0
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
    const matchesSource = filters.sources.length === 0 || filters.sources.includes(job.source)
    const matchesFailed = !filters.failedOnly || hasFailedRun(job)
    return matchesSchedule && matchesSource && matchesFailed
  })
}
