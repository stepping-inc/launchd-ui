import { describe, it, expect, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { useJobs } from "./useJobs"
import { resetFakeHandlers, setFakeHandler } from "@/test-utils/tauri-mock"

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

  it("filters by search term", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSearch("running")
    })

    await waitFor(() => {
      expect(result.current.filteredJobs.length).toBe(1)
      expect(result.current.filteredJobs[0].label).toBe(
        "com.example.running-agent"
      )
    })
  })

  it("filters by source", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSourceFilter("SystemAgent")
    })

    await waitFor(() => {
      expect(result.current.filteredJobs.length).toBe(1)
      expect(result.current.filteredJobs[0].source).toBe("SystemAgent")
    })
  })

  it("filters by Home (user-authored agents)", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSourceFilter("Home")
    })

    await waitFor(() => {
      expect(result.current.filteredJobs.length).toBe(1)
      expect(result.current.filteredJobs[0].label).toBe(
        "com.example.running-agent"
      )
      expect(result.current.filteredJobs[0].is_home_agent).toBe(true)
    })
  })

  it("matches the search against the description too", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSearch("example running")
    })

    await waitFor(() => {
      expect(result.current.filteredJobs.map((job) => job.label)).toEqual([
        "com.example.running-agent",
      ])
    })
  })

  it("filters by the kind of schedule", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setScheduleFilter("daily")
    })
    await waitFor(() => {
      expect(result.current.filteredJobs.map((job) => job.label)).toEqual([
        "com.example.running-agent",
      ])
    })

    act(() => {
      result.current.setScheduleFilter("keepalive")
    })
    await waitFor(() => {
      expect(result.current.filteredJobs.map((job) => job.label)).toEqual([
        "com.apple.system-agent",
      ])
    })

    act(() => {
      result.current.setScheduleFilter("launch")
    })
    await waitFor(() => {
      expect(result.current.filteredJobs.map((job) => job.label)).toEqual([
        "com.example.stopped-agent",
      ])
    })
  })

  it("filters to failed last runs", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setFailedOnly(true)
    })

    await waitFor(() => {
      expect(result.current.filteredJobs.map((job) => job.label)).toEqual([
        "com.example.stopped-agent",
      ])
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
