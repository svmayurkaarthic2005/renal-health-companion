import { useApp } from '@/context/AppContext';
import { Share2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function RoadmapCard() {
  const { currentPlan } = useApp();

  if (!currentPlan) {
    return (
      <div className="card-medical text-center py-12">
        <p className="text-muted-foreground">
          Generate a health plan to see your personalized roadmap
        </p>
      </div>
    );
  }

  const handleShare = () => {
    toast({
      title: "Share feature",
      description: "Plan sharing will be available soon!",
    });
  };

  const handleFindItem = (item: string) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(item + ' near me')}`, '_blank');
  };

  return (
    <div className="card-medical animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <h2 className="font-semibold text-primary text-lg">Your Roadmap</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="text-primary border-primary hover:bg-primary/5"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </div>
      
      <p className="text-foreground mb-6 leading-relaxed">
        {currentPlan.intro}
      </p>
      
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground flex items-center gap-1">
          🛒 Shopping:
        </span>
        {currentPlan.shoppingItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleFindItem(item)}
            className="pill-shopping"
          >
            <MapPin className="w-3 h-3" />
            Find {item}
          </button>
        ))}
      </div>
    </div>
  );
}
