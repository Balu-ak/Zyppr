import React, { useState, useRef, useEffect, useContext } from 'react';
import type { ChatMessage, ZypprResponse, Service, Appointment, Notification, User } from '../types';
import { SendIcon, BotIcon, WrenchScrewdriverIcon, UserCircleIcon, ClockIcon, CurrencyDollarIcon, TagIcon } from './icons';
import * as geminiService from '../services/geminiService';
import { BusinessContext } from '../context/BusinessContext';
import { AuthContext } from '../context/AuthContext';
import BookingModal from './BookingModal';
import { getNextDateForDay } from '../lib/utils';


const ServiceCard: React.FC<{ service: Service, onBook: (service: Service) => void }> = ({ service, onBook }) => (
    <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
        <h3 className="font-bold text-[var(--color-primary)]">{service.name}</h3>
        <p className="text-sm text-slate-300 mt-1">{service.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> {service.duration_minutes} min</span>
            <span className="flex items-center gap-1.5"><CurrencyDollarIcon className="w-4 h-4" /> ${service.price?.amount} {service.price?.currency}</span>
            <span className="flex items-center gap-1.5"><TagIcon className="w-4 h-4" /> {service.category}</span>
        </div>
         {service.weekly_schedule && service.weekly_schedule.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-600">
                <h4 className="text-xs font-bold text-slate-400 mb-1">Weekly Timings</h4>
                <p className="text-xs text-slate-300">
                    {service.weekly_schedule.map(s => `${s.day.substring(0,3)} ${s.time}`).join(' | ')}
                </p>
            </div>
        )}
        <button 
            onClick={() => onBook(service)}
            className="w-full mt-4 bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors text-sm"
        >
            Book Now
        </button>
    </div>
);

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
    <div className="bg-slate-700 rounded-lg p-4 border border-green-600">
        <h3 className="font-bold text-green-400">Appointment Confirmed</h3>
        <div className="mt-2 text-sm space-y-1 text-slate-300">
            <p><strong className="font-medium text-slate-200">Service:</strong> {appointment.service_name}</p>
            <p><strong className="font-medium text-slate-200">Customer:</strong> {appointment.customer.name}</p>
            <p><strong className="font-medium text-slate-200">When:</strong> {new Date(appointment.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
    </div>
);

const NotificationDisplay: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div className="bg-indigo-900/50 rounded-lg p-4 border border-indigo-700 text-sm text-indigo-200">
        <p className="font-semibold">📢 New Notification</p>
        <p className="mt-1">{notification.message}</p>
    </div>
);

