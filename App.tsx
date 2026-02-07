import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert,
  Key,
  Activity,
  CloudSun,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { DashboardCards } from './components/DashboardCards';
import { EnergyFlow } from './components/EnergyFlow';
import { BlockchainViewer } from './components/BlockchainViewer';
import { ControlPanel } from './components/ControlPanel';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { Block, MicrogridState, SimulationConfig, ValidationResult, WeatherData, AuthState, UserProfile, UserRole } from './types';
import { calculateSolarOutput, calculateLoad, updateBatteryState } from './services/simulationService';
import { generateHash, validateChain } from './services/cryptoService';
import { fetchWeatherData } from './services/weatherService';
import { DEFAULT_CONFIG, INITIAL_BATTERY_STATE, ADMIN_KEY } from './constants';

export default function App() {
  // --- Auth & View State ---
  const [view, setView] = useState<'LOGIN' | 'ADMIN_DASHBOARD' | 'SIMULATION'>('LOGIN');
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, currentUser: null });
  
  // Mock Backend Database
  const [users, setUsers] = useState<UserProfile[]>([
    { id: '1', username: 'admin', role: 'ADMIN', isApproved: true, createdAt: new Date().toISOString() },
    { id: '2', username: 'user1', role: 'USER', isApproved: true, createdAt: new Date().toISOString() },
  ]);

  // --- Simulation State ---
  const [time, setTime] = useState<number>(12); // 0-24 hours
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  
  // Weather State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);

  // Simulation Data
  const [microgrid, setMicrogrid] = useState<MicrogridState>({
    solarOutput: 0,
    loadConsumption: 0,
    battery: INITIAL_BATTERY_STATE,
    gridExchange: 0,
    timestamp: Date.now()
  });

  // Blockchain State
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [validationStatus, setValidationStatus] = useState<ValidationResult>({ isValid: true });
  
  // UI State
  const [showAdminModal, setShowAdminModal] = useState<{type: 'verify' | 'manual' | null, payload?: any}>({ type: null });
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [manualBlockData, setManualBlockData] = useState('');
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const tickRef = useRef<number | null>(null);

  // --- Logic: Authentication (Mock Backend) ---

  const handleLogin = async (username: string, role: UserRole): Promise<{success: boolean, msg: string}> => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.role === role);
    
    if (!user) {
      return { success: false, msg: "User not found or incorrect role." };
    }

    if (role === 'USER' && !user.isApproved) {
      return { success: false, msg: "Account pending approval." };
    }

    // "Password Check" (Hardcoded for demo)
    // Admin password must include "admin", User must include "user" or be "123"
    // This is just a visual check for the demo
    
    setAuth({ isAuthenticated: true, currentUser: user });
    
    if (role === 'ADMIN') {
      setView('ADMIN_DASHBOARD');
    } else {
      setView('SIMULATION');
    }

    return { success: true, msg: "Login Successful" };
  };

  const handleRegister = (username: string) => {
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      role: 'USER',
      isApproved: false,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, currentUser: null });
    setView('LOGIN');
    setIsPlaying(false);
  };

  // --- Logic: Admin Backend Ops ---

  const approveUser = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isApproved: true } : u));
    setNotification({ msg: "User Approved", type: 'success' });
  };

  const createAdmin = (username: string) => {
    const newAdmin: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      role: 'ADMIN',
      isApproved: true,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newAdmin]);
    setNotification({ msg: `Admin '${username}' created successfully`, type: 'success' });
  };


  // --- Logic: Simulation ---

  const addBlock = useCallback((data: MicrogridState, isManual = false) => {
    setBlocks(prevBlocks => {
      const lastBlock = prevBlocks[prevBlocks.length - 1];
      const index = prevBlocks.length;
      const prevHash = lastBlock ? lastBlock.hash : "0000000000000000000000000000000000000000000000000000000000000000";
      const timestamp = new Date().toISOString();
      
      const hash = generateHash(index, timestamp, JSON.stringify(data), prevHash);

      const newBlock: Block = {
        index,
        timestamp,
        data,
        prevHash,
        hash,
        isTampered: false 
      };
      return [...prevBlocks, newBlock];
    });
  }, []);

  // Initialize Genesis Block
  useEffect(() => {
    if (blocks.length === 0) {
      addBlock(microgrid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Weather Data on Location Change
  useEffect(() => {
    const getWeatherData = async () => {
      setLoadingWeather(true);
      const data = await fetchWeatherData(config.latitude, config.longitude);
      if (data) {
        setWeatherData(data);
        setNotification({ msg: "Real weather data loaded for location", type: 'success' });
      } else {
        setNotification({ msg: "Failed to load weather data. Using fallback model.", type: 'error' });
      }
      setLoadingWeather(false);
    };

    const timer = setTimeout(() => {
      getWeatherData();
    }, 800); 

    return () => clearTimeout(timer);
  }, [config.latitude, config.longitude]);

  // Simulation Loop
  useEffect(() => {
    if (isPlaying) {
      tickRef.current = window.setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 0.25; // Advance 15 mins per tick
          return newTime >= 24 ? 0 : newTime;
        });
      }, 1000); 
    } else {
      if (tickRef.current !== null) clearInterval(tickRef.current);
    }
    return () => {
      if (tickRef.current !== null) clearInterval(tickRef.current);
    };
  }, [isPlaying]);

  // Update Microgrid & Add Block on Time Change
  useEffect(() => {
    // Determine Radiation
    let currentRadiation = undefined;
    if (weatherData) {
      const hourIndex = Math.floor(time) % 24;
      if (weatherData.hourly.shortwave_radiation[hourIndex] !== undefined) {
        currentRadiation = weatherData.hourly.shortwave_radiation[hourIndex];
      }
    }

    // Calculate Physics
    const solar = calculateSolarOutput(
      time, 
      config.solarPanelArea, 
      config.solarEfficiency, 
      currentRadiation,
      config.latitude,
      config.solarPanelTilt
    );

    const load = calculateLoad(time);
    
    const { newBattery, grid } = updateBatteryState(
      microgrid.battery, 
      solar, 
      load, 
      config.batteryCapacity
    );

    const newState: MicrogridState = {
      solarOutput: parseFloat(solar.toFixed(2)),
      loadConsumption: parseFloat(load.toFixed(2)),
      battery: newBattery,
      gridExchange: parseFloat(grid.toFixed(2)),
      timestamp: Date.now()
    };

    setMicrogrid(newState);

    // Auto-mine block every hour (every 4 ticks) to avoid spamming the list
    if (Number.isInteger(time)) {
      addBlock(newState);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, config, weatherData]);


  // --- Handlers ---

  const handleTamperBlock = (index: number, newDataString: string) => {
    let newData: any;
    try {
      newData = JSON.parse(newDataString);
    } catch (e) {
      setNotification({ msg: "Invalid JSON format", type: 'error' });
      return;
    }

    const block = blocks.find(b => b.index === index);
    if (!block) return;

    if (JSON.stringify(block.data) === JSON.stringify(newData)) {
      setNotification({ msg: "No changes detected. Block remains valid.", type: 'success' });
      return;
    }

    setBlocks(prev => prev.map(b => {
      if (b.index === index) {
        return { ...b, data: newData, isTampered: true };
      }
      return b;
    }));
    setNotification({ msg: "Block tampered! Chain is now potentially invalid.", type: 'error' });
    setValidationStatus({ isValid: false, errorIndex: index, message: "Unverified changes detected" });
  };

  const handleAdminSubmit = () => {
    if (adminKeyInput !== ADMIN_KEY) {
      setNotification({ msg: "Invalid Admin Key", type: 'error' });
      return;
    }

    if (showAdminModal.type === 'verify') {
      const result = validateChain(blocks);
      setValidationStatus(result);
      if (result.isValid) {
        setNotification({ msg: "Audit Complete: Chain is valid.", type: 'success' });
      } else {
        setNotification({ msg: `Audit Complete: Breach detected at Block #${result.errorIndex}`, type: 'error' });
      }
    } else if (showAdminModal.type === 'manual') {
      try {
        const data = JSON.parse(manualBlockData);
        addBlock(data, true);
        setNotification({ msg: "Manual Block Added Successfully", type: 'success' });
      } catch (e) {
        setNotification({ msg: "Invalid JSON data", type: 'error' });
      }
    }
    
    setShowAdminModal({ type: null });
    setAdminKeyInput('');
    setManualBlockData('');
  };

  // --- Render Views ---

  if (view === 'LOGIN') {
    return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }

  if (view === 'ADMIN_DASHBOARD') {
    return (
      <AdminDashboard 
        users={users} 
        gridState={microgrid}
        onApproveUser={approveUser}
        onCreateAdmin={createAdmin}
        onLogout={handleLogout}
        onEnterSim={() => setView('SIMULATION')}
      />
    );
  }

  // Main Simulation View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Activity className="h-6 w-6 text-slate-900" />
            </div>
            <span className="font-bold text-xl tracking-tight">GridChain<span className="text-amber-500">Sim</span></span>
            {auth.currentUser?.role === 'ADMIN' && (
               <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-500 text-[10px] font-bold rounded uppercase border border-amber-500/30">Admin Mode</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
             {loadingWeather && (
               <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 animate-pulse">
                 <CloudSun size={14} /> Fetching Weather...
               </div>
             )}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              validationStatus.isValid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {validationStatus.isValid ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
              {validationStatus.isValid ? 'SECURE' : 'COMPROMISED'}
            </div>
            
            {/* Admin Context Controls */}
            {auth.currentUser?.role === 'ADMIN' && (
               <>
                <button 
                  onClick={() => setView('ADMIN_DASHBOARD')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  title="Back to Dashboard"
                >
                  <LayoutDashboard size={18} />
                </button>
                <button 
                  onClick={() => setShowAdminModal({ type: 'verify' })}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-all"
                >
                  <Key size={14} />
                  Verify Integrity
                </button>
               </>
            )}

            <button 
               onClick={handleLogout}
               className="flex items-center gap-2 px-3 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded-lg text-xs font-bold uppercase"
            >
               <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Top Section: Dashboard & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Microgrid Viz */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Microgrid Status</h2>
              <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-2xl font-mono font-bold w-16 text-center text-amber-400">
                  {Math.floor(time).toString().padStart(2, '0')}:
                  {(time % 1 * 60).toString().padStart(2, '0')}
                </span>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-2 rounded-md transition-colors ${isPlaying ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button 
                   onClick={() => {
                     setTime(12);
                     setBlocks([]);
                     setValidationStatus({isValid: true});
                     addBlock({ ...microgrid, timestamp: Date.now() });
                   }}
                   className="p-2 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
            
            <EnergyFlow state={microgrid} />
            <DashboardCards state={microgrid} />
            
            {/* Map & Config */}
            <ControlPanel 
              config={config} 
              setConfig={setConfig} 
              onManualBlockClick={() => {
                setManualBlockData(JSON.stringify({
                  solarOutput: 500,
                  loadConsumption: 0,
                  battery: { soc: 100, status: 'IDLE' },
                  gridExchange: 500,
                  timestamp: Date.now()
                }, null, 2));
                setShowAdminModal({ type: 'manual' });
              }} 
            />
          </div>

          {/* Right: Blockchain */}
          <div className="lg:col-span-1">
            <BlockchainViewer 
              blocks={blocks} 
              validationStatus={validationStatus}
              onTamper={handleTamperBlock}
            />
          </div>
        </div>

      </main>

      {/* Admin Modal */}
      {showAdminModal.type && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <Key size={24} />
              <h3 className="text-xl font-bold">Admin Authorization Required</h3>
            </div>
            
            <p className="text-slate-400 mb-6">
              {showAdminModal.type === 'verify' 
                ? "Enter the Admin Key to perform a full security audit of the blockchain ledger." 
                : "Enter the Admin Key to forcefully inject a manual block into the chain."}
            </p>

            {showAdminModal.type === 'manual' && (
               <div className="mb-4">
                 <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Inject Data (JSON)</label>
                 <textarea 
                    value={manualBlockData}
                    onChange={(e) => setManualBlockData(e.target.value)}
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-400 focus:ring-2 focus:ring-amber-500 outline-none"
                 />
               </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Admin Key</label>
                <input 
                  type="password" 
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  placeholder="admin_key_123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAdminModal({ type: null })}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdminSubmit}
                  className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-amber-500/20"
                >
                  Authorize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-3 animate-bounce
          ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}
        `}>
          {notification.type === 'success' ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
          <span className="font-bold">{notification.msg}</span>
          <button onClick={() => setNotification(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

    </div>
  );
}