import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import { X, Flame, Target, Map, Skull } from 'lucide-react';
import { calculateImpactStats } from '../utils/physics';
import { playImpactSequence } from '../utils/audio';
//final
const TARGET_CITIES = [
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522, density: 20700 },
  { name: 'New York City, USA', lat: 40.7128, lng: -74.0060, density: 10700 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, density: 6150 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278, density: 5600 },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, density: 430 },
  { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357, density: 19300 },
  { name: 'Rio de Janeiro, Brazil', lat: -22.9068, lng: -43.1729, density: 5300 },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, density: 20600 },
  { name: 'Moscow, Russia', lat: 55.7558, lng: 37.6173, density: 4800 },
  { name: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241, density: 1500 }
];

const FlyToTarget = ({ target, phase }) => {
  const map = useMap();
  useEffect(() => {
    if (phase === 'falling') map.flyTo([target.lat, target.lng], 5, { duration: 2 });
    if (phase === 'analysis') map.flyTo([target.lat, target.lng], 10, { duration: 1.5 });
  }, [target, phase, map]);
  return null;
};

export default function SimulationModal({ asteroid, onClose }) {
  if (!asteroid) return null;

  const stats = calculateImpactStats(asteroid.diameter, asteroid.velocity);
  
  const [phase, setPhase] = useState('falling'); // falling | flash | analysis
  const [target, setTarget] = useState(() => TARGET_CITIES[Math.floor(Math.random() * TARGET_CITIES.length)]);

  const blastAreaSqKm = Math.PI * Math.pow(parseFloat(stats.blastRadiusKm), 2);
  const estimatedCasualties = Math.round(blastAreaSqKm * target.density);
  const formattedCasualties = new Intl.NumberFormat().format(estimatedCasualties);

  useEffect(() => {
    setPhase('falling');

    // Blast the speakers seamlessly on load!
    playImpactSequence();

    const flashTimer = setTimeout(() => {
      setPhase('flash');
    }, 2000);

    const analysisTimer = setTimeout(() => {
      setPhase('analysis');
    }, 2500);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(analysisTimer);
    };
  }, [asteroid]); // Only do the full falling lock-on sequence on a completely new asteroid

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-space-800 border border-white/10 rounded-2xl overflow-hidden w-full max-w-6xl flex flex-col md:flex-row shadow-[0_0_50px_rgba(239,68,68,0.15)] h-[90vh] max-h-[900px]"
        >
          {/* Left Panel: Impact Map */}
          <div className="w-full md:w-1/2 h-[40%] md:h-full relative bg-black overflow-hidden relative">
            <MapContainer 
              center={[target.lat, target.lng]} 
              zoom={3} 
              zoomControl={false} 
              className="w-full h-full"
              minZoom={5}
              maxZoom={12}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              <FlyToTarget target={target} phase={phase} />
              
              {phase === 'analysis' && (
                <>
                  <Circle key={`c1-${target.name}`} center={[target.lat, target.lng]} radius={(parseFloat(stats.craterDiameterKm) / 2) * 1000} pathOptions={{ color: '#000', fillColor: '#000', fillOpacity: 0.8, weight: 1, className: 'blast-ring' }} />
                  <Circle key={`c2-${target.name}`} center={[target.lat, target.lng]} radius={parseFloat(stats.fireballRadiusKm) * 1000} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.6, weight: 1, className: 'blast-ring' }} />
                  <Circle key={`c3-${target.name}`} center={[target.lat, target.lng]} radius={parseFloat(stats.blastRadiusKm) * 1000} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.3, weight: 2, dashArray: '5, 10', className: 'blast-ring' }} />
                  <Circle key={`c4-${target.name}`} center={[target.lat, target.lng]} radius={parseFloat(stats.thermalRadiusKm) * 1000} pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.2, weight: 1, dashArray: '2, 5', className: 'blast-ring' }} />
                </>
              )}
            </MapContainer>

            {/* PHASE 1: Asteroid Falling POV */}
            <AnimatePresence>
              {phase === 'falling' && (
                <div className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none mix-blend-screen">
                  <motion.div
                    className="rounded-full shadow-[0_0_150px_red]"
                    initial={{ scale: 0.0, opacity: 0.5, y: -400 }}
                    animate={{ scale: [0.0, 5.0], opacity: [0.5, 1, 1], y: [-400, 0] }}
                    transition={{ duration: 2.0, ease: "easeIn" }}
                    style={{
                      width: '150px',
                      height: '150px',
                      background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,100,0,1) 30%, rgba(255,0,0,1) 60%, rgba(0,0,0,0) 80%)'
                    }}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* PHASE 2: White Detonation Flash Overlay*/}
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

            {/* PHASE 3: Fast Visual GPU-accelerated Screen Shockwave */}
            {phase === 'analysis' && (
              <motion.div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[500] mix-blend-screen rounded-full"
                key={`blast-screen-${target.name}`}
                initial={{ width: 0, height: 0, opacity: 1, boxShadow: '0 0 0px #ef4444, inset 0 0 0px #fff' }}
                animate={{ width: [0, 1500], height: [0, 1500], opacity: [1, 0.8, 0], boxShadow: ['0 0 100px #ef4444, inset 0 0 100px #fff', '0 0 500px #ef4444, inset 0 0 500px #ff0'] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ backgroundColor: 'rgba(255, 150, 50, 0.6)' }}
              />
            )}
            
            {phase === 'analysis' && (
              <motion.div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[490] rounded-full border-4 border-white"
                key={`ring-screen-${target.name}`}
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{ width: [0, 2000], height: [0, 2000], opacity: [1, 0] }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}

            <div className="absolute top-4 left-4 z-[700] bg-black/80 px-4 py-2 rounded-lg text-sm text-white border border-white/10 flex items-center gap-2 shadow-xl backdrop-blur-md">
              <Map size={16} className="text-space-accent" /> Target: {target.name}
            </div>
            
            <div className="absolute bottom-4 left-4 z-[700] text-xs font-mono text-gray-500 opacity-60">
              <p>USE SCROLL TO ZOOM OUT (MAX: 1000KM)</p>
              <p>DRAG TO PAN ACROSS IMPACT ZONE</p>
            </div>
          </div>

          {/* Right Panel: Data Presentation */}
          {phase !== 'analysis' && phase !== 'flash' ? (
             <div className="w-full md:w-1/2 p-6 md:p-8 relative flex flex-col items-center justify-center bg-black/90 border-l border-white/5 relative overflow-hidden h-[60%] md:h-full">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/lava_texture.png')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(10px)' }}></div>
                <div className="text-red-500 animate-pulse flex flex-col items-center relative z-10 text-center">
                   <Target size={64} className="mb-4 text-red-500 shadow-[0_0_10px_red] rounded-full" />
                   <h3 className="text-2xl md:text-3xl font-bold tracking-[0.2em] mb-2 uppercase text-white shadow-black drop-shadow-lg">Impact Imminent</h3>
                   <p className="text-sm font-mono tracking-widest text-red-400">Locking Coordinates: {target.lat.toFixed(4)}, {target.lng.toFixed(4)}</p>
                </div>
             </div>
          ) : (
            <motion.div 
              className="w-full md:w-1/2 p-6 md:p-8 relative flex flex-col h-[60%] md:h-full overflow-y-auto bg-space-800"
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
                <h2 className="text-3xl md:text-4xl font-black mb-2">{asteroid.name}</h2>
                
                <div className="flex items-center gap-3 mt-4 text-gray-400 bg-black/20 p-2 rounded-lg border border-white/5 inline-flex">
                  <label className="text-xs font-semibold uppercase tracking-wider">Target City:</label>
                  <select 
                    value={target.name}
                    onChange={(e) => {
                       const c = TARGET_CITIES.find(t => t.name === e.target.value);
                       if(c && c.name !== target.name) {
                          setTarget(c);
                          
                          // Restart the full cinematic blast replay sequence
                          setPhase('falling');
                          playImpactSequence();
                          setTimeout(() => setPhase('flash'), 2000);
                          setTimeout(() => setPhase('analysis'), 2500);
                       }
                    }}
                    className="bg-black/50 border border-white/20 rounded p-1 text-white text-sm outline-none cursor-pointer hover:border-space-accent transition-colors"
                  >
                     {TARGET_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-red-400 text-xs mb-1 uppercase tracking-widest font-bold flex items-center gap-2">
                      <Skull size={14} /> Estimated Casualties
                    </p>
                    <p className="text-3xl font-black text-white">{formattedCasualties}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400 max-w-[120px]">
                    Based on blast radius and city population density
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <p className="text-2xl font-bold">{Math.round(asteroid.diameter)} <span className="text-sm font-normal text-gray-400">m</span></p>
                  </div>
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
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
