import type {
  Task,
  TaskFilters,
  TaskPriority,
  TaskStats,
} from '../types/task.types'

const priorityRank: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

export function getPriorityClasses(priority: TaskPriority) {
  const classes: Record<TaskPriority, string> = {
    low: 'border-sky-200 bg-sky-50 text-sky-700',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    high: 'border-rose-200 bg-rose-50 text-rose-700',
  }

  return classes[priority]
}

export function formatTaskDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function filterTasks(tasks: Task[], filters: TaskFilters) {
  const searchTerm = filters.search.trim().toLowerCase()

  return tasks
    .filter((task) => {
      const description = task.description?.toLowerCase() ?? ''
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm) ||
        description.includes(searchTerm)

      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'completed' && task.completed) ||
        (filters.status === 'active' && !task.completed)

      const matchesPriority =
        filters.priority === 'all' || task.priority === filters.priority

      return matchesSearch && matchesStatus && matchesPriority
    })
    .toSorted((first, second) => {
      if (filters.sort === 'priority') {
        return priorityRank[second.priority] - priorityRank[first.priority]
      }

      const firstTime = new Date(first.createdAt).getTime()
      const secondTime = new Date(second.createdAt).getTime()

      return filters.sort === 'newest'
        ? secondTime - firstTime
        : firstTime - secondTime
    })
}

export function getTaskStats(tasks: Task[]): TaskStats {
  const completed = tasks.filter((task) => task.completed).length
  const active = tasks.length - completed
  const highPriority = tasks.filter((task) => task.priority === 'high').length
  const completionRate =
    tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100)

  return {
    active,
    completed,
    completionRate,
    highPriority,
    total: tasks.length,
  }
}
