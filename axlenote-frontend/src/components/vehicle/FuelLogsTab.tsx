import { formatDate } from '../../utils'
import { type FuelLog } from '../../types'

interface FuelLogsTabProps {
  fuelLogs: FuelLog[]
  onEdit: (log: FuelLog) => void
  onDelete: (logId: number) => void
}

export default function FuelLogsTab({ fuelLogs, onEdit, onDelete }: FuelLogsTabProps) {
  if (fuelLogs.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl">
        No fuel logs. Start tracking your mileage!
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-white/5 text-neutral-500 dark:text-neutral-500 text-xs uppercase font-bold tracking-wider">
            <th className="pb-3 pl-2">Date</th>
            <th className="pb-3">Odo</th>
            <th className="pb-3">Liters</th>
            <th className="pb-3 text-right">Price/L</th>
            <th className="pb-3 text-right">Total</th>
            <th className="pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
          {fuelLogs.map(f => (
            <tr key={f.id} className="text-sm group hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
              <td className="py-3 pl-2 text-neutral-900 dark:text-neutral-300 font-medium">{formatDate(f.date)}</td>
              <td className="py-3 text-neutral-500 dark:text-neutral-400 font-mono text-xs">{f.odometer.toLocaleString()} km</td>
              <td className="py-3 text-neutral-900 dark:text-neutral-300">
                {f.liters} L 
                {f.full_tank && <span className="text-emerald-600 dark:text-emerald-500 ml-1 text-[10px] uppercase font-bold border border-emerald-500/30 px-1 rounded">Full</span>}
              </td>
              <td className="py-3 text-right text-neutral-500">₹{f.price_per_liter}</td>
              <td className="py-3 text-right font-bold text-neutral-900 dark:text-white">₹{f.total_cost}</td>
              <td className="py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(f)}
                    className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button
                    onClick={() => onDelete(f.id)}
                    className="text-neutral-400 dark:text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
