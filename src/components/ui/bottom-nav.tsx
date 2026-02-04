import { Home, ListTodo, ShoppingCart, UserCog } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Child } from "@/types";

type BottomNavItem = {
  label: string;
  path?: string;
  icon?: typeof Home;
  emoji?: string;
  onClick?: () => void;
  active?: boolean;
};

interface BottomNavProps {
  childrenProfiles?: Child[];
  onSelectChild?: (childId: string) => void;
  hasSelectedChild?: boolean;
}

export function BottomNav({ childrenProfiles = [], onSelectChild, hasSelectedChild = false }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string>("/tasks");
  const navItems: BottomNavItem[] = [
    { label: "Hjem", icon: Home, path: "/" },
    { label: "Oppdrag", icon: ListTodo, path: "/tasks" },
    { label: "Butikk", icon: ShoppingCart, path: "/shop" },
    { label: "Foreldre", icon: UserCog, path: "/parent" },
  ];

  const shouldPickChild = (path?: string) =>
    (path === "/tasks" || path === "/shop") && !hasSelectedChild && childrenProfiles.length > 0 && onSelectChild;

  const handleNav = (path?: string) => {
    if (!path) return;
    if (shouldPickChild(path)) {
      if (childrenProfiles.length === 1) {
        onSelectChild?.(childrenProfiles[0].id);
        navigate(path);
        return;
      }
      setPendingPath(path);
      setPickerOpen(true);
      return;
    }
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t-2 border-border/50 flex justify-around items-center h-16 shadow-soft">
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
            onClick={onClick ?? (path ? () => handleNav(path) : undefined)}
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
            <span className={cn("text-xs leading-none")}>
              {label}
            </span>
          </button>
        );
      })}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Velg barn</DialogTitle>
          </DialogHeader>
          <div
            className={cn(
              "grid gap-3",
              childrenProfiles.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}
          >
            {childrenProfiles.map((child) => (
              <Button
                key={child.id}
                variant="outline"
                className="h-20 flex flex-col gap-1"
                onClick={() => {
                  onSelectChild?.(child.id);
                  setPickerOpen(false);
                  navigate(pendingPath);
                }}
              >
                <span className="text-3xl">{child.avatar}</span>
                <span className="text-sm font-semibold">{child.name}</span>
              </Button>
            ))}
          </div>
          {childrenProfiles.length === 0 && (
            <Button onClick={() => navigate("/")}>Gå til hjem</Button>
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
}