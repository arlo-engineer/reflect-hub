"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Edit3, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onToggle, onClose }: MobileNavigationProps) {
  const navItems = [
    { icon: Home, label: "ホーム", href: "/" },
    { icon: Edit3, label: "振り返り作成", href: "/reflection" },
    { icon: Settings, label: "設定", href: "/settings" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="sm:hidden fixed top-4 left-4 z-50 p-2 bg-background border border-border shadow-sm"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Navigation Panel */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out sm:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Reflect Hub</h2>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors touch-manipulation"
                onClick={onClose}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </a>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-3 text-sm font-medium touch-manipulation"
              onClick={onClose}
            >
              <LogOut className="h-5 w-5" />
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook for managing mobile navigation state
export function useMobileNavigation() {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Close on route change (if using Next.js router)
  React.useEffect(() => {
    const handleRouteChange = () => close();
    
    // Add router event listener if needed
    // router.events.on('routeChangeStart', handleRouteChange);
    
    return () => {
      // router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);

  return {
    isOpen,
    toggle,
    close,
  };
}