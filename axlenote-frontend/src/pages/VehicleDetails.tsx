import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { type Vehicle, type ServiceRecord, type FuelLog, type Reminder, type VehicleStats, type Document } from '../types'
import AddServiceModal from '../components/AddServiceModal'
import AddVehicleModal from '../components/AddVehicleModal'
import AddFuelModal from '../components/AddFuelModal'
import AddReminderModal from '../components/AddReminderModal'
import AddDocumentModal from '../components/AddDocumentModal'
import CountUp from '../components/CountUp'
import clsx from 'clsx'
import { formatDate } from '../utils'
import { useTheme } from '../context/ThemeContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'

export default function VehicleDetails() {
  const { id } = useParams()
  const { theme } = useTheme()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<VehicleStats | null>(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'service' | 'fuel' | 'reminders' | 'documents' | 'analytics'>('service')

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null)

  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false)

  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false)
  const [editingFuel, setEditingFuel] = useState<FuelLog | null>(null)

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm("Are you sure you want to delete this service record?")) return
    try {
      const res = await fetch(`/api/v1/services/${serviceId}`, { method: 'DELETE' })
      if (res.ok) fetchData()
      else alert("Failed to delete service")
    } catch (e) { console.error(e) }
  }

  const handleDeleteFuel = async (fuelId: number) => {
    if (!confirm("Are you sure you want to delete this fuel log?")) return
    try {
      const res = await fetch(`/api/v1/fuel/${fuelId}`, { method: 'DELETE' })
      if (res.ok) fetchData()
      else alert("Failed to delete fuel log")
    } catch (e) { console.error(e) }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [vRes, sRes, fRes, rRes, dRes, stRes] = await Promise.all([
        fetch(`/api/v1/vehicles/${id}`),
        fetch(`/api/v1/vehicles/${id}/services`),
        fetch(`/api/v1/vehicles/${id}/fuel`),
        fetch(`/api/v1/vehicles/${id}/reminders`),
        fetch(`/api/v1/vehicles/${id}/documents`),
        fetch(`/api/v1/vehicles/${id}/stats`),
      ])

      if (vRes.ok) setVehicle((await vRes.json()).data)
      if (sRes.ok) setServices((await sRes.json()).data || [])
      if (fRes.ok) setFuelLogs((await fRes.json()).data || [])
      if (rRes.ok) setReminders((await rRes.json()).data || [])
      if (dRes.ok) setDocuments((await dRes.json()).data || [])
      if (stRes.ok) setStats((await stRes.json()).data || null)

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  if (loading) return <div className="text-center py-12 text-neutral-500">Loading details...</div>
  if (!vehicle) return <div className="text-center py-12 text-neutral-500">Vehicle not found</div>

  const totalServiceCost = services.reduce((sum, s) => sum + Number(s.cost), 0)
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + Number(f.total_cost), 0)
  const lifetimeCost = totalServiceCost + totalFuelCost

  // Monthly Calculation
  let monthlyCost = 0
  const allDates = [...services.map(s => s.date), ...fuelLogs.map(f => f.date)].map(d => new Date(d).getTime())
  if (allDates.length > 0) {
    const minDate = Math.min(...allDates)
    const maxDate = new Date().getTime()
    const diffMonths = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24 * 30)) // approx months
    monthlyCost = lifetimeCost / diffMonths
  }

  const costData = [
    { name: 'Fuel', value: totalFuelCost, color: '#10b981' }, // emerald-500
    { name: 'Service', value: totalServiceCost, color: '#3b82f6' }, // blue-500
  ].filter(d => d.value > 0)

  // Last 6 months cost trend
  const getLast6MonthsData = () => {
    const months: { name: string; month: number; year: number; fuel: number; service: number }[] = []
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear(),
        fuel: 0,
        service: 0
      })
    }

    fuelLogs.forEach(l => {
      const d = new Date(l.date)
      const entry = months.find(m => m.month === d.getMonth() && m.year === d.getFullYear())
      if (entry) entry.fuel += Number(l.total_cost)
    })

    services.forEach(s => {
      const d = new Date(s.date)
      const entry = months.find(m => m.month === d.getMonth() && m.year === d.getFullYear())
      if (entry) entry.service += Number(s.cost)
    })

    return months
  }

  const trendData = getLast6MonthsData()

  // Mileage Calculation
  const mileageData = fuelLogs
    .filter(f => f.full_tank && f.mileage > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(f => ({
      date: formatDate(f.date),
      mileage: Number(f.mileage.toFixed(1)),
      fullDate: f.date
    }));


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {vehicle && (
        <>
          <AddServiceModal
            isOpen={isServiceModalOpen}
            onClose={() => { setIsServiceModalOpen(false); setEditingService(null); }}
            onSuccess={fetchData}
            vehicleId={vehicle.id}
            initialData={editingService}
          />
          <AddVehicleModal
            isOpen={isEditVehicleModalOpen}
            onClose={() => setIsEditVehicleModalOpen(false)}
            onSuccess={fetchData}
            initialData={vehicle}
          />
          <AddFuelModal
            isOpen={isFuelModalOpen}
            onClose={() => { setIsFuelModalOpen(false); setEditingFuel(null); }}
            onSuccess={fetchData}
            vehicleId={vehicle.id}
            initialData={editingFuel}
          />
          <AddReminderModal
            isOpen={isReminderModalOpen}
            onClose={() => setIsReminderModalOpen(false)}
            onSuccess={fetchData}
            vehicleId={vehicle.id}
          />
          <AddDocumentModal
            isOpen={isDocumentModalOpen}
            onClose={() => setIsDocumentModalOpen(false)}
            onSuccess={fetchData}
            vehicleId={vehicle.id}
          />
        </>
      )}

      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{vehicle.name}</h1>
              <button
                onClick={() => setIsEditVehicleModalOpen(true)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Edit Vehicle Details"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setIsFuelModalOpen(true)} className="flex items-center gap-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors border border-neutral-200 dark:border-white/5 hover:border-emerald-500/20 cursor-pointer shadow-sm dark:shadow-none">
            <span className="text-emerald-500 text-base">⛽</span> Add Fuel
          </button>
          <button onClick={() => setIsServiceModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30">
            <span className="text-lg">🔧</span> Log Service
          </button>
          <button onClick={() => setIsReminderModalOpen(true)} className="p-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-300 rounded-lg border border-neutral-200 dark:border-white/5 hover:border-amber-500/20 transition-colors cursor-pointer shadow-sm dark:shadow-none" title="Set Reminder">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity">
            <svg className="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
          </div>
          <p className="text-neutral-500 dark:text-neutral-500 text-xs uppercase font-bold tracking-wider mb-2">Total Lifetime Cost</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            <CountUp end={lifetimeCost} prefix="₹" />
          </p>
          <p className="text-xs text-neutral-400 mt-1 font-medium">S: ₹{totalServiceCost.toLocaleString('en-IN')} | F: ₹{totalFuelCost.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none">
          <p className="text-neutral-500 dark:text-neutral-500 text-xs uppercase font-bold tracking-wider mb-2">Monthly Avg. Cost</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            <CountUp end={Math.round(monthlyCost)} prefix="₹" />
          </p>
          <p className="text-xs text-neutral-400 mt-1">Approximate</p>
        </div>
        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none">
          <p className="text-neutral-500 dark:text-neutral-500 text-xs uppercase font-bold tracking-wider mb-2">Distance Travelled</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            <CountUp end={Number(services[0]?.odometer || fuelLogs[0]?.odometer || 0)} duration={1500} /> <span className="text-lg text-emerald-500 font-medium">km</span>
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity">
            <svg className="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
          </div>
          <p className="text-neutral-500 dark:text-neutral-500 text-xs uppercase font-bold tracking-wider mb-2">Active Reminders</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            <CountUp end={reminders.length} />
          </p>
        </div>
      </div>


      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-white/5 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {[
            { id: 'service', label: 'Service History' },
            { id: 'fuel', label: 'Fuel Logs' },
            { id: 'reminders', label: 'Reminders' },
            { id: 'documents', label: 'Documents' },
            { id: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                activeTab === tab.id ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden p-6 min-h-[400px]">
        {/* SERVICES TAB */}
        {activeTab === 'service' && (
          services.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl">
              No service records yet. Time to get your hands dirty!
            </div>
          ) : (
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
                        {/* Actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingService(s); setIsServiceModalOpen(true); }}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-white/10 rounded text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer" title="Edit"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            onClick={() => handleDeleteService(s.id)}
                            className="p-1 hover:bg-red-500/10 rounded text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-500 transition-colors cursor-pointer" title="Delete"
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
        )}

        {/* FUEL TAB */}
        {activeTab === 'fuel' && (
          fuelLogs.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl">
              No fuel logs. Start tracking your mileage!
            </div>
          ) : (
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
                      <td className="py-3 text-neutral-900 dark:text-neutral-300">{f.liters} L {f.full_tank && <span className="text-emerald-600 dark:text-emerald-500 ml-1 text-[10px] uppercase font-bold border border-emerald-500/30 px-1 rounded">Full</span>}</td>
                      <td className="py-3 text-right text-neutral-500">₹{f.price_per_liter}</td>
                      <td className="py-3 text-right font-bold text-neutral-900 dark:text-white">₹{f.total_cost}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setEditingFuel(f); setIsFuelModalOpen(true); }}
                            className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer" title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            onClick={() => handleDeleteFuel(f.id)}
                            className="text-neutral-400 dark:text-neutral-500 hover:text-red-500 transition-colors cursor-pointer" title="Delete"
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
        )}

        {/* REMINDERS TAB */}
        {activeTab === 'reminders' && (
          reminders.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl">
              No active reminders. You are all set!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reminders.map(r => {
                const currentOdo = Math.max(services[0]?.odometer || 0, fuelLogs[0]?.odometer || 0)
                let urgency = 'normal' // normal, warning, critical

                if (r.due_odometer) {
                  const remaining = r.due_odometer - currentOdo
                  if (remaining < 0) urgency = 'critical'
                  else if (remaining < 500) urgency = 'warning'
                }
                if (r.due_date) {
                  const days = (new Date(r.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  if (days < 0) urgency = 'critical'
                  else if (days < 14) urgency = 'warning'
                }

                const borderColor = urgency === 'critical' ? 'border-red-500/50' : urgency === 'warning' ? 'border-amber-500/50' : 'border-neutral-200 dark:border-white/5'
                const bgGradient = urgency === 'critical' ? 'bg-gradient-to-br from-white to-red-50 dark:from-neutral-900 dark:to-red-900/10' : urgency === 'warning' ? 'bg-gradient-to-br from-white to-amber-50 dark:from-neutral-900 dark:to-amber-900/10' : 'bg-white dark:bg-neutral-900'

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
                        {r.due_date && <p className={urgency === 'critical' && new Date(r.due_date) < new Date() ? "text-red-500 dark:text-red-400 font-bold" : ""}>Due: <span className="text-neutral-700 dark:text-neutral-200">{formatDate(r.due_date)}</span></p>}
                        {r.due_odometer && <p className={urgency === 'critical' && currentOdo > r.due_odometer ? "text-red-500 dark:text-red-400 font-bold" : ""}>Due Odo: <span className="text-neutral-700 dark:text-neutral-200">{r.due_odometer.toLocaleString()} km</span></p>}
                        <p className="italic text-neutral-500 dark:text-neutral-600 text-xs mt-2">{r.notes}</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Mark this reminder as done?')) {
                          await fetch(`/api/v1/reminders/${r.id}/complete`, { method: 'PUT' })
                          fetchData()
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
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          documents.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl">
              <p className="mb-4">No documents uploaded.</p>
              <button
                className="text-emerald-500 hover:text-emerald-400 font-bold underline underline-offset-4 cursor-pointer"
                onClick={() => setIsDocumentModalOpen(true)}
              >
                + Add Document
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsDocumentModalOpen(true)}
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
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-8">
            {/* Efficiency Chart - New */}
            {mileageData.length > 1 && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-6 rounded-xl shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Fuel Efficiency Trend</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mileageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#262626" : "#e5e5e5"} vertical={false} />
                      <XAxis dataKey="date" stroke={theme === 'dark' ? "#525252" : "#a3a3a3"} tick={{ fill: theme === 'dark' ? '#737373' : '#737373', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis stroke={theme === 'dark' ? "#525252" : "#a3a3a3"} tick={{ fill: theme === 'dark' ? '#737373' : '#737373', fontSize: 12 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#171717' : '#ffffff',
                          borderColor: theme === 'dark' ? '#262626' : '#e5e5e5',
                          borderRadius: '0.75rem',
                          color: theme === 'dark' ? '#f5f5f5' : '#171717'
                        }}
                        cursor={{ stroke: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 2 }}
                      />
                      <Line type="monotone" dataKey="mileage" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 6, fill: theme === 'dark' ? '#fff' : '#000' }} name="Efficiency (km/L)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cost Distribution Chart */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-6 rounded-xl shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Cost Distribution</h3>
                <div className="h-[300px]">
                  {costData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {costData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === 'dark' ? '#171717' : '#ffffff',
                            borderColor: theme === 'dark' ? '#262626' : '#e5e5e5',
                            borderRadius: '0.75rem',
                            color: theme === 'dark' ? '#f5f5f5' : '#171717'
                          }}
                          itemStyle={{ color: theme === 'dark' ? '#e5e5e5' : '#171717' }}
                          formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Cost']}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-neutral-500">No data available</div>
                  )}
                </div>
              </div>

              {/* 6 Month Trend */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-6 rounded-xl shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">6-Month Spending Trend</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#262626" : "#e5e5e5"} vertical={false} />
                      <XAxis dataKey="name" stroke={theme === 'dark' ? "#525252" : "#a3a3a3"} tick={{ fill: theme === 'dark' ? '#737373' : '#737373', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis stroke={theme === 'dark' ? "#525252" : "#a3a3a3"} tick={{ fill: theme === 'dark' ? '#737373' : '#737373', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#171717' : '#ffffff',
                          borderColor: theme === 'dark' ? '#262626' : '#e5e5e5',
                          borderRadius: '0.75rem',
                          color: theme === 'dark' ? '#f5f5f5' : '#171717'
                        }}
                        cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                      />
                      <Legend />
                      <Bar dataKey="fuel" name="Fuel" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="service" name="Service" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <p className="text-neutral-500 text-xs uppercase font-bold tracking-wider mb-1">Total Fuel Logs</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total_fuel_logs}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <p className="text-neutral-500 text-xs uppercase font-bold tracking-wider mb-1">Total Services</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total_services}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <p className="text-neutral-500 text-xs uppercase font-bold tracking-wider mb-1">Total Fuel Consumed</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total_liters.toFixed(1)} <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">L</span></p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <p className="text-neutral-500 text-xs uppercase font-bold tracking-wider mb-1">Avg Service Cost</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  ₹{stats.total_services > 0 ? (stats.total_service_cost / stats.total_services).toFixed(0) : 0}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
