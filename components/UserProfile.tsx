import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { CustomerProfile, Appointment } from '../types';
import ConfirmationModal from './ConfirmationModal';

const UserProfile: React.FC = () => {
  const { user, updateUserProfile, resetPassword, getAppointmentsForUser, cancelAppointment, businesses } = useContext(AuthContext);
  const userProfile = user?.profile as CustomerProfile;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CustomerProfile>(userProfile);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // State for cancellation confirmation modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancelId, setAppointmentToCancelId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const allUserAppointments = getAppointmentsForUser(user.id);
      // Filter out cancelled appointments so they don't appear in the list
      setAppointments(allUserAppointments.filter(app => app.status !== 'cancelled'));
    }
  }, [user, businesses, getAppointmentsForUser]); // Depend on businesses to refetch when appointments change

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      if (!user) throw new Error("User not found");
      await updateUserProfile(user.id, formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    try {
      if (!user) throw new Error("User not found");
      await resetPassword(user.id, passwordData.oldPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Password reset successfully!' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    }
  };

  const promptForCancellation = (appointmentId: string) => {
    setAppointmentToCancelId(appointmentId);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (!appointmentToCancelId) return;

    setMessage(null);
    try {
        await cancelAppointment(appointmentToCancelId);
        setMessage({ type: 'success', text: 'Appointment cancelled successfully.' });
    } catch (err) {
        setMessage({ type: 'error', text: (err as Error).message });
    } finally {
        setIsCancelModalOpen(false);
        setAppointmentToCancelId(null);
    }
  };

  if (!user || !userProfile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-8">
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancellation}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel your upcoming Appointment?"
      />
      <div>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 mt-1">Manage your personal information and view your appointment history.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Details */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Personal Information</h2>
          <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        {isEditing ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-300">First Name</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleProfileChange} className="w-full bg-slate-700 p-2 mt-1 rounded-md"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-slate-300">Last Name</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleProfileChange} className="w-full bg-slate-700 p-2 mt-1 rounded-md"/>
                </div>
             </div>
             <div>
                <label className="text-sm font-medium text-slate-300">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleProfileChange} className="w-full bg-slate-700 p-2 mt-1 rounded-md"/>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-300">Zipcode</label>
                    <input type="text" name="zipcode" value={formData.zipcode} onChange={handleProfileChange} className="w-full bg-slate-700 p-2 mt-1 rounded-md"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-slate-300">Apartment # (Optional)</label>
                    <input type="text" name="apartment_number" value={formData.apartment_number || ''} onChange={handleProfileChange} className="w-full bg-slate-700 p-2 mt-1 rounded-md"/>
                </div>
             </div>
            <div className="text-right pt-2">
                <button type="submit" className="bg-green-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-600">Save Changes</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div><strong className="font-medium text-slate-400 block">Name:</strong> {userProfile.first_name} {userProfile.last_name}</div>
            <div><strong className="font-medium text-slate-400 block">Email:</strong> {user.email}</div>
            <div><strong className="font-medium text-slate-400 block">Address:</strong> {userProfile.address}</div>
            <div><strong className="font-medium text-slate-400 block">Zipcode:</strong> {userProfile.zipcode}</div>
          </div>
        )}
      </div>

      {/* Password Reset */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Reset Password</h2>
        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
                <label className="text-sm font-medium text-slate-300">Old Password</label>
                <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} className="w-full bg-slate-700 p-2 mt-1 rounded-md"/>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-300">New Password</label>
                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full bg-slate-700 p-2 mt-1 rounded-md"/>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full bg-slate-700 p-2 mt-1 rounded-md"/>
            </div>
            <div className="md:col-span-3 text-right">
                <button type="submit" className="bg-[var(--color-primary)] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[var(--color-primary-dark)]">Update Password</button>
            </div>
        </form>
      </div>

      {/* Appointment History */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">My Appointments</h2>
        <div className="space-y-4">
            {appointments.length > 0 ? (
                appointments.map(app => (
                    <div key={app.id} className="bg-slate-700 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-white">{app.service_name}</p>
                            <p className={`text-sm capitalize font-medium ${
                                app.status === 'confirmed' ? 'text-green-400' : 'text-slate-300'
                            }`}>{app.status}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="font-medium text-white">{new Date(app.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                <p className="text-sm text-slate-300">{new Date(app.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            {app.status === 'confirmed' && (
                                <button 
                                    onClick={() => promptForCancellation(app.id)}
                                    className="bg-red-500 text-white font-semibold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-xs"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-slate-400 text-center py-8">You have no upcoming appointments.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;