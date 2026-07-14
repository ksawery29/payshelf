import { createFileRoute } from "@tanstack/react-router"
import fs from 'node:fs'
import path from 'node:path'

export const Route = createFileRoute('/api/version')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const versionPath = path.resolve(process.cwd(), '../version.txt');
          const version = fs.readFileSync(versionPath, 'utf-8').trim();
          return new Response(JSON.stringify({ version }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (err) {
          return new Response(JSON.stringify({ version: '0.0.1' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});