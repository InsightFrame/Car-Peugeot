
import { CarState, TelemetryPoint, DrivingMode } from "../types";

const TRONITY_CONFIG = {
  clientId: '7b9402b1-be81-4578-b5d0-96fa5d733e94',
  clientSecret: '19b7995a-f027-44bc-8a92-c9e8b28063b2',
  redirectUri: window.location.origin,
  scope: 'read_vehicle_info',
};

let mockState: CarState = {
  batteryLevel: 74,
  isCharging: false,
  rangeKm: 222,
  odometer: 12450,
  lightsOn: false,
  locked: true,
  climateOn: false,
  insideTemp: 21,
  outsideTemp: 18,
  health: 98.4,
  lastUpdate: new Date().toISOString(),
  drivingMode: 'Comfort',
  isConnected: false
};

const getModeFactor = (mode: DrivingMode): number => {
  switch (mode) {
    case 'Eco': return 1.15;
    case 'Sport': return 0.85;
    default: return 1.0;
  }
};

export const getTronityAuthUrl = () => {
  const url = new URL('https://app.tronity.io/login/public/oauth/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', TRONITY_CONFIG.clientId);
  url.searchParams.set('redirect_uri', TRONITY_CONFIG.redirectUri);
  url.searchParams.set('scope', TRONITY_CONFIG.scope);
  return url.toString();
};

export const exchangeCodeForToken = async (code: string) => {
  try {
    const response = await fetch('https://api.tronity.io/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: TRONITY_CONFIG.clientId,
        client_secret: TRONITY_CONFIG.clientSecret,
        code: code,
        redirect_uri: TRONITY_CONFIG.redirectUri,
      })
    });

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('tronity_token', data.access_token);
      return data.access_token;
    }
  } catch (error) {
    console.error("Tronity Auth Error:", error);
  }
  return null;
};

export const fetchCarData = async (): Promise<CarState> => {
  const token = localStorage.getItem('tronity_token');
  
  if (token) {
    try {
      const vResponse = await fetch('https://api.tronity.io/v1/vehicles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const vData = await vResponse.json();
      
      if (vData.data && vData.data.length > 0) {
        const vehicle = vData.data[0];
        const vehicleId = vehicle.id;
        
        const rResponse = await fetch(`https://api.tronity.io/v1/vehicles/${vehicleId}/last_record`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const rData = await rResponse.json();
        
        if (rData) {
          mockState.batteryLevel = rData.level || mockState.batteryLevel;
          mockState.rangeKm = rData.range || mockState.rangeKm;
          mockState.odometer = rData.odometer || mockState.odometer;
          mockState.isCharging = rData.charging === 'Charging';
          mockState.isConnected = true;
          mockState.lastUpdate = new Date().toISOString();
        }
      }
    } catch (error) {
      console.warn("Tronity Sync Error, using fallback.");
      mockState.isConnected = false;
    }
  }

  // Simular pequeno dreno ou carga se estiver ligado
  if (mockState.isCharging) {
    mockState.batteryLevel = Math.min(100, mockState.batteryLevel + 0.1);
  } else if (mockState.climateOn) {
    mockState.batteryLevel = Math.max(0, mockState.batteryLevel - 0.01);
  }

  const factor = getModeFactor(mockState.drivingMode);
  mockState.rangeKm = Math.round((mockState.batteryLevel / 100) * 310 * factor);

  return { ...mockState };
};

export const fetchHistoryData = async (): Promise<TelemetryPoint[]> => {
  const token = localStorage.getItem('tronity_token');
  const history: TelemetryPoint[] = [];

  if (token) {
    try {
       // Tronity bulk data could be used here, but for now we'll keep the mock generation 
       // or try to fetch some real points if available.
       // For simplicity and immediate visual feedback, we'll keep the mock logic 
       // but potentially seed it with real data if we had a vehicle ID.
    } catch (e) {}
  }
  
  const now = new Date();
  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    const baseBattery = mockState.batteryLevel - (12 - i) * 0.5;
    history.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      battery: Math.max(0, baseBattery + Math.random() * 2),
      range: Math.max(0, (baseBattery * 3.0) + Math.random() * 5),
      consumption: 14 + Math.random() * 4
    });
  }
  return history;
};

export const updateCarCommand = async (command: keyof CarState, value: any): Promise<void> => {
  // @ts-ignore
  mockState[command] = value;
  
  // Atualização imediata de lógica derivada
  if (command === 'batteryLevel' || command === 'drivingMode') {
     const factor = getModeFactor(mockState.drivingMode);
     mockState.rangeKm = Math.round((mockState.batteryLevel / 100) * 310 * factor);
  }
};
