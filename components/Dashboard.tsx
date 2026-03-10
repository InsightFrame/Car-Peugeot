
import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarState, DrivingMode } from '../types';
import { getTronityAuthUrl } from '../services/apiService';

interface DashboardProps {
  state: CarState;
  onAction: (key: keyof CarState, val: any) => void;
  insights: string[];
}

const triggerHaptic = (pattern: number | number[] = 15) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

const ElectricBolt: React.FC<{ color: string }> = ({ color }) => {
  const path = useMemo(() => {
    const pts = [
      `${10 + Math.random() * 80},${10 + Math.random() * 80}`,
      `${10 + Math.random() * 80},${10 + Math.random() * 80}`,
      `${10 + Math.random() * 80},${10 + Math.random() * 80}`,
      `${10 + Math.random() * 80},${10 + Math.random() * 80}`
    ];
    return `M ${pts.join(' L ')}`;
  }, []);

  return (
    <motion.path
      d={path}
      stroke={color}
      strokeWidth="2"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: [0, 1, 0], 
        opacity: [0, 1, 0.5, 0],
        strokeWidth: [1, 3, 1]
      }}
      transition={{ duration: 0.4, ease: "linear" }}
    />
  );
};

const EnergyParticle: React.FC<{ color: string }> = ({ color }) => {
  const startX = useMemo(() => Math.random() * 100, []);
  const duration = useMemo(() => 1 + Math.random() * 2, []);
  const delay = useMemo(() => Math.random() * 2, []);

  return (
    <motion.div
      initial={{ bottom: "0%", left: `${startX}%`, opacity: 0, scale: 0 }}
      animate={{ 
        bottom: "100%", 
        opacity: [0, 1, 0.8, 0],
        scale: [0.5, 1.2, 0.8],
        x: [0, Math.random() * 20 - 10, 0]
      }}
      transition={{ 
        duration: duration, 
        repeat: Infinity, 
        delay: delay,
        ease: "easeOut" 
      }}
      style={{ backgroundColor: color }}
      className="absolute w-1 h-1 rounded-full blur-[1px] z-30 shadow-[0_0_8px_white]"
    />
  );
};

