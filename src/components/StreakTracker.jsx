import { useState, useEffect } from 'react';

export default function StreakTracker() {
  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem('streak-start') || new Date().toISOString();
  });

  useEffect(() => {
    localStorage.setItem('streak-start', startDate);
  }, [startDate]);

  // Automatically calculates days passed right now
  const calculateDays = () => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const resetStreak = () => {
    if(window.confirm("Did you break your discipline? This resets your streak back to 0.")) {
      setStartDate(new Date().toISOString());
    }
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 shadow-2xl flex flex-col justify-between hover:border-slate-500/50 transition-all duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-200 uppercase tracking-widest mb-2 flex items-center gap-3">
          🛡️ Focus & Energy
        </h2>
        <p className="text-slate-400 text-sm font-medium mb-8">Total commitment to purpose. No distractions.</p>
      </div>
      
      <div className="text-center py-10">
        <span className="text-8xl md:text-9xl font-black text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
          {calculateDays()}
        </span>
        <p className="text-slate-500 uppercase tracking-[0.3em] mt-4 text-sm font-bold">Days Strong</p>
      </div>

      <button 
        onClick={resetStreak} 
        className="mt-8 w-full py-4 bg-red-950/40 text-red-400 border border-red-900/50 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300 font-bold tracking-widest uppercase text-sm"
      >
        I Failed (Reset)
      </button>
    </div>
  );
}