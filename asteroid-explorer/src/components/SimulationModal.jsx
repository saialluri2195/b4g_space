import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Target, Map } from 'lucide-react';
import { calculateImpactStats } from '../utils/physics';
import { playImpactSequence } from '../utils/audio';

const TARGET_CITIES = [
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
  { name: 'New York City, USA', lat: 40.7128, lng: -74.0060 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357 },
  { name: 'Rio de Janeiro, Brazil', lat: -22.9068, lng: -43.1729 },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
  { name: 'Moscow, Russia', lat: 55.7558, lng: 37.6173 },
  { name: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241 }
];

// Handles the rapid zoom dive sequence
const MapFlyTo = ({ target, phase }) => {
  const map = useMap();
  useEffect(() => {
    if (phase === 'falling') {
      map.setView([target.lat, target.lng], 4, { animate: false });
      setTimeout(() => {
         map.flyTo([target.lat, target.lng], 10, { duration: 2.0, easeLinearity: 0.25 });
      }, 50);
    }
  }, [target, phase, map]);
  return null;
};

export default function SimulationModal({ asteroid, onClose }) {
  if (!asteroid) return null;

  const stats = calculateImpactStats(asteroid.diameter, asteroid.velocity);
  
  const [phase, setPhase] = useState('falling'); // falling | flash | analysis
  const [progress, setProgress] = useState(0);
  const [target, setTarget] = useState(() => TARGET_CITIES[Math.floor(Math.random() * TARGET_CITIES.length)]);

  useEffect(() => {
    setPhase('falling');
    setProgress(0);

    // Blast the speakers seamlessly on load!
    playImpactSequence();

    const splashTimer = setTimeout(() => {
      setPhase('flash');
    }, 2000);

    const analysisTimer = setTimeout(() => {
      setPhase('analysis');
      
      let startTime = Date.now();
      const duration = 2000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        const easeProgress = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setProgress(easeProgress);
        if (p < 1) requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    }, 2500);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(analysisTimer);
    };
  }, [asteroid, target]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-space-800 border border-white/10 rounded-2xl overflow-hidden w-full max-w-6xl flex flex-col md:flex-row shadow-[0_0_50px_rgba(239,68,68,0.15)]"
        >
          {/* Left Panel: Ground Zero Map Map */}
          <div className="w-full md:w-1/2 h-[500px] md:h-[700px] relative bg-black overflow-hidden relative">
            
            <MapContainer 
               key={`${target.lat}-${target.lng}-base`}
               center={[target.lat, target.lng]} 
               zoom={4} 
               style={{ height: '100%', width: '100%' }} 
               zoomControl={false}
               dragging={false}
               scrollWheelZoom={false}
               doubleClickZoom={false}
               touchZoom={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <MapFlyTo target={target} phase={phase} />
              
              {phase === 'analysis' && (
                <>
                  <Circle center={[target.lat, target.lng]} radius={(parseFloat(stats.craterDiameterKm) / 2) * 1000 * progress} pathOptions={{ color: '#000', fillColor: '#000', fillOpacity: 0.8, weight: 1 }} />
                  <Circle center={[target.lat, target.lng]} radius={parseFloat(stats.fireballRadiusKm) * 1000 * progress} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.6, weight: 1 }} />
                  <Circle center={[target.lat, target.lng]} radius={parseFloat(stats.blastRadiusKm) * 1000 * progress} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.3, weight: 2, dashArray: '5, 10' }} />
                  <Circle center={[target.lat, target.lng]} radius={parseFloat(stats.thermalRadiusKm) * 1000 * progress} pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.2, weight: 1, dashArray: '2, 5' }} />
                </>
              )}
            </MapContainer>

            {/* PHASE 1: Jittering POV Meteor Graphic */}
            <AnimatePresence>
              {phase === 'falling' && (
                <motion.div 
                  className="absolute inset-0 z-[400] flex flex-col items-center justify-center pointer-events-none"
                  initial={{ opacity: 1 }}
                  animate={{ x: [-10, 10, -5, 5, -8, 8, -4, 4, 0], y: [10, -10, 5, -5, 8, -8, -4, 4, 0] }}
                  transition={{ duration: 0.1, repeat: Infinity, ease: 'linear' }}
                  exit={{ opacity: 0, transition: { duration: 0.1, repeat: 0 } }}
                >
                  <div className="absolute top-10 font-black text-2xl md:text-5xl text-red-500 tracking-[0.2em] shadow-[0_0_20px_red] bg-black/80 px-8 py-2 border-y-4 border-red-500 whitespace-nowrap z-[800]">
                    [ POV: YOU ARE THE METEOR ]
                  </div>
                  
                  <div className="absolute inset-0 border-4 border-red-500/30 rounded-full m-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-t-4 border-l-4 border-white absolute top-0 left-0"></div>
                    <div className="w-8 h-8 border-t-4 border-r-4 border-white absolute top-0 right-0"></div>
                    <div className="w-8 h-8 border-b-4 border-l-4 border-white absolute bottom-0 left-0"></div>
                    <div className="w-8 h-8 border-b-4 border-r-4 border-white absolute bottom-0 right-0"></div>
                    <div className="text-red-500 font-mono text-sm md:text-lg absolute -bottom-10 bg-black/50 px-4 py-2 border border-red-500 shadow-xl drop-shadow-xl font-bold">ALTITUDE: CRITICAL DROP</div>
                  </div>

                  <motion.div
                    className="rounded-full shadow-[0_0_150px_red]"
                    initial={{ scale: 0.0, opacity: 0.5, y: -400 }}
                    animate={{ scale: [0.0, 5.0], opacity: [0.5, 1, 1], y: [-400, 0] }}
                    transition={{ duration: 2.0, ease: "easeIn" }}
                    style={{
                      width: '150px',
                      height: '150px',
                      backgroundImage: "url('/lava_texture.png')",
                      backgroundSize: 'cover',
                      filter: 'contrast(1.5) brightness(1.5)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE 2: White Detonation Flash */}
            <AnimatePresence>
              {phase === 'flash' && (
                <motion.div 
                  className="absolute inset-0 z-[600] bg-white mix-blend-screen pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.8 } }}
                />
              )}
            </AnimatePresence>

            {/* PHASE 3: Radii Animations Display (same as before) */}
            {phase === 'analysis' && progress > 0 && progress < 1 && (
              <motion.div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[500] mix-blend-screen rounded-full"
                key={`blast-${target.name}`}
                initial={{ width: 0, height: 0, opacity: 1, boxShadow: '0 0 0px #ef4444, inset 0 0 0px #fff' }}
                animate={{ width: [0, 1200], height: [0, 1200], opacity: [1, 0.8, 0], boxShadow: ['0 0 100px #ef4444, inset 0 0 100px #fff', '0 0 500px #ef4444, inset 0 0 500px #ff0'] }}
                transition={{ duration: 2.0, ease: "easeOut" }}
                style={{ backgroundColor: 'rgba(255, 150, 50, 0.6)' }}
              />
            )}
            
            {phase === 'analysis' && progress > 0 && progress < 1 && (
              <motion.div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[490] rounded-full border-4 border-white"
                key={`ring-${target.name}`}
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{ width: [0, 1500], height: [0, 1500], opacity: [1, 0] }}
                transition={{ duration: 1.0, ease: "easeOut" }}
              />
            )}

            <div className="absolute top-4 left-4 z-[700] bg-black/80 px-4 py-2 rounded-lg text-sm text-white border border-white/10 flex items-center gap-2 shadow-xl backdrop-blur-md">
              <Map size={16} className="text-space-accent" /> Target: {target.name}
            </div>
          </div>

          {/* Right Panel: Data Presentation */}
          {phase !== 'analysis' ? (
             <div className="w-full md:w-1/2 p-8 relative flex flex-col items-center justify-center bg-black/90 border-l border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/lava_texture.png')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(10px)' }}></div>
                <div className="text-red-500 animate-pulse flex flex-col items-center relative z-10 text-center">
                   <Target size={64} className="mb-4 text-red-500 shadow-[0_0_10px_red] rounded-full" />
                   <h3 className="text-3xl font-bold tracking-[0.2em] mb-2 uppercase text-white shadow-black drop-shadow-lg">Impact Imminent</h3>
                   <p className="text-sm font-mono tracking-widest text-red-400">Locking Coordinates: {target.lat.toFixed(4)}, {target.lng.toFixed(4)}</p>
                </div>
             </div>
          ) : (
            <motion.div 
              className="w-full md:w-1/2 p-8 relative flex flex-col max-h-[700px] overflow-y-auto bg-space-800"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>

              <div className="mb-6 pr-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-space-danger/20 text-space-danger rounded-full text-xs font-bold tracking-wider uppercase mb-4 border border-space-danger/30">
                  <Flame size={14} /> Global Threat Simulator
                </div>
                <h2 className="text-4xl font-black mb-2">{asteroid.name}</h2>
                <p className="text-gray-400">Projected damage analysis mapping.</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Target Zone</label>
                <div className="relative">
                  <select 
                    value={target.name}
                    onChange={(e) => setTarget(TARGET_CITIES.find(c => c.name === e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white appearance-none focus:outline-none focus:border-space-accent focus:ring-1 focus:ring-space-accent/50 transition-all shadow-inner font-semibold"
                  >
                    {TARGET_CITIES.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <Target size={16} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-widest font-bold">Kinetic Energy</p>
                  <p className="text-2xl font-bold text-space-danger">{stats.energyMt} <span className="text-sm font-normal text-gray-400">Mt TNT</span></p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-widest font-bold">Velocity</p>
                  <p className="text-2xl font-bold text-space-accent">{asteroid.velocity.toFixed(1)} <span className="text-sm font-normal text-gray-400">km/s</span></p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-widest font-bold">Mass</p>
                  <p className="text-2xl font-bold">{stats.mass} <span className="text-sm font-normal text-gray-400">M tons</span></p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-widest font-bold">Diameter</p>
                  <p className="text-2xl font-bold">{Math.round(asteroid.diameter)} <span className="text-sm font-normal text-gray-400">meters</span></p>
                </div>
              </div>

              <div className="mt-auto space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-black border border-white/50 shadow-sm"></div>
                    <div>
                      <span className="text-sm font-bold text-gray-200">Crater Diameter</span>
                      <p className="text-[11px] text-gray-500 leading-tight mt-0.5">100% Destruction / Vaporized ground</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg">{stats.craterDiameterKm} km</span>
                </div>
                
                <div className="flex justify-between items-center bg-orange-900/10 p-3 rounded-lg border border-orange-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-orange-500/80 border border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                    <div>
                      <span className="text-sm font-bold text-orange-400">Fireball Radius</span>
                      <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Fatal burns / Extreme structural collapse</p>
                    </div>
                  </div>
                  <span className="font-bold text-orange-400 text-lg">{stats.fireballRadiusKm} km</span>
                </div>

                <div className="flex justify-between items-center bg-red-900/10 p-3 rounded-lg border border-red-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500/80 border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    <div>
                      <span className="text-sm font-bold text-red-500">Shockwave Radius</span>
                      <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Buildings collapse / Widespread fatalities</p>
                    </div>
                  </div>
                  <span className="font-bold text-red-500 text-lg">{stats.blastRadiusKm} km</span>
                </div>

                <div className="flex justify-between items-center bg-yellow-900/10 p-3 rounded-lg border border-yellow-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500/80 border border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                    <div>
                      <span className="text-sm font-bold text-yellow-500">Thermal Radiation</span>
                      <p className="text-[11px] text-gray-500 leading-tight mt-0.5">3rd degree burns / Spontaneous fires</p>
                    </div>
                  </div>
                  <span className="font-bold text-yellow-500 text-lg">{stats.thermalRadiusKm} km</span>
                </div>
              </div>
              
              <button onClick={onClose} className="mt-8 w-full py-4 bg-white/5 hover:bg-space-accent hover:text-black hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] text-white font-bold rounded-xl transition-all border border-white/10 uppercase tracking-widest text-sm">
                Deploy Response Team
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
