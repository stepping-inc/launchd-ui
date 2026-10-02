import { describe, it, expect } from "vitest"
import { formatScheduleSummary, scheduleKinds, type ScheduleKeys } from "@/lib/schedule-summary"
import type { CalendarInterval } from "@/types"

const none: ScheduleKeys = {
  run_at_load: null,
  keep_alive: null,
  start_interval: null,
  start_calendar_interval: null,
}

function at(fields: Partial<CalendarInterval>): CalendarInterval {
  return { minute: null, hour: null, day: null, weekday: null, month: null, ...fields }
}

describe("formatScheduleSummary", () => {
  it("shows a daily time", () => {
    expect(
      formatScheduleSummary({ ...none, start_calendar_interval: [at({ hour: 7, minute: 30 })] })
    ).toBe("daily 07:30")
  })

  it("puts several daily times in one cell", () => {
    expect(
      formatScheduleSummary({
        ...none,
        start_calendar_interval: [at({ hour: 8, minute: 0 }), at({ hour: 20, minute: 0 })],
      })
    ).toBe("daily 08:00, 20:00")
  })

  it("shows a weekly time with the weekday", () => {
    expect(
      formatScheduleSummary({
        ...none,
        start_calendar_interval: [at({ weekday: 6, hour: 9, minute: 0 })],
      })
    ).toBe("weekly Sat 09:00")
  })

  it("merges weekdays that share a time", () => {
    expect(
      formatScheduleSummary({
        ...none,
        start_calendar_interval: [
          at({ weekday: 1, hour: 9, minute: 0 }),
          at({ weekday: 5, hour: 9, minute: 0 }),
        ],
      })
    ).toBe("weekly Mon,Fri 09:00")
  })

  it("shows a monthly time with the ordinal day", () => {
    expect(
      formatScheduleSummary({ ...none, start_calendar_interval: [at({ day: 1, hour: 9, minute: 0 })] })
    ).toBe("monthly 1st 09:00")
    expect(
      formatScheduleSummary({ ...none, start_calendar_interval: [at({ day: 22, hour: 9, minute: 0 })] })
    ).toBe("monthly 22nd 09:00")
  })

  it("shows an hourly minute when the hour is missing", () => {
    expect(
      formatScheduleSummary({ ...none, start_calendar_interval: [at({ minute: 15 })] })
    ).toBe("daily hourly :15")
  })

  it("shows intervals in the largest whole unit", () => {
    expect(formatScheduleSummary({ ...none, start_interval: 600 })).toBe("every 10 min")
    expect(formatScheduleSummary({ ...none, start_interval: 21600 })).toBe("every 6 h")
    expect(formatScheduleSummary({ ...none, start_interval: 30, run_at_load: true })).toBe(
      "every 30 s"
    )
  })

  it("adds the login run next to a calendar", () => {
    expect(
      formatScheduleSummary({
        ...none,
        run_at_load: true,
        start_calendar_interval: [at({ hour: 7, minute: 0 })],
      })
    ).toBe("daily 07:00 + ログイン時")
  })

  it("names jobs without a calendar or interval", () => {
    expect(formatScheduleSummary({ ...none, keep_alive: true, run_at_load: true })).toBe(
      "常駐（KeepAlive）"
    )
    expect(formatScheduleSummary({ ...none, run_at_load: true })).toBe("ログイン時（RunAtLoad のみ）")
    expect(formatScheduleSummary(none)).toBe("起動のみ（定期の発火なし）")
  })
})

describe("scheduleKinds", () => {
  it("reads the calendar kinds", () => {
    expect(scheduleKinds({ ...none, start_calendar_interval: [at({ hour: 7, minute: 30 })] })).toEqual([
      "daily",
    ])
    expect(
      scheduleKinds({ ...none, start_calendar_interval: [at({ weekday: 6, hour: 9, minute: 0 })] })
    ).toEqual(["weekly"])
    expect(
      scheduleKinds({ ...none, start_calendar_interval: [at({ day: 1, hour: 9, minute: 0 })] })
    ).toEqual(["monthly"])
  })

  it("counts yearly dates as monthly and hourly minutes as daily", () => {
    expect(
      scheduleKinds({ ...none, start_calendar_interval: [at({ month: 3, day: 1, hour: 9 })] })
    ).toEqual(["monthly"])
    expect(scheduleKinds({ ...none, start_calendar_interval: [at({ minute: 15 })] })).toEqual([
      "daily",
    ])
  })

  it("lists every kind a job has, without repeats", () => {
    expect(
      scheduleKinds({
        ...none,
        run_at_load: true,
        start_interval: 600,
        start_calendar_interval: [
          at({ hour: 8, minute: 0 }),
          at({ hour: 20, minute: 0 }),
          at({ weekday: 6, hour: 9, minute: 0 }),
        ],
      })
    ).toEqual(["daily", "weekly", "interval", "login"])
  })

  it("leaves login out next to an interval alone", () => {
    expect(scheduleKinds({ ...none, run_at_load: true, start_interval: 30 })).toEqual(["interval"])
  })

  it("names jobs without a calendar or interval", () => {
    expect(scheduleKinds({ ...none, keep_alive: true, start_interval: 60 })).toEqual(["keepalive"])
    expect(scheduleKinds({ ...none, run_at_load: true })).toEqual(["login"])
    expect(scheduleKinds(none)).toEqual(["launch"])
  })
})
