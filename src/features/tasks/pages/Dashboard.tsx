import { Filters } from '../components/Filters'
import SearchBar from '../components/SearchBar'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { useTaskFilters } from '../hooks/useTaskFilters'
import { useTasks } from '../hooks/useTasks'
import { getTaskStats } from '../utils/taskHelpers'
import { useMemo, useCallback, useState, useEffect } from 'react'

const statCards = [
  { key: 'total', label: 'Total tasks', tone: 'bg-slate-950 text-white' },
  { key: 'active', label: 'Active', tone: 'bg-sky-50 text-sky-800' },
  {
    key: 'completed',
    label: 'Completed',
    tone: 'bg-emerald-50 text-emerald-800',
  },
  {
    key: 'highPriority',
    label: 'High priority',
    tone: 'bg-rose-50 text-rose-800',
  },
] as const

function getEmptyMessage(hasTasks: boolean) {
  return hasTasks
    ? 'Adjust your search, status, priority, or sort settings.'
    : 'Create your first task to start organizing the day.'
}

export function Dashboard() {
  const {
    createTask,
    deleteTask,
    error,
    isLoading,
    tasks,
    toggleTaskCompleted,
    updateTask,
    bulkDelete,
    bulkUpdate,
  } = useTasks()
  const { filteredTasks, filters, setFilters } = useTaskFilters(tasks)

  // Selection state for bulk actions (store selected task ids)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Pagination state (client-side simple pagination)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Recent activity log (local only). Each entry is a short message + timestamp.
  const [recentActivity, setRecentActivity] = useState<
    { id: string; at: string; message: string }[]
  >([])

  // Compute pagination results derived from filtered tasks.
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize))

  useEffect(() => {
    // clamp current page when filteredTasks length changes
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTasks.slice(start, start + pageSize)
  }, [filteredTasks, currentPage])

  // Memoize derived statistics so we don't recompute heavy aggregations
  // on every render. `getTaskStats` may scan the tasks array multiple
  // times; wrapping it in `useMemo` ensures it only runs when `tasks`
  // changes.
  const stats = useMemo(() => getTaskStats(tasks), [tasks])

  // Stabilize the search change handler so a new function reference
  // isn't passed to `SearchBar` on every render. This lets `SearchBar`
  // be wrapped in `React.memo` and avoid unnecessary re-renders.
  const handleSearchChange = useCallback(
    (search: string) => {
      setFilters((prev) => ({ ...prev, search }))
    },
    [setFilters],
  )

  // Toggle selection for a single task id
  const toggleSelect = useCallback((taskId: string) => {
    setSelectedIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    )
  }, [])

  // Select or deselect all tasks on current page
  const toggleSelectAllOnPage = useCallback(() => {
    const pageIds = paginatedTasks.map((t) => t.id)
    const allSelected = pageIds.every((id) => selectedIds.includes(id))

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)))
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])])
    }
  }, [paginatedTasks, selectedIds])

  // Bulk actions handlers come from the `useTasks` facade above.

  const bulkDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    bulkDelete(selectedIds)
    setRecentActivity((prev) => [
      {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        message: `Deleted ${selectedIds.length} tasks`,
      },
      ...prev,
    ])
    setSelectedIds([])
  }, [bulkDelete, selectedIds])

  const bulkCompleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    bulkUpdate(selectedIds, { completed: true })
    setRecentActivity((prev) => [
      {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        message: `Completed ${selectedIds.length} tasks`,
      },
      ...prev,
    ])
    setSelectedIds([])
  }, [bulkUpdate, selectedIds])

  // Supplemental stats: tasks created in last 7 days
  const tasksThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return tasks.filter((t) => new Date(t.createdAt).getTime() >= weekAgo)
      .length
  }, [tasks])

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={stat.key}
          >
            <div
              className={[
                'mb-4 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold',
                stat.tone,
              ].join(' ')}
            >
              {stat.label}
            </div>
            <p className="text-3xl font-semibold text-slate-950">
              {stats[stat.key]}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid content-start gap-4">
          <div className="grid gap-3">
            <SearchBar onChange={handleSearchChange} value={filters.search} />
            <Filters filters={filters} onChange={setFilters} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={
                    paginatedTasks.length > 0 &&
                    paginatedTasks.every((t) => selectedIds.includes(t.id))
                  }
                  onChange={() => toggleSelectAllOnPage()}
                  className="mr-2 h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-600">Select page</span>
              </label>
              <button
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                onClick={bulkCompleteSelected}
                disabled={selectedIds.length === 0}
                type="button"
              >
                Complete selected
              </button>
              <button
                className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
                onClick={bulkDeleteSelected}
                disabled={selectedIds.length === 0}
                type="button"
              >
                Delete selected
              </button>
              <div className="text-sm text-slate-500">
                {selectedIds.length} selected
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-md px-2 py-1 border"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                type="button"
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <div className="text-sm text-slate-600">
                Page {currentPage} / {totalPages}
              </div>
              <button
                className="rounded-md px-2 py-1 border"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                type="button"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-3 w-full max-w-lg rounded bg-slate-100" />
              <div className="h-3 w-3/4 rounded bg-slate-100" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
              {error}
            </div>
          ) : (
            <TaskList
              emptyMessage={getEmptyMessage(tasks.length > 0)}
              onDelete={deleteTask}
              onToggleCompleted={toggleTaskCompleted}
              onUpdate={updateTask}
              tasks={paginatedTasks}
              selectedIds={selectedIds}
              onToggleSelect={(id) => toggleSelect(id)}
            />
          )}
        </div>

        <aside className="grid content-start gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Add task
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Synced through the tasks API.
                </p>
              </div>
            </div>
            <TaskForm onSubmit={createTask} />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Completion rate
            </p>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-teal-600"
                style={{ width: `${String(stats.completionRate)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {stats.completionRate}% of all tasks are complete.
            </p>
            <div className="mt-4 border-t pt-3">
              <p className="text-sm font-medium text-slate-700">Statistics</p>
              <div className="mt-2 text-sm text-slate-600">
                {tasksThisWeek} tasks created in the last 7 days
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {filteredTasks.length} tasks match current filters
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Recent activity
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {recentActivity.length === 0 ? (
                <div className="text-sm text-slate-500">No recent activity</div>
              ) : (
                recentActivity.slice(0, 6).map((item) => (
                  <div key={item.id} className="text-sm text-slate-600">
                    <span className="font-medium">
                      {new Date(item.at).toLocaleString()}:
                    </span>{' '}
                    {item.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
