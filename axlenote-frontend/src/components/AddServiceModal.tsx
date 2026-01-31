import { useState, useEffect } from 'react'
import Modal from './Modal'
import { type ServiceRecord } from '../types'

interface AddServiceModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    vehicleId: number
    initialData?: ServiceRecord | null
}

export default function AddServiceModal({ isOpen, onClose, onSuccess, vehicleId, initialData }: AddServiceModalProps) {
    const defaultForm = {
        date: new Date().toISOString().split('T')[0],
        odometer: 0,
        cost: 0.0,
        notes: '',
        service_type: 'maintenance',
        document_url: ''
    }

    const [formData, setFormData] = useState(defaultForm)
    const [maintenanceItems, setMaintenanceItems] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                date: initialData.date.split('T')[0],
                odometer: initialData.odometer,
                cost: initialData.cost,
                notes: initialData.notes,
                service_type: initialData.service_type,
                document_url: initialData.document_url || ''
            })
        } else if (isOpen && !initialData) {
            setFormData(defaultForm)
            setMaintenanceItems([])
        }
    }, [isOpen, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const finalNotes = maintenanceItems.length > 0
                ? `[Maintenance: ${maintenanceItems.join(', ')}]\n\n${formData.notes}`
                : formData.notes

            const payload = {
                vehicle_id: vehicleId,
                ...formData,
                notes: finalNotes,
                cost: Number(formData.cost) // Ensure number
            }

            const url = initialData ? `/api/v1/services/${initialData.id}` : '/api/v1/services'
            const method = initialData ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                onSuccess()
                onClose()
                setFormData(defaultForm)
                setMaintenanceItems([])
            } else {
                alert(`Failed to ${initialData ? 'update' : 'add'} service record`)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Service" : "Log Service"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/5 px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-1">Odometer</label>
                        <input
                            type="number"
                            required
                            className="w-full rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/5 px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.odometer}
                            onChange={e => setFormData({ ...formData, odometer: parseInt(e.target.value) })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-1">Cost</label>
                        <div className="flex items-center rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/5 px-4 py-2 focus-within:ring-2 focus-within:ring-violet-500/50">
                            <span className="text-neutral-500 dark:text-zinc-500 mr-2">₹</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                                value={formData.cost}
                                onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-1">Type</label>
                        <select
                            className="w-full rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/5 px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none cursor-pointer"
                            value={formData.service_type}
                            onChange={e => setFormData({ ...formData, service_type: e.target.value })}
                        >
                            <option value="maintenance">Maintenance</option>
                            <option value="repair">Repair</option>
                            <option value="modification">Modification</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-1">Document URL <span className="text-neutral-500 dark:text-zinc-600 text-xs">(Pdf/Image, optional)</span></label>
                    <input
                        type="url"
                        placeholder="https://example.com/invoice.pdf"
                        className="w-full rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/5 px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-neutral-400 dark:placeholder:text-zinc-700"
                        value={formData.document_url}
                        onChange={e => setFormData({ ...formData, document_url: e.target.value })}
                    />
                </div>
                {formData.service_type === 'maintenance' && (
                    <div className="bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-white/5 rounded-xl p-4">
                        <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-2">Common Maintenance Items</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Oil Change', 'Air Filter', 'Chain Cleaning', 'Coolant Top-up', 'Brake Pads', 'Tire Pressure', 'Washing', 'General Service'].map(item => (
                                <label key={item} className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-zinc-300 cursor-pointer hover:text-neutral-900 dark:hover:text-white">
                                    <input
                                        type="checkbox"
                                        className="rounded border-neutral-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-violet-500 focus:ring-violet-500/50"
                                        checked={maintenanceItems.includes(item)}
                                        onChange={(e) => {
                                            if (e.target.checked) setMaintenanceItems([...maintenanceItems, item])
                                            else setMaintenanceItems(maintenanceItems.filter(i => i !== item))
                                        }}
                                    />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-neutral-500 dark:text-zinc-400 mb-1">Notes</label>
                    <textarea
                        className="w-full rounded-xl bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/5 px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 min-h-[100px] placeholder:text-neutral-400 dark:placeholder:text-zinc-700"
                        placeholder="What else did you do?"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-violet-600 px-4 py-3 text-white hover:bg-violet-500 font-bold transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20 cursor-pointer"
                >
                    {loading ? 'Saving...' : (initialData ? 'Update Service' : 'Log Service')}
                </button>
            </form>
        </Modal>
    )
}
