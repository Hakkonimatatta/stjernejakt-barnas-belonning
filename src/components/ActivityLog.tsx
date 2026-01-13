import { Activity } from "@/types";
import { Card } from "@/components/ui/card";

interface ActivityLogProps {
  activities?: Activity[];
}

const ActivityLog = ({ activities = [] }: ActivityLogProps) => {
  // Sort by timestamp, newest first
  const sortedActivities = [...activities].sort((a, b) => b.timestamp - a.timestamp);
  
  // Show only last 10 activities
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
    if (dateStr === todayStr) {
      dateLabel = "i dag";
    } else if (dateStr === yesterdayStr) {
      dateLabel = "i går";
    }

    const timeStr = date.toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });

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
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-lg">{activity.icon}</span>
              <span className="text-card-foreground font-medium">{activity.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${activity.points > 0 ? "text-green-600" : "text-red-600"}`}>
                {activity.points > 0 ? "+" : ""}{activity.points}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(activity.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityLog;
