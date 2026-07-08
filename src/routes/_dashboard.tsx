import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSessionFn } from '#/lib/auth.functions'

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async () => {
    const session = await getSessionFn()

    if (!session) {
      throw redirect({ to: '/login' })
    }

    return { session }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  return <Outlet />
}
