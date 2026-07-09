import { useRef, useState } from 'react';
import { Label } from '#/components/ui/label';
import { UploadCloud, X, FileCheck, ImageIcon } from 'lucide-react';
import { cn } from '#/lib/utils';

interface FileUploadProps {
  id: string;
  label: string;
  blobType: 'image' | 'file';
  /** accepted MIME types, e.g. "image/*" or "*" */
  accept?: string;
  /** current blob URL (from DB / after upload) */
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  required?: boolean;
}

/**
 * Drag-and-drop / click-to-browse file upload input.
 * Uploads to /api/blob-upload (POST multipart) and calls onChange with the
 * resulting Vercel Blob URL.
 */
export function FileUpload({
  id,
  label,
  blobType,
  accept,
  value,
  onChange,
  hint,
  required,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const isImage = blobType === 'image';

  async function uploadFile(file: File) {
    setError('');
    setUploading(true);
    setProgress(0);

    // Fake smooth progress while the real upload runs
    const ticker = setInterval(() => {
      setProgress((p) => Math.min(p + 4, 85));
    }, 80);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('blobType', blobType);

      const res = await fetch('/api/blob-upload', {
        method: 'POST',
        body: form,
      });

      clearInterval(ticker);

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `Upload failed (${res.status})`);
      }

      const body = (await res.json()) as { url: string };
      setProgress(100);
      onChange(body.url);
    } catch (err) {
      clearInterval(ticker);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  }

  /** Derive a short display name from a blob URL */
  function getDisplayName(url: string) {
    try {
      const parts = new URL(url).pathname.split('/');
      const raw = parts[parts.length - 1] ?? url;
      // strip uuid prefix (36 chars + dash)
      return raw.length > 37 ? raw.slice(37) : raw;
    } catch {
      return url;
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleFileChange}
        aria-label={label}
      />

      {/* Drop zone / preview */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'group relative flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          dragging
            ? 'border-primary bg-primary/5'
            : value
              ? 'border-border/80 bg-muted/40 hover:border-primary/50 hover:bg-muted/60'
              : 'border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/40',
          uploading && 'pointer-events-none opacity-75'
        )}
        aria-busy={uploading}
      >
        {/* Image preview */}
        {value && isImage ? (
          <div className="relative w-full overflow-hidden rounded-lg">
            <img
              src={value}
              alt="Product image preview"
              className="mx-auto max-h-40 rounded-lg object-cover shadow-sm"
            />
            <button
              type="button"
              onClick={clearValue}
              className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-background/90 shadow-sm transition-opacity hover:bg-background"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : value ? (
          /* File set (non-image) */
          <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/80 bg-background/70 px-3 py-2.5 text-left">
            <div className="flex min-w-0 items-center gap-2.5">
              <FileCheck className="size-4 shrink-0 text-emerald-600" />
              <span className="truncate text-sm font-medium text-foreground">
                {getDisplayName(value)}
              </span>
            </div>
            <button
              type="button"
              onClick={clearValue}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Remove file"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          /* Empty state */
          <>
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform duration-200 group-hover:scale-105">
              {isImage ? <ImageIcon className="size-5" /> : <UploadCloud className="size-5" />}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                {dragging ? 'Drop to upload' : 'Click or drag & drop'}
              </p>
              {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
            </div>
          </>
        )}

        {/* Progress bar */}
        {uploading && (
          <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-xl">
            <div
              className="h-full bg-primary transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Uploading label */}
        {uploading && (
          <p className="text-xs text-muted-foreground">
            Uploading… {progress < 90 ? `${progress}%` : 'almost done'}
          </p>
        )}
      </button>

      {error && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
