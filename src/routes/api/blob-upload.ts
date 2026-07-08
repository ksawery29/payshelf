import { createFileRoute } from '@tanstack/react-router'
import { put } from '@vercel/blob'

/**
 * POST /api/blob/upload
 * Accepts multipart form-data: { file: File, blobType: "image" | "file" }
 * Returns { url: string } — the Vercel Blob public/private URL.
 *
 * blobType "image"  → PUBLIC_BLOB_READ_WRITE_TOKEN  (access: public)
 * blobType "file"   → PRIVATE_BLOB_READ_WRITE_TOKEN (access: private)
 */
export const Route = createFileRoute('/api/blob-upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const blobType = formData.get('blobType') as string | null

        if (!file || !blobType) {
          return new Response(
            JSON.stringify({ error: 'Missing file or blobType' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          )
        }

        const isImage = blobType === 'image'
        const token = isImage
          ? process.env.PUBLIC_BLOB_READ_WRITE_TOKEN
          : process.env.PRIVATE_BLOB_READ_WRITE_TOKEN

        if (!token) {
          return new Response(
            JSON.stringify({
              error: isImage
                ? 'PUBLIC_BLOB_READ_WRITE_TOKEN is not configured'
                : 'PRIVATE_BLOB_READ_WRITE_TOKEN is not configured',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }

        const prefix = isImage ? 'products/images' : 'products/files'
        const pathname = `${prefix}/${crypto.randomUUID()}-${file.name}`
        const access = isImage ? 'public' : 'private'

        const blob = await put(pathname, file, {
          access,
          token,
          addRandomSuffix: false,
        })

        return new Response(JSON.stringify({ url: blob.url }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
