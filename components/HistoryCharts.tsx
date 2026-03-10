
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { TelemetryPoint } from '../types';

interface HistoryChartsProps {
  data: TelemetryPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 rounded-2xl border border-cyan-400/30 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-sm font-black text-white">{entry.value.toFixed(1)}{entry.unit || ''}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const HistoryCharts: React.FC<HistoryChartsProps> = ({ data }) => {
  return (
    <div className="flex flex-col space-y-10 w-full max-w-4xl mx-auto">
      {/* Battery Evolution - Stacked Top */}
      <div className="glass-card rounded-[3.5rem] p-10 border-white/5 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-1">Telemetria em Tempo Real</p>
            <h3 className="text-2xl font-black text-white italic">Nível de Energia</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Carga %</span>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBattery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 'bold' }} 
                dy={10}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(34,211,238,0.2)', strokeWidth: 2 }} />
              <Area 
                type="monotone" 
                dataKey="battery" 
                name="Bateria"
                unit="%"
                stroke="#22d3ee" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBattery)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Autonomy Projections - Stacked Bottom */}
      <div className="glass-card rounded-[3.5rem] p-10 border-white/5 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-1">Performance Histórica</p>
            <h3 className="text-2xl font-black text-white italic">Autonomia Real</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Alcance km</span>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 'bold' }} 
                dy={10}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
              <Line 
                type="stepAfter" 
                dataKey="range" 
                name="Alcance"
                unit=" km"
                stroke="#ffffff" 
                strokeWidth={2}
                dot={{ fill: '#ffffff', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: '#22d3ee', strokeWidth: 2 }}
                animationDuration={2500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HistoryCharts;
