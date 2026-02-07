import { BatteryState } from '../types';

export const calculateSolarOutput = (
  time: number, 
  area: number, 
  efficiency: number,
  radiation?: number, // Watts per square meter (W/m^2)
  latitude?: number,
  tilt?: number
): number => {
  
  // Factor to account for tilt misalignment with latitude
  // Optimal tilt is roughly equal to latitude. 
  // We apply a simple penalty if they diverge.
  let tiltFactor = 1.0;
  if (latitude !== undefined && tilt !== undefined) {
    const tiltDiff = Math.abs(latitude - tilt);
    // Reduce efficiency by 1% for every 5 degrees of misalignment (simplified model)
    tiltFactor = Math.max(0.5, 1 - (tiltDiff / 500)); 
  }

  // If we have real weather data, use it
  if (radiation !== undefined) {
    // Power (kW) = Area (m^2) * Radiation (W/m^2) * Efficiency / 1000
    // We multiply by tiltFactor to simulate POA (Plane of Array) losses roughly
    return parseFloat(((area * radiation * efficiency * tiltFactor) / 1000).toFixed(2));
  }

  // Fallback to simple math model if API fails or loads
  // Day hours roughly 6am to 6pm
  const sunrise = 6; 
  const sunset = 18; 
  
  if (time < sunrise || time > sunset) return 0;

  // Sine wave for the day
  const dayDuration = sunset - sunrise;
  const timeSinceSunrise = time - sunrise;
  const sunHeight = Math.sin((timeSinceSunrise / dayDuration) * Math.PI);
  
  // Assume generic sunny day max irradiance ~800 W/m^2
  const maxIrradiance = 0.8; 
  
  const outputKW = area * efficiency * maxIrradiance * sunHeight * tiltFactor;
  return parseFloat(Math.max(0, outputKW).toFixed(2));
};

export const calculateLoad = (time: number): number => {
  // Typical home profile: Morning peak (7-9), Evening peak (17-21), low at night
  let load = 0.5; // Base load (fridge, etc)
  
  // Morning peak
  if (time >= 6 && time <= 9) {
    load += 1.5 * Math.sin(((time - 6) / 3) * Math.PI);
  }
  
  // Evening peak
  if (time >= 17 && time <= 22) {
    load += 2.5 * Math.sin(((time - 17) / 5) * Math.PI);
  }
  
  // Random fluctuation noise
  load += (Math.random() * 0.2 - 0.1);
  
  return parseFloat(Math.max(0.2, load).toFixed(2));
};

export const updateBatteryState = (
  currentBattery: BatteryState, 
  solar: number, 
  load: number, 
  capacity: number
): { newBattery: BatteryState, grid: number } => {
  
  let netPower = solar - load; // Positive = Excess, Negative = Deficit
  let currentEnergy = (currentBattery.soc / 100) * capacity;
  let grid = 0;
  let status: BatteryState['status'] = 'IDLE';

  // Simulation step is 15 minutes (0.25 hours)
  const timeStep = 0.25;

  if (netPower > 0) {
    // Charging
    const energyToAdd = netPower * timeStep;
    const newEnergy = Math.min(capacity, currentEnergy + energyToAdd);
    
    if (newEnergy > currentEnergy) status = 'CHARGING';
    
    // If battery is full, export remaining to grid
    if (newEnergy === capacity) {
      const usedByBattery = (newEnergy - currentEnergy) / timeStep;
      grid = -(netPower - usedByBattery); // Export (negative)
    } else {
      grid = 0; // All excess went to battery
    }
    currentEnergy = newEnergy;

  } else {
    // Discharging
    const energyNeeded = Math.abs(netPower) * timeStep;
    const availableEnergy = currentEnergy;
    
    if (energyNeeded <= availableEnergy) {
      // Battery covers it all
      currentEnergy -= energyNeeded;
      status = 'DISCHARGING';
      grid = 0;
    } else {
      // Battery runs out, pull from grid
      const fromBattery = availableEnergy;
      currentEnergy = 0;
      const remainderPower = (energyNeeded - fromBattery) / timeStep;
      grid = remainderPower; // Import (positive)
      status = 'IDLE';
    }
  }
  
  // Status adjustment for edge cases
  if (solar > 0 && solar < load && currentEnergy > 0) status = 'DISCHARGING';

  return {
    newBattery: {
      soc: parseFloat(((currentEnergy / capacity) * 100).toFixed(1)),
      status
    },
    grid: parseFloat(grid.toFixed(2)) // + Import, - Export
  };
};