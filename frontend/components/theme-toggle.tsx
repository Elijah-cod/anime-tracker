"use client";

import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={`min-h-11 rounded-xl border border-line bg-surface text-sm ${compact ? "w-11" : "px-4"}`}>
        {compact ? <Moon className="mx-auto h-4 w-4" /> : "Theme"}
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Use light mode" : "Use dark mode"}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-sm font-medium text-subtle transition-colors hover:bg-muted hover:text-ink ${compact ? "w-11 px-0" : "px-4"}`}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!compact ? (isDark ? "Light mode" : "Dark mode") : null}
    </button>
  );
}
