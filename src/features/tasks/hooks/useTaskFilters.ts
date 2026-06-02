import { useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { useDebounce } from '../../../hooks/useDebounce'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import type { Task, TaskFilters } from '../types/task.types'
import { filterTasks } from '../utils/taskHelpers'

const initialFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  sort: 'newest',
}

export function useTaskFilters(tasks: Task[]): {
  filteredTasks: Task[]
  filters: TaskFilters
  setFilters: Dispatch<SetStateAction<TaskFilters>>
} {
  // Persist filters in localStorage so user preferences survive reloads.
  const [filters, setFilters] = useLocalStorage<TaskFilters>(
    'taskFilters',
    initialFilters,
  )
  const debouncedSearch = useDebounce(filters.search, 300)

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [debouncedSearch, filters],
  )

  const filteredTasks = useMemo(
    () => filterTasks(tasks, effectiveFilters),
    [effectiveFilters, tasks],
  )

  return {
    filteredTasks,
    filters,
    setFilters,
  }
}
