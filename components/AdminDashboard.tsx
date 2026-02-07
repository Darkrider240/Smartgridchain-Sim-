import React, { useState } from 'react';
import { UserProfile, MicrogridState } from '../types';
import { ShieldCheck, UserCheck, UserX, Plus, Users, Activity, Zap } from 'lucide-react';

interface Props {
  users: UserProfile[];
  gridState: MicrogridState;
  onApproveUser: (id: string) => void;
  onCreateAdmin: (username: string) => void;
  onLogout: () => void;
  onEnterSim: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ 
  users, 
  gridState, 
  onApproveUser, 
  onCreateAdmin, 
  onLogout,
  onEnterSim
}) => {
  const [newAdminName, setNewAdminName] = useState('');

  const pendingUsers = users.filter(u => u.role === 'USER' && !u.isApproved);
  const admins = users.filter(u => u.role === 'ADMIN');
  const activeUsers = users.filter(u => u.role === 'USER' && u.isApproved);

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if(newAdminName) {
      onCreateAdmin(newAdminName);
      setNewAdminName('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="text-amber-500" /> Admin Console
            </h1>
            <p className="text-slate-400 mt-1">System Governance & Access Control</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={onEnterSim}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <Activity size={16} /> Monitor Grid (Enter Sim)
            </button>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* System Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
              <Activity size={16} /> Grid Heartbeat
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">{gridState.solarOutput} <span className="text-sm text-slate-500">kW</span></div>
                <div className="text-xs text-slate-500">Current Solar</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{gridState.battery.soc}%</div>
                <div className="text-xs text-slate-500">Battery Level</div>
              </div>
            </div>
          </div>
          
           <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
              <Zap size={16} /> Net Power
            </div>
            <div className="text-3xl font-bold text-white">
               {Math.abs(gridState.gridExchange)} <span className="text-sm text-slate-500">kW</span>
            </div>
             <div className={`text-xs font-medium mt-1 ${gridState.gridExchange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
               {gridState.gridExchange > 0 ? 'IMPORTING FROM GRID' : 'EXPORTING TO GRID'}
            </div>
          </div>

           <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
              <Users size={16} /> User Stats
            </div>
            <div className="flex justify-between items-center">
              <div>
                 <div className="text-2xl font-bold text-white">{activeUsers.length}</div>
                 <div className="text-xs text-slate-500">Active Users</div>
              </div>
              <div className="text-right">
                 <div className="text-2xl font-bold text-amber-500">{pendingUsers.length}</div>
                 <div className="text-xs text-slate-500">Pending Requests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-200">Pending Account Requests</h3>
            {pendingUsers.length === 0 && <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">No pending requests</span>}
          </div>
          {pendingUsers.length > 0 ? (
             <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Requested</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pendingUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onApproveUser(user.id)}
                        className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded transition-colors flex items-center gap-2 ml-auto"
                      >
                        <UserCheck size={14} /> Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500 italic">
              All caught up! No users waiting for approval.
            </div>
          )}
        </div>

        {/* Admin Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* List Admins */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
              <h3 className="font-bold text-slate-200">System Administrators</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {admins.map(admin => (
                  <div key={admin.id} className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center">
                        <ShieldCheck size={16} />
                      </div>
                      <span className="font-medium text-slate-300">{admin.username}</span>
                    </div>
                    <span className="text-xs text-slate-500">Full Access</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Create Admin */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
              <h3 className="font-bold text-slate-200">Grant Admin Privileges</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">New Admin Username</label>
                  <input 
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. ops_manager"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium rounded transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Create Administrator
                </button>
              </form>
              <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                Creating a new administrator grants them full access to system logs, block tampering controls, and user approvals. This action is logged.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};