import React from 'react';
import { Sun, Home, Battery, Zap, BatteryCharging } from 'lucide-react';
import { MicrogridState } from '../types';

interface Props {
  state: MicrogridState;
}

export const EnergyFlow: React.FC<Props> = ({ state }) => {
  // Thresholds to trigger animations
  const isSolarActive = state.solarOutput > 0.01;
  const isLoadActive = state.loadConsumption > 0.01;
  const isBatteryCharging = state.battery.status === 'CHARGING';
  const isBatteryDischarging = state.battery.status === 'DISCHARGING';
  const isGridImporting = state.gridExchange > 0.01;
  const isGridExporting = state.gridExchange < -0.01;

  // Colors
  const solarColor = '#f59e0b'; // Amber 500
  const gridColor = '#a855f7'; // Purple 500
  const loadColor = '#3b82f6'; // Blue 500
  const batteryColor = '#10b981'; // Emerald 500
  const inactiveColor = '#334155'; // Slate 700

  // Animation Speed (lower duration = faster)
  const speed = 1.5;

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative h-[300px] flex items-center justify-center overflow-hidden mb-6 shadow-inner">
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Icons Positioned Absolutely */}
      {/* Solar (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
        <div className={`p-2 rounded-full ${isSolarActive ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-600'}`}>
          <Sun size={24} />
        </div>
        <span className="text-[10px] font-bold text-slate-500 mt-1">SOLAR</span>
      </div>

      {/* Battery (Left) */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col items-center z-10">
        <div className={`p-2 rounded-full ${state.battery.status !== 'IDLE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-600'}`}>
           {state.battery.status === 'CHARGING' ? <BatteryCharging size={24} /> : <Battery size={24} />}
        </div>
        <span className="text-[10px] font-bold text-slate-500 mt-1">BATTERY</span>
      </div>

      {/* Grid (Right) */}
      <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-center z-10">
        <div className={`p-2 rounded-full ${state.gridExchange !== 0 ? 'bg-purple-500/20 text-purple-500' : 'bg-slate-800 text-slate-600'}`}>
          <Zap size={24} />
        </div>
        <span className="text-[10px] font-bold text-slate-500 mt-1">GRID</span>
      </div>

      {/* Home (Bottom Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
         <div className={`p-2 rounded-full ${isLoadActive ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-800 text-slate-600'}`}>
          <Home size={24} />
        </div>
        <span className="text-[10px] font-bold text-slate-500 mt-1">HOME</span>
      </div>

      {/* Center Node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-700 rounded-full z-10 border-2 border-slate-600"></div>


      {/* SVG Layer for Lines and Particles */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
        
        {/* Static Paths (Background Lines) */}
        <path d="M 200 60 L 200 150" stroke={inactiveColor} strokeWidth="2" /> {/* Solar to Center */}
        <path d="M 200 150 L 200 240" stroke={inactiveColor} strokeWidth="2" /> {/* Center to Home */}
        <path d="M 60 150 L 200 150" stroke={inactiveColor} strokeWidth="2" /> {/* Battery to Center */}
        <path d="M 200 150 L 340 150" stroke={inactiveColor} strokeWidth="2" /> {/* Center to Grid */}

        {/* Active Flow Animations */}
        
        {/* Solar -> Center */}
        {isSolarActive && (
          <>
            <path d="M 200 60 L 200 150" stroke={solarColor} strokeWidth="3" strokeOpacity="0.4" />
            <circle r="4" fill={solarColor}>
              <animateMotion dur={`${speed}s`} repeatCount="indefinite" path="M 200 60 L 200 150" />
            </circle>
          </>
        )}

        {/* Center -> Home */}
        {isLoadActive && (
          <>
            <path d="M 200 150 L 200 240" stroke={loadColor} strokeWidth="3" strokeOpacity="0.4" />
            <circle r="4" fill={loadColor}>
              <animateMotion dur={`${speed}s`} repeatCount="indefinite" path="M 200 150 L 200 240" />
            </circle>
          </>
        )}

        {/* Battery Flows */}
        {isBatteryCharging && (
          <>
            <path d="M 200 150 L 60 150" stroke={batteryColor} strokeWidth="3" strokeOpacity="0.4" />
            <circle r="4" fill={batteryColor}>
              <animateMotion dur={`${speed}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" path="M 200 150 L 60 150" />
            </circle>
          </>
        )}
        {isBatteryDischarging && (
          <>
            <path d="M 60 150 L 200 150" stroke={batteryColor} strokeWidth="3" strokeOpacity="0.4" />
            <circle r="4" fill={batteryColor}>
              <animateMotion dur={`${speed}s`} repeatCount="indefinite" path="M 60 150 L 200 150" />
            </circle>
          </>
        )}

        {/* Grid Flows */}
        {isGridExporting && (
          <>
            <path d="M 200 150 L 340 150" stroke={solarColor} strokeWidth="3" strokeOpacity="0.4" /> 
            <circle r="4" fill={solarColor}>
              <animateMotion dur={`${speed}s`} repeatCount="indefinite" path="M 200 150 L 340 150" />
            </circle>
          </>
        )}
        {isGridImporting && (
          <>
            <path d="M 340 150 L 200 150" stroke={gridColor} strokeWidth="3" strokeOpacity="0.4" />
            <circle r="4" fill={gridColor}>
               <animateMotion dur={`${speed}s`} repeatCount="indefinite" path="M 340 150 L 200 150" />
            </circle>
          </>
        )}

      </svg>
    </div>
  );
};