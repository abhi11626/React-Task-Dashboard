export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskStatusFilter = 'all' | 'active' | 'completed'

export type TaskSort = 'newest' | 'oldest' | 'priority'

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: TaskPriority
  createdAt: string
}

export interface TaskFilters {
  search: string
  status: TaskStatusFilter
  priority: TaskPriority | 'all'
  sort: TaskSort
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority: TaskPriority
}

export interface UpdateTaskInput {
  completed?: boolean
  description?: string
  priority?: TaskPriority
  title?: string
}

export interface UpdateTaskMutationInput {
  input: UpdateTaskInput
  taskId: string
}

export interface TaskStats {
  active: number
  completed: number
  completionRate: number
  highPriority: number
  total: number
}
