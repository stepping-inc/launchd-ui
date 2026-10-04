import { describe, it, expect, vi } from "vitest"
import { useState } from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { JobList } from "./JobList"
import type { JobListEntry } from "@/types"
import {
  descriptionValues,
  filterJobs,
  noFilters,
  type JobFilters,
} from "@/lib/job-filters"

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
    description: "Runs the example job",
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
    description: null,
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
        descriptionValues={[]}
        loading={true}
        filters={noFilters}
        onFiltersChange={noop}
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
        descriptionValues={[]}
        loading={false}
        filters={noFilters}
        onFiltersChange={noop}
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
        descriptionValues={[]}
        loading={false}
        filters={noFilters}
        onFiltersChange={noop}
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
        descriptionValues={[]}
        loading={false}
        filters={noFilters}
        onFiltersChange={noop}
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
        descriptionValues={[]}
        loading={false}
        filters={noFilters}
        onFiltersChange={noop}
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
        descriptionValues={[]}
        loading={false}
        filters={noFilters}
        onFiltersChange={noop}
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
        descriptionValues={[]}
        loading={false}
        filters={noFilters}
        onFiltersChange={noop}
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
        descriptionValues={[]}
        loading={false}
        filters={noFilters}
        onFiltersChange={noop}
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

  it("keeps the header with its filters when nothing matches", () => {
    render(
      <JobList
        jobs={[]}
        descriptionValues={[]}
        loading={false}
        filters={{ ...noFilters, hiddenDescriptions: ["Runs the example job"] }}
        onFiltersChange={noop}
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
    expect(screen.getByRole("button", { name: "Filter Description" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Filter Schedule" })).toBeInTheDocument()
  })

  it("marks only the filtered column header", () => {
    render(
      <JobList
        jobs={mockJobs}
        descriptionValues={[]}
        loading={false}
        filters={{ ...noFilters, scheduleKinds: ["daily"] }}
        onFiltersChange={noop}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    expect(screen.getByRole("button", { name: "Filter Schedule" })).toHaveAttribute(
      "data-active",
      "true"
    )
    expect(screen.getByRole("button", { name: "Filter Description" })).toHaveAttribute(
      "data-active",
      "false"
    )
  })

  it("adds a kind to the schedule filter from the header menu", async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()
    render(
      <JobList
        jobs={mockJobs}
        descriptionValues={[]}
        loading={false}
        filters={{ ...noFilters, scheduleKinds: ["daily"] }}
        onFiltersChange={onFiltersChange}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    await user.click(screen.getByRole("button", { name: "Filter Schedule" }))
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "weekly" }))
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...noFilters,
      scheduleKinds: ["daily", "weekly"],
    })
  })

  it("offers each description value once, sorted, with the blank value last", async () => {
    const user = userEvent.setup()
    const jobs = [
      ...mockJobs,
      { ...mockJobs[0], label: "com.example.again", plist_path: "/again.plist" },
      { ...mockJobs[0], label: "com.example.another", plist_path: "/another.plist", description: "Backs up files" },
    ]
    render(
      <JobList
        jobs={jobs}
        descriptionValues={descriptionValues(jobs)}
        loading={false}
        filters={noFilters}
        onFiltersChange={noop}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    await user.click(screen.getByRole("button", { name: "Filter Description" }))
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByRole("textbox", { name: "Search values" })).toBeInTheDocument()
    expect(
      within(menu)
        .getAllByRole("menuitemcheckbox")
        .map((item) => [item.textContent, item.getAttribute("aria-checked")])
    ).toEqual([
      ["(すべて選択)", "true"],
      ["Backs up files", "true"],
      ["Runs the example job", "true"],
      ["(空白)", "true"],
    ])
    expect(within(menu).queryByText("直近の失敗だけ")).not.toBeInTheDocument()
    expect(within(menu).queryByText("Daemon")).not.toBeInTheDocument()
  })

  it("hides the rows of an unchecked value and brings them back", async () => {
    const user = userEvent.setup()
    function Harness() {
      const [filters, setFilters] = useState<JobFilters>(noFilters)
      return (
        <JobList
          jobs={filterJobs(mockJobs, filters)}
          descriptionValues={descriptionValues(mockJobs)}
          loading={false}
          filters={filters}
          onFiltersChange={setFilters}
          onStart={noop}
          onStop={noop}
          onRestart={noop}
          onKickstart={noop}
          onDelete={noop}
          onSelect={noop}
          onRevealInFinder={noop}
        />
      )
    }
    render(<Harness />)
    const filterButton = screen.getByRole("button", { name: "Filter Description" })
    await user.click(filterButton)
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "(空白)" }))
    // The menu stays open, so another value can be switched right away.
    expect(screen.getByRole("menuitemcheckbox", { name: "(空白)" })).toHaveAttribute(
      "aria-checked",
      "false"
    )
    expect(screen.getByRole("menuitemcheckbox", { name: "(すべて選択)" })).toHaveAttribute(
      "aria-checked",
      "false"
    )
    // The open menu hides the rest of the page from the accessibility tree.
    expect(screen.getByRole("table", { hidden: true })).not.toHaveTextContent("com.example.stopped")
    expect(screen.getByRole("table", { hidden: true })).toHaveTextContent("Runs the example job")
    expect(filterButton).toHaveAttribute("data-active", "true")

    await user.click(screen.getByRole("menuitemcheckbox", { name: "(すべて選択)" }))
    expect(screen.getByRole("table", { hidden: true })).toHaveTextContent("com.example.stopped")
    expect(filterButton).toHaveAttribute("data-active", "false")

    await user.click(screen.getByRole("menuitemcheckbox", { name: "(すべて選択)" }))
    expect(screen.getByText("No agents found")).toBeInTheDocument()
    await user.click(screen.getByRole("menuitem", { name: "Clear" }))
    expect(screen.getByRole("table", { hidden: true })).toHaveTextContent("Runs the example job")
    expect(screen.getByRole("table", { hidden: true })).toHaveTextContent("com.example.stopped")
  })

  it("narrows only the value list with the search box", async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()
    render(
      <JobList
        jobs={mockJobs}
        descriptionValues={descriptionValues(mockJobs)}
        loading={false}
        filters={noFilters}
        onFiltersChange={onFiltersChange}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    await user.click(screen.getByRole("button", { name: "Filter Description" }))
    await user.type(await screen.findByRole("textbox", { name: "Search values" }), "EXAMPLE")
    expect(
      screen.getAllByRole("menuitemcheckbox").map((item) => item.textContent)
    ).toEqual(["(すべて選択)", "Runs the example job"])
    expect(onFiltersChange).not.toHaveBeenCalled()
    expect(screen.getByRole("table", { hidden: true })).toHaveTextContent("com.example.stopped")

    // "(すべて選択)" switches only the values the search leaves.
    await user.click(screen.getByRole("menuitemcheckbox", { name: "(すべて選択)" }))
    expect(onFiltersChange).toHaveBeenLastCalledWith({
      ...noFilters,
      hiddenDescriptions: ["Runs the example job"],
    })
  })

  it("shows a description that came from the description table like any other", () => {
    render(
      <JobList
        jobs={[{ ...mockJobs[1], label: "com.google.keystone.agent", description: "Google のアプリの更新" }]}
        descriptionValues={[]}
        loading={false}
        filters={noFilters}
        onFiltersChange={noop}
        onStart={noop}
        onStop={noop}
        onRestart={noop}
        onKickstart={noop}
        onDelete={noop}
        onSelect={noop}
        onRevealInFinder={noop}
      />
    )
    expect(screen.getByText("Google のアプリの更新")).not.toHaveClass("text-muted-foreground")
    expect(screen.queryByText("com.google.keystone.agent")).not.toBeInTheDocument()
  })
})
