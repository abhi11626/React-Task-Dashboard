import type { Task, UpdateTaskInput } from '../types/task.types'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  emptyMessage: string
  onDelete: (taskId: string) => void
  onToggleCompleted: (task: Task) => void
  onUpdate: (taskId: string, input: UpdateTaskInput) => void
  tasks: Task[]
  // optional selection state and handlers for bulk actions
  selectedIds?: string[]
  onToggleSelect?: (taskId: string) => void
}

export function TaskList({
  emptyMessage,
  onDelete,
  onToggleCompleted,
  onUpdate,
  tasks,
  selectedIds = [],
  onToggleSelect,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h3 className="text-base font-semibold text-slate-950">
          No tasks found
        </h3>
        <p className="mt-2 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          onDelete={onDelete}
          onToggleCompleted={onToggleCompleted}
          onUpdate={onUpdate}
          task={task}
          selected={selectedIds.includes(task.id)}
          onSelect={
            onToggleSelect
              ? (taskId: string, selected: boolean) => {
                  onToggleSelect(taskId)
                  void selected
                }
              : undefined
          }
        />
      ))}
    </div>
  )
}
