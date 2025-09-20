import React, { createContext, useState, ReactNode } from 'react';
import type { Business } from '../types';

interface BusinessContextType {
    businessProfile: Business;
    setBusinessProfile: (profile: Business) => void;
}

// FIX: Added missing properties to defaultYogaStudio to match the Business type.
const defaultYogaStudio: Business = {
    id: 'biz_yoga_1',
    name: 'Flow & Glow Yoga',
    timezone: 'America/New_York',
    type: 'Yoga Studio',
    zipcode: '10001',
    address: '123 Zen Rd',
    pictures: [
        {id: 'p1', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120&auto=format&fit=crop', caption: 'Serene studio space'},
        {id: 'p2', url: 'https://images.unsplash.com/photo-1599447462858-a78b544b8b68?q=80&w=2070&auto=format&fit=crop', caption: 'Morning Vinyasa'},
    ],
    announcements: [],
};

export const BusinessContext = createContext<BusinessContextType>({
    businessProfile: defaultYogaStudio,
    setBusinessProfile: () => {},
});

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [businessProfile, setBusinessProfile] = useState<Business>(defaultYogaStudio);

    return (
        <BusinessContext.Provider value={{ businessProfile, setBusinessProfile }}>
            {children}
        </BusinessContext.Provider>
    );
};