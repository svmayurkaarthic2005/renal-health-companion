import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, HealthPlan, JourneyItem, KidneyStage } from '@/types/health';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentPlan: HealthPlan | null;
  setCurrentPlan: (plan: HealthPlan | null) => void;
  journeyItems: JourneyItem[];
  addJourneyItem: (item: JourneyItem) => void;
  removeJourneyItem: (id: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentPlan, setCurrentPlan] = useState<HealthPlan | null>(null);
  const [journeyItems, setJourneyItems] = useState<JourneyItem[]>([]);

  const addJourneyItem = (item: JourneyItem) => {
    setJourneyItems(prev => [item, ...prev]);
  };

  const removeJourneyItem = (id: string) => {
    setJourneyItems(prev => prev.filter(item => item.id !== id));
  };

  const logout = () => {
    setUser(null);
    setCurrentPlan(null);
    setJourneyItems([]);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      currentPlan,
      setCurrentPlan,
      journeyItems,
      addJourneyItem,
      removeJourneyItem,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
