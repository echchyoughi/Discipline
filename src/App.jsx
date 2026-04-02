import BudgetTracker from './components/BudgetTracker';
import StreakTracker from './components/StreakTracker';

function App() {
  return (
    <div className="min-h-screen p-6 md:p-12 font-sans selection:bg-red-500 selection:text-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-widest text-white uppercase drop-shadow-lg">
            Discipline
          </h1>
          <p className="mt-3 text-slate-400 tracking-[0.2em] text-sm md:text-base uppercase font-semibold">
            Stay Focused. Protect Your Energy.
          </p>
        </header>
        
        {/* Grid for Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StreakTracker />
          <BudgetTracker />
        </div>

      </div>
    </div>
  );
}

export default App;