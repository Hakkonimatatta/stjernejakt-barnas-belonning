import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  onAddChild: (child: Omit<Child, "id" | "points">) => void;
  language: Language;
  onChangeLanguage: (language: Language) => void;
}

const Home = ({ children, onSelectChild, onAddChild, language, onChangeLanguage }: HomeProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAvatar, setChildAvatar] = useState("");
  const [errors, setErrors] = useState<{ name?: string; avatar?: string }>({});
  const { playWelcomeSound } = useWelcomeSound();

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
    navigate("/tasks");
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
      className="min-h-screen p-6 flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: `url(${homeBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <h1 className="font-bold text-primary">
            <span className="inline-flex items-center justify-center gap-2 text-4xl sm:text-5xl md:text-6xl leading-tight whitespace-nowrap">
              <span aria-hidden>⭐</span>
              <span>{t("appTitle")}</span>
              <span aria-hidden>⭐</span>
            </span>
          </h1>
          <p className="text-xl text-foreground">{t("whoIsReady")}</p>
        </div>

        <div className="space-y-4">
          {children.map((child) => (
            <Card key={child.id} className="p-6 bg-card border-4 border-border shadow-lg">
              <div className="flex items-center gap-6">
                <div className="text-7xl">{child.avatar}</div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-card-foreground mb-2">{child.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl">⭐</span>
                    <span className="text-2xl font-bold text-star">{child.points}</span>
                    <span className="text-lg text-muted-foreground">{t("points")}</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => handleSelect(child.id)}
                className="w-full mt-4 h-16 text-2xl font-bold bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {t("begin")}
              </Button>
            </Card>
          ))}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Card className="p-6 bg-card/50 border-4 border-dashed border-border hover:bg-card hover:shadow-lg transition-all cursor-pointer">
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                  <div className="text-6xl">➕</div>
                  <p className="text-xl font-bold text-muted-foreground">{t("addChild")}</p>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md flex flex-col max-h-[90vh]">
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
                className="w-full h-14 text-lg font-bold bg-success text-white hover:bg-success/90 flex-shrink-0"
              >
                {t("add")}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate("/parent")}
          className="w-full h-12 text-lg"
        >
          {t("parentMode")}
        </Button>

        <div className="flex gap-3">
          <Button
            onClick={() => onChangeLanguage("no")}
            variant={language === "no" ? "default" : "outline"}
            className="flex-1 h-12 text-lg font-bold"
          >
            {t("norwegian")}
          </Button>
          <Button
            onClick={() => onChangeLanguage("en")}
            variant={language === "en" ? "default" : "outline"}
            className="flex-1 h-12 text-lg font-bold"
          >
            {t("english")}
          </Button>
        </div>
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
            className="w-full h-12 text-lg mt-4"
          >
            {t("ok")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
