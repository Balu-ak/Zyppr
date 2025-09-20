import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { Business, User, CustomerProfile } from '../types';

interface BusinessListViewProps {
  onSelectBusiness: (business: Business) => void;
}

const BusinessCard: React.FC<{ business: Business, onSelect: () => void }> = ({ business, onSelect }) => {
    const themeClass = business.type.includes('Yoga') ? 'theme-yoga' : 'theme-gym';
    return (
        <div className={`bg-slate-800 rounded-lg shadow-lg overflow-hidden border-t-4 border-transparent ${themeClass} hover:border-[var(--color-primary)] transition-all`}>
            <div className="relative">
                <img src={business.pictures[0]?.url || `https://source.unsplash.com/random/400x200?${business.type}`} alt={business.name} className="w-full h-40 object-cover" />
                {business.is_demo && (
                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">DEMO</span>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-white">{business.name}</h3>
                <p className="text-sm text-slate-400">{business.address}</p>
                <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full mt-3 text-white bg-[var(--color-primary)]/50`}>
                    {business.type}
                </span>
                <button 
                    onClick={onSelect}
                    className={`w-full mt-4 bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary)] transition-colors text-sm`}>
                    View Details
                </button>
            </div>
        </div>
    )
};

const BusinessListView: React.FC<BusinessListViewProps> = ({ onSelectBusiness }) => {
  const { user, businesses } = useContext(AuthContext);
  const userProfile = user?.profile as CustomerProfile;

  const nearbyBusinesses = useMemo(() => {
    if (!userProfile?.zipcode) return businesses;
    // If there are only demo businesses, show them regardless of zipcode. Otherwise, filter by zipcode.
    const realBusinesses = businesses.filter(b => !b.is_demo);
    if (realBusinesses.length === 0) {
        return businesses;
    }
    return businesses.filter(b => b.zipcode === userProfile.zipcode && !b.is_demo);
  }, [userProfile, businesses]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Nearby Studios & Gyms</h1>
        <p className="text-slate-400 mt-1">Showing businesses near your location ({userProfile.zipcode}).</p>
      </div>
      {businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map(business => (
                <BusinessCard key={business.id} business={business} onSelect={() => onSelectBusiness(business)} />
            ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-800 rounded-xl">
            <h3 className="text-xl font-semibold text-white">No businesses found.</h3>
            <p className="text-slate-400 mt-2">We couldn't find any registered businesses in your area ({userProfile.zipcode}).</p>
        </div>
      )}
    </div>
  );
};

export default BusinessListView;