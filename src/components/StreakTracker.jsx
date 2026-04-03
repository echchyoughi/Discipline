import { useState, useEffect } from 'react';

export default function StreakTracker() {
  const [startDate, setStartDate] = useState(() => localStorage.getItem('streak-start') || new Date().toISOString());
  const [bestStreak, setBestStreak] = useState(() => Number(localStorage.getItem('streak-best')) || 0);
  const [points, setPoints] = useState(() => Number(localStorage.getItem('streak-points')) || 0);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('streak-tasks') || '[]'));
  const [newTask, setNewTask] = useState('');
  const [showFailed, setShowFailed] = useState(false);

  useEffect(() => { localStorage.setItem('streak-start', startDate); }, [startDate]);
  useEffect(() => { localStorage.setItem('streak-best', bestStreak); }, [bestStreak]);
  useEffect(() => { localStorage.setItem('streak-points', points); }, [points]);
  useEffect(() => { localStorage.setItem('streak-tasks', JSON.stringify(tasks)); }, [tasks]);

  const calculateDays = () => {
    const diffTime = Math.abs(new Date() - new Date(startDate));
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const currentStreak = calculateDays();
  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const allDone = totalTasks > 0 && completedTasks === totalTasks;

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), text: newTask.trim(), done: false }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nowDone = !t.done;
      // Award or deduct points
      setPoints(p => Math.max(0, p + (nowDone ? 10 : -10)));
      return { ...t, done: nowDone };
    }));
  };

  const deleteTask = (id) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      // Deduct points if deleting a completed task
      if (task?.done) setPoints(p => Math.max(0, p - 10));
      return prev.filter(t => t.id !== id);
    });
  };

  const clearDoneTasks = () => {
    setTasks(prev => prev.filter(t => !t.done));
  };

  const handleReset = () => {
    if (window.confirm('Did you break your streak? This resets back to 0.')) {
      if (currentStreak > bestStreak) setBestStreak(currentStreak);
      setStartDate(new Date().toISOString());
      setShowFailed(true);
      setTimeout(() => setShowFailed(false), 4000);
    }
  };

  const getPointsRank = () => {
    if (points >= 500) return { label: 'Elite', color: 'text-yellow-400' };
    if (points >= 200) return { label: 'Strong', color: 'text-blue-400' };
    if (points >= 100) return { label: 'Rising', color: 'text-emerald-400' };
    return { label: 'Starter', color: 'text-slate-400' };
  };

  const rank = getPointsRank();

  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 hover:border-slate-500/50 transition-all duration-300">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-200 uppercase tracking-widest flex items-center gap-3">
          🛡️ Focus & Energy
        </h2>
        <p className="text-slate-400 text-sm font-medium mt-1">Total commitment to purpose. No distractions.</p>
      </div>

      {/* Failed banner */}
      {showFailed && (
        <div className="bg-red-950/50 border border-red-800/50 rounded-2xl px-5 py-4 text-center">
          <p className="text-red-400 font-bold text-sm uppercase tracking-widest">Streak lost. Get back up.</p>
          <p className="text-red-500/70 text-xs mt-1">Last streak: {bestStreak} days</p>
        </div>
      )}

      {/* Streak + Points row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-slate-900/60 p-6 rounded-2xl border border-slate-700/50 text-center">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-bold">Current Streak</p>
          <p className="text-7xl font-black text-white leading-none">{currentStreak}</p>
          <p className="text-slate-500 uppercase tracking-[0.3em] mt-2 text-xs font-bold">Days Strong</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 text-center flex-1">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1 font-bold">Best</p>
            <p className="text-2xl font-black text-white">{Math.max(bestStreak, currentStreak)}</p>
            <p className="text-slate-600 text-xs mt-1">days</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 text-center flex-1">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1 font-bold">Points</p>
            <p className={`text-2xl font-black ${rank.color}`}>{points}</p>
            <p className={`text-xs mt-1 font-bold ${rank.color} opacity-70`}>{rank.label}</p>
          </div>
        </div>
      </div>

      {/* Tomorrow's Plan */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-200 text-sm font-black uppercase tracking-widest">Tomorrow's Plan</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {totalTasks === 0
                ? 'Add what you commit to doing'
                : `${completedTasks}/${totalTasks} done · +${completedTasks * 10} pts`}
            </p>
          </div>
          {allDone && (
            <span className="text-xs bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 px-3 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse">
              All Done 🔥
            </span>
          )}
          {completedTasks > 0 && !allDone && (
            <button
              onClick={clearDoneTasks}
              className="text-slate-600 text-xs uppercase tracking-widest hover:text-slate-400 font-bold transition-colors"
            >
              Clear done
            </button>
          )}
        </div>

        {/* Add task input */}
        <form onSubmit={addTask} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="I will..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl font-black text-lg transition-all"
          >
            +
          </button>
        </form>

        {/* Task list */}
        {tasks.length > 0 ? (
          <div className="flex flex-col gap-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  task.done
                    ? 'bg-emerald-950/20 border-emerald-900/30'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    task.done
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-600 hover:border-slate-400'
                  }`}
                >
                  {task.done && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={`flex-1 text-sm font-medium transition-all ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {task.text}
                </span>
                {task.done && <span className="text-emerald-600 text-xs font-bold">+10</span>}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-700 hover:text-red-400 transition-colors text-xs ml-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 text-sm text-center py-4 italic">No commitments yet. What will you do tomorrow?</p>
        )}
      </div>

      {/* Points legend */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Starter', min: 0, color: 'text-slate-400' },
          { label: 'Rising', min: 100, color: 'text-emerald-400' },
          { label: 'Strong', min: 200, color: 'text-blue-400' },
          { label: 'Elite', min: 500, color: 'text-yellow-400' },
        ].map(tier => (
          <div
            key={tier.label}
            className={`bg-slate-900/40 rounded-xl py-2 border ${points >= tier.min ? 'border-slate-600' : 'border-slate-800/50 opacity-40'}`}
          >
            <p className={`text-xs font-black ${tier.color}`}>{tier.label}</p>
            <p className="text-slate-600 text-xs">{tier.min}+ pts</p>
          </div>
        ))}
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full py-4 bg-red-950/40 text-red-400 border border-red-900/50 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300 font-bold tracking-widest uppercase text-sm"
      >
        I Failed — Reset Streak
      </button>
    </div>
  );
}