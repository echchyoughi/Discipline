import { useState, useEffect } from 'react';

export default function BudgetTracker() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('budget-balance')) || 1700);
  const [daysLeft, setDaysLeft] = useState(() => Number(localStorage.getItem('budget-days')) || 60);
  const [spentToday, setSpentToday] = useState('');

  // AUTO-UPDATE LOGIC: Adjusts days left automatically based on the real-world calendar
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem('budget-last-date');

    if (lastDate && lastDate !== today) {
      const msPassed = new Date(today) - new Date(lastDate);
      const daysPassed = Math.floor(msPassed / (1000 * 60 * 60 * 24));
      
      if (daysPassed > 0) {
         setDaysLeft(prev => Math.max(0, prev - daysPassed));
      }
    }
    localStorage.setItem('budget-last-date', today);
  }, []);

  // Save changes to local storage instantly
  useEffect(() => {
    localStorage.setItem('budget-balance', balance);
    localStorage.setItem('budget-days', daysLeft);
  }, [balance, daysLeft]);

  const dailyAllowance = daysLeft > 0 ? (balance / daysLeft).toFixed(2) : 0;

  const handleSpend = (e) => {
    e.preventDefault(); // Prevents page from reloading when you hit enter
    const spent = Number(spentToday);
    if (spent > 0) {
      setBalance((prev) => prev - spent);
      setSpentToday('');
    }
  };

  const handleReset = () => {
    if(window.confirm("Start a brand new 30-day budget?")) {
      setBalance(1000);
      setDaysLeft(30);
      localStorage.setItem('budget-last-date', new Date().toLocaleDateString());
    }
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 shadow-2xl flex flex-col justify-between hover:border-slate-500/50 transition-all duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-200 uppercase tracking-widest mb-8 flex items-center gap-3">
          💰 Finance
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-bold">Total Bank</p>
            <p className="text-3xl font-black text-white">DH{balance.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-bold">Days Left</p>
            <p className="text-3xl font-black text-white">{daysLeft}</p>
          </div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-900/50 p-6 rounded-2xl text-center mb-8">
          <p className="text-emerald-500/80 text-xs uppercase tracking-widest mb-2 font-bold">Today's Limit</p>
          <p className="text-5xl font-black text-emerald-400">${dailyAllowance}</p>
        </div>
      </div>

      <form onSubmit={handleSpend} className="flex gap-3 mb-6">
        <input 
          type="number" 
          step="0.01"
          placeholder="Spent today? ($)" 
          value={spentToday}
          onChange={(e) => setSpentToday(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-lg"
        />
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
        >
          Log
        </button>
      </form>
      
      <button 
        onClick={handleReset} 
        className="text-slate-500 text-xs uppercase tracking-widest hover:text-slate-300 transition-colors font-bold"
      >
        Reset 30-Day Budget
      </button>
    </div>
  );
}