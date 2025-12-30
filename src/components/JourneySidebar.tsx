import { useApp } from '@/context/AppContext';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function JourneySidebar() {
  const { journeyItems, removeJourneyItem } = useApp();

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="card-medical">
        <h2 className="font-semibold text-foreground mb-4">Your Journey</h2>
        
        {journeyItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No health plans yet. Generate your first plan!
          </p>
        ) : (
          <div className="space-y-2">
            {journeyItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-start justify-between gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <p className="text-sm text-foreground line-clamp-2 flex-1">
                  {item.prompt}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeJourneyItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
