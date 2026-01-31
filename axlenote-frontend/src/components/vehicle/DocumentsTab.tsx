import { formatDate } from '../../utils'
import { type Document } from '../../types'

interface DocumentsTabProps {
  documents: Document[]
  onAddDocument: () => void
}

export default function DocumentsTab({ documents, onAddDocument }: DocumentsTabProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl">
        <p className="mb-4">No documents uploaded.</p>
        <button
          className="text-emerald-500 hover:text-emerald-400 font-bold underline underline-offset-4 cursor-pointer"
          onClick={onAddDocument}
        >
          + Add Document
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={onAddDocument}
          className="flex items-center gap-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white px-3 py-1.5 rounded-lg text-sm font-medium border border-neutral-200 dark:border-white/5 transition-colors cursor-pointer"
        >
          <span>+</span> Add Document
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(d => (
          <div key={d.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-violet-500/30 transition-all shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center text-xl">📄</div>
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm">{d.name}</h4>
                <p className="text-neutral-500 text-xs">{d.type} {d.expiry_date && `• Expires ${formatDate(d.expiry_date)}`}</p>
              </div>
            </div>
            <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-violet-400 text-sm font-medium">View</a>
          </div>
        ))}
      </div>
    </div>
  )
}
