import { useState } from 'react'
import Modal from './Modal'

interface AddDocumentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    vehicleId: number
}

export default function AddDocumentModal({ isOpen, onClose, onSuccess, vehicleId }: AddDocumentModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'General', // License, Registration, Insurance, Other
        file_url: '',
        expiry_date: '',
        notes: ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                vehicle_id: vehicleId,
                ...formData
            }

            const res = await fetch('/api/v1/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                onSuccess()
                onClose()
                setFormData({
                    name: '',
                    type: 'General',
                    file_url: '',
                    expiry_date: '',
                    notes: ''
                })
            } else {
                alert("Failed to add document")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Document">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-1">Document Name</label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. Vehicle Registration"
                        className="w-full rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/5 px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-1">Type</label>
                        <select
                            className="w-full rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/5 px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none cursor-pointer"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="General">General</option>
                            <option value="Registration">Registration</option>
                            <option value="Insurance">Insurance</option>
                            <option value="License">License</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-1">Expiry Date <span className="text-neutral-500 dark:text-zinc-600 text-xs">(Optional)</span></label>
                        <input
                            type="date"
                            className="w-full rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/5 px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.expiry_date}
                            onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-1">File URL</label>
                    <input
                        type="url"
                        required
                        placeholder="https://..."
                        className="w-full rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/5 px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        value={formData.file_url}
                        onChange={e => setFormData({ ...formData, file_url: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-1">Notes</label>
                    <textarea
                        className="w-full rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/5 px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 min-h-[80px]"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-violet-600 px-4 py-3 text-white hover:bg-violet-500 font-bold transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 cursor-pointer"
                >
                    {loading ? 'Adding...' : 'Add Document'}
                </button>
            </form>
        </Modal>
    )
}
