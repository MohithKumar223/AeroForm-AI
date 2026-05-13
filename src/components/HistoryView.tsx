import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, ChevronRight, Trash2, Award } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onDelete }) => {
  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-slate-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-slate-300">No Analysis History</h3>
          <p className="text-sm text-slate-500">Your completed sessions will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Training Log</h2>
          <p className="text-sm text-slate-500 font-mono uppercase tracking-widest mt-1">Archive of recorded performance data</p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-full">
          {history.length} Sessions Recorded
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel group overflow-hidden flex h-32 hover:border-neon-cyan/30 transition-all cursor-pointer"
            onClick={() => onSelect(item)}
          >
            <div className="w-32 h-full relative overflow-hidden">
              <img src={item.thumbnail} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Session thumbnail" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent" />
            </div>
            
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-neon-cyan uppercase font-bold">{item.sportName}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="text-[10px] font-mono text-slate-500">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-200 truncate w-40">{item.location}</h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-neon-yellow leading-none">{item.score}</div>
                  <div className="text-[8px] font-mono text-slate-500 uppercase">Score</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] truncate max-w-[120px]">{item.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-neon-cyan transition-colors" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
