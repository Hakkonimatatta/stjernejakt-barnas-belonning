import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Task } from "@/types";
import { toast } from "sonner";
import { initializeAudioContext, playSuccessSequence } from "@/lib/audioManager";
import { Language, translate } from "@/lib/i18n";

interface TasksProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  language: Language;
}

const Tasks = ({ tasks, onCompleteTask, language }: TasksProps) => {
  const cleanupTimeout = useRef<number>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);

  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) => 
    translate(language, key, params);

  // Check if this is the first visit for this child
  useEffect(() => {
    const childId = location.state?.childId;
    if (childId) {
      const welcomeKey = `stjernejakt_welcome_seen_${childId}`;
      const hasSeenWelcome = localStorage.getItem(welcomeKey);
      
      if (!hasSeenWelcome) {
        setShowWelcome(true);
        localStorage.setItem(welcomeKey, "true");
      }
    }
  }, [location.state?.childId]);

  useEffect(() => {
    const timeoutId = cleanupTimeout.current;
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const playSuccessSound = () => {
    // Initialize AudioContext on first user interaction (required for iOS)
    initializeAudioContext();
    
    // Play the success sequence
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
    if (!task.completed) {
      onCompleteTask(task.id);
      playSuccessSound();
      void triggerConfetti();
      toast.success(t("taskCompleted", { points: task.points }), {
        duration: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("welcomeTitle")}</DialogTitle>
            <DialogDescription className="text-base pt-4">
              {t("welcomeMessage")}
            </DialogDescription>
          </DialogHeader>
          <Button 
            onClick={() => setShowWelcome(false)}
            className="w-full mt-4"
          >
            {t("ok")}
          </Button>
        </DialogContent>
      </Dialog>

      <div className="max-w-md mx-auto space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => navigate("/")} className="text-sm sm:text-base h-10 sm:h-auto px-2 sm:px-4">
            {t("back")}
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold text-primary text-center">{t("tasks")}</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate("/shop")}
            className="h-10 sm:h-auto px-2 sm:px-6 text-sm sm:text-xl font-bold"
          >
            <span className="text-xl sm:text-3xl">🛒</span>
            <span className="hidden sm:inline ml-2">{t("shop")}</span>
          </Button>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className={`p-3 sm:p-5 bg-card border-2 sm:border-4 shadow-lg transition-all ${
                task.completed 
                  ? "border-success opacity-75" 
                  : "border-border hover:shadow-xl"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-4xl sm:text-5xl">{task.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-card-foreground mb-1 truncate">
                    {task.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-star">{task.points}</span>
                    <span className="text-sm text-muted-foreground">{t("points")}</span>
                  </div>
                </div>
                {task.completed ? (
                  <div className="text-4xl">{t("completed")}</div>
                ) : (
                  <Button
                    onClick={() => handleComplete(task)}
                    className="h-14 px-6 text-lg font-bold bg-success text-white hover:bg-success/90"
                  >
                    {t("done")}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tasks;



