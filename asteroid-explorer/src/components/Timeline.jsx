import React from 'react';
import { Play, Pause, FastForward, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function Timeline({ 
  currentTime, setCurrentTime, minTime, maxTime, 
  isPlaying, setIsPlaying, speed, setSpeed, 
  exaggerate, setExaggerate 
}) {
  const progress = ((currentTime - minTime) / (maxTime - minTime)) * 100 || 0;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[800px] max-w-[90vw] bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl z-10">
      
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-space-accent font-mono text-sm mb-1">Current Date Simulation</p>
          <h2 className="text-2xl font-bold">{format(currentTime, 'MMM dd, yyyy - HH:mm:ss')}</h2>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setExaggerate(!exaggerate)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${exaggerate ? 'bg-space-accent text-space-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Activity size={16} /> {exaggerate ? 'Exaggerated Scale' : 'Realistic Scale'}
          </button>
          <button 
            onClick={() => setSpeed(s => s === 1 ? 10 : s === 10 ? 50 : 1)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-all"
          >
            <FastForward size={16} /> {speed}x
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <input
          type="range"
          min={minTime}
          max={maxTime}
          value={currentTime}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentTime(Number(e.target.value));
          }}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-space-accent"
        />
      </div>
    </div>
  );
}
