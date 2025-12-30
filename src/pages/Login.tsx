import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { KidneyStage } from '@/types/health';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<KidneyStage>('prevention');
  const navigate = useNavigate();
  const { setUser } = useApp();

  const handleContinue = () => {
    setUser({
      email: email || 'guest@renal-ai.com',
      mode,
      isGuest: !email,
    });
    navigate('/dashboard');
  };

  const handleGuestLink = () => {
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <div className="card-medical w-full max-w-md animate-fade-in">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Renal Healing Portal</h1>
            <p className="text-muted-foreground">Continue Your Journey</p>
          </div>

          <div className="space-y-4">
            {/* Guest Link */}
            <button 
              onClick={handleGuestLink}
              className="text-primary hover:underline text-sm font-medium"
            >
              Continue as Guest
            </button>

            {/* Email Input */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="input-medical"
              />
            </div>

            {/* Mode Selector */}
            <Select value={mode} onValueChange={(value) => setMode(value as KidneyStage)}>
              <SelectTrigger className="w-full h-12 bg-background border-border">
                <SelectValue placeholder="Select your mode" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="prevention">Prevention Mode</SelectItem>
                <SelectItem value="stage3">Stage 3 (Moderate)</SelectItem>
                <SelectItem value="stage5">Stage 5 (Dialysis)</SelectItem>
              </SelectContent>
            </Select>

            {/* Continue Button */}
            <Button 
              onClick={handleContinue}
              className="w-full btn-primary-medical h-12 text-base"
            >
              Continue as Guest → Dashboard
            </Button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
            </div>

            {/* Contact Support */}
            <Button 
              variant="secondary"
              className="w-full h-12 bg-muted text-muted-foreground hover:bg-muted/80"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
