import CountUp from '../CountUp'

interface StatsGridProps {
  lifetimeCost: number
  totalServiceCost: number
  totalFuelCost: number
  monthlyCost: number
  currentOdometer: number
  reminderCount: number
}

export default function StatsGrid({
  lifetimeCost,
  totalServiceCost,
  totalFuelCost,
  monthlyCost,
  currentOdometer,
  reminderCount
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity">
          <svg className="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
        </div>
        <p className="text-neutral-500 dark:text-neutral-500 text-xs uppercase font-bold tracking-wider mb-2">Total Lifetime Cost</p>
        <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          <CountUp end={lifetimeCost} prefix="₹" />
        </p>
        <p className="text-xs text-neutral-400 mt-1 font-medium">S: ₹{totalServiceCost.toLocaleString('en-IN')} | F: ₹{totalFuelCost.toLocaleString('en-IN')}</p>
      </div>

      <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none">
        <p className="text-neutral-500 dark:text-neutral-500 text-xs uppercase font-bold tracking-wider mb-2">Monthly Avg. Cost</p>
        <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          <CountUp end={Math.round(monthlyCost)} prefix="₹" />
        </p>
        <p className="text-xs text-neutral-400 mt-1">Approximate</p>
      </div>

      <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none">
        <p className="text-neutral-500 dark:text-neutral-500 text-xs uppercase font-bold tracking-wider mb-2">Distance Travelled</p>
        <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          <CountUp end={currentOdometer} duration={1500} /> <span className="text-lg text-emerald-500 font-medium">km</span>
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity">
          <svg className="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
        </div>
        <p className="text-neutral-500 dark:text-neutral-500 text-xs uppercase font-bold tracking-wider mb-2">Active Reminders</p>
        <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          <CountUp end={reminderCount} />
        </p>
      </div>
    </div>
  )
}
