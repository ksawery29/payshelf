import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { routeTree } from './routeTree.gen';

NProgress.configure({ showSpinner: false });

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  });

  router.subscribe('onBeforeNavigate', ({ pathChanged }) => {
    if (pathChanged) NProgress.start();
  });

  router.subscribe('onResolved', () => {
    NProgress.done();
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
