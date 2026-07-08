import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { getSessionFn, getHasUsersFn } from '#/lib/auth.functions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: async () => {
    const [session, hasUsers] = await Promise.all([
      getSessionFn(),
      getHasUsersFn(),
    ])

    // If no users exist, redirect to setup (onboarding)
    if (!hasUsers) {
      throw redirect({ to: '/setup' })
    }

    // If already logged in, redirect to dashboard
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message ?? 'Invalid email or password')
        return
      }

      window.location.href = '/dashboard'
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="animate-in fade-in-0 slide-in-from-bottom-4 border-border/50 shadow-xl backdrop-blur duration-500">
      <CardHeader className="space-y-1">
        <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your admin account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in…
              </span>
            ) : (
              'Sign in'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
