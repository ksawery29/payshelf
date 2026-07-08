import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { getSessionFn, getHasUsersFn } from '#/lib/auth.server'
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

export const Route = createFileRoute('/_auth/setup')({
  beforeLoad: async () => {
    const [session, hasUsers] = await Promise.all([
      getSessionFn(),
      getHasUsersFn(),
    ])

    // If users already exist, setup is done — go to login
    if (hasUsers) {
      throw redirect({ to: '/login' })
    }

    // If already logged in, go to dashboard
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SetupPage,
})

function SetupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message ?? 'Could not create account')
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
        <CardTitle className="font-heading text-2xl">Set up your store</CardTitle>
        <CardDescription>
          Create your admin account to get started
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
            <Label htmlFor="setup-name">Name</Label>
            <Input
              id="setup-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-email">Email</Label>
            <Input
              id="setup-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-password">Password</Label>
            <Input
              id="setup-password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
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
                Creating account…
              </span>
            ) : (
              'Create account'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
