import React from 'react';
import { ShieldAlert, Maximize, AlertTriangle } from 'lucide-react';

export default function Sidebar({ data, selectedAsteroid, setSelectedAsteroid }) {
  if (!data || data.length === 0) return null;

  const hazardous = data.filter(a => a.isHazardous);
  const largest = [...data].sort((a, b) => b.diameter - a.diameter)[0];
  const closest = [...data].sort((a, b) => a.missDistance - b.missDistance)[0];

  const topScary = [...data].sort((a, b) => {
    if (a.isHazardous === b.isHazardous) return b.diameter - a.diameter;
    return a.isHazardous ? -1 : 1;
  }).slice(0, 5);

  return (
    <div className="absolute right-4 top-4 w-80 max-h-[90vh] overflow-y-auto bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl z-10">
      
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-space-accent to-white bg-clip-text text-transparent mb-1">
          Asteroid Risk Explorer
        </h1>
        <p className="text-sm text-gray-400 border-b border-white/10 pb-4">Live NASA NEO Data Visualizer</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <div className="text-space-danger flex items-center gap-2 mb-1">
            <ShieldAlert size={16} /> <span className="text-xs font-semibold">Hazardous</span>
          </div>
          <p className="text-xl font-bold">{hazardous.length}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <div className="text-space-accent flex items-center gap-2 mb-1">
            <Maximize size={16} /> <span className="text-xs font-semibold">Largest (m)</span>
          </div>
          <p className="text-xl font-bold">{Math.round(largest?.diameter || 0)}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Top 5 Threats</h3>
        <div className="flex flex-col gap-2">
          {topScary.length > 0 ? topScary.map((ast, i) => (
            <button
              key={ast.id}
              onClick={() => setSelectedAsteroid(ast)}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-space-danger/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <span className={`${ast.isHazardous ? 'text-space-danger' : 'text-gray-500'} font-mono text-sm`}>0{i + 1}</span>
                <div>
                  <p className="font-semibold text-sm group-hover:text-white text-gray-200 transition-colors">{ast.name}</p>
                  <p className="text-xs text-gray-400">Ø {Math.round(ast.diameter)}m</p>
                </div>
              </div>
              {ast.isHazardous && <AlertTriangle size={16} className="text-space-danger animate-pulse" />}
            </button>
          )) : <p className="text-sm text-gray-500">No data found.</p>}
        </div>
      </div>
    </div>
  );
}
