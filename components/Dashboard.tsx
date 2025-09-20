import React, { useContext } from 'react';
import Card from './Card';
import { ConversationsIcon, CalendarIcon, MarketingIcon, LightbulbIcon } from './icons';
import { BusinessContext } from '../context/BusinessContext';

const Dashboard: React.FC = () => {
  const { businessProfile } = useContext(BusinessContext);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome, {businessProfile.type} Owner!</h1>
        <p className="text-slate-400 mt-1">Here's a summary of your Zyppr assistant's activity this week.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Inquiries Handled" value="42" description="New customer conversations">
            <ConversationsIcon className="w-8 h-8 text-[var(--color-primary)]" />
        </Card>
        <Card title="Appointments Booked" value="15" description="Successfully scheduled via AI">
            <CalendarIcon className="w-8 h-8 text-[var(--color-success)]" />
        </Card>
        <Card title="Marketing Posts" value="2" description="Generated for social media">
            <MarketingIcon className="w-8 h-8 text-[var(--color-secondary)]" />
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">AI-Powered Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl shadow-lg p-6 flex items-start hover:bg-slate-700 transition-colors duration-200">
                <div className="bg-[var(--color-accent)]/20 text-[var(--color-accent)] p-3 rounded-full mr-4">
                    <LightbulbIcon className="w-6 h-6"/>
                </div>
                <div>
                    <h3 className="font-semibold text-white">Smart Suggestion</h3>
                    <p className="text-slate-300 mt-1 text-sm">You have 5 clients who haven't booked in over a month. Would you like to generate a re-engagement post for them?</p>
                    <button className="mt-3 bg-[var(--color-accent)] text-white text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-opacity-80 transition-colors">Generate Post</button>
                </div>
            </div>
             <div className="bg-slate-800 rounded-xl shadow-lg p-6 flex items-start hover:bg-slate-700 transition-colors duration-200">
                <div className="bg-indigo-500/20 text-indigo-300 p-3 rounded-full mr-4">
                    <LightbulbIcon className="w-6 h-6"/>
                </div>
                <div>
                    <h3 className="font-semibold text-white">Weekly Analytics</h3>
                    <p className="text-slate-300 mt-1 text-sm">Your most popular class this week was 'Sunrise Yoga'. Consider adding another session on weekends to maximize attendance.</p>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <ul className="space-y-4 text-slate-300">
              <li className="flex items-center"><span className="bg-green-500/20 text-green-400 text-xs font-bold mr-3 px-2.5 py-1 rounded-full">BOOKED</span>Appointment with Jane Doe for 'Sunrise Yoga' on Oct 26.</li>
              <li className="flex items-center"><span className="bg-purple-500/20 text-purple-400 text-xs font-bold mr-3 px-2.5 py-1 rounded-full">POSTED</span>New Instagram post about 'Weekend Special' offer.</li>
              <li className="flex items-center"><span className="bg-sky-500/20 text-sky-400 text-xs font-bold mr-3 px-2.5 py-1 rounded-full">INQUIRY</span>New conversation started with +1-555-123-4567.</li>
              <li className="flex items-center"><span className="bg-slate-500/20 text-slate-400 text-xs font-bold mr-3 px-2.5 py-1 rounded-full">CLOSED</span>Conversation with John Smith archived.</li>
          </ul>
      </div>
    </div>
  );
};

export default Dashboard;