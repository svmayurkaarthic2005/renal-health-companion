import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'prevention': return 'Prevention';
      case 'stage3': return 'Stage 3 (Moderate)';
      case 'stage5': return 'Stage 5 (Dialysis)';
      default: return mode;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-navbar text-navbar-foreground h-14 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">🫘</span>
        <span className="font-semibold text-lg">Renal-AI</span>
      </div>
      
      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-navbar-foreground/80 hidden sm:block">
            {user.email}
          </span>
          <Badge variant="secondary" className="bg-primary/20 text-primary-foreground border-0">
            {getModeLabel(user.mode)}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-navbar-foreground hover:bg-navbar-foreground/10"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
