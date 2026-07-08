import { Link } from "@tanstack/react-router";

export function Footer({ shopName }: { shopName?: string | null }) {
  const currentYear = new Date().getFullYear();
  const name = shopName || "My Shop";

  return (
    <footer className="border-t border-border/80 bg-background/50 backdrop-blur-md py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div>
          &copy; {currentYear} {name}. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
