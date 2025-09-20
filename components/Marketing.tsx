import React, { useState, useContext } from 'react';
import type { MarketingPost, SocialPlatform, PostTone } from '../types';
import * as geminiService from '../services/geminiService';
import { BusinessContext } from '../context/BusinessContext';

const Marketing: React.FC = () => {
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { businessProfile } = useContext(BusinessContext);
  const [platform, setPlatform] = useState<SocialPlatform>('Instagram');
  const [tone, setTone] = useState<PostTone>('Promotional');

  const handleGeneratePost = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { text, imageUrl } = await geminiService.generateMarketingPost(businessProfile.type, platform, tone);
      const newPost: MarketingPost = {
        id: Date.now(),
        text,
        imageUrl,
        platform,
        generatedAt: new Date(),
      };
      setPosts(prevPosts => [newPost, ...prevPosts]);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred during post generation.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const PostSkeleton: React.FC = () => (
    <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="w-full h-80 bg-slate-700"></div>
      <div className="p-6">
        <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-white mb-1">Generate Marketing Content</h2>
          <p className="text-slate-400 mb-6">Select your options and let Zyppr generate a new social media post for your business.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col">
                <label htmlFor="businessType" className="text-sm font-medium text-slate-300 mb-2">Business Type</label>
                <div 
                    id="businessType"
                    className="bg-slate-700 rounded-lg px-3 py-2 text-sm text-white/70 w-full"
                >
                    {businessProfile.type}
                </div>
            </div>

            <div className="flex flex-col">
                <label htmlFor="platform" className="text-sm font-medium text-slate-300 mb-2">Platform</label>
                <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value as SocialPlatform)} className="bg-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-full">
                    <option>Instagram</option>
                    <option>Facebook</option>
                    <option>Twitter</option>
                </select>
            </div>

            <div className="flex flex-col">
                <label htmlFor="tone" className="text-sm font-medium text-slate-300 mb-2">Tone</label>
                <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as PostTone)} className="bg-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-full">
                    <option>Promotional</option>
                    <option>Informative</option>
                    <option>Engaging</option>
                </select>
            </div>
            
            <button
                onClick={handleGeneratePost}
                disabled={isLoading}
                className="bg-[var(--color-primary)] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center w-full"
            >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
                </>
            ) : '✨ Generate Post'}
            </button>
        </div>
      </div>
        {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading && <PostSkeleton />}
        {posts.map(post => (
          <div key={post.id} className="bg-slate-800 rounded-xl shadow-lg overflow-hidden group">
            <img src={post.imageUrl} alt="Generated marketing" className="w-full h-80 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-[var(--color-secondary)]">{post.platform} Post</span>
                <span className="text-xs text-slate-400">{post.generatedAt.toLocaleDateString()}</span>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap">{post.text}</p>
            </div>
          </div>
        ))}
        {posts.length === 0 && !isLoading && (
            <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-slate-800 rounded-xl">
                <h3 className="text-xl font-semibold text-white">No posts generated yet.</h3>
                <p className="text-slate-400 mt-2">Click the "Generate Post" button to get started!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Marketing;