import { useState } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { generateMockPlan } from '@/lib/mockData';

export function HealthPlanInput() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { setCurrentPlan, addJourneyItem } = useApp();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const plan = generateMockPlan(prompt);
    setCurrentPlan(plan);
    
    addJourneyItem({
      id: crypto.randomUUID(),
      prompt: prompt,
      createdAt: new Date().toISOString(),
    });
    
    setPrompt('');
    setIsGenerating(false);
  };

  return (
    <div className="card-medical">
      <h2 className="font-semibold text-foreground mb-4">New Health Plan</h2>
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g. 'I have Quinoa, need a 3 day smart plan'"
            className="input-medical pr-10"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
        
        <Button 
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="btn-primary-medical"
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </div>
    </div>
  );
}
