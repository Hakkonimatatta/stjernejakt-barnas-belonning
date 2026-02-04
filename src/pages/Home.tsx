import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Child } from "@/types";
import { toast } from "sonner";
import { z } from "zod";
import homeBackground from "@/assets/home-background.jpg";
import { useWelcomeSound } from "@/hooks/useWelcomeSound";
import { Language, translate } from "@/lib/i18n";

interface HomeProps {
  children: Child[];
  onSelectChild: (childId: string) => void;
  onAddChild: (child: Omit<Child, "id" | "points" | "tasks" | "rewards">) => void;
  language: Language;
  hasSelectedChild: boolean;
}

const Home = ({ children, onSelectChild, onAddChild, language, hasSelectedChild }: HomeProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAvatar, setChildAvatar] = useState("");
  const [errors, setErrors] = useState<{ name?: string; avatar?: string }>({});
  const [pointsPopId, setPointsPopId] = useState<string | null>(null);
  const { playWelcomeSound } = useWelcomeSound();
  const lastPointsRef = useState<Record<string, number>>({})[0];

  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) => 
    translate(language, key, params);

  const childSchema = z.object({
    name: z.string().trim().min(1, t("nameCannotBeEmpty")).max(30, t("nameTooLong")),
    avatar: z.string().trim().min(1, t("selectAvatarRequired")),
  });

  useEffect(() => {
    if (children.length === 0) {
      setWelcomeOpen(true);
    }
  }, [children.length]);

  useEffect(() => {
    children.forEach((child) => {
      const prev = lastPointsRef[child.id];
      if (prev !== undefined && prev !== child.points) {
        setPointsPopId(child.id);
        window.setTimeout(() => setPointsPopId((id) => (id === child.id ? null : id)), 500);
      }
      lastPointsRef[child.id] = child.points;
    });
  }, [children, lastPointsRef]);

  const avatars = [
    // Boys with skin tones
    "👦", "👦🏻", "👦🏼", "👦🏽", "👦🏾", "👦🏿",
    // Girls with skin tones
    "👧", "👧🏻", "👧🏼", "👧🏽", "👧🏾", "👧🏿",
    // Gender neutral with skin tones
    "🧒", "🧒🏻", "🧒🏼", "🧒🏽", "🧒🏾", "🧒🏿",
    // Babies with skin tones
    "👶", "👶🏻", "👶🏼", "👶🏽", "👶🏾", "👶🏿",
    // Blonde hair
    "👱‍♂️", "👱🏻‍♂️", "👱🏼‍♂️", "👱🏽‍♂️", "👱🏾‍♂️", "👱🏿‍♂️",
    "👱‍♀️", "👱🏻‍♀️", "👱🏼‍♀️", "👱🏽‍♀️", "👱🏾‍♀️", "👱🏿‍♀️",
    // Curly/red haired variants
    "🧑‍🦱", "👨‍🦱", "👩‍🦱", "🧑‍🦲", "👨‍🦲", "👩‍🦲",
    // Brown/white haired variants
    "🧑‍🦳", "👨‍🦳", "👩‍🦳",
    // Curly/afro hair
    "🧑🏻‍🦱", "👨🏻‍🦱", "👩🏻‍🦱", "🧑🏼‍🦱", "👨🏼‍🦱", "👩🏼‍🦱",
    "🧑🏽‍🦱", "👨🏽‍🦱", "👩🏽‍🦱", "🧑🏾‍🦱", "👨🏾‍🦱", "👩🏾‍🦱",
    "🧑🏿‍🦱", "👨🏿‍🦱", "👩🏿‍🦱",
    // Other faces
    "🧑", "👨", "👩",
    // Animals
    "🐻", "🐶", "🐱", "🦁", "🐼", "🦊", "🐯", "🐨", "🦌", "🐭", "🐹", "🦝", "🐸", "🦜", "🦆", "🦅", "🐢", "🐙", "🦑", "🦕", "🦖", "🐉",
    // Fantasy & nature
    "🦄", "🦋", "🐝", "🐞", "🦗", "🕷️", "⭐", "🌟", "💫", "🌈",
  ];

  const handleSelect = (childId: string) => {
    playWelcomeSound();
    onSelectChild(childId);
    navigate("/tasks", { state: { childId } });
  };

  const handleAddChild = () => {
    try {
      setErrors({});
      
      const validated = childSchema.parse({
        name: childName,
        avatar: childAvatar,
      });

      onAddChild({
        name: validated.name,
        avatar: validated.avatar,
      });

      setChildName("");
      setChildAvatar("");
      setOpen(false);
      toast.success(t("childAdded", { name: validated.name }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { name?: string; avatar?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof newErrors] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error(t("fillAllFields"));
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative p-0 sm:p-0"
      style={{
        backgroundImage: `url(${homeBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-background/80" />
      <div className="max-w-md w-full space-y-8 relative z-10 px-2 sm:px-0 py-4 sm:py-8">
        <div className="text-center space-y-2">
          <h1 className="font-bold text-primary">
            <span className="inline-flex w-full items-center justify-center gap-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight whitespace-nowrap">
              <span aria-hidden>⭐</span>
              <span>{t("appTitle")}</span>
              <span aria-hidden>⭐</span>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-foreground">{t("whoIsReady")}</p>
        </div>

        <div className="space-y-4 pb-20">
          {children.map((child, index) => (
            <Card 
              key={child.id} 
              className="p-6 bg-gradient-to-br from-card to-card/80 border-2 hover:border-primary/30 transform hover:scale-[1.02] transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-6">
                <div className="text-7xl transform hover:scale-110 transition-transform duration-300">{child.avatar}</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2 truncate" title={child.name}>{child.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl">⭐</span>
                    <span className={`text-2xl font-bold text-star ${pointsPopId === child.id ? "animate-pop" : ""}`}>{child.points}</span>
                    <span className="text-lg text-muted-foreground">{t("points")}</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => handleSelect(child.id)}
                size="lg"
                className="w-full mt-4 text-xl sm:text-2xl font-bold bg-[#F2C94C] hover:bg-[#E5BC3C] text-[#2B2200]"
              >
                {t("begin")} 🚀
              </Button>
            </Card>
          ))}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              {children.length === 0 ? (
                <button
                  className="fixed bottom-20 right-4 z-50 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full shadow-2xl w-16 h-16 flex items-center justify-center border-4 border-background hover:scale-110 hover:shadow-glow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-bounce-subtle"
                  aria-label={t("addChild")}
                  type="button"
                >
                  <Plus className="w-8 h-8" />
                </button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-lg font-semibold"
                >
                  {t("addChild")}
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="max-w-md w-[calc(100%-2rem)] flex flex-col max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl">{t("addNewChild")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 overflow-y-auto flex-1">
                <div>
                  <Label htmlFor="childName">{t("name")}</Label>
                  <Input
                    id="childName"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="h-12 text-lg"
                    maxLength={30}
                    autoFocus
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label>{t("selectAvatar")}</Label>
                  <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-2">
                    {avatars.map((avatar) => (
                      <Button
                        key={avatar}
                        type="button"
                        variant={childAvatar === avatar ? "default" : "outline"}
                        onClick={() => setChildAvatar(avatar)}
                        className="h-14 text-3xl flex-shrink-0"
                      >
                        {avatar}
                      </Button>
                    ))}
                  </div>
                  {errors.avatar && <p className="text-sm text-destructive mt-1">{errors.avatar}</p>}
                </div>
              </div>
              <Button
                onClick={handleAddChild}
                size="lg"
                className="w-full font-bold bg-[#F2C94C] hover:bg-[#E5BC3C] text-[#2B2200]"
              >
                {t("add")}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="h-2" />
      </div>

      <Dialog open={welcomeOpen} onOpenChange={setWelcomeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">{t("welcome")}</DialogTitle>
            <DialogDescription className="text-center text-lg pt-4 space-y-3">
              <p>{t("welcomeMessage1")}</p>
              <p>{t("welcomeMessage2")}</p>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setWelcomeOpen(false)}
            variant="primary"
            size="default"
            className="w-full text-lg mt-4 font-bold"
          >
              {t("ok")}
            </Button>
        </DialogContent>
      </Dialog>
      <BottomNav
        childrenProfiles={children}
        onSelectChild={onSelectChild}
        hasSelectedChild={hasSelectedChild}
      />
    </div>
  );
};

export default Home;
