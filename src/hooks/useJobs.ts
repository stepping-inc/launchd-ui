import { useState, useEffect, useCallback } from "react"
import type { JobListEntry } from "@/types"
import { listJobs } from "@/lib/invoke"
import {
  descriptionValues,
  filterJobs,
  noFilters,
  type JobFilters,
} from "@/lib/job-filters"

type UseJobsReturn = {
  jobs: JobListEntry[]
  filteredJobs: JobListEntry[]
  // The values offered in the description header menu
  descriptionValues: string[]
  loading: boolean
  error: string | null
  filters: JobFilters
  setFilters: (value: JobFilters) => void
  refresh: () => Promise<void>
}

export function useJobs(): UseJobsReturn {
  const [jobs, setJobs] = useState<JobListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<JobFilters>(noFilters)

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

  const filteredJobs = filterJobs(jobs, filters)
  // Like a spreadsheet, the description menu offers the values left by the other filters.
  const descriptionOptions = descriptionValues(
    filterJobs(jobs, { ...filters, hiddenDescriptions: [] })
  )

  return {
    jobs,
    filteredJobs,
    descriptionValues: descriptionOptions,
    loading,
    error,
    filters,
    setFilters,
    refresh,
  }
}
