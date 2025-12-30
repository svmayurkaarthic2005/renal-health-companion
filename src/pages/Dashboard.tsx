import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { JourneySidebar } from '@/components/JourneySidebar';
import { HealthPlanInput } from '@/components/HealthPlanInput';
import { RoadmapCard } from '@/components/RoadmapCard';
import { DayCard } from '@/components/DayCard';
import { FloatingButtons } from '@/components/FloatingButtons';
import { ChatWindow } from '@/components/ChatWindow';
import { DiagnosticHub } from '@/components/DiagnosticHub';
import { DayPlan } from '@/types/health';

export default function Dashboard() {
  const { user, currentPlan, setCurrentPlan } = useApp();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleDayUpdate = (updatedDay: DayPlan) => {
    if (!currentPlan) return;
    
    setCurrentPlan({
      ...currentPlan,
      days: currentPlan.days.map(day => 
        day.id === updatedDay.id ? updatedDay : day
      ),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Sidebar */}
        <JourneySidebar />
        
        {/* Main Content */}
        <main className="flex-1 space-y-6">
          <HealthPlanInput />
          
          <RoadmapCard />
          
          {/* Day Cards */}
          {currentPlan && currentPlan.days.length > 0 && (
            <div className="space-y-4">
              {currentPlan.days.map((day) => (
                <DayCard 
                  key={day.id} 
                  day={day} 
                  onUpdate={handleDayUpdate}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Buttons */}
      <FloatingButtons 
        onChatOpen={() => setIsChatOpen(true)}
        onDiagnosticOpen={() => setIsDiagnosticOpen(true)}
      />

      {/* Chat Window */}
      <ChatWindow 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      {/* Diagnostic Hub Modal */}
      <DiagnosticHub 
        isOpen={isDiagnosticOpen} 
        onClose={() => setIsDiagnosticOpen(false)} 
      />
    </div>
  );
}
