import { describe, it, expect, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { useJobs } from "./useJobs"
import { resetFakeHandlers, setFakeHandler } from "@/test-utils/tauri-mock"
import { noFilters } from "@/lib/job-filters"

beforeEach(() => {
  resetFakeHandlers()
})

describe("useJobs", () => {
  it("loads jobs on mount", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.jobs.length).toBe(3)
    expect(result.current.error).toBeNull()
  })

  it("filters by the kinds of schedule, any of them", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setFilters({ ...noFilters, scheduleKinds: ["daily"] })
    })
    await waitFor(() => {
      expect(result.current.filteredJobs.map((job) => job.label)).toEqual([
        "com.example.running-agent",
      ])
    })

    act(() => {
      result.current.setFilters({ ...noFilters, scheduleKinds: ["keepalive", "launch"] })
    })
    await waitFor(() => {
      expect(result.current.filteredJobs.map((job) => job.label)).toEqual([
        "com.example.stopped-agent",
        "com.apple.system-agent",
      ])
    })
  })

  it("filters by source", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setFilters({ ...noFilters, sources: ["SystemAgent"] })
    })

    await waitFor(() => {
      expect(result.current.filteredJobs.length).toBe(1)
      expect(result.current.filteredJobs[0].source).toBe("SystemAgent")
    })
  })

  it("filters to failed last runs together with the other filters", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setFilters({ ...noFilters, failedOnly: true })
    })
    await waitFor(() => {
      expect(result.current.filteredJobs.map((job) => job.label)).toEqual([
        "com.example.stopped-agent",
      ])
    })

    act(() => {
      result.current.setFilters({ ...noFilters, failedOnly: true, sources: ["SystemAgent"] })
    })
    await waitFor(() => {
      expect(result.current.filteredJobs).toEqual([])
    })
  })

  it("handles error", async () => {
    setFakeHandler("list_jobs", () => {
      throw new Error("Connection failed")
    })

    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toContain("Connection failed")
    expect(result.current.jobs.length).toBe(0)
  })
})
