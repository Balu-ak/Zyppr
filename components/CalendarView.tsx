import React, { useState, useContext, useEffect } from 'react';
import type { Appointment } from '../types';
import * as geminiService from '../services/geminiService';
import { CalendarIcon, EditIcon, XMarkIcon } from './icons';
import { BusinessContext } from '../context/BusinessContext';
import { AuthContext } from '../context/AuthContext';

const CalendarView: React.FC = () => {
  const { businessProfile } = useContext(BusinessContext);
  const { user, businesses, addAppointment, cancelAppointment } = useContext(AuthContext);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pastedConversation, setPastedConversation] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [currentEditData, setCurrentEditData] = useState<Appointment | null>(null);

  useEffect(() => {
    const currentBusinessData = businesses.find(b => b.id === businessProfile.id);
    const businessAppointments = currentBusinessData?.appointments || [];
    setAppointments(businessAppointments.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));
  }, [businesses, businessProfile.id]);


  const handleStartEdit = (appointment: Appointment) => {
    setEditingAppointmentId(appointment.id);
    setCurrentEditData({ ...appointment });
  };

  const handleCancelEdit = () => {
    setEditingAppointmentId(null);
    setCurrentEditData(null);
  };

  const handleSaveEdit = () => {
    if (!currentEditData) return;
    // In a real app, this would call a context function `updateAppointment`
    setAppointments(prev =>
        prev.map(app => (app.id === currentEditData.id ? currentEditData : app))
    );
    handleCancelEdit();
  };
  
  const formatDateForInput = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleParseConversation = async () => {
    if (!pastedConversation.trim()) {
        setError("Please paste a conversation text.");
        return;
    }
    setIsParsing(true);
    setError(null);
    try {
        const result = await geminiService.callZypprAPI(pastedConversation, 'business_owner', businessProfile, user);
        
        if (result.response?.appointments && result.response.appointments.length > 0) {
            const newAppointmentData = result.response.appointments[0];
            const { id, ...appointmentToSave } = newAppointmentData;
            addAppointment(businessProfile.id, appointmentToSave);
            setPastedConversation('');
        } else if (result.response?.errors && result.response.errors.length > 0) {
            setError(result.response.errors.join(', '));
        } else if (result.response?.clarifying_questions && result.response.clarifying_questions.length > 0) {
            setError(`The AI needs more information: ${result.response.clarifying_questions.join(', ')}`);
        } else {
            setError("The AI could not extract appointment details from the text.");
        }
    } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError("An unknown error occurred.");
        }
    } finally {
        setIsParsing(false);
    }
  };

  const handleAdminCancelAppointment = async (appointmentId: string) => {
    if (window.confirm("Are you sure you want to cancel this customer's appointment?")) {
        setError(null);
        try {
            await cancelAppointment(appointmentId);
            // The useEffect hook will automatically update the component's state
        } catch (err) {
            setError((err as Error).message);
        }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-white">Upcoming Appointments</h2>
          <div className="space-y-4">
            {appointments.map(app => (
              <div key={app.id} className={`bg-slate-700 p-4 rounded-lg transition-all duration-300 ${app.status === 'cancelled' ? 'opacity-50' : ''}`}>
                {editingAppointmentId === app.id && currentEditData ? (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-slate-400">Customer Name</label>
                            <input type="text" value={currentEditData.customer.name} onChange={(e) => setCurrentEditData({...currentEditData, customer: {...currentEditData.customer, name: e.target.value}})} className="w-full bg-slate-600 text-white p-2 rounded-md text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-400">Service</label>
                            <input type="text" value={currentEditData.service_name} onChange={(e) => setCurrentEditData({...currentEditData, service_name: e.target.value})} className="w-full bg-slate-600 text-white p-2 rounded-md text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-400">Date & Time</label>
                            <input type="datetime-local" value={formatDateForInput(new Date(currentEditData.start_time))} onChange={(e) => setCurrentEditData({...currentEditData, start_time: new Date(e.target.value).toISOString()})} className="w-full bg-slate-600 text-white p-2 rounded-md text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={handleCancelEdit} className="bg-slate-600 text-white font-semibold py-1.5 px-4 rounded-lg hover:bg-slate-500 transition-colors text-sm">Cancel</button>
                            <button onClick={handleSaveEdit} className="bg-green-500 text-white font-semibold py-1.5 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm">Save</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] p-3 rounded-full mr-4">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`font-semibold text-white ${app.status === 'cancelled' ? 'line-through' : ''}`}>{app.service_name}</p>
                                <p className="text-sm text-slate-300">{app.customer.name}</p>
                                {app.status === 'cancelled' && <span className="text-xs font-bold text-red-400 uppercase">Cancelled</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <p className={`font-medium text-white ${app.status === 'cancelled' ? 'line-through' : ''}`}>{new Date(app.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                <p className={`text-sm text-slate-300 ${app.status === 'cancelled' ? 'line-through' : ''}`}>{new Date(app.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                             {app.status === 'confirmed' && (
                                <>
                                    <button onClick={() => handleStartEdit(app)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-600 transition-colors" title="Edit Appointment">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleAdminCancelAppointment(app.id)} className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-slate-600 transition-colors" title="Cancel Appointment">
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
              </div>
            ))}
             {appointments.length === 0 && (
                <p className="text-center text-slate-400 py-8">No appointments found for this business.</p>
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
           <h2 className="text-xl font-bold mb-4 text-white">Create Booking from Text</h2>
           <p className="text-sm text-slate-400 mb-4">Paste a conversation log below. The AI will extract the details and create an appointment.</p>
           <textarea
             value={pastedConversation}
             onChange={(e) => setPastedConversation(e.target.value)}
             rows={8}
             placeholder="e.g., User: Hi, I want to book a Vinyasa Flow class. AI: Sure, when? User: How about Friday at 5pm? My name is John Doe."
             className="w-full bg-slate-700 text-white p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
           />
           {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
           <button
             onClick={handleParseConversation}
             disabled={isParsing}
             className="w-full mt-4 bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
           >
            {isParsing ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Parsing...
                </>
            ) : 'Parse & Book'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;