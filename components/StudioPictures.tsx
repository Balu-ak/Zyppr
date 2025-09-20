import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { BusinessProfile, StudioPicture } from '../types';

const StudioPictures: React.FC = () => {
    const { user, addPicture } = useContext(AuthContext);
    const businessProfile = user?.profile as BusinessProfile;
    // For demo purposes, we manage pictures in local state that get pushed to context
    const [pictures, setPictures] = useState<StudioPicture[]>(businessProfile.pictures || []);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageCaption, setNewImageCaption] = useState('');

    const handleAddPicture = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newImageUrl.trim()) return;

        // In a real app, you'd get the business ID from the logged-in user's session
        // For now, we'll assume there's a way to get it, e.g. from a related business object
        // Let's find the business that matches the profile name
        // This is a simplification for the demo
        const mockBusinessId = `biz_${businessProfile.business_name.replace(/\s/g, '_')}`;

        const newPicture = { url: newImageUrl, caption: newImageCaption };
        addPicture(mockBusinessId, newPicture); // Update context
        setPictures(prev => [...prev, { id: `pic_${Date.now()}`, ...newPicture }]); // Update local state for immediate render
        
        setNewImageUrl('');
        setNewImageCaption('');
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Add a New Photo</h2>
                <form onSubmit={handleAddPicture} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-300">Image URL</label>
                        <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full bg-slate-700 p-2 mt-1 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300">Caption (optional)</label>
                        <input
                            type="text"
                            value={newImageCaption}
                            onChange={(e) => setNewImageCaption(e.target.value)}
                            placeholder="e.g., Our main yoga hall"
                            className="w-full bg-slate-700 p-2 mt-1 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                        />
                    </div>
                    <div className="text-right">
                        <button type="submit" className="bg-[var(--color-primary)] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors">
                            Add Photo
                        </button>
                    </div>
                </form>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-white mb-4">Your Studio Photos</h1>
                {pictures.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pictures.map(pic => (
                            <div key={pic.id} className="bg-slate-800 rounded-lg overflow-hidden shadow-lg group">
                                <img src={pic.url} alt={pic.caption} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <p className="text-sm text-slate-300 truncate">{pic.caption || 'Untitled'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-800 rounded-xl">
                        <h3 className="text-xl font-semibold text-white">No photos uploaded yet.</h3>
                        <p className="text-slate-400 mt-2">Use the form above to add photos of your studio or gym.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudioPictures;