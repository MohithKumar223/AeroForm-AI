import React from 'react';
import { motion } from 'motion/react';
import { Play, Activity, Target, Shield, Info, MapPin } from 'lucide-react';
import { AnalysisResult } from '../types';

interface DashboardProps {
  data: AnalysisResult;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [activeFrameIndex, setActiveFrameIndex] = React.useState(0);
  const activeFrame = data.frames[activeFrameIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Telemetry Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-panel p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">Jump Performance</h2>
            <div className="text-neon-yellow font-mono font-bold text-xl">{data.score}/100</div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/20 rounded-md">
            <Activity className="w-3 h-3 text-neon-cyan" />
            <span className="text-[10px] font-mono font-bold text-neon-cyan uppercase">{data.sportName}</span>
          </div>

          <div className="space-y-4">
            {activeFrame.telemetry.map((metric, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 border border-white/5 rounded-lg bg-white/[0.02]"
              >
                <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">{metric.label}</div>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-mono font-medium">{metric.value}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    metric.status === 'optimal' ? 'bg-green-400' : 
                    metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  } animate-pulse`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Biometric Analysis
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed font-light italic">
            "{activeFrame.description}"
          </div>
        </div>
      </div>

      {/* Main Analysis View */}
      <div className="lg:col-span-6 space-y-4">
        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-black">
          <img 
            src={activeFrame.imageUrl} 
            alt="Analysis Frame" 
            className="w-full h-full object-contain"
          />
          
          {/* AI Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {activeFrame.keyPoints.map((point, i) => (
                <g key={i}>
                  <motion.circle 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    cx={point.x} 
                    cy={point.y} 
                    r="1.5" 
                    className="fill-neon-cyan/50 stroke-neon-cyan stroke-[0.5]"
                  />
                  <text 
                    x={point.x + 2} 
                    y={point.y - 2} 
                    className="fill-neon-cyan text-[3px] font-mono"
                  >
                    {point.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-tighter">AI Processing Active</span>
            </div>
          </div>
        </div>

        {/* Frame Navigator */}
        <div className="flex gap-2 justify-center h-20">
          {data.frames.map((frame, i) => (
            <button
              key={frame.id}
              onClick={() => setActiveFrameIndex(i)}
              className={`relative h-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                activeFrameIndex === i ? 'border-neon-yellow scale-105 z-10' : 'border-white/10 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
              }`}
            >
              <img src={frame.imageUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-xs font-mono font-bold">0{i + 1}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Global Critique & Metadata */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Shield className="w-3 h-3 text-neon-yellow" /> Coach's Report
          </h2>
          <div className="text-sm font-light text-slate-200 leading-relaxed">
            {data.overallCritique}
          </div>
        </div>

        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Activity className="w-3 h-3 text-red-500" /> Critical Demands
          </h2>
          <div className="space-y-4">
            {data.criticalDemands.map((demand, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neon-cyan uppercase">{demand.label}</span>
                  <span className={`text-[8px] font-mono uppercase px-1 rounded ${
                    demand.importance === 'extreme' ? 'bg-red-500 text-white' :
                    demand.importance === 'critical' ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-ink'
                  }`}>
                    {demand.importance}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{demand.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg">
              <MapPin className="w-4 h-4 text-neon-cyan" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-500">Origin Location</div>
              <div className="text-xs font-medium">{data.metadata.location}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg">
              <Target className="w-4 h-4 text-neon-cyan" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-500">Coordinates</div>
              <div className="text-xs font-mono">{data.metadata.coordinates.lat}, {data.metadata.coordinates.lng}</div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full p-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 group"
        >
          <Play className="w-4 h-4 group-hover:text-neon-cyan transition-colors" />
          <span className="text-xs font-mono uppercase tracking-widest">Post New Analysis</span>
        </button>
      </div>
    </div>
  );
};