const AiResponse: React.FC<{ data: ZypprResponse, onBookService: (service: Service) => void }> = ({ data, onBookService }) => {
    const { response } = data;

    if (!response) {
        return (
            <div className="bg-red-900/50 p-3 rounded-lg border border-red-700 text-sm text-red-200">
                <p className="font-semibold">An error occurred:</p>
                <ul className="list-disc list-inside">
                    <li>The AI returned an incomplete response. Please try your request again.</li>
                </ul>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {response.assistant_reply && <p>{response.assistant_reply}</p>}
            {response.notification && <NotificationDisplay notification={response.notification} />}
            {response.appointments && response.appointments.map(app => <AppointmentCard key={app.id} appointment={app} />)}
            {response.services && response.services.length > 0 && (
                <div>
                    <h3 className="font-semibold text-slate-300 mb-2">Here are the available services:</h3>
                    <div className="space-y-2">
                        {response.services.map(svc => <ServiceCard key={svc.id || svc.name} service={svc} onBook={onBookService} />)}
                    </div>
                </div>
            )}
            {response.available_slots && response.available_slots.length > 0 && (
                 <div>
                    <h3 className="font-semibold text-slate-300 mb-2">Here are some available times:</h3>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                       {response.available_slots.map((slot, i) => (
                           <li key={i}>{slot.service_name} on {new Date(slot.start_time).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</li>
                       ))}
                    </ul>
                </div>
            )}
            {response.clarifying_questions && (
                <div className="bg-yellow-900/50 p-3 rounded-lg border border-yellow-700 text-sm text-yellow-200">
                    <p className="font-semibold mb-2">Please provide more information:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {response.clarifying_questions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                </div>
            )}
            {response.errors && (
                <div className="bg-red-900/50 p-3 rounded-lg border border-red-700 text-sm text-red-200">
                    <p className="font-semibold">An error occurred:</p>
                    <ul className="list-disc list-inside">{response.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                </div>
            )}
        </div>
    );
};

interface ConversationsProps {
  initialPrompt?: string;
  showRoleSwitcher?: boolean;
}

const Conversations: React.FC<ConversationsProps> = ({ initialPrompt, showRoleSwitcher = true }) => {
    const [role, setRole] = useState<'user' | 'business_owner'>('user');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState(initialPrompt || '');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { businessProfile } = useContext(BusinessContext);
    const { user, addAppointment } = useContext(AuthContext);
    const inputRef = useRef<HTMLInputElement>(null);

    // Booking Modal State
    const [bookingService, setBookingService] = useState<Service | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if(initialPrompt) {
            setUserInput(initialPrompt);
            inputRef.current?.focus();
        }
    }, [initialPrompt]);
    
    useEffect(() => {
        setMessages([]);
    }, [businessProfile]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const newUserMessage: ChatMessage = { id: Date.now(), sender: 'human', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        const aiResponseData = await geminiService.callZypprAPI(userInput, role, businessProfile, user);

        if (aiResponseData.operation === 'CREATE_APPOINTMENT' && aiResponseData.status === 'success' && aiResponseData.response?.appointments?.[0]) {
            const newAppointment = aiResponseData.response.appointments[0];
            const { id, ...appointmentData } = newAppointment;
            addAppointment(businessProfile.id, appointmentData);
        }

        const newAiMessage: ChatMessage = { id: Date.now() + 1, sender: 'ai', data: aiResponseData };
        setMessages(prev => [...prev, newAiMessage]);
        setIsLoading(false);
    };

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
                name: `${(user.profile as any).first_name} ${(user.profile as any).last_name}`,
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
        
        const confirmationText = `Successfully booked ${bookingService.name} for ${startTime.toLocaleString()}! This has been added to your appointments.`;
        
        const bookingConfirmationMessage: ChatMessage = {
            id: Date.now(),
            sender: 'ai',
            data: {
                operation: 'ASSIST',
                role: 'user',
                status: 'success',
                response: {
                    assistant_reply: confirmationText,
                }
            }
        };
        setMessages(prev => [...prev, bookingConfirmationMessage]);
    };

    return (
        <div className="flex flex-col h-full bg-slate-800 rounded-xl shadow-lg">
            {notification && (
                 <div className="absolute top-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-down">
                    {notification}
                </div>
            )}
            <BookingModal
                isOpen={!!bookingService}
                service={bookingService}
                onClose={() => setBookingService(null)}
                onConfirm={handleConfirmBooking}
            />
            <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                    <BotIcon className="w-8 h-8 text-[var(--color-primary)]" />
                    <div>
                        <h1 className="text-xl font-bold">Zyppr AI Assistant</h1>
                        <p className="text-sm text-slate-400">{businessProfile.name}</p>
                    </div>
                </div>
                {showRoleSwitcher && (
                    <div className="flex items-center bg-slate-900/50 p-1 rounded-lg">
                        <button onClick={() => setRole('user')} className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 ${role === 'user' ? 'bg-[var(--color-primary)] text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                            <UserCircleIcon className="w-5 h-5" /> User
                        </button>
                        <button onClick={() => setRole('business_owner')} className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 ${role === 'business_owner' ? 'bg-[var(--color-secondary)] text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                            <WrenchScrewdriverIcon className="w-5 h-5" /> Admin
                        </button>
                    </div>
                )}
            </header>
            
            <main className="flex-1 p-6 overflow-y-auto space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 mt-8">
                        <p>Start a conversation with the AI Assistant.</p>
                        <p className="text-sm">You are currently in <strong className={role === 'user' ? 'text-[var(--color-primary)]' : 'text-[var(--color-secondary)]'}>{role === 'user' ? 'user' : 'admin'}</strong> mode.</p>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'human' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <BotIcon className="w-8 h-8 p-1.5 bg-[var(--color-primary)] text-white rounded-full flex-shrink-0 mt-1" />}
                        <div className={`max-w-xl px-4 py-3 rounded-xl ${msg.sender === 'human' ? 'bg-slate-700 text-white rounded-br-none' : 'bg-slate-900/50 text-white rounded-bl-none border border-slate-700'}`}>
                            {msg.sender === 'human' ? <p>{msg.text}</p> : <AiResponse data={msg.data!} onBookService={handleOpenBookingModal} />}
                        </div>
                    </div>
                ))}

                {isLoading && (
                     <div className="flex items-start gap-3 justify-start">
                        <BotIcon className="w-8 h-8 p-1.5 bg-[var(--color-primary)] text-white rounded-full flex-shrink-0 mt-1" />
                        <div className="max-w-xl px-4 py-3 rounded-xl bg-slate-900/50 text-white rounded-bl-none border border-slate-700">
                             <div className="flex items-center justify-center space-x-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t border-slate-700 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={role === 'user' ? "e.g., 'What services do you offer?'" : "e.g., 'Add a new pilates class for $25'"}
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-l-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-r-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:bg-slate-600" disabled={isLoading}>
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default Conversations;