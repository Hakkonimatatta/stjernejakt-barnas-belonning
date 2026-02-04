import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft } from "lucide-react";
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
  onTogglePinForPurchase: (require: boolean) => void;
  requirePinForPurchase: boolean;
  onToggle24hReset: (childId: string, enable: boolean) => void;
  onResetAllData: () => void;
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
  onTogglePinForPurchase,
  requirePinForPurchase,
  onToggle24hReset,
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
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showAllRewards, setShowAllRewards] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pointsToDeduct, setPointsToDeduct] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<
    | { type: "task"; id: string }
    | { type: "reward"; id: string }
    | { type: "child"; id: string }
    | null
  >(null);

  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) =>
    translate(language, key, params);

  const taskSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, t("taskNameCannotBeEmpty"))
      .max(50, t("taskNameTooLong")),
    icon: z.string().trim().min(1, t("selectIconRequired")),
    points: z.number().int().min(1, t("pointsMin")).max(100, t("pointsMax")),
  });

  const rewardSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, t("rewardNameCannotBeEmpty"))
      .max(50, t("rewardNameTooLong")),
    icon: z.string().trim().min(1, t("selectIconRequired")),
    cost: z.number().int().min(1, t("priceMin")).max(1000, t("priceMax")),
  });

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const hasChildren = children.length > 0;

  useEffect(() => {
    const unlockedFlag = sessionStorage.getItem("parent_unlocked") === "true";
    if (unlockedFlag) {
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    if (pin === currentPin) {
      setUnlocked(true);
      sessionStorage.setItem("parent_unlocked", "true");
      toast.success(t("welcomeParent"));
    } else {
      toast.error(t("wrongPin"));
      setPin("");
    }
  };

  const handleResetTasks = () => {
    if (!selectedChild) return;
    onResetTasks(selectedChild.id);
    toast.success(t("allTasksReset"));
  };

  const handleResetRewards = () => {
    if (!selectedChild) return;
    onResetRewards(selectedChild.id);
    toast.success(t("allRewardsReset"));
  };

  const handleAddTask = () => {
    if (!selectedChild) return;
    try {
      setErrors({});

      const validated = taskSchema.parse({
        name: taskName,
        icon: taskIcon,
        points: Number.parseInt(taskPoints, 10),
      });

      onAddTask(selectedChild.id, {
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
    if (!selectedChild) return;
    onDeleteTask(selectedChild.id, taskId);
    toast.success(t("taskDeleted"));
  };

  const handleDeleteChild = (childId: string) => {
    if (children.length === 1) {
      toast.error(t("mustHaveOneChild"));
      return;
    }
    onDeleteChild(childId);
    if (selectedChildId === childId) {
      setSelectedChildId(null);
    }
    toast.success(t("childRemoved"));
  };

  const handleAddReward = () => {
    if (!selectedChild) return;
    try {
      setRewardErrors({});

      const validated = rewardSchema.parse({
        name: rewardName,
        icon: rewardIcon,
        cost: Number.parseInt(rewardCost, 10),
      });

      onAddReward(selectedChild.id, {
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
    if (!selectedChild) return;
    onDeleteReward(selectedChild.id, rewardId);
    toast.success(t("rewardDeleted"));
  };

  const openDeleteDialog = (action: NonNullable<typeof deleteAction>) => {
    setDeleteAction(action);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteAction(null);
  };

  const confirmDelete = () => {
    if (!deleteAction) return;
    if (deleteAction.type === "task") {
      handleDeleteTask(deleteAction.id);
    } else if (deleteAction.type === "reward") {
      handleDeleteReward(deleteAction.id);
    } else {
      handleDeleteChild(deleteAction.id);
    }
    closeDeleteDialog();
  };

  const deleteTitle = () => {
    if (!deleteAction) return "";
    if (deleteAction.type === "task") return t("confirmDeleteTask");
    if (deleteAction.type === "reward") return t("confirmDeleteReward");
    const childName = children.find((child) => child.id === deleteAction.id)?.name ?? "";
    return t("confirmDeleteTitle", { name: childName });
  };

  const deleteDescription = () => {
    if (!deleteAction) return "";
    if (deleteAction.type === "task") return t("confirmDeleteTaskDescription");
    if (deleteAction.type === "reward") return t("confirmDeleteRewardDescription");
    return t("confirmDeleteDescription");
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

  const handleAddPoints = () => {
    if (!selectedChild) return;
    const points = Number.parseInt(pointsToDeduct[selectedChild.id] || "0", 10);
    if (!Number.isFinite(points) || points <= 0) {
      toast.error(t("enterValidPoints"));
      return;
    }
    onAdjustPoints(selectedChild.id, points);
    setPointsToDeduct({ ...pointsToDeduct, [selectedChild.id]: "" });
    toast.success(t("pointsAdded", { points, name: selectedChild.name }));
  };

  const handleDeductPoints = () => {
    if (!selectedChild) return;
    const points = Number.parseInt(pointsToDeduct[selectedChild.id] || "0", 10);
    if (!Number.isFinite(points) || points <= 0) {
      toast.error(t("enterValidPoints"));
      return;
    }
    if (points > selectedChild.points) {
      toast.error(t("cannotDeductMore"));
      return;
    }
    onAdjustPoints(selectedChild.id, -points);
    setPointsToDeduct({ ...pointsToDeduct, [selectedChild.id]: "" });
    toast.success(t("pointsDeducted", { points, name: selectedChild.name }));
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
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  placeholder="****"
                  maxLength={4}
                  className="text-2xl text-center h-14"
                />
              </div>

              <Button onClick={handleUnlock} className="w-full h-14 text-lg font-bold">
                {t("unlock")}
              </Button>

              <Button variant="outline" onClick={() => navigate("/")} className="w-full h-12 text-lg">
                {t("cancel")}
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground space-y-1">
              <div>{t("defaultPin")}</div>
              <div>{t("defaultPinHint")}</div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              sessionStorage.removeItem("parent_unlocked");
              navigate("/");
            }}
            aria-label={t("back")}
            className="hover:bg-primary/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold text-primary text-center">{t("parentMode")}</h1>
          <div className="w-10" />
        </div>

        {hasChildren ? (
          <>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t("childSettings")}
            </div>

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
          </>
        ) : (
          <Card className="p-6 bg-card border-4 border-border shadow-lg text-center space-y-3">
            <div className="text-4xl">👶</div>
            <div className="text-lg font-semibold text-card-foreground">{t("noChildrenYet")}</div>
            <p className="text-sm text-muted-foreground">{t("addChildFromHome")}</p>
            <Button onClick={() => navigate("/")} className="w-full">
              {t("addChild")}
            </Button>
          </Card>
        )}

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

              <div className="mt-6 space-y-2">
                <h3 className="font-semibold text-muted-foreground">{t("existingTasks")}</h3>
                {selectedChild.tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{task.icon}</span>
                      <div>
                        <p className="font-semibold text-card-foreground">{task.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.points} {t("points")} {task.completed && "✅"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onResetTask(selectedChild.id, task.id);
                            toast.success(t("taskReset"));
                          }}
                        >
                          {t("reset")}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog({ type: "task", id: task.id })}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </div>
                ))}
                {selectedChild.tasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">{t("noTasksYet")}</p>
                )}
                {selectedChild.tasks.length > 3 && (
                  <Button variant="outline" className="w-full" onClick={() => setShowAllTasks(true)}>
                    {t("viewAllTasks", { count: selectedChild.tasks.length })}
                  </Button>
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

              <div className="mt-6 space-y-2">
                <h3 className="font-semibold text-muted-foreground">{t("existingRewards")}</h3>
                {selectedChild.rewards.slice(0, 3).map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reward.icon}</span>
                      <div>
                        <p className="font-semibold text-card-foreground">{reward.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reward.cost} {t("points")} {reward.purchased && "✅"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {reward.purchased && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onResetReward(selectedChild.id, reward.id);
                            toast.success(t("rewardReset"));
                          }}
                        >
                          {t("reset")}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog({ type: "reward", id: reward.id })}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </div>
                ))}
                {selectedChild.rewards.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">{t("noRewardsYet")}</p>
                )}
                {selectedChild.rewards.length > 3 && (
                  <Button variant="outline" className="w-full" onClick={() => setShowAllRewards(true)}>
                    {t("viewAllRewards", { count: selectedChild.rewards.length })}
                  </Button>
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
                <Button variant="outline" size="sm" onClick={handleAddPoints}>
                  {t("addPoints")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeductPoints}>
                  {t("deduct")}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card border-4 border-border shadow-lg">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">{t("enable24hReset")}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="font-semibold text-card-foreground">{t("enable24hReset")}</div>
                  <p className="text-sm text-muted-foreground">{t("enable24hResetDescription")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {selectedChild.enable24hReset !== false ? t("on") : t("off")}
                  </span>
                  <Switch
                    checked={selectedChild.enable24hReset !== false}
                    onCheckedChange={(value) => onToggle24hReset(selectedChild.id, value)}
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="font-semibold text-card-foreground">{t("requirePinForPurchase")}</div>
                  <p className="text-sm text-muted-foreground">{t("pinRequiredForShop")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {requirePinForPurchase ? t("on") : t("off")}
                  </span>
                  <Switch checked={requirePinForPurchase} onCheckedChange={onTogglePinForPurchase} />
                </div>
              </div>
            </Card>
          </>
        )}

        {!selectedChild && (
          <Card className="p-6 bg-card border-4 border-border shadow-lg">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">{t("changePin")}</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="newPin">{t("newPin")}</Label>
                <Input
                  id="newPin"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
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
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder={t("confirmPin")}
                  maxLength={4}
                  className="h-12 text-lg"
                />
              </div>
              {pinError && <p className="text-sm text-destructive">{pinError}</p>}
              <Button onClick={handleChangePin} className="w-full h-12 text-lg">
                {t("updatePin")}
              </Button>
            </div>
          </Card>
        )}

        {hasChildren && (
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
                    onClick={() => openDeleteDialog({ type: "child", id: child.id })}
                    disabled={children.length === 1}
                  >
                    {t("delete")}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6 bg-card border-4 border-border shadow-lg">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">{t("language")}</h2>
          <div className="flex gap-2">
            <Button
              variant={language === "no" ? "default" : "outline"}
              onClick={() => onChangeLanguage("no")}
              className="flex-1"
            >
              🇳🇴 {t("norwegian")}
            </Button>
            <Button
              variant={language === "en" ? "default" : "outline"}
              onClick={() => onChangeLanguage("en")}
              className="flex-1"
            >
              🇬🇧 {t("english")}
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-card border-4 border-border shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📱</div>
            <div>
              <h2 className="text-xl font-bold text-card-foreground">{t("syncAcrossDevices")}</h2>
              <p className="text-sm text-muted-foreground">{t("syncTapToOpen")}</p>
            </div>
          </div>
          <Button
            className="w-full mt-4"
            onClick={() => {
              sessionStorage.setItem("parent_unlocked", "true");
              navigate("/sync");
            }}
          >
            {t("syncOpen")}
          </Button>
        </Card>

        <Card className="p-4 bg-muted/50 border-2 border-dashed border-muted-foreground/30">
          <h3 className="font-semibold text-muted-foreground mb-2">{t("tips")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t("tip1")}</li>
            <li>{t("tip2")}</li>
            <li>{t("tip3")}</li>
          </ul>
        </Card>
      </div>

      {selectedChild && (
        <Dialog open={showAllTasks} onOpenChange={setShowAllTasks}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("allTasksTitle", { name: selectedChild.name })}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {selectedChild.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{task.icon}</span>
                    <div>
                      <p className="font-semibold text-card-foreground">{task.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.points} {t("points")} {task.completed && "✅"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {task.completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onResetTask(selectedChild.id, task.id);
                          toast.success(t("taskReset"));
                        }}
                      >
                        {t("reset")}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog({ type: "task", id: task.id })}
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              ))}
              {selectedChild.tasks.length === 0 && (
                <p className="text-center text-muted-foreground py-4">{t("noTasksYet")}</p>
              )}
            </div>
            <Button className="w-full" onClick={() => setShowAllTasks(false)}>
              {t("close")}
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {selectedChild && (
        <Dialog open={showAllRewards} onOpenChange={setShowAllRewards}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("allRewardsTitle", { name: selectedChild.name })}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {selectedChild.rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <p className="font-semibold text-card-foreground">{reward.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reward.cost} {t("points")} {reward.purchased && "✅"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {reward.purchased && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onResetReward(selectedChild.id, reward.id);
                          toast.success(t("rewardReset"));
                        }}
                      >
                        {t("reset")}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog({ type: "reward", id: reward.id })}
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              ))}
              {selectedChild.rewards.length === 0 && (
                <p className="text-center text-muted-foreground py-4">{t("noRewardsYet")}</p>
              )}
            </div>
            <Button className="w-full" onClick={() => setShowAllRewards(false)}>
              {t("close")}
            </Button>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{deleteTitle()}</DialogTitle>
            <DialogDescription>{deleteDescription()}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={closeDeleteDialog}>
              {t("confirmNo")}
            </Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDelete}>
              {t("confirmYes")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentMode;