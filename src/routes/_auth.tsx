import { createFileRoute, Outlet } from '@tanstack/react-router';
import { BrandLockup, BrandMark } from '#/components/brand';

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-[100dvh] bg-background px-4 py-6 sm:p-6">
      <main
        id="main-content"
        className="app-surface mx-auto grid min-h-[calc(100dvh-3rem)] max-w-6xl overflow-hidden lg:grid-cols-[1.05fr_0.95fr]"
      >
        <section className="relative hidden overflow-hidden bg-primary p-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark className="bg-primary-foreground text-primary" />
            <span className="font-heading text-base font-semibold tracking-tight">Payshelf</span>
          </div>

          <div className="max-w-md">
            <p className="mb-4 w-fit rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80">
              Seller console
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-[-0.03em] text-balance">
              Checkout, delivery, and product ops in one quiet workspace.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/68">
              Manage your shelf, track revenue, and hand off secure access links without rebuilding
              payment plumbing.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm font-medium text-white/85">Today</span>
              <span className="rounded-md bg-emerald-400/15 px-2 py-1 text-xs font-medium text-emerald-200">
                +18.4%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                ['Revenue', '$2,418'],
                ['Orders', '37'],
                ['Products', '12'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-white/48">{label}</p>
                  <p className="metric-number mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-background/80 p-5 sm:p-10">
          <div className="w-full max-w-md">
            <BrandLockup className="mb-8 justify-center lg:hidden" />
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}
