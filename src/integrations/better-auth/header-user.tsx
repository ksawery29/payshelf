import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="size-9 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? 'User avatar'}
            className="size-9 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground">
            {session.user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void authClient.signOut()
          }}
        >
          Sign out
        </Button>
      </div>
    )
  }

  return null
}
