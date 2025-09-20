import React, { useState, useEffect, useContext } from 'react';
import { BusinessContext } from '../context/BusinessContext';
import { AuthContext } from '../context/AuthContext';
import type { Service, View, Appointment, User } from '../types';
import * as geminiService from '../services/geminiService';
import { ClockIcon, CurrencyDollarIcon, TagIcon, WrenchScrewdriverIcon, UserCircleIcon, SparklesIcon } from './icons';
import BookingModal from './BookingModal';
import { getNextDateForDay } from '../lib/utils';


interface ServicesProps {
    setCurrentView: (view: View | 'conversations', initialPrompt?: string) => void;
    forceUserView?: boolean;
}

const ServiceCard: React.FC<{ service: Service, onBook: (service: Service) => void, role: 'user' | 'business_owner' }> = ({ service, onBook, role }) => (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-[var(--color-primary)] pr-2">{service.name}</h3>
              {service.is_demo && <span className="text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full flex-shrink-0">Demo</span>}
            </div>
            <p className="text-sm text-slate-300 mt-1 min-h-[40px]">{service.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> {service.duration_minutes} min</span>
                <span className="flex items-center gap-1.5"><CurrencyDollarIcon className="w-4 h-4" /> ${service.price?.amount} {service.price?.currency}</span>
                <span className="flex items-center gap-1.5"><TagIcon className="w-4 h-4" /> {service.category}</span>
            </div>
            {service.weekly_schedule && service.weekly_schedule.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700">
                    <h4 className="text-xs font-bold text-slate-400 mb-1">Weekly Timings</h4>
                    <p className="text-xs text-slate-300">
                        {service.weekly_schedule.map(s => `${s.day.substring(0,3)} ${s.time}`).join(' | ')}
                    </p>
                </div>
            )}
        </div>
        {role === 'user' && (
            <button 
                onClick={() => onBook(service)}
                className="w-full mt-4 bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors text-sm"
            >
                Book Now
            </button>
        )}
    </div>
);