const Dashboard: React.FC<DashboardProps> = ({ state, onAction, insights }) => {
  const isCharging = state.isCharging;
  const level = state.batteryLevel;
  const currentMode = state.drivingMode || 'Comfort';
  const isConnected = state.isConnected;
  
  const liquidGradient = isCharging 
    ? 'from-green-950 via-green-500 to-green-300' 
    : 'from-cyan-950 via-cyan-500 to-cyan-300';

  const segments = Array.from({ length: 10 }, (_, i) => 100 - (i * 10 + 10));

  const modes: { id: DrivingMode; label: string; color: string; desc: string }[] = [
    { id: 'Eco', label: 'ECO', color: 'text-green-400', desc: 'Máxima Eficiência' },
    { id: 'Comfort', label: 'COMFORT', color: 'text-cyan-400', desc: 'Equilíbrio Diário' },
    { id: 'Sport', label: 'SPORT', color: 'text-red-500', desc: 'Performance Pura' }
  ];

  const handleModeChange = (mode: DrivingMode) => {
    if (mode === currentMode) return;
    triggerHaptic([20, 10, 20]);
    onAction('drivingMode', mode);
  };

  const handleControlAction = (key: keyof CarState, currentVal: any) => {
    triggerHaptic(25);
    onAction(key, !currentVal);
  };

  const handleConnect = () => {
    triggerHaptic([30, 20, 30]);
    window.location.href = getTronityAuthUrl();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      {/* Header Premium */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-6 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee]"></div>
            <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.8em]">GT Line Control</span>
          </div>
          <h1 className="text-6xl font-black text-white italic tracking-tighter">
            Olá, <span className="text-cyan-400 not-italic">Leonardo</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {!isConnected && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConnect}
              className="px-6 py-3 rounded-full bg-cyan-400 text-black font-black italic text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all"
            >
              Connect Peugeot e-2008
            </motion.button>
          )}
          
          <div className="bg-white/5 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/10 flex items-center space-x-3 shadow-xl relative overflow-hidden group">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-zinc-600'} animate-pulse relative z-10`}></div>
            <span className="text-white font-black italic text-xs uppercase tracking-[0.3em] relative z-10">
              {isConnected ? 'LIVE CONNECT' : 'Online'}
            </span>
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Lado Esquerdo: O Mostrador em Pilha */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[450px]">
          <AnimatePresence>
            {isCharging && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute w-72 h-[400px] bg-green-500/10 blur-[100px] rounded-full z-0"
              />
            )}
          </AnimatePresence>

          <div className="relative w-48 h-80 z-10">
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-4 rounded-t-lg border-x border-t border-white/10 transition-colors duration-500 ${isCharging ? 'bg-green-500/20' : 'bg-zinc-800'}`}></div>
            
            <div className={`absolute inset-0 bg-zinc-950/90 rounded-[2rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(0,0,0,1)] overflow-hidden transition-all duration-500 ${isCharging ? 'ring-2 ring-green-500/30' : ''}`}>
              
              <motion.div 
                initial={{ height: "0%" }}
                animate={{ height: `${level}%` }}
                transition={{ duration: 2, ease: "circOut" }}
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${liquidGradient}`}
              >
                <div className="absolute top-0 left-0 w-[400%] h-12 -translate-y-[85%] pointer-events-none">
                  <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
                    <motion.path 
                      d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z" 
                      fill={isCharging ? "rgba(74, 222, 128, 0.5)" : "rgba(34, 211, 238, 0.3)"}
                      animate={{ x: ["-50%", "0%"] }}
                      transition={{ repeat: Infinity, duration: isCharging ? 2 : 4, ease: "linear" }}
                    />
                  </svg>
                </div>
                {isCharging && Array.from({ length: 15 }).map((_, i) => (
                  <EnergyParticle key={i} color="#4ade80" />
                ))}
              </motion.div>

              <AnimatePresence>
                {isCharging && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
                      <BoltEmitter color="#bbf7d0" count={6} />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 pointer-events-none">
                {segments.map((val, idx) => (
                  <motion.div 
                    key={idx} 
                    className={`h-1.5 w-full rounded-full transition-all duration-700 ${
                      level > val ? (isCharging ? 'bg-green-400/40' : 'bg-white/10') : 'bg-white/5'
                    }`}
                  />
                ))}
              </div>

              <div className="relative z-40 h-full flex flex-col items-center justify-center">
                <motion.div key={level} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="flex items-center justify-center">
                    <span className={`text-6xl font-black text-white tracking-tighter drop-shadow-2xl ${isCharging ? 'animate-pulse' : ''}`}>
                      {Math.round(level)}
                    </span>
                    <span className={`text-xl font-black ml-1 ${isCharging ? 'text-green-400' : 'text-cyan-400'}`}>%</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="mt-12 w-48 space-y-3 z-10">
            <div className="flex justify-between items-center px-1">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Ajuste Manual</span>
              <span className={`text-[10px] font-bold ${isCharging ? 'text-green-400' : 'text-cyan-400'}`}>{Math.round(level)}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={level}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (Math.abs(val - level) > 5) triggerHaptic(10);
                onAction('batteryLevel', val);
              }}
              className={`w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer transition-all ${isCharging ? 'accent-green-500' : 'accent-cyan-400'}`}
            />
          </div>
        </div>

        {/* Lado Direito: Dashboard de Performance e Driving Modes */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Autonomia e Fluxo */}
          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card rounded-[3rem] p-8 border-white/5 group hover:border-cyan-400/30 transition-all duration-500">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Autonomia Projetada</p>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-cyan-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
              </div>
              <p className="text-6xl font-black text-white italic tracking-tighter leading-none">
                {state.rangeKm}<span className="text-xl text-cyan-400 ml-1">KM</span>
              </p>
            </div>
            
            <div className={`glass-card rounded-[3rem] p-8 border-white/5 flex flex-col justify-center transition-colors duration-500 ${isCharging ? 'bg-green-500/5 border-green-500/20' : ''}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-2">Fluxo Energético</p>
              <div className="flex items-center space-x-3">
                 <span className={`text-4xl font-black italic transition-colors duration-500 ${isCharging ? 'text-green-400' : 'text-white'}`}>
                   {isCharging ? '+22.4' : '-1.2'}
                 </span>
                 <span className="text-xs font-bold text-zinc-500 uppercase">kW/h</span>
              </div>
            </div>
          </div>

          {/* Driving Mode Section */}
          <div className="glass-card rounded-[3.5rem] p-8 border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">Perfil de Performance</p>
                <h3 className="text-2xl font-black text-white italic">Modos de Condução</h3>
              </div>
              <div className={`px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest ${modes.find(m => m.id === currentMode)?.color}`}>
                {currentMode} Ativo
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={`relative flex flex-col items-center p-6 rounded-[2.5rem] border transition-all duration-500 group overflow-hidden ${
                    currentMode === mode.id 
                      ? 'bg-white/10 border-white/20 shadow-2xl scale-[1.02]' 
                      : 'bg-transparent border-white/5 hover:border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className={`text-xl font-black italic mb-1 transition-colors ${currentMode === mode.id ? mode.color : 'text-white'}`}>
                    {mode.label}
                  </div>
                  <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter text-center leading-tight">
                    {mode.desc}
                  </div>
                  {currentMode === mode.id && (
                    <motion.div 
                      layoutId="activeModeGlow"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-around items-center bg-zinc-950/80 backdrop-blur-3xl p-6 rounded-[3.5rem] border border-white/5 shadow-2xl">
            <ControlButton 
              active={isCharging} 
              onClick={() => handleControlAction('isCharging', isCharging)} 
              icon="bolt" 
              label={isCharging ? "Ativo" : "Carga"}
              theme={isCharging ? "green" : "white"}
            />
            <div className="w-[1px] h-14 bg-white/5"></div>
            <ControlButton 
              active={state.climateOn} 
              onClick={() => handleControlAction('climateOn', state.climateOn)} 
              icon="fan" 
              label="Clima"
              theme="cyan"
            />
            <div className="w-[1px] h-14 bg-white/5"></div>
            <ControlButton 
              active={state.lightsOn} 
              onClick={() => handleControlAction('lightsOn', state.lightsOn)} 
              icon="light" 
              label="Luzes"
              theme="white"
            />
            <div className="w-[1px] h-14 bg-white/5"></div>
            <ControlButton 
              active={state.locked} 
              onClick={() => handleControlAction('locked', state.locked)} 
              icon="lock" 
              label={state.locked ? "Lock" : "Unlock"}
              theme="white"
            />
          </div>

          <AnimatePresence>
            {insights.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-gradient-to-br from-cyan-400/5 to-transparent border border-white/5 rounded-[3rem] relative overflow-hidden group hover:border-cyan-400/20 transition-all duration-500"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/5 blur-[80px] rounded-full group-hover:bg-cyan-400/10 transition-all"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.8em] text-cyan-400 mb-3 opacity-60">Insight AI</p>
                <p className="text-xl font-bold text-zinc-200 italic leading-snug">"{insights[0]}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-10 border-t border-white/5">
        <StatRow label="Km Total" value={state.odometer.toLocaleString()} unit="km" />
        <StatRow label="Temp. Interior" value={state.insideTemp} unit="°C" />
        <StatRow label="Saúde e-GT" value={state.health} unit="%" />
        <StatRow label="Sincronização" value={isConnected ? 'Live' : 'Cloud'} unit="" />
      </div>
    </div>
  );
};

const BoltEmitter: React.FC<{ color: string, count: number }> = ({ color, count }) => {
  const [bolts, setBolts] = useState<number[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      setBolts(prev => [...prev.slice(-count + 1), Date.now()]);
    }, 200);
    return () => clearInterval(interval);
  }, [count]);

  return (
    <>
      {bolts.map(id => (
        <ElectricBolt key={id} color={color} />
      ))}
    </>
  );
};

