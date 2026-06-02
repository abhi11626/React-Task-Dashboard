import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '../types/task.types'

// LocalStorage-backed persistence for tasks. This replaces the remote
// /tasks API for development/demo purposes while keeping the same async
// signatures so the React Query hooks remain unchanged.

const STORAGE_KEY = 'task-dashboard:tasks'

function readTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) return parsed as Task[]
    return []
  } catch {
    return []
  }
}

function writeTasksToStorage(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // ignore write errors for now
  }
}

export async function getTasks(): Promise<Task[]> {
  // keep async signature for React Query compatibility
  return Promise.resolve(readTasksFromStorage())
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const tasks = readTasksFromStorage()
  const newTask: Task = {
    id: `local-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    completed: false,
    ...input,
  }
  const next = [newTask, ...tasks]
  writeTasksToStorage(next)
  return Promise.resolve(newTask)
}

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  const tasks = readTasksFromStorage()
  const next = tasks.map((t) => (t.id === taskId ? { ...t, ...input } : t))
  writeTasksToStorage(next)
  const updated = next.find((t) => t.id === taskId)
  if (!updated) throw new Error('Task not found')
  return Promise.resolve(updated)
}

export async function deleteTask(taskId: string): Promise<void> {
  const tasks = readTasksFromStorage()
  const next = tasks.filter((t) => t.id !== taskId)
  writeTasksToStorage(next)
  return Promise.resolve()
}
