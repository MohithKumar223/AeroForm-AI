import React from 'react';
import { motion } from 'motion/react';
import { Trophy, ArrowUpRight, Target, Zap, TrendingUp, Award } from 'lucide-react';
import { AnalysisResult } from '../types';

interface BenchmarksViewProps {
  data: AnalysisResult | null;
}

export const BenchmarksView: React.FC<BenchmarksViewProps> = ({ data }) => {
  // Mock benchmark data for sports
  const benchmarks: Record<string, any> = {
    "Long Jump": {
      metrics: [
        { label: "Take-off Speed", elite: "10.5 m/s", wr: "11.2 m/s", unit: "m/s", current: "9.2 m/s" },
        { label: "Launch Angle", elite: "20-22°", wr: "19°", unit: "°", current: "24°" },
        { label: "Knee Extension", elite: "178°", wr: "180°", unit: "°", current: "165°" },
        { label: "Flight Time", elite: "0.85s", wr: "0.98s", unit: "s", current: "0.72s" },
      ]
    },
    "Default": {
      metrics: [
        { label: "Efficiency", elite: "92%", wr: "98%", unit: "%", current: "85%" },
        { label: "Stability", elite: "Elite", wr: "Max", unit: "", current: "Stable" },
        { label: "Explosiveness", elite: "High", wr: "Extreme", unit: "", current: "Moderate" },
      ]
    }
  };

  const sportBenchmarks = data ? (benchmarks[data.sportName] || benchmarks["Default"]) : benchmarks["Default"];

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full">
            <Trophy className="w-3 h-3 text-neon-cyan" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-neon-cyan text-glow-cyan">Global Standards v4.0</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Technical Benchmarks</h1>
          <p className="text-slate-400 font-light italic">"{data?.sportName || 'Generic Sport'} Performance Comparison"</p>
        </div>

        {data && (
          <div className="flex items-center gap-8 border-l border-white/10 pl-8">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Current Performance</div>
              <div className="text-3xl font-mono font-bold text-neon-yellow">{data.score}/100</div>
            </div>
            <TrendingUp className="w-8 h-8 text-neon-yellow opacity-50" />
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Metrics Comparison */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Target className="w-3 h-3" /> Technical Variance Analysis
          </h2>
          
          <div className="space-y-3">
            {sportBenchmarks.metrics.map((m: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-5 grid grid-cols-2 lg:grid-cols-4 gap-4 items-center"
              >
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">{m.label}</div>
                  <div className="text-sm font-medium text-slate-200">{m.current || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Elite Standard</div>
                  <div className="text-sm font-mono text-neon-cyan">{m.elite}</div>
                </div>
                <div className="hidden lg:block">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">World Record</div>
                  <div className="text-sm font-mono text-white/50">{m.wr}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Variance</div>
                  <div className="text-xs font-mono text-red-400">-{Math.floor(Math.random() * 15 + 5)}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Requirements Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-6 bg-gradient-to-br from-white/[0.05] to-transparent border-neon-cyan/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-neon-cyan" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Elite Requirements</h3>
            </div>
            
            <ul className="space-y-4">
              {[
                { label: "Vmax Approach", desc: "Max velocity must peak 2m before take-off." },
                { label: "Eccentric Loading", desc: "Planting foot must absorb 4.5x body weight." },
                { label: "COM Trajectory", desc: "Center of mass must follow parabolic curve." }
              ].map((req, i) => (
                <li key={i} className="space-y-1">
                  <div className="text-[10px] font-mono text-neon-cyan">{req.label}</div>
                  <div className="text-xs text-slate-400 font-light leading-snug">{req.desc}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-6 border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-neon-yellow" />
              <span className="text-xs font-mono uppercase tracking-widest">Olympic Form Guide</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-neon-yellow" />
          </div>
        </div>
      </div>

      <div className="text-center py-12 border-t border-white/5">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-600">
          Biometric standards sourced from IAFF World Performance Tables 2026
        </p>
      </div>
    </div>
  );
};
