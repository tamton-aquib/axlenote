import { useState, useEffect } from 'react'
import Modal from './Modal'
import { type Vehicle } from '../types'

interface AddVehicleModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    initialData?: Vehicle | null
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess, initialData }: AddVehicleModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        type: 'bike',
        vin: '',
        license_plate: '',
        image_url: ''
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name,
                make: initialData.make,
                model: initialData.model,
                year: initialData.year,
                type: initialData.type,
                vin: initialData.vin || '',
                license_plate: initialData.license_plate || '',
                image_url: initialData.image_url || ''
            })
        } else if (isOpen && !initialData) {
            setFormData({
                name: '',
                make: '',
                model: '',
                year: new Date().getFullYear(),
                type: 'bike',
                vin: '',
                license_plate: '',
                image_url: ''
            })
        }
    }, [isOpen, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = initialData ? `/api/v1/vehicles/${initialData.id}` : '/api/v1/vehicles'
            const method = initialData ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                onSuccess()
                onClose()
                setFormData({
                    name: '', make: '', model: '', year: new Date().getFullYear(), type: 'bike', vin: '', license_plate: '', image_url: ''
                })
            } else {
                alert(initialData ? "Failed to update vehicle" : "Failed to create vehicle")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Vehicle" : "Add New Vehicle"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Nickname</label>
                    <input
                        type="text"
                        required
                        className="w-full rounded-lg bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/10 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="e.g. The beast"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Make</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-lg bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/10 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.make}
                            onChange={e => setFormData({ ...formData, make: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Model</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-lg bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/10 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.model}
                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Year</label>
                        <input
                            type="number"
                            required
                            className="w-full rounded-lg bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/10 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.year}
                            onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Type</label>
                        <select
                            className="w-full rounded-lg bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/10 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="bike">Motorcycle</option>
                            <option value="car">Car</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Image URL (Optional)</label>
                    <input
                        type="url"
                        className="w-full rounded-lg bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/10 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="https://example.com/car.jpg"
                        value={formData.image_url}
                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">VIN (Optional)</label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/10 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.vin}
                            onChange={e => setFormData({ ...formData, vin: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">License Plate</label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-white/10 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            value={formData.license_plate}
                            onChange={e => setFormData({ ...formData, license_plate: e.target.value })}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-500 font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Save Changes' : 'Add Vehicle')}
                </button>
            </form>
        </Modal>
    )
}
