import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { SourceFilter } from "@/types"
import type { ScheduleFilter } from "@/lib/job-filters"
import { Search } from "lucide-react"

type SearchBarProps = {
  search: string
  onSearchChange: (value: string) => void
  sourceFilter: SourceFilter
  onSourceFilterChange: (value: SourceFilter) => void
  scheduleFilter: ScheduleFilter
  onScheduleFilterChange: (value: ScheduleFilter) => void
  failedOnly: boolean
  onFailedOnlyChange: (value: boolean) => void
}

const sourceOptions: Array<{ value: SourceFilter; label: string }> = [
  { value: "All", label: "All" },
  { value: "UserAgent", label: "User" },
  { value: "Home", label: "Home" },
  { value: "SystemAgent", label: "System" },
  { value: "SystemDaemon", label: "Daemon" },
]

const scheduleOptions: Array<{ value: ScheduleFilter; label: string }> = [
  { value: "All", label: "All" },
  { value: "daily", label: "daily" },
  { value: "weekly", label: "weekly" },
  { value: "monthly", label: "monthly" },
  { value: "interval", label: "間隔" },
  { value: "keepalive", label: "常駐" },
  { value: "login", label: "ログイン時" },
  { value: "launch", label: "起動のみ" },
]

export function SearchBar({
  search,
  onSearchChange,
  sourceFilter,
  onSourceFilterChange,
  scheduleFilter,
  onScheduleFilterChange,
  failedOnly,
  onFailedOnlyChange,
}: SearchBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {sourceOptions.map((option) => (
            <Button
              key={option.value}
              variant={sourceFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onSourceFilterChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1" role="group" aria-label="Schedule">
          {scheduleOptions.map((option) => (
            <Button
              key={option.value}
              variant={scheduleFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onScheduleFilterChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <Button
          variant={failedOnly ? "default" : "outline"}
          size="sm"
          aria-pressed={failedOnly}
          onClick={() => onFailedOnlyChange(!failedOnly)}
        >
          直近の失敗だけ
        </Button>
      </div>
    </div>
  )
}
