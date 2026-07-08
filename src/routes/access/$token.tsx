import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db } from "#/db";
import { purchase, product } from "#/db/schema";
import { eq } from "drizzle-orm";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { BrandLockup } from "#/components/brand";
import { Card, CardContent, CardFooter } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  AlertTriangle,
  Download,
  FileArchive,
  Mail,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

const getAccessFn = createServerFn({ method: "GET" })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const results = await db
      .select({
        purchaseId: purchase.id,
        status: purchase.status,
        customerEmail: purchase.customerEmail,
        productName: product.name,
        productDescription: product.description,
        productImageUrl: product.imageUrl,
        productFilePath: product.filePath,
      })
      .from(purchase)
      .innerJoin(product, eq(purchase.productId, product.id))
      .where(eq(purchase.accessToken, data.token))
      .limit(1);

    if (results.length === 0) {
      return { found: false as const };
    }

    const row = results[0];

    if (row.status !== "active") {
      return {
        found: true as const,
        revoked: true as const,
        reason: row.status as "refunded" | "disputed",
        productName: row.productName,
      };
    }

    return {
      found: true as const,
      revoked: false as const,
      productName: row.productName,
      productDescription: row.productDescription,
      productImageUrl: row.productImageUrl,
      productFilePath: row.productFilePath,
      customerEmail: row.customerEmail,
    };
  });

/**
 * Generates a short-lived presigned download URL for a private Vercel Blob.
 * Uses the issueSignedToken → presignUrl pattern so the client browser can
 * download directly from Vercel's CDN with a time-limited signed URL.
 * Falls back to returning the URL as-is for legacy (non-blob) paths.
 */
const getSignedDownloadUrlFn = createServerFn({ method: "POST" })
  .validator((data: { blobUrl: string }) => data)
  .handler(async ({ data }) => {
    const rwToken = process.env.PRIVATE_BLOB_READ_WRITE_TOKEN;
    if (!rwToken) throw new Error("PRIVATE_BLOB_READ_WRITE_TOKEN is not set");

    if (!data.blobUrl.includes(".private.blob.vercel-storage.com")) {
      return { url: data.blobUrl };
    }

    const { pathname: rawPathname } = new URL(data.blobUrl);

    // normalize: strip leading slash + decode percent-encoding
    // so this matches the actual stored pathname exactly
    const pathname = decodeURIComponent(rawPathname).replace(/^\//, "");

    const signedToken = await issueSignedToken({
      pathname,
      operations: ["get"],
      validUntil: Date.now() + 5 * 60 * 1000,
      token: rwToken,
    });

    const { presignedUrl } = await presignUrl(signedToken, {
      pathname,
      operation: "get",
      access: "private",
      validUntil: Date.now() + 5 * 60 * 1000,
    });

    return { url: presignedUrl };
  });

export const Route = createFileRoute("/access/$token")({
  loader: ({ params }) => getAccessFn({ data: { token: params.token } }),
  component: AccessPage,
});

function AccessPage() {
  const data = Route.useLoaderData();

  if (!data.found) {
    return (
      <AccessShell>
        <AccessState
          icon={<ShieldX className="size-7" strokeWidth={1.8} />}
          title="Link not found"
          description="This access link is invalid or has expired."
        />
      </AccessShell>
    );
  }

  if (data.revoked) {
    return (
      <AccessShell>
        <AccessState
          icon={<ShieldX className="size-7" strokeWidth={1.8} />}
          tone="destructive"
          title="Access revoked"
          description={`Your access to ${data.productName} was revoked because of a ${data.reason === "refunded" ? "refund" : "payment dispute"}.`}
        />
      </AccessShell>
    );
  }

  return (
    <AccessShell>
      <Card className="w-full max-w-2xl overflow-hidden bg-card/95 py-0">
        {data.productImageUrl ? (
          <div className="aspect-[16/8] overflow-hidden bg-muted">
            <img
              src={data.productImageUrl}
              alt={data.productName}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/8] items-center justify-center border-b border-border/80 bg-muted/70">
            <span className="flex size-14 items-center justify-center rounded-lg bg-card text-xl font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              {data.productName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <CardContent className="grid gap-6 p-6 sm:p-8">
          <div>
            <Badge className="mb-3 bg-accent text-accent-foreground">
              Purchased
            </Badge>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {data.productName}
            </h1>
            {data.productDescription && (
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {data.productDescription}
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailRow
              icon={<Mail className="size-4" />}
              label="Purchased by"
              value={data.customerEmail}
            />
            <DetailRow
              icon={<ShieldCheck className="size-4" />}
              label="Access status"
              value="Active"
            />
          </div>

          {!data.productFilePath && (
            <div className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/8 p-4 text-sm leading-6 text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <p>
                The download file has not been uploaded yet. Check this link
                again soon.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/80 bg-muted/30 p-5 sm:p-6">
          {data.productFilePath ? (
            <DownloadButton filePath={data.productFilePath} />
          ) : (
            <Button className="w-full" size="lg" variant="outline" disabled>
              <FileArchive className="size-4" data-icon="inline-start" />
              File pending
            </Button>
          )}
        </CardFooter>
      </Card>
    </AccessShell>
  );
}

function AccessShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <BrandLockup />
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-5xl items-center justify-center px-4 py-10 sm:px-6"
      >
        {children}
      </main>
    </div>
  );
}

function AccessState({
  icon,
  title,
  description,
  tone = "muted",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone?: "muted" | "destructive";
}) {
  return (
    <Card className="w-full max-w-lg bg-card/95 text-center">
      <CardContent className="flex flex-col items-center gap-5 py-12">
        <span
          className={
            tone === "destructive"
              ? "flex size-14 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
              : "flex size-14 items-center justify-center rounded-lg bg-muted text-muted-foreground"
          }
        >
          {icon}
        </span>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Back to store
        </Button>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-background/70 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function DownloadButton({ filePath }: { filePath: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    setError("");
    setLoading(true);
    try {
      const result = await getSignedDownloadUrlFn({
        data: { blobUrl: filePath },
      });
      window.location.href = result.url;
    } catch {
      setError("Could not generate download link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-2">
      <Button
        className="w-full"
        size="lg"
        onClick={() => void handleDownload()}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Preparing download…
          </span>
        ) : (
          <>
            <Download className="size-4" data-icon="inline-start" />
            Download file
          </>
        )}
      </Button>
      {error && (
        <p
          className="text-center text-xs font-medium text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
