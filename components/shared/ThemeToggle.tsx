"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const cycleTheme = () => {
    let newTheme = "light";
    if (theme === "light") newTheme = "dark";
    else if (theme === "dark") newTheme = "system";
    else newTheme = "light";
    
    setTheme(newTheme);
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="transition-all relative"
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      {theme === "system" && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-background" title="System Theme Active" />
      )}
      <span className="sr-only">Toggle theme (current: {theme})</span>
    </Button>
  );
}
