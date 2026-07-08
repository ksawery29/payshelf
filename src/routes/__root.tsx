import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ThemeProvider } from "@/components/theme-provider";

import appCss from "../styles.css?url";
import { ModeToggle } from "#/components/ui/mode-toggle";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Payshelf",
      },
      {
        name: "description",
        content: "A clean storefront and checkout layer for digital products.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ThemeProvider>
        <head>
          <HeadContent />
        </head>
        <body>
          <div className="fixed bottom-4 left-4">
            <ModeToggle />
          </div>

          <a href="#main-content" className="skip-link">
            Skip to content
          </a>

          {children}

          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
        </body>
      </ThemeProvider>
    </html>
  );
}
