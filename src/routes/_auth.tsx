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
        <section className="relative hidden overflow-hidden bg-muted lg:block">
          <img
            src="/auth/side-image.png"
            alt="Payshelf Workspace"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.6)] pointer-events-none" />
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
