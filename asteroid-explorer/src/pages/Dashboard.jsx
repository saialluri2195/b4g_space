import React, { useState, useEffect } from 'react';
import { useNasaData } from '../hooks/useNasaData';
import AsteroidScene from '../components/AsteroidScene';
import Timeline from '../components/Timeline';
import Sidebar from '../components/Sidebar';
import SimulationModal from '../components/SimulationModal';
import DirectionsModal from '../components/DirectionsModal';
import { Loader2, Info } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { data, loading, error } = useNasaData();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const[isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const[exaggerate, setExaggerate] = useState(true); // Default to true for visual impressiveness
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [showDirections, setShowDirections] = useState(true);

  // Time boundaries based on data
  const minTime = data.length > 0 ? data[0].date - 86400000 : Date.now();
  const maxTime = data.length > 0 ? data[data.length - 1].date + 86400000 : Date.now() + 86400000 * 7;

  // Animation loop for the timeline
  useEffect(() => {
    let animationFrame;
    let lastTime = performance.now();

    const update = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (isPlaying) {
        setCurrentTime((prev) => {
          // Advance time: 1 second real-time = 1 hour simulation time * speed multiplier
          const next = prev + (delta * 3600 * speed);
          if (next > maxTime) return minTime; // Loop back
          return next;
        });
      }
      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, speed, maxTime, minTime]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-space-900 text-white flex-col gap-4">
        <Loader2 className="animate-spin text-space-accent" size={48} />
        <h2 className="text-xl font-mono tracking-widest text-space-accent animate-pulse">ESTABLISHING UPLINK TO NASA...</h2>
      </div>
    );
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center bg-space-900 text-space-danger font-bold text-xl">{error}</div>;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-space-900">
      
      {/* 3D Visualization */}
      <AsteroidScene 
        data={data} 
        currentTime={currentTime} 
        exaggerate={exaggerate} 
        onSelect={setSelectedAsteroid} 
      />

      {/* UI Overlay */}
      <Sidebar 
        data={data} 
        selectedAsteroid={selectedAsteroid}
        setSelectedAsteroid={setSelectedAsteroid} 
      />
      
      <Timeline 
        currentTime={currentTime} 
        setCurrentTime={setCurrentTime}
        minTime={minTime}
        maxTime={maxTime}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        speed={speed}
        setSpeed={setSpeed}
        exaggerate={exaggerate}
        setExaggerate={setExaggerate}
      />

      {/* Impact Simulation Modal */}
      {selectedAsteroid && (
        <SimulationModal 
          asteroid={selectedAsteroid} 
          onClose={() => setSelectedAsteroid(null)} 
        />
      )}

      {/* Directions Toggle */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={() => setShowDirections(true)}
          className="bg-black/40 hover:bg-space-accent/20 border border-white/10 hover:border-space-accent/50 text-white p-3 rounded-xl transition-all shadow-lg flex items-center gap-2 group backdrop-blur-md"
        >
          <Info size={20} className="text-space-accent group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm tracking-wider uppercase hidden sm:block">Instructions</span>
        </button>
      </div>

      <AnimatePresence>
        {showDirections && (
          <DirectionsModal onClose={() => setShowDirections(false)} />
        )}
      </AnimatePresence>

    </div>
  );
}
