export interface BatteryState {
  soc: number; // State of Charge 0-100
  status: 'CHARGING' | 'DISCHARGING' | 'IDLE';
}

export interface MicrogridState {
  solarOutput: number; // kW
  loadConsumption: number; // kW
  battery: BatteryState;
  gridExchange: number; // kW (Positive = Import, Negative = Export)
  timestamp: number;
}

export interface Block {
  index: number;
  timestamp: string;
  data: MicrogridState; // In a real chain, this is stringified, but we keep object for UI ease
  prevHash: string;
  hash: string;
  isTampered?: boolean; // Visual flag only, validation uses actual hash check
}

export interface SimulationConfig {
  latitude: number;
  longitude: number;
  solarPanelArea: number; // sq meters
  solarEfficiency: number; // percentage 0-1
  solarPanelTilt: number; // degrees
  batteryCapacity: number; // kWh
  initialBatteryCharge: number; // percentage
}

export interface ValidationResult {
  isValid: boolean;
  errorIndex?: number;
  message?: string;
}

export interface WeatherData {
  hourly: {
    time: string[];
    shortwave_radiation: number[]; // W/m^2
    temperature_2m: number[]; // Celsius
  };
  daily: {
    sunrise: string[];
    sunset: string[];
  }
}

// --- AUTH TYPES ---

export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  isApproved: boolean; // Users need approval, Admins created by Admins are auto-approved
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
}