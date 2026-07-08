import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: session } = authClient.useSession()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <h1 className="font-heading text-lg font-semibold tracking-tight">
            Payshelf
          </h1>
          <div className="flex items-center gap-3">
            {session?.user && (
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = '/login'
                    },
                  },
                })
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">No products yet</p>
          <Button className="mt-4">Create Product</Button>
        </div>
      </main>
    </div>
  )
}
