import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Child, Reward } from "@/types";
import { toast } from "sonner";
import { Language, translate } from "@/lib/i18n";
import { fireConfetti } from "@/lib/confetti";
import { BottomNav } from "@/components/ui/bottom-nav";

interface ShopProps {
  rewards: Reward[];
  currentPoints: number;
  onPurchaseReward: (rewardId: string) => void;
  language: Language;
  requirePinForPurchase?: boolean;
  parentPin?: string;
  hasSelectedChild?: boolean;
  enable24hReset?: boolean;
  children: Child[];
  onSelectChild: (childId: string) => void;
  selectedChildAvatar?: string;
}

const Shop = ({
  rewards,
  currentPoints,
  onPurchaseReward,
  language,
  requirePinForPurchase,
  parentPin = "1234",
  hasSelectedChild,
  enable24hReset = true,
  children,
  onSelectChild,
  selectedChildAvatar,
}: ShopProps) => {
  const navigate = useNavigate();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pendingRewardId, setPendingRewardId] = useState<string | null>(null);
  const [pointsPop, setPointsPop] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmedRewardName, setConfirmedRewardName] = useState<string>("");

  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) => 
    translate(language, key, params);

  useEffect(() => {
    setPointsPop(true);
    const timer = window.setTimeout(() => setPointsPop(false), 500);
    return () => window.clearTimeout(timer);
  }, [currentPoints]);

  const handlePinSubmit = (rewardId: string) => {
    if (pin === parentPin) {
      onPurchaseReward(rewardId);
      fireConfetti();
      setConfirmOpen(true);
      setConfirmedRewardName(rewards.find(r => r.id === rewardId)?.name || "Reward");
      toast.success(t("congratulations", { name: rewards.find(r => r.id === rewardId)?.name || "Reward" }), {
        duration: 3000,
      });
      setPinDialogOpen(false);
      setPin("");
      setPendingRewardId(null);
      setPinError(false);
    } else {
      toast.error(t("wrongPin"));
      setPinError(true);
      setPin("");
      window.setTimeout(() => setPinError(false), 400);
    }
  };

  const handlePurchase = (reward: Reward) => {
    if (enable24hReset && reward.purchased) {
      toast.info(t("alreadyPurchased"));
      return;
    }
    
    if (currentPoints >= reward.cost) {
      if (requirePinForPurchase) {
        setPendingRewardId(reward.id);
        setPinDialogOpen(true);
      } else {
        onPurchaseReward(reward.id);
        fireConfetti();
        setConfirmOpen(true);
        setConfirmedRewardName(reward.name);
        toast.success(t("congratulations", { name: reward.name }), {
          duration: 3000,
        });
      }
    } else {
      toast.error(t("needMorePoints", { points: reward.cost - currentPoints }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-0 sm:p-0">
      {/* Sticky toppbar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg flex items-center gap-2 px-4 py-3 border-b-2 border-border/30 shadow-soft">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/tasks")}
          aria-label={t("back")}
          className="mr-2 hover:bg-primary/10"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <span className="text-3xl sm:text-4xl font-bold flex-1 text-center text-primary">{t("shop")}</span>
        <div className="flex items-center gap-2">
          {selectedChildAvatar && (
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-card/80 border-2 border-border/30 shadow-md">
              <span className="text-xl">{selectedChildAvatar}</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-full border-2 border-border/30 shadow-md">
          <span className="text-xl">⭐</span>
          <span className={`text-lg font-bold text-star ${pointsPop ? "animate-pop" : ""}`}>{currentPoints}</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6 px-2 sm:px-0 py-4 sm:py-6 pb-28">

        <div className="space-y-4">
          {rewards.length === 0 && !hasSelectedChild ? (
            <Card className="p-6 bg-card border-2 border-dashed border-border text-center">
              <div className="text-4xl mb-3">🧒</div>
              <div className="text-lg font-semibold text-card-foreground mb-2">{t("selectChildToShop")}</div>
              <p className="text-sm text-muted-foreground mb-4">{t("selectChildToShopHint")}</p>
              <Button onClick={() => navigate("/")} className="w-full">
                {t("goToHome")}
              </Button>
            </Card>
          ) : (
            rewards.map((reward, index) => {
              const canAfford = currentPoints >= reward.cost;
              const isLocked = enable24hReset && reward.purchased;

              return (
                <Card
                  key={reward.id}
                  className={`p-3 sm:p-5 bg-gradient-to-br from-card to-card/80 border-2 transition-all duration-300 animate-slide-up ${
                    isLocked
                      ? "border-success/50 opacity-80 bg-success/5"
                      : canAfford
                      ? "border-border hover:border-accent/50 hover:shadow-xl hover:scale-[1.02]"
                      : "border-border/50 opacity-60 grayscale"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-5xl sm:text-6xl transition-all duration-300 ${
                        canAfford && !reward.purchased ? "hover:scale-110 animate-float" : ""
                      }`}
                    >
                      {reward.icon}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-xl sm:text-2xl font-bold mb-1 ${
                          isLocked ? "line-through text-muted-foreground" : "text-card-foreground"
                        }`}
                      >
                        {reward.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl font-bold text-star">{reward.cost}</span>
                        <span className="text-sm sm:text-base text-muted-foreground">⭐ {t("points")}</span>
                      </div>
                    </div>
                    {isLocked ? (
                      <div className="text-4xl animate-pop">🎉</div>
                    ) : (
                      <Button
                        onClick={() => handlePurchase(reward)}
                        disabled={!canAfford}
                        className={`h-14 px-6 text-lg font-bold ${
                          canAfford
                            ? "bg-accent text-accent-foreground hover:bg-accent/90"
                            : "opacity-40 cursor-not-allowed"
                        }`}
                      >
                        🛒 {t("buy")}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>


      </div>

      {pinDialogOpen && pendingRewardId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-sm w-full p-6 bg-card border-4 border-border shadow-lg">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-card-foreground text-center">{t("enterPin")}</h2>
              <div>
                <Label htmlFor="purchasePin">{t("pinCode")}</Label>
                <Input
                  id="purchasePin"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && pendingRewardId && handlePinSubmit(pendingRewardId)}
                  placeholder="****"
                  maxLength={4}
                  className={`text-2xl text-center h-14 mt-2 ${pinError ? "border-destructive animate-shake" : ""}`}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPinDialogOpen(false);
                    setPin("");
                    setPendingRewardId(null);
                  }}
                  className="flex-1"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={() => pendingRewardId && handlePinSubmit(pendingRewardId)}
                  className="flex-1"
                >
                  {t("unlock")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="max-w-sm w-full p-6 bg-card border-4 border-border shadow-2xl animate-pop text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-2xl font-bold text-card-foreground mb-2">{t("congratulations", { name: confirmedRewardName })}</h3>
            <p className="text-muted-foreground mb-4">{t("rewardPurchasedMessage")}</p>
            <Button className="w-full" onClick={() => setConfirmOpen(false)}>
              {t("ok")}
            </Button>
          </Card>
        </div>
      )}
      <BottomNav
        childrenProfiles={children}
        onSelectChild={onSelectChild}
        hasSelectedChild={hasSelectedChild}
      />
    </div>
  );
};

export default Shop;
