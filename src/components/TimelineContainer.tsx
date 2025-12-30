import { ReactNode } from 'react';
import { DayPlan } from '@/types/health';
import { cn } from '@/lib/utils';

interface TimelineContainerProps {
  days: DayPlan[];
  children: ReactNode;
}

export function TimelineContainer({ days, children }: TimelineContainerProps) {
  const dayCards = Array.isArray(children) ? children : [children];

  return (
    <div className="relative">
      {/* Vertical timeline line background */}
      <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-border" />

      {/* Day cards with timeline markers */}
      <div className="space-y-4">
        {days.map((day, index) => (
          <div key={day.id} className="relative pl-20">
            {/* Timeline circle marker */}
            <div
              className={cn(
                'absolute left-3 top-6 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all',
                day.completed
                  ? 'bg-success border-success text-success-foreground'
                  : 'bg-card border-primary text-primary'
              )}
            >
              {day.dayNumber}
            </div>

            {/* Completion line overlay - green line connecting completed days */}
            {day.completed && index < days.length - 1 && (
              <div className="absolute left-7 top-14 w-0.5 bg-success" style={{ height: '12.5rem' }} />
            )}

            {/* Day Card - render from children */}
            {dayCards[index]}
          </div>
        ))}
      </div>
    </div>
  );
}
