import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute('/api/version')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(JSON.stringify({ version: '0.0.1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
});