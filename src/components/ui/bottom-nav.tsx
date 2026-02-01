import { Home, ListTodo, ShoppingCart, UserCog } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Language } from "@/lib/i18n";

type BottomNavItem = {
  label: string;
  path?: string;
  icon?: typeof Home;
  emoji?: string;
  onClick?: () => void;
  active?: boolean;
};

interface BottomNavProps {
  language?: Language;
  onChangeLanguage?: (language: Language) => void;
  showLanguageToggle?: boolean;
}

export function BottomNav({ language, onChangeLanguage, showLanguageToggle }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/" || location.pathname === "/home";
  const isTasksOrShop = location.pathname === "/tasks" || location.pathname === "/shop";
  const showLang = Boolean(showLanguageToggle && isHome && language && onChangeLanguage);

  const navItems: BottomNavItem[] = showLang
    ? [
        { label: "Hjem", icon: Home, path: "/" },
        {
          label: "Norsk",
          emoji: "🇳🇴",
          onClick: () => onChangeLanguage?.("no"),
          active: language === "no",
        },
        {
          label: "English",
          emoji: "🇬🇧",
          onClick: () => onChangeLanguage?.("en"),
          active: language === "en",
        },
        { label: "Foreldre", icon: UserCog, path: "/parent" },
      ]
    : isTasksOrShop
      ? [
          { label: "Hjem", icon: Home, path: "/" },
          { label: "⭐ Stjernejobb ⭐", onClick: undefined, active: false },
          { label: "Foreldre", icon: UserCog, path: "/parent" },
        ]
      : [
          { label: "Hjem", icon: Home, path: "/" },
          { label: "Oppgaver", icon: ListTodo, path: "/tasks" },
          { label: "Butikk", icon: ShoppingCart, path: "/shop" },
          { label: "Foreldre", icon: UserCog, path: "/parent" },
        ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t-2 border-border/50 flex justify-around items-center h-16 shadow-soft md:hidden">
      {navItems.map(({ label, icon: Icon, path, emoji, onClick, active }) => {
        const isActive =
          typeof active === "boolean"
            ? active
            : location.pathname === path || (path === "/" && location.pathname === "/home");
        return (
          <button
            key={path ?? label}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative",
              isActive 
                ? "text-primary font-bold scale-110" 
                : "text-muted-foreground hover:text-primary hover:scale-105",
              !path && !onClick ? "cursor-default" : ""
            )}
            aria-label={label}
            onClick={onClick ?? (path ? () => navigate(path) : undefined)}
            type="button"
          >
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
            )}
            {Icon ? (
              <Icon
                className={cn(
                  "w-6 h-6 mb-1 transition-all duration-300",
                  isActive ? "drop-shadow-lg" : ""
                )}
              />
            ) : (
              <span className={cn("text-2xl mb-1", isActive ? "drop-shadow-lg" : "")}>{emoji}</span>
            )}
            <span
              className={cn(
                "text-xs leading-none",
                label.includes("Stjernejobb")
                  ? "text-2xl sm:text-3xl font-bold text-primary whitespace-nowrap inline-flex items-center gap-1"
                  : ""
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
