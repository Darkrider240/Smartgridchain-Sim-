import React from 'react';
import { Sun, Home, Battery, BatteryCharging, Zap, ArrowRightLeft } from 'lucide-react';
import { MicrogridState } from '../types';

interface Props {
  state: MicrogridState;
}

export const DashboardCards: React.FC<Props> = ({ state }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Solar Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sun size={64} className="text-amber-500" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
            <Sun size={20} />
          </div>
          <h3 className="font-semibold text-slate-600 dark:text-slate-400">Solar PV</h3>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {state.solarOutput} <span className="text-sm font-normal text-slate-500">kW</span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.min(100, state.solarOutput / 5 * 100)}%` }}></div>
        </div>
      </div>

      {/* Load Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Home size={64} className="text-blue-500" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
            <Home size={20} />
          </div>
          <h3 className="font-semibold text-slate-600 dark:text-slate-400">Load</h3>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {state.loadConsumption} <span className="text-sm font-normal text-slate-500">kW</span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, state.loadConsumption / 5 * 100)}%` }}></div>
        </div>
      </div>

      {/* Battery Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Battery size={64} className="text-emerald-500" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${state.battery.status === 'CHARGING' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            {state.battery.status === 'CHARGING' ? <BatteryCharging size={20} /> : <Battery size={20} />}
          </div>
          <h3 className="font-semibold text-slate-600 dark:text-slate-400">Battery</h3>
        </div>
        <div className="flex items-baseline gap-2">
           <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {state.battery.soc}%
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{state.battery.status}</span>
        </div>
        
        <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-500 ${state.battery.soc < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${state.battery.soc}%` }}></div>
        </div>
      </div>

      {/* Grid Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap size={64} className="text-purple-500" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600 dark:text-purple-400">
            <ArrowRightLeft size={20} />
          </div>
          <h3 className="font-semibold text-slate-600 dark:text-slate-400">Grid</h3>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {Math.abs(state.gridExchange)} <span className="text-sm font-normal text-slate-500">kW</span>
        </div>
        <div className="text-xs mt-1 font-medium">
          {state.gridExchange > 0 ? <span className="text-red-400">IMPORTING</span> : state.gridExchange < 0 ? <span className="text-emerald-400">EXPORTING</span> : <span className="text-slate-500">IDLE</span>}
        </div>
      </div>

    </div>
  );
};