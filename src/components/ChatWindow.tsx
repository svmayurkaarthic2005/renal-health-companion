import { useState, useRef } from 'react';
import { X, Send, MessageCircle, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/types/health';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

// Type for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm here to help with your diet and health. Ask me anything about kidney-friendly foods, meal planning, or managing your condition. You can also use voice input!",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in your browser. Please use Chrome, Edge, Firefox, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        
        // Set timeout to stop listening after 10 seconds of silence
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          console.log('No speech detected, stopping recognition');
          recognition.stop();
          setIsListening(false);
        }, 10000);
      };

      recognition.onresult = (event: any) => {
        // Reset timeout on speech detection
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          console.log(`Result ${i}: ${transcript} (isFinal: ${event.results[i].isFinal})`);
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript.trim()) {
          setInput(prev => {
            const newInput = prev ? prev + finalTranscript : finalTranscript;
            console.log('Updated input:', newInput);
            return newInput;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Clear timeout on error
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        setIsListening(false);
        
        // Only show errors for actual errors, not no-speech
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access.');
        } else if (event.error === 'network') {
          alert('Network error. Please check your internet connection.');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected - please try again');
          // Don't show alert for no-speech, just log it
        } else if (event.error !== 'aborted') {
          alert(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Error creating SpeechRecognition:', error);
      alert('Failed to initialize speech recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      console.log('Stopping speech recognition');
      recognitionRef.current.stop();
      setIsListening(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    }
  };

  const handleVoiceInput = () => {
    try {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    } catch (error) {
      console.error('Error in handleVoiceInput:', error);
      alert('Failed to use speech recognition');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://shaven-luz-superideally.ngrok-free.dev/webhook-test/renaiaichat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          timestamp: userMessage.timestamp,
        }),
      });

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.output || "I've received your message. How else can I help you?",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Webhook error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-card rounded-xl shadow-floating border border-border overflow-hidden z-50 animate-slide-in-right">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">Renal Assistant</span>
        </div>
        <button onClick={onClose} title="Close chat" className="hover:bg-primary-foreground/10 p-1 rounded">
          <X className="w-5 h-5" aria-label="Close chat window" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[85%] p-3 rounded-lg text-sm whitespace-pre-wrap",
              message.role === 'assistant'
                ? "bg-muted text-foreground"
                : "bg-primary text-primary-foreground ml-auto"
            )}
            dangerouslySetInnerHTML={{
              __html: message.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br />')
            }}
          />
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border p-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or use voice..."
            className="flex-1 px-2 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            size="sm" 
            onClick={handleVoiceInput}
            title={isListening ? "Stop listening" : "Start voice input"}
            className={cn(
              "bg-blue-500 hover:bg-blue-600",
              isListening && "bg-red-500 hover:bg-red-600"
            )}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 animate-pulse" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          <Button size="sm" onClick={handleSend} disabled={isLoading} className="bg-primary hover:bg-primary/90">
            <Send className={cn("w-4 h-4", isLoading && "animate-pulse")} />
          </Button>
        </div>
      </div>
    </div>
  );
}
