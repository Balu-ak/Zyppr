import React, { useContext } from 'react';
import type { View, BusinessProfile } from '../types';
import { DashboardIcon, ConversationsIcon, CalendarIcon, MarketingIcon, BotIcon, ServicesIcon, PhotoIcon, MegaphoneIcon } from './icons';
import { BusinessContext } from '../context/BusinessContext';
import { AuthContext } from '../context/AuthContext';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  viewName: View;
  label: string;
  currentView: View;
  setCurrentView: (view: View) => void;
  children: React.ReactNode;
}> = ({ viewName, label, currentView, setCurrentView, children }) => {
  const isActive = currentView === viewName;
  return (
    <button
      onClick={() => setCurrentView(viewName)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-[var(--color-primary)] text-white'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {children}
      <span className="ml-3">{label}</span>
    </button>
  );
};

const BusinessSwitcher: React.FC = () => {
    const { businessProfile, setBusinessProfile } = useContext(BusinessContext);
    
    const handleToggle = () => {
        if (businessProfile.type === 'Yoga Studio') {
            setBusinessProfile({
                id: 'biz_gym_1',
                name: 'Core Strength Gym',
                timezone: 'America/Los_Angeles',
                type: 'Gym Center',
                zipcode: '90210',
                address: '456 Fitness Ave',
                pictures: [],
                announcements: [],
            });
        } else {
            setBusinessProfile({
                id: 'biz_yoga_1',
                name: 'Flow & Glow Yoga',
                timezone: 'America/New_York',
                type: 'Yoga Studio',
                zipcode: '10001',
                address: '123 Zen Rd',
                pictures: [],
                announcements: [],
            });
        }
    }

    return (
        <div className="px-2 mb-8">
            <label className="text-xs text-slate-400 font-medium">Business Profile</label>
            <button onClick={handleToggle} className="w-full bg-slate-700 p-2 rounded-lg mt-2 text-left hover:bg-slate-600 transition-colors">
                <p className="font-bold text-white">{businessProfile.name}</p>
                <p className="text-sm text-[var(--color-primary)]">{businessProfile.type}</p>
            </button>
        </div>
    )
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const { user } = useContext(AuthContext);
  const businessProfile = user?.profile as BusinessProfile;
  const isGym = businessProfile?.category === 'Fitness' || businessProfile?.category === 'Yoga & Fitness Center';

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-800 p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center px-2 mb-6">
          <BotIcon className="w-8 h-8 text-[var(--color-primary)] flex-shrink-0" />
          <div className="ml-3">
            <h1 className="text-xl font-bold text-white leading-tight">Zyppr</h1>
            <p className="text-xs text-slate-400 leading-tight">AI Operations Assistant</p>
          </div>
        </div>
        
        {/* <BusinessSwitcher /> */}

        <nav className="space-y-2">
          <NavItem
            viewName="dashboard"
            label="Dashboard"
            currentView={currentView}
            setCurrentView={setCurrentView}
          >
            <DashboardIcon className="w-6 h-6" />
          </NavItem>
          <NavItem
            viewName="services"
            label="Services"
            currentView={currentView}
            setCurrentView={setCurrentView}
          >
            <ServicesIcon className="w-6 h-6" />
          </NavItem>
           <NavItem
            viewName="photos"
            label="Photos"
            currentView={currentView}
            setCurrentView={setCurrentView}
          >
            <PhotoIcon className="w-6 h-6" />
          </NavItem>
          <NavItem
            viewName="calendar"
            label="Appointments"
            currentView={currentView}
            setCurrentView={setCurrentView}
          >
            <CalendarIcon className="w-6 h-6" />
          </NavItem>
          <NavItem
            viewName="conversations"
            label="AI Chat"
            currentView={currentView}
            setCurrentView={setCurrentView}
          >
            <ConversationsIcon className="w-6 h-6" />
          </NavItem>
          <NavItem
            viewName="marketing"
            label="Marketing"
            currentView={currentView}
            setCurrentView={setCurrentView}
          >
            <MarketingIcon className="w-6 h-6" />
          </NavItem>
           {isGym && (
             <NavItem
              viewName="broadcast"
              label="Broadcast"
              currentView={currentView}
              setCurrentView={setCurrentView}
            >
              <MegaphoneIcon className="w-6 h-6" />
            </NavItem>
          )}
        </nav>
      </div>
       <div className="text-center text-xs text-slate-500 space-y-2">
          <div className="bg-slate-700/50 rounded-lg py-2 px-3 text-slate-400">
            Powered by Google Gemini
          </div>
          <p>&copy; 2024 Zyppr</p>
        </div>
    </aside>
  );
};

export default Sidebar;