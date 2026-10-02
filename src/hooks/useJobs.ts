import { useState, useEffect, useCallback } from "react"
import type { JobListEntry, SourceFilter } from "@/types"
import { listJobs } from "@/lib/invoke"
import { filterJobs, type ScheduleFilter } from "@/lib/job-filters"

type UseJobsReturn = {
  jobs: JobListEntry[]
  filteredJobs: JobListEntry[]
  loading: boolean
  error: string | null
  search: string
  setSearch: (value: string) => void
  sourceFilter: SourceFilter
  setSourceFilter: (value: SourceFilter) => void
  scheduleFilter: ScheduleFilter
  setScheduleFilter: (value: ScheduleFilter) => void
  failedOnly: boolean
  setFailedOnly: (value: boolean) => void
  refresh: () => Promise<void>
}

export function useJobs(): UseJobsReturn {
  const [jobs, setJobs] = useState<JobListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("All")
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilter>("All")
  const [failedOnly, setFailedOnly] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listJobs()
      setJobs(result)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filteredJobs = filterJobs(jobs, { search, sourceFilter, scheduleFilter, failedOnly })

  return {
    jobs,
    filteredJobs,
    loading,
    error,
    search,
    setSearch,
    sourceFilter,
    setSourceFilter,
    scheduleFilter,
    setScheduleFilter,
    failedOnly,
    setFailedOnly,
    refresh,
  }
}