const ControlButton = ({ active, onClick, label, icon, theme }: any) => {
  const isGreen = theme === 'green';
  const isCyan = theme === 'cyan';
  
  return (
    <button onClick={onClick} className={`flex flex-col items-center space-y-3 transition-all duration-500 group ${active ? 'scale-105' : 'opacity-40 hover:opacity-100'}`}>
      <div className={`w-14 h-14 rounded-[1.8rem] flex items-center justify-center border-2 transition-all duration-500 ${
        active 
        ? (isGreen ? 'bg-green-500 border-green-500 text-black shadow-[0_0_20px_rgba(74,222,128,0.3)]' : isCyan ? 'bg-cyan-400 border-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-white border-white text-black')
        : 'border-white/10 text-white bg-white/5'
      }`}>
        {icon === 'bolt' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
        {icon === 'light' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>}
        {icon === 'lock' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
        {icon === 'fan' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M12 12l0 -3 M12 12l3 3 M12 12l-3 3" /></svg>}
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors">{label}</span>
    </button>
  );
};

const StatRow = ({ label, value, unit }: any) => (
  <div className="flex flex-col space-y-1">
    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">{label}</p>
    <div className="flex items-baseline space-x-1">
      <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{value}</span>
      <span className="text-[10px] font-bold text-cyan-400 uppercase italic">{unit}</span>
    </div>
  </div>
);

export default Dashboard;
