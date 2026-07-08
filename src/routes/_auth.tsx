import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/40 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Payshelf
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your digital product platform
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
