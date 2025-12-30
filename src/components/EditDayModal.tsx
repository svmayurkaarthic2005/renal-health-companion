import { useState } from 'react';
import { DayPlan } from '@/types/health';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { X, Sparkles } from 'lucide-react';

interface EditDayModalProps {
  day: DayPlan;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: DayPlan) => void;
}

export function EditDayModal({ day, isOpen, onClose, onSave }: EditDayModalProps) {
  const [activeTab, setActiveTab] = useState('manual');
  const [meals, setMeals] = useState(
    `B: ${day.meals.breakfast}\nL: ${day.meals.lunch}\nD: ${day.meals.dinner}`
  );
  const [activity, setActivity] = useState(day.activity);
  const [sleep, setSleep] = useState(day.sleep);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleManualSave = () => {
    // Parse meals from text
    const mealLines = meals.split('\n');
    const parseMeal = (line: string) => {
      const match = line.match(/[BLD]:\s*(.+)/);
      return match ? match[1].trim() : '';
    };

    const updatedDay: DayPlan = {
      ...day,
      meals: {
        breakfast: parseMeal(mealLines[0] || ''),
        lunch: parseMeal(mealLines[1] || ''),
        dinner: parseMeal(mealLines[2] || ''),
      },
      activity,
      sleep,
    };

    onSave(updatedDay);
    toast({
      title: 'Changes Saved',
      description: `Day ${day.dayNumber} has been updated`,
    });
    onClose();
  };

  const handleAiUpdate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: 'Please provide instructions',
        description: 'Tell AI how you want to change this day',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate AI update - in real implementation, this would call an API
      const updatedDay: DayPlan = {
        ...day,
        activity: aiPrompt,
      };

      onSave(updatedDay);
      toast({
        title: 'Updated with AI',
        description: `Day ${day.dayNumber} has been updated based on your request`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update with AI',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Edit Day {day.dayNumber}
            </DialogTitle>
            <DialogClose className="rounded-md p-1 hover:bg-muted">
              <X className="w-4 h-4" />
            </DialogClose>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Miracle
            </TabsTrigger>
          </TabsList>

          {/* Manual Tab */}
          <TabsContent value="manual" className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Meals</label>
              <Textarea
                value={meals}
                onChange={(e) => setMeals(e.target.value)}
                placeholder="B: Breakfast&#10;L: Lunch&#10;D: Dinner"
                className="mt-2 min-h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Activity</label>
              <Textarea
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Describe your activity"
                className="mt-2 min-h-20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Sleep</label>
              <Textarea
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                placeholder="Describe your sleep schedule"
                className="mt-2 min-h-20"
              />
            </div>

            <Button
              onClick={handleManualSave}
              className="w-full bg-foreground text-background hover:bg-foreground/90"
            >
              Save Changes
            </Button>
          </TabsContent>

          {/* AI Miracle Tab */}
          <TabsContent value="ai" className="space-y-4">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary flex items-center gap-2">
                <span>Tell AI how to change this day:</span>
              </p>
            </div>

            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Example: Make the meals more fiber-rich and add evening yoga..."
              className="min-h-24"
            />

            <Button
              onClick={handleAiUpdate}
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
            >
              {isLoading ? 'Updating...' : 'Update with AI'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
