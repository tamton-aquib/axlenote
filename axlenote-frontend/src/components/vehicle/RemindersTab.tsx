import { formatDate } from '../../utils'
import { type Reminder } from '../../types'

interface RemindersTabProps {
  reminders: Reminder[]
  currentOdometer: number
  onComplete: (reminderId: number) => void
}

export default function RemindersTab({ reminders, currentOdometer, onComplete }: RemindersTabProps) {
  if (reminders.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl">
        No active reminders. You are all set!
      </div>
    )
  }

  const getUrgency = (r: Reminder): 'normal' | 'warning' | 'critical' => {
    let urgency: 'normal' | 'warning' | 'critical' = 'normal'

    if (r.due_odometer) {
      const remaining = r.due_odometer - currentOdometer
      if (remaining < 0) urgency = 'critical'
      else if (remaining < 500) urgency = 'warning'
    }
    if (r.due_date) {
      const days = (new Date(r.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      if (days < 0) urgency = 'critical'
      else if (days < 14) urgency = 'warning'
    }
    return urgency
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reminders.map(r => {
        const urgency = getUrgency(r)
        const borderColor = urgency === 'critical' ? 'border-red-500/50' : urgency === 'warning' ? 'border-amber-500/50' : 'border-neutral-200 dark:border-white/5'
        const bgGradient = urgency === 'critical' 
          ? 'bg-gradient-to-br from-white to-red-50 dark:from-neutral-900 dark:to-red-900/10' 
          : urgency === 'warning' 
          ? 'bg-gradient-to-br from-white to-amber-50 dark:from-neutral-900 dark:to-amber-900/10' 
          : 'bg-white dark:bg-neutral-900'

        return (
          <div key={r.id} className={`${bgGradient} border ${borderColor} rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-lg group`}>
            <div>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  {urgency === 'critical' && <span className="text-red-500 text-lg">⚠️</span>}
                  {urgency === 'warning' && <span className="text-amber-500 text-lg">⏰</span>}
                  {r.title}
                </h4>
                {r.is_recurring && (
                  <span className="text-[10px] uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">Recurring</span>
                )}
              </div>
              <div className="space-y-1 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                {r.due_date && (
                  <p className={urgency === 'critical' && new Date(r.due_date) < new Date() ? "text-red-500 dark:text-red-400 font-bold" : ""}>
                    Due: <span className="text-neutral-700 dark:text-neutral-200">{formatDate(r.due_date)}</span>
                  </p>
                )}
                {r.due_odometer && (
                  <p className={urgency === 'critical' && currentOdometer > r.due_odometer ? "text-red-500 dark:text-red-400 font-bold" : ""}>
                    Due Odo: <span className="text-neutral-700 dark:text-neutral-200">{r.due_odometer.toLocaleString()} km</span>
                  </p>
                )}
                <p className="italic text-neutral-500 dark:text-neutral-600 text-xs mt-2">{r.notes}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Mark this reminder as done?')) {
                  onComplete(r.id)
                }
              }}
              className="w-full mt-auto bg-black/5 dark:bg-black/20 border border-neutral-200 dark:border-white/5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/20 text-neutral-500 dark:text-neutral-400 py-2 rounded-lg text-sm transition-all cursor-pointer"
            >
              Mark Done
            </button>
          </div>
        )
      })}
    </div>
  )
}
