import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BusinessProvider } from '../context/BusinessContext';
import { BotIcon, HomeIcon, UserCircleIcon } from './icons';
import BusinessListView from './BusinessListView';
import BusinessDetailView from './BusinessDetailView';
import UserProfile from './UserProfile';
import type { Business, UserView } from '../types';

const UserAppContent: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const [currentView, setCurrentView] = useState<UserView>('discover');
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

    const handleSelectBusiness = (business: Business) => {
        setSelectedBusiness(business);
    };

    const handleBackToList = () => {
        setSelectedBusiness(null);
        setCurrentView('discover');
    };
    
    // Determine theme based on selected business, or default
    const themeClass = selectedBusiness?.type.includes('Yoga') ? 'theme-yoga' : 'theme-gym';

    const renderMainContent = () => {
        if (currentView === 'profile') {
            return <UserProfile />;
        }
        if (currentView === 'discover') {
             return !selectedBusiness ? (
                <BusinessListView onSelectBusiness={handleSelectBusiness} />
            ) : (
                <BusinessDetailView business={selectedBusiness} onBack={handleBackToList} />
            );
        }
        return null;
    };

    return (
        <div className={`min-h-screen ${themeClass} bg-slate-900 text-white`}>
            <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <BotIcon className="w-8 h-8 text-[var(--color-primary)]" />
                    <h1 className="text-xl font-bold">Zyppr</h1>
                </div>
                <div className="flex items-center gap-4">
                    <nav className="flex items-center gap-2 bg-slate-800 p-1 rounded-full">
                        <button onClick={() => { setCurrentView('discover'); setSelectedBusiness(null); }} title="Discover Businesses" className={`p-2 rounded-full transition-colors ${currentView === 'discover' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                            <HomeIcon className="w-5 h-5" />
                        </button>
                         <button onClick={() => setCurrentView('profile')} title="My Profile" className={`p-2 rounded-full transition-colors ${currentView === 'profile' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                            <UserCircleIcon className="w-5 h-5" />
                        </button>
                    </nav>
                     <div className="text-right">
                        <p className="font-medium text-sm">{user?.email}</p>
                        <button onClick={logout} className="text-xs text-slate-400 hover:text-[var(--color-primary)]">Logout</button>
                    </div>
                </div>
            </header>
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
               {renderMainContent()}
            </main>
        </div>
    );
};

// This wrapper is needed because UserApp is outside the BusinessProvider in App.tsx
const UserApp: React.FC = () => {
    return (
        <BusinessProvider>
            <UserAppContent />
        </BusinessProvider>
    );
};

export default UserApp;