import React from 'react'
import type {
  TaskFilters,
  TaskPriority,
  TaskSort,
  TaskStatusFilter,
} from '../types/task.types'

interface FiltersProps {
  filters: TaskFilters
  onChange: (filters: TaskFilters) => void
}

const statuses: { label: string; value: TaskStatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]

const priorities: { label: string; value: TaskPriority | 'all' }[] = [
  { label: 'All priorities', value: 'all' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

const sortOptions: { label: string; value: TaskSort }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Priority', value: 'priority' },
]

// Memoize Filters to avoid re-rendering the controls when parent
// updates do not change the `filters` object identity. This helps
// when the parent has other state changes unrelated to filter values.
export const Filters = React.memo(function Filters({
  filters,
  onChange,
}: FiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div
        className="flex rounded-md border border-slate-200 bg-white p-1"
        role="tablist"
        aria-label="Filter by status"
      >
        {statuses.map((status) => (
          <button
            className={[
              'flex-1 rounded px-3 py-2 text-sm font-medium transition',
              filters.status === status.value
                ? 'bg-slate-950 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
            ].join(' ')}
            key={status.value}
            onClick={() => {
              onChange({ ...filters, status: status.value })
            }}
            aria-pressed={filters.status === status.value}
            type="button"
          >
            {status.label}
          </button>
        ))}
      </div>

      <label className="sr-only" htmlFor="priority-filter">
        Filter by priority
      </label>
      <select
        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        id="priority-filter"
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          onChange({
            ...filters,
            priority: event.target.value as TaskPriority | 'all',
          })
        }}
        value={filters.priority}
      >
        {priorities.map((priority) => (
          <option key={priority.value} value={priority.value}>
            {priority.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="sort-filter">
        Sort tasks
      </label>
      <select
        className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        id="sort-filter"
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          onChange({ ...filters, sort: event.target.value as TaskSort })
        }}
        value={filters.sort}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
})
