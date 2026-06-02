import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import { MainLayout } from '../layouts/MainLayout'

// Lazy-load page components to enable route-level code-splitting. This
// reduces the initial bundle size by deferring page code until the
// route is visited.
const Dashboard = lazy(() =>
  import('../../features/tasks/pages/Dashboard').then((m) => ({
    default: m.Dashboard,
  })),
)

// app/router owns route definitions and keeps page-level navigation out of feature components.
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div className="p-6">Loading...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
