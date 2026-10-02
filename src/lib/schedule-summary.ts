import type { CalendarInterval } from "@/types"

export type ScheduleKeys = {
  run_at_load: boolean | null
  keep_alive: boolean | null
  start_interval: number | null
  start_calendar_interval: CalendarInterval[] | null
}

const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function has(value: number | null | undefined): value is number {
  return value !== null && value !== undefined
}

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function ordinal(day: number): string {
  const tens = day % 100
  if (tens >= 11 && tens <= 13) return `${day}th`
  switch (day % 10) {
    case 1:
      return `${day}st`
    case 2:
      return `${day}nd`
    case 3:
      return `${day}rd`
    default:
      return `${day}th`
  }
}

function formatInterval(seconds: number): string {
  if (seconds % 3600 === 0) return `every ${seconds / 3600} h`
  if (seconds % 60 === 0) return `every ${seconds / 60} min`
  return `every ${seconds} s`
}

function timeOf(ci: CalendarInterval): string {
  const minute = pad(ci.minute ?? 0)
  return has(ci.hour) ? `${pad(ci.hour)}:${minute}` : `hourly :${minute}`
}

// Weekdays are merged per time ("weekly Mon,Fri 09:00"), the other kinds per prefix
// ("daily 08:00, 20:00"), so several fire times stay in one short cell.
function formatCalendar(intervals: CalendarInterval[]): string {
  const groups = new Map<string, string[]>()
  const add = (key: string, value: string) => {
    const values = groups.get(key) ?? []
    if (!values.includes(value)) values.push(value)
    groups.set(key, values)
  }

  for (const ci of intervals) {
    if (has(ci.month) && has(ci.day)) {
      add(`yearly ${monthShort[ci.month - 1]} ${ordinal(ci.day)}`, timeOf(ci))
    } else if (has(ci.day)) {
      add(`monthly ${ordinal(ci.day)}`, timeOf(ci))
    } else if (has(ci.weekday)) {
      add(`weekly\u0000${timeOf(ci)}`, weekdayShort[ci.weekday])
    } else if (has(ci.month)) {
      add(`daily in ${monthShort[ci.month - 1]}`, timeOf(ci))
    } else {
      add("daily", timeOf(ci))
    }
  }

  return Array.from(groups.entries())
    .map(([key, values]) => {
      if (key.startsWith("weekly\u0000")) {
        return `weekly ${values.join(",")} ${key.slice("weekly\u0000".length)}`
      }
      return `${key} ${values.join(", ")}`
    })
    .join(" / ")
}

/**
 * Summarise when a job runs in one short line for the job list.
 */
export function formatScheduleSummary(keys: ScheduleKeys): string {
  if (keys.keep_alive) return "常駐（KeepAlive）"

  const parts: string[] = []
  if (keys.start_calendar_interval && keys.start_calendar_interval.length > 0) {
    parts.push(formatCalendar(keys.start_calendar_interval))
  }
  if (has(keys.start_interval) && keys.start_interval > 0) {
    parts.push(formatInterval(keys.start_interval))
  }

  if (parts.length === 0) {
    return keys.run_at_load ? "ログイン時（RunAtLoad のみ）" : "起動のみ（定期の発火なし）"
  }
  // RunAtLoad next to a calendar is worth showing: the job also runs at login.
  // Next to a short interval it adds nothing, so it is left out there.
  if (keys.run_at_load && keys.start_calendar_interval && keys.start_calendar_interval.length > 0) {
    parts.push("ログイン時")
  }
  return parts.join(" + ")
}
