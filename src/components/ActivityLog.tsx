import { Activity } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Language, translate } from "@/lib/i18n";

interface ActivityLogProps {
  activities?: Activity[];
  onUndo?: (activityId: string) => void;
  language?: Language;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const ActivityLog = ({ activities = [], onUndo, language = "no" }: ActivityLogProps) => {
  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) =>
    translate(language, key, params);

  const locale = language === "no" ? "no-NO" : "en-GB";
  const weekAgo = Date.now() - ONE_WEEK_MS;

  const weekActivities = [...activities]
    .filter((a) => a.timestamp >= weekAgo)
    .sort((a, b) => b.timestamp - a.timestamp);

  const tasksDone = weekActivities.filter((a) => a.type === "task").length;
  const rewardsBought = weekActivities.filter((a) => a.type === "reward").length;
  const pointsEarned = weekActivities
    .filter((a) => a.points > 0 && a.type !== "adjustment")
    .reduce((sum, a) => sum + a.points, 0);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toLocaleDateString(locale);
    const todayStr = today.toLocaleDateString(locale);
    const yesterdayStr = yesterday.toLocaleDateString(locale);

    let dateLabel = dateStr;
    if (dateStr === todayStr) dateLabel = t("today");
    else if (dateStr === yesterdayStr) dateLabel = t("yesterday");

    const timeStr = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    return `${dateLabel} ${timeStr}`;
  };

  const activityLabel = (activity: Activity): string => {
    if (activity.type === "adjustment") {
      return activity.points >= 0 ? t("activityAdjustmentAdded") : t("activityAdjustmentDeducted");
    }
    if (activity.type === "reset") {
      return `${t("activityReset")}: ${activity.name}`;
    }
    return activity.name;
  };

  const activityIcon = (activity: Activity): string => {
    if (activity.type === "reset") return "🔄";
    if (activity.type === "adjustment") return activity.points >= 0 ? "📈" : "📉";
    return activity.icon;
  };

  const canUndo = (activity: Activity): boolean =>
    activity.type === "task" || activity.type === "reward";

  return (
    <Card className="p-4 bg-card border-2 border-border">
      <h3 className="font-bold text-card-foreground mb-3">📊 {t("activityLogTitle")}</h3>

      {/* Weekly summary */}
      <div className="mb-3 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
        <p className="font-semibold text-muted-foreground">{t("weeklySummary")}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-card-foreground">
          <span>✅ {t("weeklyTasksDone", { count: tasksDone })}</span>
          <span>🛍️ {t("weeklyRewardsBought", { count: rewardsBought })}</span>
          {pointsEarned > 0 && <span>⭐ {t("weeklyPointsEarned", { points: pointsEarned })}</span>}
        </div>
      </div>

      {weekActivities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">{t("noActivityThisWeek")}</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {weekActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm gap-2"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">{activityIcon(activity)}</span>
                <span
                  className={`font-medium truncate ${
                    activity.type === "reset" ? "text-muted-foreground italic" : "text-card-foreground"
                  }`}
                >
                  {activityLabel(activity)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {activity.type !== "reset" && (
                  <span
                    className={`font-bold ${
                      activity.points > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {activity.points > 0 ? "+" : ""}
                    {activity.points}
                  </span>
                )}
                <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
                  {formatTime(activity.timestamp)}
                </span>
                {canUndo(activity) && onUndo && weekActivities[0]?.id === activity.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => onUndo(activity.id)}
                  >
                    {t("undoLastAction")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ActivityLog;
