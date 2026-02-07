import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { SimulationConfig } from '../types';
import { Settings, ShieldAlert, MapPin, Wand2, Info } from 'lucide-react';
import L from 'leaflet';

// Leaflet icon fix
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  config: SimulationConfig;
  setConfig: (c: SimulationConfig) => void;
  onManualBlockClick: () => void;
}

const LocationMarker = ({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return <Marker position={position} icon={icon} />;
};

export const ControlPanel: React.FC<Props> = ({ config, setConfig, onManualBlockClick }) => {
  const [showPower, setShowPower] = useState(false);
  
  const handleLatChange = (val: string) => {
      setConfig({...config, latitude: parseFloat(val) || 0});
  };

  const handleLngChange = (val: string) => {
      setConfig({...config, longitude: parseFloat(val) || 0});
  };

  const handleAutoEfficiency = () => {
    // Set to standard high-quality commercial panel efficiency
    setConfig({...config, solarEfficiency: 0.20});
  };

  const peakPower = (config.solarPanelArea * config.solarEfficiency).toFixed(2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Map Container */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-300 flex items-center gap-2"><MapPin size={18} /> Location Selector</h3>
                <div className="flex gap-2 text-xs font-mono text-slate-500">
                    <span>Lat: {config.latitude.toFixed(2)}</span>
                    <span>Lng: {config.longitude.toFixed(2)}</span>
                </div>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden border border-slate-700 relative z-0">
                <MapContainer 
                    center={[config.latitude, config.longitude]} 
                    zoom={3} 
                    scrollWheelZoom={true} 
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker 
                        position={[config.latitude, config.longitude]} 
                        setPosition={(pos) => setConfig({...config, latitude: pos[0], longitude: pos[1]})} 
                    />
                </MapContainer>
            </div>
        </div>

        {/* Config Inputs */}
        <div className="space-y-6">
            {/* System Hardware */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Settings size={18} /> Hardware Setup</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Solar Area (m²)</label>
                        <input 
                            type="number" 
                            value={config.solarPanelArea}
                            onChange={(e) => setConfig({...config, solarPanelArea: parseFloat(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-amber-500 outline-none"
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Efficiency (0-1)</label>
                        <div className="flex gap-2">
                          <input 
                              type="number" 
                              step="0.01"
                              max="1"
                              value={config.solarEfficiency}
                              onChange={(e) => setConfig({...config, solarEfficiency: parseFloat(e.target.value)})}
                              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-amber-500 outline-none"
                          />
                          <button 
                            onClick={handleAutoEfficiency}
                            title="Auto-set standard efficiency"
                            className="px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-amber-500"
                          >
                            <Wand2 size={14} />
                          </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tilt (°)</label>
                        <input 
                            type="number" 
                            value={config.solarPanelTilt}
                            onChange={(e) => setConfig({...config, solarPanelTilt: parseFloat(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-amber-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Battery Cap (kWh)</label>
                        <input 
                            type="number" 
                            value={config.batteryCapacity}
                            onChange={(e) => setConfig({...config, batteryCapacity: parseFloat(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Latitude</label>
                        <input 
                            type="number" 
                            value={config.latitude}
                            onChange={(e) => handleLatChange(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Longitude</label>
                        <input 
                            type="number" 
                            value={config.longitude}
                            onChange={(e) => handleLngChange(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Estimated Power Toggle */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={showPower}
                      onChange={(e) => setShowPower(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-slate-400 group-hover:text-amber-400 transition-colors">
                      Display Estimated Peak Power
                    </span>
                  </label>
                  
                  {showPower && (
                    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                      <Info size={16} className="text-amber-500 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-amber-500 uppercase">Estimated STC Peak Output</div>
                        <div className="text-lg font-bold text-white">{peakPower} kW</div>
                        <div className="text-[10px] text-amber-500/70 mt-1">
                          Based on {config.solarPanelArea}m² area and {(config.solarEfficiency * 100).toFixed(1)}% efficiency under standard test conditions (1000 W/m²).
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            </div>

            {/* Attack Vector */}
            <div className="bg-red-900/10 p-5 rounded-xl border border-red-900/30 shadow-sm">
                <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2"><ShieldAlert size={18} /> Manual Block Operations</h3>
                <p className="text-xs text-red-300/70 mb-4 leading-relaxed">
                    Simulate a "Bad Actor" attack by injecting a fraudulent block into the chain using the Admin Key. This will create a valid hash for invalid data, which can be detected later by auditing the grid physics.
                </p>
                <button 
                    onClick={onManualBlockClick}
                    className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 font-bold rounded-lg transition-all text-sm uppercase tracking-wide"
                >
                    Inject Manual Block
                </button>
            </div>
        </div>
    </div>
  );
};