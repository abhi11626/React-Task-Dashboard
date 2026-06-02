import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Tasks', to: '/' },
  { label: 'Calendar', to: '/' },
  { label: 'Reports', to: '/' },
] as const

// app/layouts defines durable page chrome shared across routed pages.
export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-slate-900/95 px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="text-xs font-semibold uppercase text-teal-300">
                TaskFlow
              </p>
              <h1 className="mt-1 text-xl font-semibold text-white">
                Workspace
              </h1>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200 lg:mt-6 lg:inline-block">
              Online
            </span>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto lg:mt-8 lg:flex-col lg:overflow-visible">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  [
                    'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white',
                  ].join(' ')
                }
                key={item.label}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">Task Management</p>
                <h2 className="text-2xl font-semibold text-white">
                  Daily Dashboard
                </h2>
              </div>
              <a
                href="#task-form"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                New task
              </a>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
