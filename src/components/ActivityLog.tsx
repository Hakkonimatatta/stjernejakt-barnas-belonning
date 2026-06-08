import { Activity } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActivityLogProps {
  activities?: Activity[];
  onUndo?: (activityId: string) => void;
}

const ActivityLog = ({ activities = [], onUndo }: ActivityLogProps) => {
  const sortedActivities = [...activities].sort((a, b) => b.timestamp - a.timestamp);
  const recentActivities = sortedActivities.slice(0, 10);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toLocaleDateString("no-NO");
    const todayStr = today.toLocaleDateString("no-NO");
    const yesterdayStr = yesterday.toLocaleDateString("no-NO");

    let dateLabel = dateStr;
    if (dateStr === todayStr) dateLabel = "i dag";
    else if (dateStr === yesterdayStr) dateLabel = "i går";

    const timeStr = date.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
    return `${dateLabel} ${timeStr}`;
  };

  if (recentActivities.length === 0) {
    return (
      <Card className="p-4 bg-muted/30 border-2 border-dashed border-border">
        <p className="text-sm text-muted-foreground text-center">Ingen aktivitet ennå</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-2 border-border">
      <h3 className="font-bold text-card-foreground mb-3">📊 Aktivitetslogg</h3>
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {recentActivities.map((activity, index) => (
          <div key={activity.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-lg flex-shrink-0">{activity.icon}</span>
              <span className="text-card-foreground font-medium truncate">{activity.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`font-bold ${activity.points > 0 ? "text-green-600" : "text-red-600"}`}>
                {activity.points > 0 ? "+" : ""}{activity.points}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
                {formatTime(activity.timestamp)}
              </span>
              {index === 0 && onUndo && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => onUndo(activity.id)}
                >
                  Angre
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityLog;
