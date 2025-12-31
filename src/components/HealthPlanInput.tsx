import { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { generateMockPlan } from '@/lib/mockData';
import { toast } from 'sonner';

// Extend Window interface for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: Event & { error: string }) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function HealthPlanInput() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { setCurrentPlan, addJourneyItem } = useApp();
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setPrompt(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else {
        toast.error('Speech recognition error. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('https://shaven-luz-superideally.ngrok-free.dev/webhook-test/main', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();
      
      // Map webhook response to HealthPlan format
      const plan = {
        id: crypto.randomUUID(),
        prompt: prompt.trim(),
        intro: data.overview?.description || 'Your personalized health plan based on your input.',
        shoppingItems: data.overview?.shopping || [],
        days: data.roadmap.map((day: { day: string; meals: { breakfast: string; lunch: string; dinner: string }; sleep: string; activity: string }, index: number) => ({
          id: crypto.randomUUID(),
          dayNumber: index + 1,
          date: day.day,
          meals: {
            breakfast: day.meals.breakfast,
            lunch: day.meals.lunch,
            dinner: day.meals.dinner,
          },
          sleep: day.sleep,
          activity: day.activity,
          bp: { systolic: 120, diastolic: 80 },
          completed: false,
        })),
        createdAt: new Date().toISOString(),
      };

      setCurrentPlan(plan);
      
      addJourneyItem({
        id: crypto.randomUUID(),
        prompt: prompt,
        createdAt: new Date().toISOString(),
      });
      
      setPrompt('');
      toast.success('Health plan generated successfully!');
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
            onClick={toggleListening}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
              isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground hover:text-primary'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
