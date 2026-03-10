
export type DrivingMode = 'Eco' | 'Comfort' | 'Sport';

export interface CarState {
  batteryLevel: number;
  isCharging: boolean;
  rangeKm: number;
  odometer: number;
  lightsOn: boolean;
  locked: boolean;
  climateOn: boolean;
  insideTemp: number;
  outsideTemp: number;
  health: number;
  lastUpdate: string;
  drivingMode: DrivingMode;
  isConnected: boolean;
}

export interface TelemetryPoint {
  time: string;
  battery: number;
  range: number;
  consumption: number;
}
