import { createFileRoute, Outlet, redirect, useRouterState, Link } from '@tanstack/react-router';
import { getSessionFn } from '#/lib/auth.functions';
import { getSettingsFn } from '#/lib/settings.functions';
import { authClient } from '#/lib/auth-client';
import { BrandLockup } from '#/components/brand';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '#/components/ui/sidebar';
import { Separator } from '#/components/ui/separator';
import { Button } from '#/components/ui/button';
import {
  LayoutDashboard,
  TrendingUp,
  LifeBuoy,
  Settings as SettingsIcon,
  ExternalLink,
  LogOut,
} from 'lucide-react';

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async () => {
    const session = await getSessionFn();

    if (!session) {
      throw redirect({ to: '/login' });
    }

    return { session };
  },
  loader: async () => {
    const settings = await getSettingsFn();
    return { settings };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { settings } = Route.useLoaderData();
  const { data: session } = authClient.useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isOnboarding = pathname.startsWith('/onboarding');

  if (isOnboarding) {
    return <Outlet />;
  }

  const navItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Analytics',
      url: '/analytics',
      icon: TrendingUp,
    },
    {
      title: 'Support',
      url: '/dashboard/support',
      icon: LifeBuoy,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-border/50 px-6 py-4">
          <BrandLockup shopName={settings.shopName} />
        </SidebarHeader>
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url !== '/dashboard' && pathname.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/" className="flex items-center gap-3">
                      <ExternalLink className="size-4" />
                      <span>Storefront</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-border/50 p-4">
          <div className="flex flex-col gap-2">
            {session?.user && (
              <div className="max-w-full truncate rounded-lg border border-border/80 bg-card px-3 py-2 text-xs text-muted-foreground">
                <span className="font-semibold block text-foreground truncate">Logged in as</span>
                <span className="truncate block">{session.user.email}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                void authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = '/login';
                    },
                  },
                });
              }}
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground capitalize">
              {pathname.split('/').filter(Boolean).pop() || 'Dashboard'}
            </span>
          </div>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
