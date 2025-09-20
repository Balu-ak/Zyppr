import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BotIcon } from './icons';
import type { Role } from '../types';

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [role, setRole] = useState<Role>('user');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup } = useContext(AuthContext);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginView) {
        await login(formData.email, formData.password, role);
      } else {
        await signup(role, formData);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
        setIsLoading(false);
    }
  };
  
  const renderSignupFields = useMemo(() => {
    if (role === 'user') {
        return (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <input name="first_name" placeholder="First Name *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                    <input name="last_name" placeholder="Last Name *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                </div>
                <input name="address" placeholder="Address *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                <div className="grid grid-cols-2 gap-4">
                    <input name="zipcode" placeholder="Zipcode *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                    <input name="apartment_number" placeholder="Apt #" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" />
                </div>
                <input name="password" type="password" placeholder="Password *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                <input name="confirm_password" type="password" placeholder="Confirm Password *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
            </>
        );
    } else { // business_owner
        return (
            <>
                <input name="business_name" placeholder="Business Name *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                <input name="address" placeholder="Business Address *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                 <div className="grid grid-cols-2 gap-4">
                    <input name="zipcode" placeholder="Zipcode *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
                    <select name="category" onChange={handleInputChange} defaultValue="" className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required>
                        <option value="" disabled>Category... *</option>
                        <option value="Yoga">Yoga Studio</option>
                        <option value="Fitness">Gym / Fitness Center</option>
                        <option value="Yoga & Fitness Center">Yoga & Fitness Center</option>
                    </select>
                </div>
                <input name="password" type="password" placeholder="Password *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
            </>
        )
    }
  }, [role]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <BotIcon className="w-16 h-16 text-[var(--color-primary)] mx-auto" />
            <h1 className="text-4xl font-bold text-white mt-4">Welcome to Zyppr</h1>
            <p className="text-slate-400 mt-2">Your AI Operations Assistant for Wellness & Fitness.</p>
        </div>
        
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl">
          <div className="flex border-b border-slate-700 mb-6">
            <button onClick={() => {setIsLoginView(true); setFormData({})}} className={`w-1/2 py-3 font-semibold text-sm transition-colors ${ isLoginView ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-slate-400 hover:text-white' }`} >
              Login
            </button>
            <button onClick={() => {setIsLoginView(false); setFormData({})}} className={`w-1/2 py-3 font-semibold text-sm transition-colors ${ !isLoginView ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-slate-400 hover:text-white' }`}>
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">I am a...</label>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setRole('user')} className={`w-1/2 p-3 rounded-lg font-semibold text-sm border-2 transition-colors ${role === 'user' ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-slate-600 hover:border-slate-500'}`}>
                        Customer
                    </button>
                    <button type="button" onClick={() => setRole('business_owner')} className={`w-1/2 p-3 rounded-lg font-semibold text-sm border-2 transition-colors ${role === 'business_owner' ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-slate-600 hover:border-slate-500'}`}>
                        Business Owner
                    </button>
                </div>
              </div>

            <input name="email" type="email" placeholder="Email Address *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
            
            {isLoginView ? (
                 <input name="password" type="password" placeholder="Password *" onChange={handleInputChange} className="w-full bg-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" required />
            ) : (
                renderSignupFields
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button type="submit" disabled={isLoading} className="w-full bg-[var(--color-primary)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
              {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;