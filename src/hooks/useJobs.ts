import { useState, useEffect, useCallback } from "react"
import type { JobListEntry } from "@/types"
import { listJobs } from "@/lib/invoke"
import { filterJobs, noFilters, type JobFilters } from "@/lib/job-filters"

type UseJobsReturn = {
  jobs: JobListEntry[]
  filteredJobs: JobListEntry[]
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

  return {
    jobs,
    filteredJobs,
    loading,
    error,
    filters,
    setFilters,
    refresh,
  }
}
