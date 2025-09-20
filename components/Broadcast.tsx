import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { BusinessProfile, Announcement } from '../types';

const Broadcast: React.FC = () => {
    const { user, addAnnouncement } = useContext(AuthContext);
    const businessProfile = user?.profile as BusinessProfile;
    const [announcements, setAnnouncements] = useState<Announcement[]>(businessProfile.announcements || []);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSendBroadcast = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSending(true);

        // This is a mock. A real app would have a backend to send this.
        setTimeout(() => {
            const mockBusinessId = `biz_${businessProfile.business_name.replace(/\s/g, '_')}`;
            addAnnouncement(mockBusinessId, newMessage);
            const newAnnouncement: Announcement = {
                id: `ann_${Date.now()}`,
                message: newMessage,
                timestamp: new Date().toISOString()
            };
            setAnnouncements(prev => [newAnnouncement, ...prev]);
            setNewMessage('');
            setIsSending(false);
        }, 500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4">New Broadcast Message</h2>
                    <p className="text-sm text-slate-400 mb-4">Send an announcement to all your subscribed customers.</p>
                    <form onSubmit={handleSendBroadcast}>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            rows={5}
                            placeholder="e.g., The gym will be closed on Monday for the holiday."
                            className="w-full bg-slate-700 text-white p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full mt-4 bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {isSending ? 'Sending...' : 'Send to All Customers'}
                        </button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-white">Past Announcements</h2>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {announcements.length > 0 ? (
                            announcements.map(ann => (
                                <div key={ann.id} className="bg-slate-700 p-4 rounded-lg">
                                    <p className="text-slate-300">{ann.message}</p>
                                    <p className="text-xs text-slate-500 mt-2 text-right">
                                        {new Date(ann.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 text-center py-8">No announcements have been sent yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Broadcast;