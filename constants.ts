import { SimulationConfig, BatteryState } from './types';

export const ADMIN_KEY = "admin_key_123";

export const INITIAL_BATTERY_STATE: BatteryState = {
  soc: 50,
  status: 'IDLE'
};

export const DEFAULT_CONFIG: SimulationConfig = {
  latitude: 34.05, // Los Angeles
  longitude: -118.25,
  solarPanelArea: 25,
  solarEfficiency: 0.2,
  solarPanelTilt: 30, // Default tilt
  batteryCapacity: 13.5, // Tesla Powerwall 2
  initialBatteryCharge: 50
};