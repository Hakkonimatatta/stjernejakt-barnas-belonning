import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reward } from "@/types";
import { toast } from "sonner";
import { Language, translate } from "@/lib/i18n";

interface ShopProps {
  rewards: Reward[];
  currentPoints: number;
  onPurchaseReward: (rewardId: string) => void;
  language: Language;
}

const Shop = ({ rewards, currentPoints, onPurchaseReward, language }: ShopProps) => {
  const navigate = useNavigate();

  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) => 
    translate(language, key, params);

  const handlePurchase = (reward: Reward) => {
    if (reward.purchased) {
      toast.info(t("alreadyPurchased"));
      return;
    }
    
    if (currentPoints >= reward.cost) {
      onPurchaseReward(reward.id);
      toast.success(t("congratulations", { name: reward.name }), {
        duration: 3000,
      });
    } else {
      toast.error(t("needMorePoints", { points: reward.cost - currentPoints }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => navigate("/tasks")} className="text-sm sm:text-base h-10 sm:h-auto px-2 sm:px-4">
            {t("back")}
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold text-primary text-center">{t("shop")}</h1>
          <div className="flex items-center justify-center sm:justify-end gap-2 bg-card px-3 py-2 sm:px-4 sm:py-2 rounded-full border-2 sm:border-4 border-border">
            <span className="text-xl sm:text-2xl">⭐</span>
            <span className="text-lg sm:text-xl font-bold text-star">{currentPoints}</span>
          </div>
        </div>

        <div className="space-y-4">
          {rewards.map((reward) => {
            const canAfford = currentPoints >= reward.cost;
            
            return (
              <Card 
                key={reward.id} 
                className={`p-3 sm:p-5 bg-card border-2 sm:border-4 shadow-lg transition-all ${
                  reward.purchased
                    ? "border-success opacity-75"
                    : canAfford
                    ? "border-border hover:shadow-xl"
                    : "border-border opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{reward.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-card-foreground mb-1">
                      {reward.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-star">{reward.cost}</span>
                      <span className="text-sm text-muted-foreground">{t("points")}</span>
                    </div>
                  </div>
                  {reward.purchased ? (
                    <div className="text-4xl">{t("completed")}</div>
                  ) : (
                    <Button
                      onClick={() => handlePurchase(reward)}
                      disabled={!canAfford}
                      className={`h-14 px-6 text-lg font-bold ${
                        canAfford
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {t("buy")}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="w-full h-14 text-lg"
        >
          {t("myPoints")}
        </Button>
      </div>
    </div>
  );
};

export default Shop;
