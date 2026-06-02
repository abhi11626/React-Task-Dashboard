import { useState } from 'react'
import type { SyntheticEvent } from 'react'

import type {
  CreateTaskInput,
  Task,
  TaskPriority,
} from '../types/task.types'

interface TaskFormProps {
  onCancel?: () => void
  onSubmit: (input: CreateTaskInput) => void
  submitLabel?: string
  task?: Task
}

const priorities: TaskPriority[] = ['low', 'medium', 'high']

function getTaskInput(
  title: string,
  description: string,
  priority: TaskPriority,
): CreateTaskInput {
  const trimmedDescription = description.trim()

  if (trimmedDescription) {
    return {
      title,
      description: trimmedDescription,
      priority,
    }
  }

  return {
    title,
    priority,
  }
}

export function TaskForm({
  onCancel,
  onSubmit,
  submitLabel = 'Create task',
  task,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? 'medium',
  )

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return
    }

    onSubmit(getTaskInput(trimmedTitle, description, priority))

    if (!task) {
      setTitle('')
      setDescription('')
      setPriority('medium')
    }
  }

  return (
    <form
      className="grid gap-3"
      id={task ? undefined : 'task-form'}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            onChange={(event) => {
              setTitle(event.target.value)
            }}
            placeholder="Add a focused task"
            value={title}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">
            Description
          </span>
          <textarea
            className="min-h-24 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            onChange={(event) => {
              setDescription(event.target.value)
            }}
            placeholder="Optional notes"
            value={description}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">
              Priority
            </span>
            <select
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm capitalize text-slate-950 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              onChange={(event) => {
                setPriority(event.target.value as TaskPriority)
              }}
              value={priority}
            >
              {priorities.map((priorityOption) => (
                <option key={priorityOption} value={priorityOption}>
                  {priorityOption}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            {onCancel ? (
              <button
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={onCancel}
                type="button"
              >
                Cancel
              </button>
            ) : null}
            <button
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
              type="submit"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
