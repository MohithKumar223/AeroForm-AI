/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UploadView } from './components/UploadView';
import { Dashboard } from './components/Dashboard';
import { HistoryView } from './components/HistoryView';
import { BenchmarksView } from './components/BenchmarksView';
import { analyzeAthleticSequence } from './services/gemini';
import { AnalysisResult, HistoryItem } from './types';
import { Activity, ShieldCheck, Zap, History as HistoryIcon, LayoutDashboard, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ViewState = 'upload' | 'dashboard' | 'history' | 'benchmarks';

export default function App() {
  const [data, setData] = React.useState<AnalysisResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [view, setView] = React.useState<ViewState>('upload');
  const [history, setHistory] = React.useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('aeroform_history');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('aeroform_history', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async (files: File[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeAthleticSequence(files);
      setData(result);
      setView('dashboard');
      
      // Add to history
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        sportName: result.sportName,
        score: result.score,
        location: result.metadata.location,
        thumbnail: result.frames[0].imageUrl,
        fullData: result
      };
      setHistory(prev => [newItem, ...prev]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Full error:", err);
      console.error("Error message:", errorMsg);
      setError(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setData(item.fullData);
    setView('dashboard');
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen technical-grid overflow-hidden flex flex-col">
      {/* Header Navigation */}
      <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between z-50 bg-slate-950/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setView('upload'); setData(null); }}>
            <div className="w-8 h-8 bg-neon-yellow rounded flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
              <Zap className="w-5 h-5 text-ink" fill="currentColor" />
            </div>
            <span className="font-mono font-bold text-lg tracking-tighter uppercase">AeroForm <span className="text-neon-cyan">v2</span></span>
          </div>
          
          <nav className="hidden md:flex items-center h-16">
            <button 
              onClick={() => setView(data ? 'dashboard' : 'upload')}
              className={`h-full px-4 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${
                (view === 'dashboard' || view === 'upload') ? 'text-neon-yellow border-neon-yellow' : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-3 h-3" /> Analysis
            </button>
            <button 
              onClick={() => setView('history')}
              className={`h-full px-4 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${
                view === 'history' ? 'text-neon-yellow border-neon-yellow' : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              <HistoryIcon className="w-3 h-3" /> History
            </button>
            <button 
              onClick={() => setView('benchmarks')}
              className={`h-full px-4 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${
                view === 'benchmarks' ? 'text-neon-yellow border-neon-yellow' : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              <Trophy className="w-3 h-3" /> Benchmarks
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            <span className="text-[9px] font-mono uppercase text-green-500 tracking-tighter">System Nominal</span>
          </div>
          <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
            <Activity className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-auto flex flex-col">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest flex items-center gap-3 shadow-2xl"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {error}
              <button onClick={() => setError(null)} className="hover:text-red-400">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 container mx-auto p-6 md:p-12 overflow-visible">
          <AnimatePresence mode="wait">
            {view === 'upload' && !data && (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <UploadView onAnalyze={handleAnalyze} isLoading={loading} />
              </motion.div>
            )}

            {view === 'dashboard' && data && (
              <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-full">
                <Dashboard data={data} key={data.frames[0].imageUrl} />
              </motion.div>
            )}

            {view === 'history' && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HistoryView history={history} onSelect={handleSelectHistory} onDelete={handleDeleteHistory} />
              </motion.div>
            )}

            {view === 'benchmarks' && (
              <motion.div key="benchmarks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BenchmarksView data={data} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 border-t border-white/5 px-6 flex items-center justify-between bg-black/40 text-[9px] font-mono uppercase tracking-[0.2em] text-slate-600 shrink-0">
        <div className="flex items-center gap-4">
          <span>Processing Node: US-EAST-GEN-01</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>Version: 2.1.0-PRO-BETA</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-neon-cyan/50 italic">AI Bio-Engine v4.4 Calibrated</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>© 2026 AeroForm Tech</span>
        </div>
      </footer>
    </div>
  );
}

