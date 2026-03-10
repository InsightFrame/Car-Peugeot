
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import HistoryCharts from './components/HistoryCharts';
import { CarState, TelemetryPoint } from './types';
import { fetchCarData, fetchHistoryData, updateCarCommand, exchangeCodeForToken } from './services/apiService';
import { getSmartInsights, processUserCommand } from './services/geminiService';

const App: React.FC = () => {
  const [carState, setCarState] = useState<CarState | null>(null);
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [command, setCommand] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      try {
        setLoading(true);
        console.log("Iniciando sincronização Peugeot...");
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          console.log("Código de autorização detectado, trocando por token...");
          await exchangeCodeForToken(code);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        console.log("Procurando dados do veículo...");
        const [data, historyData] = await Promise.all([
          fetchCarData(),
          fetchHistoryData()
        ]);
        
        console.log("Dados recebidos:", data);
        setCarState(data);
        setHistory(historyData);
        
        try {
          const aiTips = await getSmartInsights(data);
          setInsights(aiTips);
        } catch (aiErr) {
          console.warn("Erro ao obter insights AI:", aiErr);
        }
        
        setLoading(false);
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3500);
      } catch (e) {
        console.error("Erro crítico na inicialização:", e);
        setLoading(false);
      }
    };
    
    init();

    const interval = setInterval(async () => {
      const data = await fetchCarData();
      setCarState(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
        return data;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleAction = async (key: keyof CarState, val: any) => {
    if (!carState) return;
    const newState = { ...carState, [key]: val };
    setCarState(newState);
    await updateCarCommand(key, val);
  };

  const handleAICommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !carState || isProcessingAI) return;

    setIsProcessingAI(true);
    setAiResponse(null);
    
    const result = await processUserCommand(command, carState);
    
    if (result.functionCalls && result.functionCalls.length > 0) {
      for (const fc of result.functionCalls) {
        if (fc.name === 'controlCarFeature') {
          const { feature, value } = fc.args as any;
          let typedValue: any = value;
          if (value === 'true') typedValue = true;
          if (value === 'false') typedValue = false;
          
          await handleAction(feature as keyof CarState, typedValue);
        }
      }
    }

    if (result.text) {
      setAiResponse(result.text);
      setTimeout(() => setAiResponse(null), 5000);
    }

    setCommand("");
    setIsProcessingAI(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_20px_#22d3ee]"></div>
          <h2 className="text-cyan-400 font-black uppercase tracking-[0.5em] text-xs">Sincronizando Sistemas Peugeot...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-cyan-400 selection:text-black pb-32">
      <AnimatePresence mode="wait">
        {showWelcome && (
          <motion.div 
            key="welcome-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/10 blur-[180px] rounded-full animate-pulse"></div>
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="relative text-center space-y-4"
            >
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-[2px] bg-cyan-400 mx-auto shadow-[0_0_15px_#22d3ee]"
              />
              <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[1em] mb-4">Sistemas Ativos</h2>
              <h1 className="text-7xl font-black italic tracking-tighter text-white">
                Peugeot <span className="text-cyan-400 not-italic">Leonardo</span>
              </h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-zinc-600 font-bold uppercase tracking-[0.4em] text-[10px]"
              >
                Intelligent Electric Experience
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full"></div>
      </div>

      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: showWelcome ? 3.5 : 0 }}
        className="relative z-10 space-y-20"
      >
        <Dashboard 
          state={carState!} 
          onAction={handleAction} 
          insights={insights}
        />
        
        <section className="max-w-6xl mx-auto px-6">
          <div className="flex items-center space-x-4 mb-10">
            <h2 className="text-3xl font-black italic tracking-tighter">Fluxo de <span className="text-cyan-400">Energia</span></h2>
            <div className="h-px flex-grow bg-white/5"></div>
          </div>
          <HistoryCharts data={history} />
        </section>
      </motion.main>

      {/* Floating Command Center */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-[60]">
        <AnimatePresence>
          {aiResponse && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-4 p-4 glass-card rounded-2xl border-cyan-400/30 text-center"
            >
              <p className="text-cyan-400 text-sm font-medium italic">"{aiResponse}"</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <form 
          onSubmit={handleAICommand}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-focus-within:opacity-100"></div>
          <div className="relative flex items-center bg-black/80 backdrop-blur-3xl rounded-full border border-white/10 p-2 pl-6">
            <input 
              type="text" 
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Comando de voz: 'Liga o ar condicionado'..."
              className="bg-transparent border-none focus:ring-0 flex-grow text-sm font-medium text-white placeholder-zinc-600"
              disabled={isProcessingAI}
            />
            <button 
              type="submit"
              disabled={isProcessingAI || !command.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isProcessingAI ? 'bg-zinc-800' : 'bg-cyan-400 text-black hover:scale-110 active:scale-95'
              }`}
            >
              {isProcessingAI ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              )}
            </button>
          </div>
        </form>
      </div>

      <footer className="relative z-10 py-12 text-center pb-32">
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[1em]">Peugeot Pure Electric Technology</p>
      </footer>
    </div>
  );
};

export default App;
