import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const isBrowser = typeof document !== 'undefined';

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  });

  if (isBrowser) {
    import('nprogress').then(({ default: NProgress }) => {
      import('nprogress/nprogress.css');
      NProgress.configure({ showSpinner: false });

      router.subscribe('onBeforeNavigate', ({ pathChanged }) => {
        if (pathChanged) NProgress.start();
      });

      router.subscribe('onResolved', () => {
        NProgress.done();
      });
    });
  }

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
