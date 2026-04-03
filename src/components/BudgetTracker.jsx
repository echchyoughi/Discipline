import { useState, useEffect } from 'react';

export default function BudgetTracker() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('budget-balance')) || 1800);
  const [daysLeft, setDaysLeft] = useState(() => Number(localStorage.getItem('budget-days')) || 60);
  const [spentToday, setSpentToday] = useState('');
  const [lastAlert, setLastAlert] = useState(null);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('budget-history') || '[]'));

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const todayStr = today.toLocaleDateString();
    const lastDate = localStorage.getItem('budget-last-date');
    if (lastDate && lastDate !== todayStr) {
      const daysPassed = Math.floor((new Date(todayStr) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
      if (daysPassed > 0) setDaysLeft(prev => Math.max(0, prev - daysPassed));
    }
    localStorage.setItem('budget-last-date', todayStr);
  }, []);

  useEffect(() => {
    localStorage.setItem('budget-balance', balance);
    localStorage.setItem('budget-days', daysLeft);
    localStorage.setItem('budget-history', JSON.stringify(history));
  }, [balance, daysLeft, history]);

  const dailyAllowance = daysLeft > 0 ? balance / daysLeft : 0;

  const handleSpend = (e) => {
    e.preventDefault();
    const spent = parseFloat(spentToday);
    if (!spent || spent <= 0) return;

    const overage = spent - dailyAllowance;

    setBalance(prev => Math.max(0, prev - spent));
    setDaysLeft(prev => Math.max(0, prev - 1));

    setHistory(prev => [{
      date: dateString,
      amount: spent,
      allowance: dailyAllowance,
      over: overage > 0,
      overage,
    }, ...prev].slice(0, 10));

    if (overage > 0) {
      setLastAlert({ type: 'over', msg: `Over by DH${overage.toFixed(2)} — deducted from tomorrow` });
    } else {
      setLastAlert({ type: 'under', msg: `DH${Math.abs(overage).toFixed(2)} saved — tomorrow's limit goes up` });
    }

    setSpentToday('');
  };

  const handleReset = () => {
    if (window.confirm('Start a brand new 60-day budget?')) {
      setBalance(1800);
      setDaysLeft(60);
      setHistory([]);
      setLastAlert(null);
      localStorage.setItem('budget-last-date', today.toLocaleDateString());
    }
  };

  const tomorrowAllowance = daysLeft > 1 ? balance / (daysLeft - 1) : 0;

  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 shadow-2xl flex flex-col justify-between hover:border-slate-500/50 transition-all duration-300">
      
      {/* Date */}
      <p className="text-slate-500 text-xs uppercase tracking-widest mb-6 font-bold">{dateString}</p>

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

        {/* Daily allowance */}
        <div className="bg-emerald-950/30 border border-emerald-900/50 p-6 rounded-2xl text-center mb-4">
          <p className="text-emerald-500/80 text-xs uppercase tracking-widest mb-2 font-bold">Today's Limit</p>
          <p className="text-5xl font-black text-emerald-400">DH{dailyAllowance.toFixed(2)}</p>
          {daysLeft > 1 && (
            <p className="text-emerald-700 text-xs mt-2">Tomorrow: DH{tomorrowAllowance.toFixed(2)} if you stay on budget</p>
          )}
        </div>

        {/* Alert */}
        {lastAlert && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold ${
            lastAlert.type === 'over'
              ? 'bg-red-950/40 border border-red-800/50 text-red-400'
              : 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-400'
          }`}>
            {lastAlert.msg}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSpend} className="flex gap-3 mb-6">
        <input
          type="number"
          step="0.01"
          placeholder="Spent today? (DH)"
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

      {/* History */}
      {history.length > 0 && (
        <div className="mb-6">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3 font-bold">History</p>
          <div className="flex flex-col gap-2">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-900/40 px-4 py-3 rounded-xl border border-slate-700/30">
                <span className="text-slate-400 text-xs">{h.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">DH{h.amount.toFixed(2)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    h.over ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/50 text-emerald-400'
                  }`}>
                    {h.over ? `+DH${h.overage.toFixed(2)}` : 'ok'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleReset}
        className="text-slate-500 text-xs uppercase tracking-widest hover:text-slate-300 transition-colors font-bold"
      >
        Reset 30-Day Budget
      </button>
    </div>
  );
}