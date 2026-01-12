import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Task, Reward, Child } from "@/types";
import EmojiPicker, { getSuggestedEmojis } from "@/components/EmojiPicker";

const taskSchema = z.object({
  name: z.string().trim().min(1, "Oppgavenavn kan ikke være tomt").max(50, "Navn må være mindre enn 50 tegn"),
  icon: z.string().trim().min(1, "Velg et ikon"),
  points: z.number().int().min(1, "Poeng må være minst 1").max(100, "Poeng må være mindre enn 100"),
});

const rewardSchema = z.object({
  name: z.string().trim().min(1, "Belønningsnavn kan ikke være tomt").max(50, "Navn må være mindre enn 50 tegn"),
  icon: z.string().trim().min(1, "Velg et ikon"),
  cost: z.number().int().min(1, "Pris må være minst 1 poeng").max(1000, "Pris må være mindre enn 1000 poeng"),
});

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
  onUpdatePin 
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

  const selectedChild = children.find(c => c.id === selectedChildId);

  const handleUnlock = () => {
    if (pin === currentPin) {
      setUnlocked(true);
      toast.success("Velkommen, forelder!");
    } else {
      toast.error("Feil PIN-kode");
      setPin("");
    }
  };

  const handleResetTasks = () => {
    if (!selectedChildId) return;
    onResetTasks(selectedChildId);
    toast.success("Alle oppgaver er tilbakestilt!");
  };

  const handleAddTask = () => {
    if (!selectedChildId) return;
    try {
      setErrors({});
      
      const validated = taskSchema.parse({
        name: taskName,
        icon: taskIcon,
        points: parseInt(taskPoints),
      });

      onAddTask(selectedChildId, {
        name: validated.name,
        icon: validated.icon,
        points: validated.points,
      });
      
      setTaskName("");
      setTaskIcon("");
      setTaskPoints("5");
      toast.success("Ny oppgave er lagt til!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { name?: string; icon?: string; points?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof newErrors] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error("Vennligst fyll ut alle felt riktig");
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedChildId) return;
    onDeleteTask(selectedChildId, taskId);
    toast.success("Oppgave slettet");
  };

  const handleDeleteChild = (childId: string) => {
    if (children.length === 1) {
      toast.error("Du må ha minst ett barn!");
      return;
    }
    onDeleteChild(childId);
    if (selectedChildId === childId) {
      setSelectedChildId(null);
    }
    toast.success("Barn fjernet");
  };

  const handleAddReward = () => {
    if (!selectedChildId) return;
    try {
      setRewardErrors({});
      
      const validated = rewardSchema.parse({
        name: rewardName,
        icon: rewardIcon,
        cost: parseInt(rewardCost),
      });

      onAddReward(selectedChildId, {
        name: validated.name,
        icon: validated.icon,
        cost: validated.cost,
      });
      
      setRewardName("");
      setRewardIcon("");
      setRewardCost("20");
      toast.success("Ny belønning er lagt til!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { name?: string; icon?: string; cost?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof newErrors] = err.message;
          }
        });
        setRewardErrors(newErrors);
        toast.error("Vennligst fyll ut alle felt riktig");
      }
    }
  };

  const handleDeleteReward = (rewardId: string) => {
    if (!selectedChildId) return;
    onDeleteReward(selectedChildId, rewardId);
    toast.success("Belønning slettet");
  };

  const handleChangePin = () => {
    setPinError("");
    
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError("PIN må være 4 siffer");
      return;
    }
    
    if (newPin !== confirmPin) {
      setPinError("PIN-kodene stemmer ikke overens");
      return;
    }
    
    onUpdatePin(newPin);
    setNewPin("");
    setConfirmPin("");
    toast.success("PIN-kode oppdatert!");
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 bg-card border-4 border-border shadow-lg">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-primary mb-2">Foreldremodus</h1>
              <p className="text-muted-foreground">Skriv inn PIN-kode</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="pin">PIN-kode</Label>
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
                Lås opp
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full h-12 text-lg"
              >
                Avbryt
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              Standard PIN: 1234 (kan endres inne i foreldremodus)
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Foreldremodus</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            ← Tilbake
          </Button>
        </div>

        {/* Velg barn */}
        <Card className="p-6 bg-card border-4 border-border shadow-lg">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">Velg barn å administrere</h2>
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
                Oppgaver for {selectedChild.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taskName">Oppgavenavn</Label>
                  <Input
                    id="taskName"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="F.eks. Rydd rommet"
                    className="h-12 text-lg"
                    maxLength={50}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label>Velg ikon</Label>
                  <EmojiPicker
                    value={taskIcon}
                    onChange={setTaskIcon}
                    placeholder="Trykk for å velge emoji"
                    quickEmojis={getSuggestedEmojis(taskName)}
                  />
                  {errors.icon && <p className="text-sm text-destructive mt-1">{errors.icon}</p>}
                </div>

                <div>
                  <Label htmlFor="taskPoints">Poengverdi</Label>
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
                  ➕ Legg til oppgave
                </Button>
              </div>

              <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-muted-foreground">Eksisterende oppgaver:</h3>
                {selectedChild.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{task.icon}</span>
                      <div>
                        <p className="font-semibold text-card-foreground">{task.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.points} poeng {task.completed && "✅"}
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
                            toast.success("Oppgave tilbakestilt!");
                          }}
                        >
                          🔄
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
                  <p className="text-center text-muted-foreground py-4">Ingen oppgaver ennå</p>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-card border-4 border-border shadow-lg">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                Belønninger for {selectedChild.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rewardName">Belønningsnavn</Label>
                  <Input
                    id="rewardName"
                    value={rewardName}
                    onChange={(e) => setRewardName(e.target.value)}
                    placeholder="F.eks. Iskrem"
                    className="h-12 text-lg"
                    maxLength={50}
                  />
                  {rewardErrors.name && <p className="text-sm text-destructive mt-1">{rewardErrors.name}</p>}
                </div>

                <div>
                  <Label>Velg ikon</Label>
                  <EmojiPicker
                    value={rewardIcon}
                    onChange={setRewardIcon}
                    placeholder="Trykk for å velge emoji"
                    quickEmojis={getSuggestedEmojis(rewardName)}
                  />
                  {rewardErrors.icon && <p className="text-sm text-destructive mt-1">{rewardErrors.icon}</p>}
                </div>

                <div>
                  <Label htmlFor="rewardCost">Pris (poeng)</Label>
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
                  ➕ Legg til belønning
                </Button>
              </div>

              <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-muted-foreground">Eksisterende belønninger:</h3>
                {selectedChild.rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reward.icon}</span>
                      <div>
                        <p className="font-semibold text-card-foreground">{reward.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reward.cost} poeng {reward.purchased && "✅"}
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
                            toast.success("Belønning tilbakestilt!");
                          }}
                        >
                          🔄
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
                  <p className="text-center text-muted-foreground py-4">Ingen belønninger ennå</p>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-card border-4 border-border shadow-lg">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                Poeng for {selectedChild.name}
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">⭐</span>
                <span className="text-3xl font-bold text-star">{selectedChild.points} poeng</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Poeng"
                  value={pointsToDeduct[selectedChild.id] || ""}
                  onChange={(e) => setPointsToDeduct({ ...pointsToDeduct, [selectedChild.id]: e.target.value })}
                  className="h-10 flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const points = parseInt(pointsToDeduct[selectedChild.id] || "0");
                    if (points > 0) {
                      onAdjustPoints(selectedChild.id, points);
                      setPointsToDeduct({ ...pointsToDeduct, [selectedChild.id]: "" });
                      toast.success(`Lagt til ${points} poeng!`);
                    }
                  }}
                >
                  ➕ Legg til
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const points = parseInt(pointsToDeduct[selectedChild.id] || "0");
                    if (points > 0 && points <= selectedChild.points) {
                      onAdjustPoints(selectedChild.id, -points);
                      setPointsToDeduct({ ...pointsToDeduct, [selectedChild.id]: "" });
                      toast.success(`Trukket ${points} poeng!`);
                    }
                  }}
                >
                  ➖ Trekk fra
                </Button>
              </div>
            </Card>
          </>
        )}

        <Card className="p-6 bg-card border-4 border-border shadow-lg">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">Administrer barn</h2>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {children.map((child) => (
              <div key={child.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{child.avatar}</span>
                  <div>
                    <p className="font-semibold text-card-foreground">{child.name}</p>
                    <p className="text-sm text-muted-foreground">{child.points} poeng</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteChild(child.id)}
                  disabled={children.length === 1}
                >
                  Slett
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card border-4 border-border shadow-lg">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">Endre PIN-kode</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPin">Ny PIN-kode</Label>
              <Input
                id="newPin"
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="4 siffer"
                maxLength={4}
                className="h-12 text-lg"
              />
            </div>
            <div>
              <Label htmlFor="confirmPin">Bekreft PIN-kode</Label>
              <Input
                id="confirmPin"
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Gjenta PIN"
                maxLength={4}
                className="h-12 text-lg"
              />
            </div>
            {pinError && <p className="text-sm text-destructive">{pinError}</p>}
            <Button
              onClick={handleChangePin}
              className="w-full h-12 text-lg"
            >
              Oppdater PIN
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
              <h2 className="text-xl font-bold text-card-foreground">Samkjøre på flere enheter?</h2>
              <p className="text-sm text-muted-foreground">Trykk her for å synkronisere med andre enheter</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/50 border-2 border-dashed border-muted-foreground/30">
          <h3 className="font-semibold text-muted-foreground mb-2">💡 Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Hver profil har nå egne oppgaver og belønninger</li>
            <li>• Velg et barn øverst for å administrere dets oppgaver og belønninger</li>
            <li>• Spør barna om hvilke oppgaver de ønsker å gjøre og belønninger de kan kjøpe i butikken</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ParentMode;
