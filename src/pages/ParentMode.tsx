import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Task, Reward, Child } from "@/types";
import EmojiPicker, { getSuggestedEmojis } from "@/components/EmojiPicker";
import { Language, translate } from "@/lib/i18n";

interface ParentModeProps {
  onResetTasks: (childId: string) => void;
  onResetTask: (childId: string, taskId: string) => void;
  onResetReward: (childId: string, rewardId: string) => void;
  onResetRewards: (childId: string) => void;
  onAddTask: (childId: string, task: Omit<Task, "id" | "completed">) => void;
  onDeleteTask: (childId: string, taskId: string) => void;
  onDeleteChild: (childId: string) => void;
  onAddReward: (childId: string, reward: Omit<Reward, "id" | "purchased">) => void;
  onDeleteReward: (childId: string, rewardId: string) => void;
  onAdjustPoints: (childId: string, points: number) => void;
  children: Child[];
  currentPin: string;
  onUpdatePin: (newPin: string) => void;
  language: Language;
  onChangeLanguage: (language: Language) => void;
}

const ParentMode = ({ 
  onResetTasks, 
  onResetTask, 
  onResetReward, 
  onResetRewards, 
  onAddTask, 
  onDeleteTask, 
  onDeleteChild, 
  onAddReward, 
  onDeleteReward, 
  onAdjustPoints, 
  children, 
  currentPin, 
  onUpdatePin,
  language,
  onChangeLanguage,
}: ParentModeProps) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [taskName, setTaskName] = useState("");
  const [taskIcon, setTaskIcon] = useState("");
  const [taskPoints, setTaskPoints] = useState("5");
  const [errors, setErrors] = useState<{ name?: string; icon?: string; points?: string }>({});
  const [rewardName, setRewardName] = useState("");
  const [rewardIcon, setRewardIcon] = useState("");
  const [rewardCost, setRewardCost] = useState("20");
  const [rewardErrors, setRewardErrors] = useState<{ name?: string; icon?: string; cost?: string }>({});
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pointsToDeduct, setPointsToDeduct] = useState<Record<string, string>>({});

  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) =>
    translate(language, key, params);

  const taskSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, t("taskNameCannotBeEmpty"))
          .max(50, t("taskNameTooLong")),
        icon: z.string().trim().min(1, t("selectIconRequired")),
        points: z
          .number()
          .int()
          .min(1, t("pointsMin"))
          .max(100, t("pointsMax")),
      }),
    [language]
  );

  const rewardSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, t("rewardNameCannotBeEmpty"))
          .max(50, t("rewardNameTooLong")),
        icon: z.string().trim().min(1, t("selectIconRequired")),
        cost: z
          .number()
          .int()
          .min(1, t("priceMin"))
          .max(1000, t("priceMax")),
      }),
    [language]
  );

  const totalTasks = useMemo(
    () => children.reduce((sum, child) => sum + child.tasks.length, 0),
    [children]
  );

  const totalRewards = useMemo(
    () => children.reduce((sum, child) => sum + child.rewards.length, 0),
    [children]
  );

  const selectedChild = children.find(c => c.id === selectedChildId);

  const handleUnlock = () => {
    if (pin === currentPin) {
      setUnlocked(true);
      toast.success(t("welcomeParent"));
    } else {
      toast.error(t("wrongPin"));
      setPin("");
    }
  };

  const handleResetTasks = () => {
    if (!selectedChildId) return;
    onResetTasks(selectedChildId);
    toast.success(t("allTasksReset"));
  };

  const handleAddTask = () => {
    if (!selectedChildId) return;
    try {
      setErrors({});
      
      const validated = taskSchema.parse({
        name: taskName,
        icon: taskIcon,
        points: Number(taskPoints),
      });

      onAddTask(selectedChildId, {
        name: validated.name,
        icon: validated.icon,
        points: validated.points,
      });
      
      setTaskName("");
      setTaskIcon("");
      setTaskPoints("5");
      toast.success(t("taskAdded"));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { name?: string; icon?: string; points?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof newErrors] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error(t("fillAllFieldsCorrectly"));
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedChildId) return;
    onDeleteTask(selectedChildId, taskId);
    toast.success(t("taskDeleted"));
  };

  const handleDeleteChild = (childId: string) => {
    onDeleteChild(childId);
    if (selectedChildId === childId) {
      setSelectedChildId(null);
    }
    toast.success(t("childRemoved"));
  };

  const handleAddReward = () => {
    if (!selectedChildId) return;
    try {
      setRewardErrors({});
      
      const validated = rewardSchema.parse({
        name: rewardName,
        icon: rewardIcon,
        cost: Number(rewardCost),
      });

      onAddReward(selectedChildId, {
        name: validated.name,
        icon: validated.icon,
        cost: validated.cost,
      });
      
      setRewardName("");
      setRewardIcon("");
      setRewardCost("20");
      toast.success(t("rewardAdded"));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { name?: string; icon?: string; cost?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof newErrors] = err.message;
          }
        });
        setRewardErrors(newErrors);
        toast.error(t("fillAllFieldsCorrectly"));
      }
    }
  };

  const handleDeleteReward = (rewardId: string) => {
    if (!selectedChildId) return;
    onDeleteReward(selectedChildId, rewardId);
    toast.success(t("rewardDeleted"));
  };

  const handleChangePin = () => {
    setPinError("");
    
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError(t("pinMustBe4Digits"));
      return;
    }
    
    if (newPin !== confirmPin) {
      setPinError(t("pinsDoNotMatch"));
      return;
    }
    
    onUpdatePin(newPin);
    setNewPin("");
    setConfirmPin("");
    toast.success(t("pinUpdated"));
  };

  const handleAdjustPointsLocal = (direction: "add" | "deduct") => {
    if (!selectedChild) return;

    const raw = pointsToDeduct[selectedChild.id] || "0";
    const points = parseInt(raw, 10);

    if (!Number.isFinite(points) || points <= 0) {
      toast.error(t("enterValidPoints"));
      return;
    }

    if (direction === "deduct") {
      if (points > selectedChild.points) {
        toast.error(t("cannotDeductMore"));
        return;
      }
      onAdjustPoints(selectedChild.id, -points);
      toast.success(t("pointsDeducted", { points, name: selectedChild.name }));
    } else {
      onAdjustPoints(selectedChild.id, points);
      toast.success(t("pointsAdded", { points, name: selectedChild.name }));
    }

    setPointsToDeduct({ ...pointsToDeduct, [selectedChild.id]: "" });
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 bg-card border-4 border-border shadow-lg">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary mb-2">{t("parentMode")}</h1>
              <p className="text-muted-foreground">{t("enterPin")}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="pin">{t("pinCode")}</Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleUnlock()}
                  placeholder="****"
                  maxLength={4}
                  className="text-2xl text-center h-14"
                />
              </div>
              
              <Button 
                onClick={handleUnlock}
                className="w-full h-14 text-lg font-bold"
              >
                {t("unlock")}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full h-12 text-lg"
              >
                {t("cancel")}
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              {t("defaultPin")}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-primary">{t("parentMode")}</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            {t("back")}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onChangeLanguage("no")}
            variant={language === "no" ? "default" : "outline"}
            className="h-10"
          >
            {t("norwegian")}
          </Button>
          <Button
            onClick={() => onChangeLanguage("en")}
            variant={language === "en" ? "default" : "outline"}
            className="h-10"
          >
            {t("english")}
          </Button>
          <Button
            onClick={() => navigate("/sync")}
            className="h-10 flex-1"
            variant="secondary"
          >
            {t("syncDevices")}
          </Button>
        </div>

        {/* Velg barn */}
        <Card className="p-6 bg-card border-4 border-border shadow-lg">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">{t("selectChildToManage")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChildId === child.id ? "default" : "outline"}
                className="h-20 flex flex-col gap-1"
                onClick={() => setSelectedChildId(child.id)}
              >
                <span className="text-3xl">{child.avatar}</span>
                <span className="text-sm font-semibold">{child.name}</span>
              </Button>
            ))}
          </div>
        </Card>

        {selectedChild && (
          <>
            <Card className="p-6 bg-card border-4 border-border shadow-lg">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                {t("tasksForChild", { name: selectedChild.name })}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taskName">{t("taskName")}</Label>
                  <Input
                    id="taskName"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder={t("taskNamePlaceholder")}
                    className="h-12 text-lg"
                    maxLength={50}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label>{t("selectIcon")}</Label>
                  <EmojiPicker
                    value={taskIcon}
                    onChange={setTaskIcon}
                    placeholder={t("clickToSelectEmoji")}
                    quickEmojis={getSuggestedEmojis(taskName)}
                  />
                  {errors.icon && <p className="text-sm text-destructive mt-1">{errors.icon}</p>}
                </div>

                <div>
                  <Label htmlFor="taskPoints">{t("pointValue")}</Label>
                  <Input
                    id="taskPoints"
                    type="number"
                    value={taskPoints}
                    onChange={(e) => setTaskPoints(e.target.value)}
                    min="1"
                    max="100"
                    className="h-12 text-lg"
                  />
                  {errors.points && <p className="text-sm text-destructive mt-1">{errors.points}</p>}
                </div>

                <Button
                  onClick={handleAddTask}
                  className="w-full h-14 text-lg font-bold bg-success text-white hover:bg-success/90"
                >
                  {t("addTask")}
                </Button>
              </div>

              <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-muted-foreground">{t("existingTasks")}:</h3>
                {selectedChild.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{task.icon}</span>
                      <div>
                        <p className="font-semibold text-card-foreground">{task.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.points} {t("points")} {task.completed && t("completed")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onResetTask(selectedChildId!, task.id);
                            toast.success(t("taskReset"));
                          }}
                        >
                          {t("reset")}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Slett
                      </Button>
                    </div>
                  </div>
                ))}
                {selectedChild.tasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">{t("noTasksYet")}</p>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-card border-4 border-border shadow-lg">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                {t("rewardsForChild", { name: selectedChild.name })}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rewardName">{t("rewardName")}</Label>
                  <Input
                    id="rewardName"
                    value={rewardName}
                    onChange={(e) => setRewardName(e.target.value)}
                    placeholder={t("rewardNamePlaceholder")}
                    className="h-12 text-lg"
                    maxLength={50}
                  />
                  {rewardErrors.name && <p className="text-sm text-destructive mt-1">{rewardErrors.name}</p>}
                </div>

                <div>
                  <Label>{t("selectIcon")}</Label>
                  <EmojiPicker
                    value={rewardIcon}
                    onChange={setRewardIcon}
                    placeholder={t("clickToSelectEmoji")}
                    quickEmojis={getSuggestedEmojis(rewardName)}
                  />
                  {rewardErrors.icon && <p className="text-sm text-destructive mt-1">{rewardErrors.icon}</p>}
                </div>

                <div>
                  <Label htmlFor="rewardCost">{t("price")}</Label>
                  <Input
                    id="rewardCost"
                    type="number"
                    value={rewardCost}
                    onChange={(e) => setRewardCost(e.target.value)}
                    min="1"
                    max="1000"
                    className="h-12 text-lg"
                  />
                  {rewardErrors.cost && <p className="text-sm text-destructive mt-1">{rewardErrors.cost}</p>}
                </div>

                <Button
                  onClick={handleAddReward}
                  className="w-full h-14 text-lg font-bold bg-success text-white hover:bg-success/90"
                >
                  {t("addReward")}
                </Button>
              </div>

              <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-muted-foreground">{t("existingRewards")}:</h3>
                {selectedChild.rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reward.icon}</span>
                      <div>
                        <p className="font-semibold text-card-foreground">{reward.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reward.cost} {t("points")} {reward.purchased && t("completed")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {reward.purchased && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onResetReward(selectedChildId!, reward.id);
                            toast.success(t("rewardReset"));
                          }}
                        >
                          {t("reset")}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReward(reward.id)}
                      >
                        Slett
                      </Button>
                    </div>
                  </div>
                ))}
                {selectedChild.rewards.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">{t("noRewardsYet")}</p>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-card border-4 border-border shadow-lg">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                {t("pointsForChild", { name: selectedChild.name })}
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">⭐</span>
                <span className="text-3xl font-bold text-star">{selectedChild.points} {t("points")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={t("points")}
                  value={pointsToDeduct[selectedChild.id] || ""}
                  onChange={(e) => setPointsToDeduct({ ...pointsToDeduct, [selectedChild.id]: e.target.value })}
                  className="h-10 flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustPointsLocal("add")}
                >
                  {t("addPoints")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustPointsLocal("deduct")}
                >
                  {t("deduct")}
                </Button>
              </div>
            </Card>
          </>
        )}

        <Card className="p-6 bg-card border-4 border-border shadow-lg">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">{t("manageChildren")}</h2>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {children.map((child) => (
              <div key={child.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{child.avatar}</span>
                  <div>
                    <p className="font-semibold text-card-foreground">{child.name}</p>
                    <p className="text-sm text-muted-foreground">{child.points} {t("points")}</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteChild(child.id)}
                >
                  {t("delete")}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card border-4 border-border shadow-lg">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">{t("changePin")}</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPin">{t("newPin")}</Label>
              <Input
                id="newPin"
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder={t("newPin")}
                maxLength={4}
                className="h-12 text-lg"
              />
            </div>
            <div>
              <Label htmlFor="confirmPin">{t("confirmPin")}</Label>
              <Input
                id="confirmPin"
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder={t("confirmPin")}
                maxLength={4}
                className="h-12 text-lg"
              />
            </div>
            {pinError && <p className="text-sm text-destructive">{pinError}</p>}
            <Button
              onClick={handleChangePin}
              className="w-full h-12 text-lg"
            >
              {t("updatePin")}
            </Button>
          </div>
        </Card>

        <Card 
          className="p-6 bg-card border-4 border-border shadow-lg cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate("/sync")}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">📱</div>
            <div>
              <h2 className="text-xl font-bold text-card-foreground">{t("syncAcrossDevices")}</h2>
              <p className="text-sm text-muted-foreground">{t("syncTapToOpen")}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/50 border-2 border-dashed border-muted-foreground/30">
          <h3 className="font-semibold text-muted-foreground mb-2">💡 {t("tips")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t("tip3")}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ParentMode;
