import React, { useState } from 'react'

import type { Task, UpdateTaskInput } from '../types/task.types'
import { formatTaskDate, getPriorityClasses } from '../utils/taskHelpers'
import { TaskForm } from './TaskForm'

interface TaskCardProps {
  onDelete: (taskId: string) => void
  onToggleCompleted: (task: Task) => void
  onUpdate: (taskId: string, input: UpdateTaskInput) => void
  task: Task
  // optional selection props for bulk actions
  selected?: boolean
  onSelect?: ((taskId: string, selected: boolean) => void) | undefined
}

// Wrap TaskCard in React.memo to avoid re-rendering individual list items
// when their props have not changed. This is beneficial because TaskCard
// is rendered many times in a list; memoization reduces per-item work.
export const TaskCard = React.memo(function TaskCard({
  onDelete,
  onToggleCompleted,
  onUpdate,
  task,
  selected,
  onSelect,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <article className="rounded-lg border border-teal-200 bg-white p-3 shadow-sm">
        <TaskForm
          onCancel={() => {
            setIsEditing(false)
          }}
          onSubmit={(input) => {
            onUpdate(task.id, input)
            setIsEditing(false)
          }}
          submitLabel="Save task"
          task={task}
        />
      </article>
    )
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {/* Selection checkbox - lightweight UI for bulk actions. */}
      {onSelect ? (
        <div className="-mt-2 -ml-2 mb-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              aria-label={`Select task ${task.title}`}
              checked={!!selected}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onSelect?.(task.id, e.target.checked)
              }
              className="mr-2 h-4 w-4 rounded border-slate-300"
            />
          </label>
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={[
              'text-base font-semibold text-slate-950',
              task.completed ? 'line-through decoration-slate-400' : '',
            ].join(' ')}
          >
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {task.description}
            </p>
          ) : null}
        </div>
        <span
          className={[
            'shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize',
            getPriorityClasses(task.priority),
          ].join(' ')}
        >
          {task.priority}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>{formatTaskDate(task.createdAt)}</span>
        <span
          className={[
            'rounded-full px-2.5 py-1 font-medium',
            task.completed
              ? 'bg-emerald-400/10 text-emerald-200'
              : 'bg-slate-700 text-slate-200',
          ].join(' ')}
        >
          {task.completed ? 'Completed' : 'Active'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className={[
            'rounded-md px-3 py-2 text-sm font-semibold transition',
            task.completed
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-emerald-600 text-white hover:bg-emerald-500',
          ].join(' ')}
          onClick={() => {
            onToggleCompleted(task)
          }}
          type="button"
        >
          {task.completed ? 'Reopen' : 'Complete'}
        </button>
        <button
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={() => {
            setIsEditing(true)
          }}
          type="button"
        >
          Edit
        </button>
        <button
          className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          onClick={() => {
            onDelete(task.id)
          }}
          type="button"
        >
          Delete
        </button>
      </div>
    </article>
  )
})
