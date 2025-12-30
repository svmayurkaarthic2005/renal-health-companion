import { useState } from 'react';
import { DayPlan } from '@/types/health';
import { Button } from '@/components/ui/button';
import { Check, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface DayCardProps {
  day: DayPlan;
  onUpdate: (updated: DayPlan) => void;
}

export function DayCard({ day, onUpdate }: DayCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bpSystolic, setBpSystolic] = useState(day.bp.systolic);
  const [bpDiastolic, setBpDiastolic] = useState(day.bp.diastolic);

  const handleSaveBP = () => {
    onUpdate({
      ...day,
      bp: { systolic: bpSystolic, diastolic: bpDiastolic }
    });
    toast({
      title: "BP Saved",
      description: `Blood pressure ${bpSystolic}/${bpDiastolic} recorded`,
    });
  };

  const handleComplete = () => {
    onUpdate({ ...day, completed: true });
    toast({
      title: "Day Completed!",
      description: `Great job completing Day ${day.dayNumber}!`,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className={cn(
      "day-card animate-fade-in",
      day.completed && "bg-success/5 border-success/30"
    )}>
      {/* Day Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
          day.completed 
            ? "bg-success text-success-foreground" 
            : "bg-primary text-primary-foreground"
        )}>
          {day.dayNumber}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{formatDate(day.date)}</h3>
        </div>
        {day.completed ? (
          <Check className="w-6 h-6 text-success" />
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm"
              onClick={handleComplete}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              Complete
            </Button>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Meals */}
        <div className="p-4">
          <h4 className="font-medium text-foreground mb-2">Meals:</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><span className="text-primary font-medium">B:</span> {day.meals.breakfast}</p>
            <p><span className="text-primary font-medium">L:</span> {day.meals.lunch}</p>
            <p><span className="text-primary font-medium">D:</span> {day.meals.dinner}</p>
          </div>
        </div>

        {/* Sleep */}
        <div className="p-4">
          <h4 className="font-medium text-foreground mb-2">Sleep:</h4>
          <p className="text-sm text-muted-foreground">{day.sleep}</p>
        </div>

        {/* Activity */}
        <div className="p-4">
          <h4 className="font-medium text-foreground mb-2">Activity:</h4>
          <p className="text-sm text-muted-foreground">{day.activity}</p>
        </div>
      </div>

      {/* BP Input */}
      {!day.completed && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">BP</span>
            <input
              type="number"
              value={bpSystolic}
              onChange={(e) => setBpSystolic(Number(e.target.value))}
              className="w-16 px-2 py-1 text-sm border border-border rounded bg-background"
              placeholder="120"
            />
            <span className="text-muted-foreground">/</span>
            <input
              type="number"
              value={bpDiastolic}
              onChange={(e) => setBpDiastolic(Number(e.target.value))}
              className="w-16 px-2 py-1 text-sm border border-border rounded bg-background"
              placeholder="80"
            />
            <Button size="sm" onClick={handleSaveBP} className="ml-2">
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
