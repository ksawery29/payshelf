import { createFileRoute } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="flex w-full flex-row justify-center">
      <p>
        No products yet
      </p>

      <Button>
        Create Product
      </Button>
    </div>
  )
}
