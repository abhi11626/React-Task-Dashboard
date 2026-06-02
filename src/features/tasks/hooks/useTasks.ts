import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from '../api/tasksApi'
import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
  UpdateTaskMutationInput,
} from '../types/task.types'

export const tasksQueryKeys = {
  all: ['tasks'] as const,
}

export const tasksQueryKey = tasksQueryKeys.all

const emptyTasks: Task[] = []

interface TasksMutationContext {
  optimisticTaskId?: string
  previousTasks: Task[] | undefined
}

function createOptimisticTask(input: CreateTaskInput): Task {
  return {
    id: `optimistic-${crypto.randomUUID()}`,
    completed: false,
    createdAt: new Date().toISOString(),
    ...input,
  }
}

function applyTaskUpdate(task: Task, input: UpdateTaskInput): Task {
  return {
    ...task,
    ...input,
  }
}

function restorePreviousTasks(
  queryClient: QueryClient,
  previousTasks: Task[] | undefined,
) {
  queryClient.setQueryData(tasksQueryKey, previousTasks ?? [])
}

export function useTasksQuery() {
  return useQuery({
    queryKey: tasksQueryKey,
    queryFn: getTasks,
    staleTime: 30_000,
  })
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, CreateTaskInput, TasksMutationContext>({
    mutationFn: createTask,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKey })

      const previousTasks = queryClient.getQueryData<Task[]>(tasksQueryKey)
      const optimisticTask = createOptimisticTask(input)

      queryClient.setQueryData<Task[]>(tasksQueryKey, (currentTasks = []) => [
        optimisticTask,
        ...currentTasks,
      ])

      return { optimisticTaskId: optimisticTask.id, previousTasks }
    },
    onError: (_error, _input, context) => {
      if (context) {
        restorePreviousTasks(queryClient, context.previousTasks)
      }
    },
    onSuccess: (createdTask, _input, context) => {
      queryClient.setQueryData<Task[]>(tasksQueryKey, (currentTasks = []) => {
        const optimisticTaskId = context.optimisticTaskId

        if (!optimisticTaskId) {
          return [createdTask, ...currentTasks]
        }

        const hasOptimisticTask = currentTasks.some(
          (task) => task.id === optimisticTaskId,
        )

        if (!hasOptimisticTask) {
          return [createdTask, ...currentTasks]
        }

        return currentTasks.map((task) =>
          task.id === optimisticTaskId ? createdTask : task,
        )
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey })
    },
  })
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, UpdateTaskMutationInput, TasksMutationContext>(
    {
      mutationFn: ({ input, taskId }) => updateTask(taskId, input),
      onMutate: async ({ input, taskId }) => {
        await queryClient.cancelQueries({ queryKey: tasksQueryKey })

        const previousTasks = queryClient.getQueryData<Task[]>(tasksQueryKey)

        queryClient.setQueryData<Task[]>(tasksQueryKey, (currentTasks = []) =>
          currentTasks.map((task) =>
            task.id === taskId ? applyTaskUpdate(task, input) : task,
          ),
        )

        return { previousTasks }
      },
      onError: (_error, _input, context) => {
        if (context) {
          restorePreviousTasks(queryClient, context.previousTasks)
        }
      },
      onSuccess: (updatedTask) => {
        queryClient.setQueryData<Task[]>(tasksQueryKey, (currentTasks = []) =>
          currentTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task,
          ),
        )
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: tasksQueryKey })
      },
    },
  )
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation<undefined, Error, string, TasksMutationContext>({
    mutationFn: async (taskId): Promise<undefined> => {
      await deleteTask(taskId)
      return undefined
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKey })

      const previousTasks = queryClient.getQueryData<Task[]>(tasksQueryKey)

      queryClient.setQueryData<Task[]>(tasksQueryKey, (currentTasks = []) =>
        currentTasks.filter((task) => task.id !== taskId),
      )

      return { previousTasks }
    },
    onError: (_error, _taskId, context) => {
      if (context) {
        restorePreviousTasks(queryClient, context.previousTasks)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey })
    },
  })
}

export function useBulkDeleteMutation() {
  const queryClient = useQueryClient()

  return useMutation<undefined, Error, string[], TasksMutationContext>({
    mutationFn: async (taskIds: string[]) => {
      // call delete endpoint for each id
      await Promise.all(taskIds.map((id) => deleteTask(id)))
      return undefined
    },
    onMutate: async (taskIds) => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKey })

      const previousTasks = queryClient.getQueryData<Task[]>(tasksQueryKey)

      queryClient.setQueryData<Task[]>(tasksQueryKey, (currentTasks = []) =>
        currentTasks.filter((task) => !taskIds.includes(task.id)),
      )

      return { previousTasks }
    },
    onError: (_error, _taskIds, context) => {
      if (context) {
        restorePreviousTasks(queryClient, context.previousTasks)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey })
    },
  })
}

