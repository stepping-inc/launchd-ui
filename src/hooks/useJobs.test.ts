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

  it("hides the jobs of unchecked description values together with the other filters", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.descriptionValues).toEqual(["Example running agent", "(空白)"])

    act(() => {
      result.current.setFilters({ ...noFilters, hiddenDescriptions: ["(空白)"] })
    })
    await waitFor(() => {
      expect(result.current.filteredJobs.map((job) => job.label)).toEqual([
        "com.example.running-agent",
      ])
    })

    act(() => {
      result.current.setFilters({
        scheduleKinds: ["keepalive", "launch"],
        hiddenDescriptions: ["Example running agent"],
      })
    })
    await waitFor(() => {
      expect(result.current.filteredJobs.map((job) => job.label)).toEqual([
        "com.example.stopped-agent",
        "com.apple.system-agent",
      ])
    })
  })

  it("offers the description values left by the schedule filter", async () => {
    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setFilters({ scheduleKinds: ["daily"], hiddenDescriptions: ["Example running agent"] })
    })
    await waitFor(() => {
      expect(result.current.filteredJobs).toEqual([])
      expect(result.current.descriptionValues).toEqual(["Example running agent"])
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
