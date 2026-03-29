import React from 'react';
import { motion } from 'framer-motion';
import { X, Info, MousePointer2, ZoomIn, Target } from 'lucide-react';

export default function DirectionsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-space-800 border border-white/10 rounded-2xl w-full max-w-2xl shadow-[0_0_50px_rgba(56,189,248,0.15)] p-6 md:p-8 relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <Info className="text-space-accent" size={32} />
          <h2 className="text-3xl font-black text-white tracking-wider">SYSTEM INSTRUCTIONS</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="bg-space-accent/20 p-3 rounded-lg text-space-accent">
              <MousePointer2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Navigation</h3>
              <p className="text-gray-400 text-sm">Click and drag around the globe to rotate Earth. View approaching near-Earth objects from multiple angles.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="bg-space-accent/20 p-3 rounded-lg text-space-accent">
              <ZoomIn size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Zoom Control</h3>
              <p className="text-gray-400 text-sm">Scroll up or down with your mouse wheel, or pinch on trackpad, to zoom in and out of the solar system view.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="bg-red-500/20 p-3 rounded-lg text-red-500">
              <Target size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Impact Simulation</h3>
              <p className="text-gray-400 text-sm">Click on any red asteroid to launch the high-fidelity impact physics simulation and calculate ground zero threat levels.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="bg-space-accent/20 p-3 rounded-lg text-space-accent">
              <Info size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Timeline Controls</h3>
              <p className="text-gray-400 text-sm">Use the bottom control panel to adjust the passing of time (1x up to maximum speed). You can also toggle <b>Exaggerated Sizes</b> so you can easily spot small near-Earth objects that would normally be invisible at a planetary scale.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full mt-8 py-4 bg-space-accent/20 hover:bg-space-accent hover:text-black text-space-accent font-bold rounded-xl transition-all border border-space-accent/50 uppercase tracking-widest text-sm"
        >
          Acknowledge & Initialize
        </button>
      </motion.div>
    </div>
  );
}
