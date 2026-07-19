"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Crosshair } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notebook", label: "Notebook", icon: BookOpen },
  { href: "/focus", label: "Focus", icon: Crosshair },
];

export default function NavRail() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Side Rail */}
      <nav data-tour="nav" className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 flex-col items-center justify-center gap-6 z-[100]" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              data-tour={`nav-${item.label.toLowerCase()}`}
              className={`group relative h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                isActive
                  ? "bg-premium-text text-[var(--theme-bg)] shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "text-premium-muted hover:text-premium-text hover:bg-premium-border/30"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
              
              {/* Tooltip */}
              <span className="absolute left-14 px-3 py-1.5 rounded-md bg-premium-text text-[var(--theme-bg)] text-xs font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav data-tour="nav" className="md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t border-premium-border bg-[var(--theme-bg)]/90 backdrop-blur-lg" aria-label="Main navigation">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                data-tour={`nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? "text-premium-text" : "text-premium-muted"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] uppercase tracking-widest font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
