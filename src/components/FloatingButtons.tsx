import { MessageCircle, Heart } from 'lucide-react';

interface FloatingButtonsProps {
  onChatOpen: () => void;
  onDiagnosticOpen: () => void;
}

export function FloatingButtons({ onChatOpen, onDiagnosticOpen }: FloatingButtonsProps) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      <button
        onClick={onChatOpen}
        className="floating-btn bg-primary hover:bg-primary/90"
        aria-label="Open chat assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      
      <button
        onClick={onDiagnosticOpen}
        className="floating-btn bg-destructive hover:bg-destructive/90"
        aria-label="Open diagnostic hub"
      >
        <Heart className="w-6 h-6" />
      </button>
    </div>
  );
}
