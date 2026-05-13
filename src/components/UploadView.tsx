import React from 'react';
import { Upload, Camera, Zap, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UploadViewProps {
  onAnalyze: (files: File[]) => void;
  isLoading: boolean;
}

export const UploadView: React.FC<UploadViewProps> = ({ onAnalyze, isLoading }) => {
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAnalyze(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 h-full flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-yellow/10 border border-neon-yellow/20 rounded-full">
            <Zap className="w-3 h-3 text-neon-yellow" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-neon-yellow">v2.0 AeroAnalysis Engine</span>
          </div>
          
          <h1 className="text-6xl font-bold tracking-tighter leading-tight">
            DECODE EVERY <br />
            <span className="text-neon-cyan">MILLISECOND.</span>
          </h1>

          <p className="text-slate-400 text-lg font-light leading-relaxed max-w-sm">
            Professional-grade biomechanics analysis for vertical and horizontal jumping. 
            Upload a sequence of images or a short clip to get started.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-neon-cyan transition-colors">
                <Camera className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-sm font-mono uppercase tracking-wide">Multi-Frame Support</div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-neon-cyan transition-colors">
                <Activity className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-sm font-mono uppercase tracking-wide">AI Pose Estimation</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div 
            className={`h-[400px] glass-panel border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center text-center group cursor-pointer ${
              dragActive ? 'border-neon-cyan bg-neon-cyan/5' : 'border-white/10 hover:border-white/20'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => e.target.files && onAnalyze(Array.from(e.target.files))}
            />
            
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="relative w-20 h-20 mx-auto">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 border-2 border-neon-cyan border-t-transparent rounded-full"
                    />
                    <div className="absolute inset-4 border border-white/10 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-neon-cyan animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-neon-cyan">Processing Telemetry</div>
                    <div className="text-slate-500 text-[10px] mt-2">GEMINI PRO ANALYSIS IN PROGRESS</div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-neon-cyan/10 transition-all">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-neon-cyan transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Drop Files or Click</h3>
                    <p className="text-slate-500 text-sm italic">Supports JPG, PNG, MP4</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-neon-cyan/10 blur-3xl rounded-full -z-10" />
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-neon-yellow/10 blur-3xl rounded-full -z-10" />
        </motion.div>
      </div>

      {/* Quick Access Examples */}
      <div className="mt-20 border-t border-white/5 pt-12">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-6">Recent Training Datasets</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg group hover:bg-white/[0.05] cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded bg-white/5" />
              <div className="flex-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Jump_Seq_0{i}</div>
                <div className="text-[8px] font-mono text-slate-600">07.05.2026 • 12.85N 77.59E</div>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-neon-cyan" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