const Services: React.FC<ServicesProps> = ({ setCurrentView, forceUserView = false }) => {
    const [role, setRole] = useState<'user' | 'business_owner'>(forceUserView ? 'user' : 'user');
    const { businessProfile } = useContext(BusinessContext);
    const { user, businesses, addService, addAppointment } = useContext(AuthContext);

    const currentBusinessData = businesses.find(b => b.id === businessProfile.id) || businessProfile;
    
    // State for booking modal
    const [bookingService, setBookingService] = useState<Service | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    
    // Form state for adding a new service
    const [newService, setNewService] = useState({ name: '', description: '', duration: '60', price: '25', category: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpenBookingModal = (service: Service) => {
        setBookingService(service);
    };

    const handleConfirmBooking = (selectedSlot: { day: string; time: string }) => {
        if (!bookingService || !user || user.role !== 'user') return;

        const startTime = getNextDateForDay(selectedSlot.day, selectedSlot.time);
        const endTime = new Date(startTime.getTime() + bookingService.duration_minutes * 60000);

        const newAppointment: Omit<Appointment, 'id'> = {
            service_id: bookingService.id,
            service_name: bookingService.name,
            customer: {
                name: `${user.profile.first_name} ${user.profile.last_name}`,
                email: user.email,
                phone: null,
            },
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            notes: null,
            status: 'confirmed',
        };

        addAppointment(businessProfile.id, newAppointment);
        setBookingService(null);
        
        setNotification(`Successfully booked ${bookingService.name} for ${startTime.toLocaleString()}!`);
        setTimeout(() => setNotification(null), 5000);
    };
    
    const handleGenerateDescription = async () => {
        if (!newService.name) return;
        const desc = await geminiService.generateDescription(newService.name, businessProfile.type);
        setNewService(prev => ({ ...prev, description: desc }));
    };

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        const serviceToAdd = {
            name: newService.name,
            description: newService.description,
            duration_minutes: parseInt(newService.duration, 10),
            price: {
                amount: parseFloat(newService.price),
                currency: 'USD'
            },
            category: newService.category,
            tags: [],
            is_demo: false,
        };
        addService(businessProfile.id, serviceToAdd);
        setNewService({ name: '', description: '', duration: '60', price: '25', category: '' }); // Reset form
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            {notification && (
                <div className="fixed top-24 right-8 bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg z-50 animate-fade-in-down">
                    {notification}
                </div>
            )}
            <BookingModal
                isOpen={!!bookingService}
                service={bookingService}
                onClose={() => setBookingService(null)}
                onConfirm={handleConfirmBooking}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Services</h1>
                    <p className="text-slate-400 mt-1">
                        {role === 'user' && !forceUserView ? `Browse services at ${businessProfile.name}` : `Manage your available services`}
                        {forceUserView && `Browse services at ${businessProfile.name}`}
                    </p>
                </div>
                {!forceUserView && (
                    <div className="flex items-center bg-slate-800 p-1 rounded-lg">
                        <button onClick={() => setRole('user')} className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 ${role === 'user' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                            <UserCircleIcon className="w-5 h-5" /> User View
                        </button>
                        <button onClick={() => setRole('business_owner')} className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 ${role === 'business_owner' ? 'bg-[var(--color-secondary)] text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                            <WrenchScrewdriverIcon className="w-5 h-5" /> Admin View
                        </button>
                    </div>
                )}
            </div>

            {role === 'business_owner' && !forceUserView && (
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Add a New Service</h2>
                    <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">Service Name</label>
                            <input type="text" value={newService.name} onChange={(e) => setNewService(prev => ({...prev, name: e.target.value}))} className="w-full bg-slate-700 p-2 mt-1 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-slate-300 flex justify-between items-center">Description</label>
                            <div className="relative">
                                <textarea value={newService.description} onChange={(e) => setNewService(prev => ({...prev, description: e.target.value}))} rows={2} className="w-full bg-slate-700 p-2 mt-1 rounded-md pr-10 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" />
                                <button type="button" onClick={handleGenerateDescription} title="Generate with AI" className="absolute top-2 right-2 text-slate-400 hover:text-[var(--color-primary)]"><SparklesIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300">Duration (minutes)</label>
                            <input type="number" value={newService.duration} onChange={(e) => setNewService(prev => ({...prev, duration: e.target.value}))} className="w-full bg-slate-700 p-2 mt-1 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                        </div>
                        <div>
                             <label className="text-sm font-medium text-slate-300">Price (USD)</label>
                            <input type="number" value={newService.price} onChange={(e) => setNewService(prev => ({...prev, price: e.target.value}))} className="w-full bg-slate-700 p-2 mt-1 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                        </div>
                         <div className="md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">Category</label>
                            <input type="text" placeholder={businessProfile.type === 'Yoga Studio' ? 'e.g., Yoga, Meditation' : 'e.g., Fitness, Membership'} value={newService.category} onChange={(e) => setNewService(prev => ({...prev, category: e.target.value}))} className="w-full bg-slate-700 p-2 mt-1 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                        </div>
                        <div className="md:col-span-2 text-right">
                             <button type="submit" disabled={isSubmitting} className="bg-green-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors disabled:bg-slate-600">
                                {isSubmitting ? 'Adding...' : 'Add Service'}
                            </button>
                        </div>
                    </form>
                     {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
            )}

            {(currentBusinessData.services?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentBusinessData.services!.map(service => (
                        <ServiceCard key={service.id} service={service} onBook={handleOpenBookingModal} role={role} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 bg-slate-800 rounded-xl">
                    <h3 className="text-xl font-semibold text-white">No services found.</h3>
                    <p className="text-slate-400 mt-2">{role === 'business_owner' ? "Use the form above to add your first service." : "This business hasn't listed any services yet."}</p>
                </div>
            )}
        </div>
    );
};

export default Services;