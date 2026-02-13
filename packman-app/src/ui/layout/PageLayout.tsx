import * as React from "react";
import { cn } from "../../lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function PageLayout({
  children,
  className,
  title,
  subtitle,
}: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-app text-text-primary font-sans selection:bg-brand-primary/30">
      {/* Header / Nav could go here */}
      {(title || subtitle) && (
        <header className="px-8 py-6 border-b border-border-subtle bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {title}
              </h1>
            )}
            {subtitle && <p className="mt-1 text-text-secondary">{subtitle}</p>}
          </div>
        </header>
      )}

      <main className={cn("flex-1 px-8 py-8", className)}>
        <div className="max-w-5xl mx-auto h-full">{children}</div>
      </main>
    </div>
  );
}
