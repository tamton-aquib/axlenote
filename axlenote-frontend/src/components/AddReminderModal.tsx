import { useState } from 'react'
import Modal from './Modal'

interface AddReminderModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    vehicleId: number
}

export default function AddReminderModal({ isOpen, onClose, onSuccess, vehicleId }: AddReminderModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        type: 'Service',
        due_date: '',
        due_odometer: 0,
        is_recurring: false,
        interval_km: 0,
        interval_months: 0,
        notes: '',
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                vehicle_id: vehicleId,
                ...formData,
            }

            const res = await fetch('/api/v1/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                onSuccess()
                onClose()
                setFormData({
                    title: '', type: 'Service', due_date: '', due_odometer: 0, is_recurring: false, interval_km: 0, interval_months: 0, notes: ''
                })
            } else {
                alert("Failed to add reminder")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Set Reminder">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Oil Change"
                            className="w-full rounded-xl bg-zinc-950 border border-white/5 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Type</label>
                        <select
                            className="w-full rounded-xl bg-zinc-950 border border-white/5 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Service">Service</option>
                            <option value="Paperwork">Paperwork</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Due Date</label>
                        <input
                            type="date"
                            className="w-full rounded-xl bg-zinc-950 border border-white/5 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.due_date}
                            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Due Odometer</label>
                        <input
                            type="number"
                            className="w-full rounded-xl bg-zinc-950 border border-white/5 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.due_odometer}
                            onChange={e => setFormData({ ...formData, due_odometer: parseInt(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <input
                            type="checkbox"
                            id="is_recurring"
                            checked={formData.is_recurring}
                            onChange={e => setFormData({ ...formData, is_recurring: e.target.checked })}
                            className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-violet-500 focus:ring-violet-500/50 cursor-pointer accent-violet-500"
                        />
                        <label htmlFor="is_recurring" className="text-sm font-bold text-white cursor-pointer select-none">Recurring Reminder</label>
                    </div>

                    {formData.is_recurring && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1 font-bold uppercase">Every (km)</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg bg-zinc-950 border border-white/5 px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                                    value={formData.interval_km}
                                    onChange={e => setFormData({ ...formData, interval_km: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1 font-bold uppercase">Every (months)</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg bg-zinc-950 border border-white/5 px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                                    value={formData.interval_months}
                                    onChange={e => setFormData({ ...formData, interval_months: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-violet-600 px-4 py-3 text-white hover:bg-violet-500 font-bold transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                    {loading ? 'Set Reminder' : 'Set Reminder'}
                </button>
            </form>
        </Modal>
    )
}
