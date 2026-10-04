import { describe, it, expect } from "vitest"
import {
  blankDescription,
  descriptionValue,
  descriptionValues,
  filterJobs,
  noFilters,
} from "@/lib/job-filters"
import type { JobListEntry } from "@/types"

function job(label: string, description: string | null): JobListEntry {
  return {
    label,
    pid: null,
    last_exit_code: null,
    plist_path: `/${label}.plist`,
    source: "UserAgent",
    status: "Loaded",
    last_run_at: null,
    is_home_agent: true,
    description,
    run_at_load: null,
    keep_alive: null,
    start_interval: null,
    start_calendar_interval: null,
  }
}

describe("descriptionValue", () => {
  it("is the description as the list shows it", () => {
    expect(descriptionValue(job("a", "Backs up files"))).toBe("Backs up files")
  })

  it("is the blank value for a missing or empty description", () => {
    expect(descriptionValue(job("a", null))).toBe(blankDescription)
    expect(descriptionValue(job("a", ""))).toBe(blankDescription)
    expect(descriptionValue(job("a", "  "))).toBe(blankDescription)
  })
})

describe("descriptionValues", () => {
  it("lists each value once in ascending order, with the blank value last", () => {
    const jobs = [
      job("a", "Syncs mail"),
      job("b", null),
      job("c", "Backs up files"),
      job("d", "Syncs mail"),
      job("e", ""),
      job("f", "Archives logs"),
    ]
    expect(descriptionValues(jobs)).toEqual([
      "Archives logs",
      "Backs up files",
      "Syncs mail",
      blankDescription,
    ])
  })

  it("is empty for no jobs", () => {
    expect(descriptionValues([])).toEqual([])
  })
})

describe("filterJobs", () => {
  it("drops the jobs of the hidden values, blank ones included", () => {
    const jobs = [job("a", "Syncs mail"), job("b", null), job("c", ""), job("d", "Backs up files")]
    expect(
      filterJobs(jobs, { ...noFilters, hiddenDescriptions: [blankDescription, "Syncs mail"] }).map(
        (j) => j.label
      )
    ).toEqual(["d"])
  })

  it("keeps every job without hidden values", () => {
    const jobs = [job("a", "Syncs mail"), job("b", null)]
    expect(filterJobs(jobs, noFilters)).toEqual(jobs)
  })
})
