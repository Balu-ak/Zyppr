import React, { useContext } from 'react';
import type { View, User, BusinessProfile } from '../types';
import { AuthContext } from '../context/AuthContext';

interface HeaderProps {
    currentView: View;
}

const viewTitles: { [key in View]: string } = {
    dashboard: "Dashboard",
    conversations: 'AI-Managed Conversations',
    calendar: 'Appointments',
    marketing: 'AI Marketing Assistant',
    services: 'Manage & Discover Services',
    photos: 'Manage Studio Pictures',
    broadcast: 'Send Broadcast Message'
};

const Header: React.FC<HeaderProps> = ({ currentView }) => {
    const { user, logout } = useContext(AuthContext);
    const businessProfile = user?.profile as BusinessProfile;
    
    return (
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 shadow-md p-4 z-10 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white capitalize">{viewTitles[currentView]}</h2>
            <div className="flex items-center gap-4">
                <div className="text-right">
                     <p className="text-sm font-medium text-slate-200">{user?.email}</p>
                     <p className="text-xs text-slate-400">{businessProfile?.business_name}</p>
                </div>
                <button onClick={logout} className="bg-slate-700 hover:bg-[var(--color-primary)] hover:text-white text-slate-300 text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;