import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Activity, Child, Task } from "@/types";
import { toast } from "sonner";
import { initializeAudioContext, playSuccessSequence } from "@/lib/audioManager";
import { Language, translate } from "@/lib/i18n";

interface TasksProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  currentPoints: number;
  enable24hReset: boolean;
  activities: Activity[];
  language: Language;
  children: Child[];
  onSelectChild: (childId: string) => void;
  hasSelectedChild: boolean;
}

const Tasks = ({
  tasks,
  onCompleteTask,
  currentPoints,
  enable24hReset,
  activities,
  language,
  children,
  onSelectChild,
  hasSelectedChild,
}: TasksProps) => {
  const BONUS_TASK_TARGET = 3;
  const BONUS_WINDOW_MS = 24 * 60 * 60 * 1000;
  const cleanupTimeout = useRef<number>();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [recentlyCompletedId, setRecentlyCompletedId] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [milestone, setMilestone] = useState<number | null>(null);

  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) =>
    translate(language, key, params);

  useEffect(() => {
    const now = Date.now();
    const completedRecent = activities.filter(
      (a) => a.type === "task" && now - a.timestamp <= BONUS_WINDOW_MS
    ).length;
    const percent = Math.min(100, Math.round((completedRecent / BONUS_TASK_TARGET) * 100));
    setProgressValue(percent);

    if (completedRecent >= BONUS_TASK_TARGET) {
      setMilestone(completedRecent);
      setTimeout(() => setMilestone(null), 2000);
    }
  }, [activities, BONUS_TASK_TARGET, BONUS_WINDOW_MS]);

  useEffect(() => {
    const welcomeKey = "stjernejakt_welcome_seen";
    const hasSeenWelcome = localStorage.getItem(welcomeKey);

    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem(welcomeKey, "true");
    }
  }, []);

  useEffect(() => {
    const timeoutId = cleanupTimeout.current;
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const playSuccessSound = () => {
    initializeAudioContext();
    void playSuccessSequence();
  };

  const triggerConfetti = async () => {
    try {
      const { fireConfetti } = await import("@/lib/confetti");
      fireConfetti();
    } catch (error) {
      console.error("Failed to load confetti:", error);
    }
  };

  const handleComplete = (task: Task) => {
    const canComplete = enable24hReset ? !task.completed : true;
    if (canComplete) {
      onCompleteTask(task.id);
      setRecentlyCompletedId(task.id);
      window.setTimeout(() => setRecentlyCompletedId(null), 650);
      playSuccessSound();
      void triggerConfetti();
      toast.success(t("taskCompleted", { points: task.points }), {
        duration: 2000,
      });
    } else {
      toast.info(t("timeLockHint"), { duration: 2500 });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-0 sm:p-0">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg grid grid-cols-[auto,1fr,auto] items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 border-b-2 border-border/30 shadow-soft">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          aria-label={t("back")}
          className="hover:bg-primary/10"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <span className="text-3xl sm:text-4xl font-bold text-primary text-center">{t("tasks")}</span>
        <div className="flex items-center gap-2 justify-self-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/shop")}
            className="text-base sm:text-lg font-semibold flex items-center gap-1 flex-shrink-0"
            aria-label={t("shop")}
          >
            <span className="text-xl sm:text-2xl">🛒</span>
            {t("shop")}
          </Button>
          <div className="flex items-center gap-1 bg-card/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full border-2 border-border/30 shadow-sm flex-shrink-0">
            <span className="text-lg">⭐</span>
            <span className="text-base font-bold text-star min-w-6 text-center">{currentPoints}</span>
          </div>
        </div>
      </div>

      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("welcomeTitle")}</DialogTitle>
            <DialogDescription className="text-base pt-4">{t("welcomeMessage")}</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowWelcome(false)} className="w-full mt-4">
            {t("ok")}
          </Button>
        </DialogContent>
      </Dialog>

      <div className="max-w-md mx-auto space-y-4 px-3 sm:px-0 py-3 sm:py-6 pb-28">
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
              <div className="text-6xl mb-4 animate-bounce-subtle">✨</div>
              <div className="text-xl font-semibold mb-2">{t("noTasksYet")}</div>
              <div className="text-muted-foreground mb-4">{t("addNewTask")}</div>
              <Button onClick={() => navigate("/parent")} className="w-full max-w-xs">
                {t("goToParentMode")}
              </Button>
            </div>
          ) : (
            tasks.map((task, index) => {
              const isCompleted = enable24hReset ? task.completed : false;
              return (
                <Card
                  key={task.id}
                  className={`p-2 sm:p-5 bg-gradient-to-br from-card to-card/80 border-2 transition-all duration-300 animate-slide-up ${
                    isCompleted
                      ? "border-success/50 opacity-80 bg-success/5"
                      : "border-border hover:border-primary/30 hover:shadow-xl hover:scale-[1.02]"
                  } ${recentlyCompletedId === task.id ? "animate-card-done" : ""}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div
                      className={`text-4xl sm:text-6xl transition-all duration-300 ${
                        !isCompleted ? "hover:scale-110" : "grayscale"
                      }`}
                    >
                      {task.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg sm:text-2xl font-bold mb-1 truncate ${
                          isCompleted ? "line-through text-muted-foreground" : "text-card-foreground"
                        }`}
                      >
                        {task.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-xl sm:text-3xl font-bold text-star">+{task.points}</span>
                        <span className="text-xs sm:text-base text-muted-foreground">{t("points")}</span>
                      </div>
                    </div>
                    {isCompleted ? (
                      <div className="text-3xl sm:text-4xl animate-pop">✅</div>
                    ) : (
                      <Button
                        onClick={() => handleComplete(task)}
                        className="h-12 sm:h-14 px-4 sm:px-6 text-base sm:text-lg font-bold bg-success text-white hover:bg-success/90"
                      >
                        ✓ {t("done")}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {tasks.length > 0 && (
          <div className="mt-8 mb-4">
            <div className="text-sm font-semibold text-primary mb-2">{t("bonusTaskMessage")}</div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-muted-foreground">{t("tasks")}</span>
              <span className="text-xs text-muted-foreground">
                {t("bonusProgress", {
                  count: Math.min(
                    BONUS_TASK_TARGET,
                    activities.filter((a) => a.type === "task" && Date.now() - a.timestamp <= BONUS_WINDOW_MS).length,
                  ),
                  total: BONUS_TASK_TARGET,
                })}
              </span>
            </div>
            <Progress value={progressValue} />
            {milestone && (
              <div className="flex items-center justify-center mt-2 animate-bounce text-2xl">
                {milestone === 5 && "🌟"}
                {milestone === 10 && "🏅"}
                {milestone === 15 && "🎉"}
                {milestone === 20 && "🚀"}
                <span className="ml-2 font-bold text-success">
                  {milestone} {t("done")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav
        childrenProfiles={children}
        onSelectChild={onSelectChild}
        hasSelectedChild={hasSelectedChild}
      />
    </div>
  );
};

export default Tasks;