export function useBulkUpdateMutation() {
  const queryClient = useQueryClient()

  return useMutation<Task[], Error, { taskIds: string[]; input: UpdateTaskInput }, TasksMutationContext>({
    mutationFn: async ({ taskIds, input }) => {
      // update each task on the server and return updated tasks
      const results = await Promise.all(taskIds.map((id) => updateTask(id, input)))
      return results
    },
    onMutate: async ({ taskIds, input }) => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKey })

      const previousTasks = queryClient.getQueryData<Task[]>(tasksQueryKey)

      queryClient.setQueryData<Task[]>(tasksQueryKey, (currentTasks = []) =>
        currentTasks.map((task) =>
          taskIds.includes(task.id) ? applyTaskUpdate(task, input) : task,
        ),
      )

      return { previousTasks }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        restorePreviousTasks(queryClient, context.previousTasks)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey })
    },
  })
}

export function useTasks() {
  const tasksQuery = useTasksQuery()
  const createTaskMutation = useCreateTaskMutation()
  const updateTaskMutation = useUpdateTaskMutation()
  const deleteTaskMutation = useDeleteTaskMutation()
  const { mutate: createTaskMutate, status: createTaskStatus } =
    createTaskMutation
  const { mutate: deleteTaskMutate, status: deleteTaskStatus } =
    deleteTaskMutation
  const { mutate: updateTaskMutate, status: updateTaskStatus } =
    updateTaskMutation
  const tasks = tasksQuery.data ?? emptyTasks

  // bulk operations
  const bulkDeleteMutation = useBulkDeleteMutation()
  const bulkUpdateMutation = useBulkUpdateMutation()

  const bulkDeleteHandler = useCallback(
    (taskIds: string[]) => {
      bulkDeleteMutation.mutate(taskIds)
    },
    [bulkDeleteMutation],
  )

  const bulkUpdateHandler = useCallback(
    (taskIds: string[], input: UpdateTaskInput) => {
      bulkUpdateMutation.mutate({ taskIds, input })
    },
    [bulkUpdateMutation],
  )

  // useCallback keeps mutation handlers referentially stable so memoized children do not re-render just because the facade rebuilt.
  const createTaskHandler = useCallback(
    (input: CreateTaskInput) => {
      createTaskMutate(input)
    },
    [createTaskMutate],
  )

  // useCallback stabilizes delete callbacks passed through the task list to every card.
  const deleteTaskHandler = useCallback(
    (taskId: string) => {
      deleteTaskMutate(taskId)
    },
    [deleteTaskMutate],
  )

  // useCallback keeps update props stable while still sending the latest mutation function from React Query.
  const updateTaskHandler = useCallback(
    (taskId: string, input: UpdateTaskInput) => {
      updateTaskMutate({ input, taskId })
    },
    [updateTaskMutate],
  )

  // useCallback prevents each dashboard render from creating a new toggle function for every memoized TaskCard.
  const toggleTaskCompletedHandler = useCallback(
    (task: Task) => {
      updateTaskMutate({
        input: { completed: !task.completed },
        taskId: task.id,
      })
    },
    [updateTaskMutate],
  )

  // useMemo returns a stable facade object when query data and mutation state have not changed.
  return useMemo(
    () => ({
      createTask: createTaskHandler,
      createTaskStatus,
      deleteTask: deleteTaskHandler,
      deleteTaskStatus,
      error: tasksQuery.error?.message ?? null,
      isLoading: tasksQuery.isLoading,
      tasks,
      toggleTaskCompleted: toggleTaskCompletedHandler,
      updateTask: updateTaskHandler,
      bulkDelete: bulkDeleteHandler,
      bulkUpdate: bulkUpdateHandler,
      updateTaskStatus,
    }),
    [
      createTaskHandler,
      createTaskStatus,
      deleteTaskHandler,
      deleteTaskStatus,
      tasksQuery.error?.message,
      tasksQuery.isLoading,
      tasks,
      toggleTaskCompletedHandler,
      bulkDeleteHandler,
      bulkUpdateHandler,
      updateTaskHandler,
      updateTaskStatus,
    ],
  )
}
