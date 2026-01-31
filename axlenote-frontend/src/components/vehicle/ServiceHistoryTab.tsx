import clsx from 'clsx'
import { formatDate } from '../../utils'
import { type ServiceRecord } from '../../types'

interface ServiceHistoryTabProps {
  services: ServiceRecord[]
  onEdit: (service: ServiceRecord) => void
  onDelete: (serviceId: number) => void
}

export default function ServiceHistoryTab({ services, onEdit, onDelete }: ServiceHistoryTabProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl">
        No service records yet. Time to get your hands dirty!
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {services.map((s) => (
        <div key={s.id} className="relative pl-8 border-l border-neutral-200 dark:border-white/10 last:border-0">
          <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-white dark:bg-neutral-900 border-2 border-emerald-500 ring-4 ring-white dark:ring-neutral-900" />
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={clsx("inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                  s.service_type === 'maintenance' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20' :
                    s.service_type === 'repair' ? 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20' :
                      'bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20'
                )}>
                  {s.service_type}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(s)}
                    className="p-1 hover:bg-neutral-100 dark:hover:bg-white/10 rounded text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="p-1 hover:bg-red-500/10 rounded text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 mt-1 whitespace-pre-wrap">{s.notes}</p>
              {s.document_url && (
                <a href={s.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  View Attachment
                </a>
              )}
            </div>
            <div className="text-right sm:shrink-0">
              <p className="text-neutral-900 dark:text-white font-bold text-lg">₹{Number(s.cost).toLocaleString('en-IN')}</p>
              <p className="text-neutral-500 text-sm font-medium">{formatDate(s.date)}</p>
              <p className="text-neutral-500 dark:text-neutral-600 text-xs mt-1">{s.odometer.toLocaleString()} km</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
