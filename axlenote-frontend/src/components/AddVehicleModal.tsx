import { useState } from 'react'
import Modal from './Modal'

interface AddVehicleModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess }: AddVehicleModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        type: 'bike',
        vin: '',
        license_plate: '',
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/v1/vehicles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                onSuccess()
                onClose()
                setFormData({
                    name: '', make: '', model: '', year: new Date().getFullYear(), type: 'bike', vin: '', license_plate: ''
                })
            } else {
                alert("Failed to create vehicle")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Vehicle">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nickname</label>
                    <input
                        type="text"
                        required
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder="e.g. The beast"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Make</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            value={formData.make}
                            onChange={e => setFormData({ ...formData, make: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Model</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            value={formData.model}
                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Year</label>
                        <input
                            type="number"
                            required
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            value={formData.year}
                            onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                        <select
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="bike">Motorcycle</option>
                            <option value="car">Car</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">VIN (Optional)</label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            value={formData.vin}
                            onChange={e => setFormData({ ...formData, vin: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">License Plate</label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            value={formData.license_plate}
                            onChange={e => setFormData({ ...formData, license_plate: e.target.value })}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Add Vehicle'}
                </button>
            </form>
        </Modal>
    )
}
