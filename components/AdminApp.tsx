import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import Conversations from './Conversations';
import CalendarView from './CalendarView';
import Marketing from './Marketing';
import Services from './Services';
import StudioPictures from './StudioPictures';
import Broadcast from './Broadcast';
import { BusinessContext } from '../context/BusinessContext';
import { AuthContext } from '../context/AuthContext';
import type { View, BusinessProfile as BusinessProfileType } from '../types';

const AdminApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined);
  const { user } = useContext(AuthContext);
  const { businessProfile } = useContext(BusinessContext);
  
  const profile = user?.profile as BusinessProfileType;
  const themeClass = profile.category.includes('Yoga') ? 'theme-yoga' : 'theme-gym';

  const handleSetCurrentView = (view: View, prompt?: string) => {
    setCurrentView(view);
    setInitialPrompt(prompt);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'conversations':
        return <Conversations initialPrompt={initialPrompt} />;
      case 'calendar':
        return <CalendarView />;
      case 'marketing':
        return <Marketing />;
      case 'services':
        return <Services setCurrentView={handleSetCurrentView} />;
      case 'photos':
        return <StudioPictures />;
      case 'broadcast':
        return <Broadcast />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`flex h-screen font-sans ${themeClass}`}>
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header currentView={currentView} />
        <main className="flex-1 overflow-y-auto p-8 bg-slate-900 text-white">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default AdminApp;