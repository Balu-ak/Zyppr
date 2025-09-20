import React, { useState, useContext } from 'react';
import type { Business, View } from '../types';
import Services from './Services';
import Conversations from './Conversations';
import { BusinessContext } from '../context/BusinessContext';

interface BusinessDetailViewProps {
  business: Business;
  onBack: () => void;
}

type DetailView = 'services' | 'conversations';

const BusinessDetailView: React.FC<BusinessDetailViewProps> = ({ business, onBack }) => {
    const { setBusinessProfile } = useContext(BusinessContext);
    const [view, setView] = useState<DetailView>('services');
    const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
    
    // Set the global business context to the selected business
    React.useEffect(() => {
        setBusinessProfile(business);
    }, [business, setBusinessProfile]);

    const handleSetView = (newView: View | 'conversations', prompt?: string) => {
        if (newView === 'conversations' || newView === 'services') {
            setView(newView as DetailView);
            setInitialPrompt(prompt);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <button onClick={onBack} className="text-sm text-[var(--color-primary)] hover:underline mb-4">
                        &larr; Back to all businesses
                    </button>
                    <h1 className="text-3xl font-bold text-white">{business.name}</h1>
                    <p className="text-slate-400 mt-1">{business.address}</p>
                </div>
                 <div className="flex items-center bg-slate-800 p-1 rounded-lg mt-4">
                    <button onClick={() => setView('services')} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${view === 'services' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        Services
                    </button>
                    <button onClick={() => setView('conversations')} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${view === 'conversations' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        Ask AI Assistant
                    </button>
                </div>
            </div>

            {business.pictures.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {business.pictures.slice(0, 4).map(pic => (
                        <div key={pic.id} className="aspect-video rounded-lg overflow-hidden">
                            <img src={pic.url} alt={pic.caption} className="w-full h-full object-cover"/>
                        </div>
                    ))}
                </div>
            )}
            
            {view === 'services' ? (
                <Services setCurrentView={handleSetView} forceUserView={true} />
            ) : (
                 <div className="h-[calc(80vh)]">
                    <Conversations initialPrompt={initialPrompt} showRoleSwitcher={false} />
                 </div>
            )}
        </div>
    );
};

export default BusinessDetailView;