import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { JobList } from "./JobList"
import type { JobListEntry } from "@/types"

const mockJobs: JobListEntry[] = [
  {
    label: "com.example.running",
    pid: 1234,
    last_exit_code: 0,
    plist_path: "/Users/test/Library/LaunchAgents/com.example.running.plist",
    source: "UserAgent",
    status: "Running",
    last_run_at: String(Date.now()),
    is_home_agent: true,
    service_description: "Runs the example job",
    run_at_load: null,
    keep_alive: null,
    start_interval: null,
    start_calendar_interval: [{ minute: 30, hour: 7, day: null, weekday: null, month: null }],
  },
  {
    label: "com.example.stopped",
    pid: null,
    last_exit_code: 78,
    plist_path: "/Users/test/Library/LaunchAgents/com.example.stopped.plist",
    source: "UserAgent",
    status: "Unloaded",
    last_run_at: null,
    is_home_agent: false,
    service_description: null,
    run_at_load: null,
    keep_alive: null,
    start_interval: null,
    start_calendar_interval: null,
  },
]

const noop = vi.fn()

describe("JobList", () => {
  it("renders loading state", () => {
    render(
      <JobList
        jobs={[]}
        loading={true}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    expect(screen.getByText("Loading agents...")).toBeInTheDocument()
  })

  it("renders empty state", () => {
    render(
      <JobList
        jobs={[]}
        loading={false}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    expect(screen.getByText("No agents found")).toBeInTheDocument()
  })

  it("shows the description, and the label only for a job without one", () => {
    render(
      <JobList
        jobs={mockJobs}
        loading={false}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    expect(screen.queryByText("Label")).not.toBeInTheDocument()
    expect(screen.getByText("Runs the example job")).toBeInTheDocument()
    expect(screen.queryByText("com.example.running")).not.toBeInTheDocument()
    expect(screen.getByText("com.example.stopped")).toHaveClass("text-muted-foreground")
  })

  it("renders the ServiceDescription column", () => {
    render(
      <JobList
        jobs={mockJobs}
        loading={false}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    expect(screen.getByText("Description")).toBeInTheDocument()
    expect(screen.getByText("Runs the example job")).toBeInTheDocument()
  })

  it("shows when each job runs and leaves status and PID to the detail view", () => {
    render(
      <JobList
        jobs={mockJobs}
        loading={false}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    expect(screen.getByText("Schedule")).toBeInTheDocument()
    expect(screen.getByText("daily 07:30")).toBeInTheDocument()
    expect(screen.getByText("起動のみ（定期の発火なし）")).toBeInTheDocument()
    expect(screen.queryByText("Running")).not.toBeInTheDocument()
    expect(screen.queryByText("1234")).not.toBeInTheDocument()
  })

  it("marks a failed last run next to the label", () => {
    render(
      <JobList
        jobs={mockJobs}
        loading={false}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    expect(screen.getByLabelText("Last exit code: 78")).toBeInTheDocument()
    expect(screen.queryByLabelText("Last exit code: 0")).not.toBeInTheDocument()
  })

  it('shows "Run now" only for active (non-Unloaded) agents', () => {
    render(
      <JobList
        jobs={mockJobs}
        loading={false}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    // mockJobs has one Running and one Unloaded agent → exactly one Run now button
    const runButtons = screen.getAllByRole("button", { name: "Run now" })
    expect(runButtons).toHaveLength(1)
  })

  it("calls onKickstart when Run now is clicked", () => {
    const onKickstart = vi.fn()
    render(
      <JobList
        jobs={mockJobs}
        loading={false}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={onKickstart}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    screen.getByRole("button", { name: "Run now" }).click()
    expect(onKickstart).toHaveBeenCalledWith(
      expect.objectContaining({ label: "com.example.running" })
    )
  })
})
