import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) => 
    translate(language, key, params);

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
      <div className="max-w-md mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => navigate("/")} className="text-sm sm:text-base h-10 sm:h-auto px-2 sm:px-4">
            {t("back")}
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold text-primary text-center">{t("tasks")}</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate("/shop")}
            className="h-10 sm:h-20 px-2 sm:px-6 text-sm sm:text-xl font-bold"
          >
            <span className="text-xl sm:text-3xl">🛒</span>
            <span className="hidden sm:inline ml-2">{t("shop")}</span>
          </Button>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className={`p-3 sm:p-5 bg-card border-4 shadow-lg transition-all ${
                task.completed 
                  ? "border-success opacity-75" 
                  : "border-border hover:shadow-xl"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="text-4xl sm:text-5xl flex-shrink-0">{task.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-card-foreground mb-1 break-words">
                    {task.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-star">{task.points}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">{t("points")}</span>
                  </div>
                </div>
                {task.completed ? (
                  <div className="text-3xl sm:text-4xl flex-shrink-0">{t("completed")}</div>
                ) : (
                  <Button
                    onClick={() => handleComplete(task)}
                    className="w-full sm:w-auto h-10 sm:h-14 px-4 sm:px-6 text-sm sm:text-lg font-bold bg-success text-white hover:bg-success/90"
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



