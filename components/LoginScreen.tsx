import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, User, Lock, ArrowRight, UserPlus, Loader2 } from 'lucide-react';

interface Props {
  onLogin: (username: string, role: UserRole) => Promise<{ success: boolean; msg: string }>;
  onRegister: (username: string) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin, onRegister }) => {
  const [role, setRole] = useState<UserRole>('USER');
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Visual only for demo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    if (mode === 'REGISTER') {
      if (role === 'ADMIN') {
        setError("Admins cannot self-register. Contact an existing administrator.");
      } else {
        onRegister(username);
        setSuccessMsg("Request sent! Wait for an Admin to approve your account.");
        setMode('LOGIN');
      }
    } else {
      const result = await onLogin(username, role);
      if (!result.success) {
        setError(result.msg);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-slate-700 mb-4 text-amber-500">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">GridChain Simulator</h1>
          <p className="text-slate-400 text-sm mt-2">Secure Microgrid Management System</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-950 p-1 rounded-lg mb-6 border border-slate-800">
          <button
            onClick={() => setRole('USER')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              role === 'USER' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <User size={16} /> User
          </button>
          <button
            onClick={() => setRole('ADMIN')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              role === 'ADMIN' ? 'bg-amber-900/30 text-amber-500 border border-amber-500/30 shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Lock size={16} /> Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={role === 'ADMIN' ? 'admin' : 'Enter username'}
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-medium">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            } ${
              role === 'ADMIN' 
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
               mode === 'LOGIN' ? <><ArrowRight size={18} /> Login System</> : <><UserPlus size={18} /> Request Account</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
           {role === 'USER' && (
             <button 
               onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); setSuccessMsg(''); }}
               className="text-xs text-slate-400 hover:text-white underline"
             >
               {mode === 'LOGIN' ? "Need an account? Request Access" : "Back to Login"}
             </button>
           )}
           {role === 'ADMIN' && (
             <p className="text-xs text-slate-500">
               Default Admin: <strong>admin</strong> / <strong>admin123</strong>
             </p>
           )}
        </div>
      </div>
    </div>
  );
};