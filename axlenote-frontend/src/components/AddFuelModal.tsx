import { useState, useEffect } from 'react'
import Modal from './Modal'
import { type FuelLog } from '../types'

interface AddFuelModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    vehicleId: number
    initialData?: FuelLog | null
}

export default function AddFuelModal({ isOpen, onClose, onSuccess, vehicleId, initialData }: AddFuelModalProps) {
    const defaultForm = {
        date: new Date().toISOString().split('T')[0],
        odometer: '' as any,
        liters: '' as any,
        price_per_liter: '' as any,
        total_cost: '' as any,
        full_tank: false,
        notes: '',
    }

    const [formData, setFormData] = useState(defaultForm)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                date: initialData.date.split('T')[0],
                odometer: initialData.odometer,
                liters: initialData.liters,
                price_per_liter: initialData.price_per_liter,
                total_cost: initialData.total_cost,
                full_tank: initialData.full_tank,
                notes: initialData.notes
            })
        } else if (isOpen && !initialData) {
            setFormData(defaultForm)
        }
    }, [isOpen, initialData])

    // Dynamic Calculation Logic
    const handleChange = (field: 'liters' | 'price' | 'total', value: string) => {
        const newData = { ...formData, [field === 'price' ? 'price_per_liter' : field === 'total' ? 'total_cost' : field]: value }

        const price = parseFloat(newData.price_per_liter)
        const liters = parseFloat(newData.liters)
        const total = parseFloat(newData.total_cost)

        // Rule 1: Liters and Price filled -> Caluclate Total
        if ((field === 'liters' || field === 'price') && !isNaN(price) && !isNaN(liters)) {
            newData.total_cost = (liters * price).toFixed(2)
        }
        else if ((field === 'liters' || field === 'total') && !isNaN(liters) && !isNaN(total) && liters > 0) {
            newData.price_per_liter = (total / liters).toFixed(2)
        }
        else if ((field === 'total' || field === 'price') && !isNaN(total) && !isNaN(price) && price > 0) {
            newData.liters = (total / price).toFixed(2)
        }

        setFormData(newData)
    }

    // Effect for Full Tank mode
    useEffect(() => {
        if (formData.full_tank) {
            // Recalculate liters if possible
            const price = parseFloat(formData.price_per_liter)
            const total = parseFloat(formData.total_cost)
            if (!isNaN(price) && !isNaN(total) && price > 0) {
                setFormData(prev => ({ ...prev, liters: (total / price).toFixed(2) }))
            }
        }
    }, [formData.full_tank, formData.price_per_liter, formData.total_cost])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                vehicle_id: vehicleId,
                date: formData.date,
                odometer: Number(formData.odometer),
                liters: Number(formData.liters),
                price_per_liter: Number(formData.price_per_liter),
                total_cost: Number(formData.total_cost),
                full_tank: formData.full_tank,
                notes: formData.notes
            }

            const url = initialData ? `/api/v1/fuel/${initialData.id}` : '/api/v1/fuel'
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
            } else {
                alert(`Failed to ${initialData ? 'update' : 'add'} fuel log`)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Fuel Log" : "Log Fuel"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-zinc-950 border-b border-zinc-800 pb-2 text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-600 font-mono"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Odometer</label>
                        <input
                            type="number"
                            required
                            placeholder="Current reading"
                            className="w-full bg-zinc-950 border-b border-zinc-800 pb-2 text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-600 font-mono"
                            value={formData.odometer}
                            onChange={e => setFormData({ ...formData, odometer: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Price / L</label>
                        <div className="flex items-center">
                            <span className="text-zinc-500 mr-1 text-sm">₹</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="Rate"
                                className="w-full bg-zinc-950 border-b border-zinc-800 pb-2 text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-600 font-mono"
                                value={formData.price_per_liter}
                                onChange={e => handleChange('price', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Liters</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="Vol"
                            className={`w-full bg-zinc-950 border-b border-zinc-800 pb-2 text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-600 font-mono ${formData.full_tank ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.liters}
                            onChange={e => handleChange('liters', e.target.value)}
                            disabled={formData.full_tank}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Total</label>
                        <div className="flex items-center">
                            <span className="text-zinc-500 mr-1 text-sm">₹</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="Cost"
                                className="w-full bg-zinc-950 border-b border-zinc-800 pb-2 text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-600 font-bold font-mono"
                                value={formData.total_cost}
                                onChange={e => handleChange('total', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-b border-white/5 bg-zinc-900/50 rounded px-2 -mx-2">
                    <label htmlFor="full_tank" className={`text-sm font-medium text-zinc-300 select-none ${(!formData.full_tank && formData.price_per_liter && formData.liters) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>Full Tank Fill?</label>
                    <input
                        type="checkbox"
                        id="full_tank"
                        checked={formData.full_tank}
                        onChange={e => setFormData({ ...formData, full_tank: e.target.checked })}
                        disabled={!formData.full_tank && String(formData.price_per_liter ?? '') !== '' && String(formData.liters ?? '') !== ''}
                        className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer accent-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-500 font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    {loading ? 'Saving...' : (initialData ? 'Update Log' : 'Add Log')}
                </button>
            </form>
        </Modal>
    )
}
