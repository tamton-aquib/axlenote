import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { type Vehicle, type ServiceRecord, type FuelLog, type Reminder, type VehicleStats, type Document } from '../types'
import AddServiceModal from '../components/AddServiceModal'
import AddVehicleModal from '../components/AddVehicleModal'
import AddFuelModal from '../components/AddFuelModal'
import AddReminderModal from '../components/AddReminderModal'
import AddDocumentModal from '../components/AddDocumentModal'
import clsx from 'clsx'
import { StatsGrid, ServiceHistoryTab, FuelLogsTab, RemindersTab, DocumentsTab, AnalyticsTab } from '../components/vehicle'

type TabType = 'service' | 'fuel' | 'reminders' | 'documents' | 'analytics'

export default function VehicleDetails() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<VehicleStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('service')

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null)
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false)
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false)
  const [editingFuel, setEditingFuel] = useState<FuelLog | null>(null)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)

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

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm("Delete this service record?")) return
    try {
      const res = await fetch(`/api/v1/services/${serviceId}`, { method: 'DELETE' })
      if (res.ok) fetchData()
      else alert("Failed to delete")
    } catch (e) { console.error(e) }
  }

  const handleDeleteFuel = async (fuelId: number) => {
    if (!confirm("Delete this fuel log?")) return
    try {
      const res = await fetch(`/api/v1/fuel/${fuelId}`, { method: 'DELETE' })
      if (res.ok) fetchData()
      else alert("Failed to delete")
    } catch (e) { console.error(e) }
  }

  const handleCompleteReminder = async (reminderId: number) => {
    try {
      const res = await fetch(`/api/v1/reminders/${reminderId}/complete`, { method: 'PUT' })
      if (res.ok) fetchData()
      else alert("Failed to update")
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="text-center py-12 text-neutral-500">Loading details...</div>
  if (!vehicle) return <div className="text-center py-12 text-neutral-500">Vehicle not found</div>

  const totalServiceCost = services.reduce((sum, s) => sum + Number(s.cost), 0)
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + Number(f.total_cost), 0)
  const lifetimeCost = totalServiceCost + totalFuelCost
  const currentOdometer = Math.max(services[0]?.odometer || 0, fuelLogs[0]?.odometer || 0)

  let monthlyCost = 0
  const allDates = [...services.map(s => s.date), ...fuelLogs.map(f => f.date)].map(d => new Date(d).getTime())
  if (allDates.length > 0) {
    const minDate = Math.min(...allDates)
    const maxDate = new Date().getTime()
    const diffMonths = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24 * 30))
    monthlyCost = lifetimeCost / diffMonths
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'service', label: 'Service History' },
    { key: 'fuel', label: 'Fuel Logs' },
    { key: 'reminders', label: 'Reminders' },
    { key: 'documents', label: 'Documents' },
    { key: 'analytics', label: 'Analytics' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AddServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => { setIsServiceModalOpen(false); setEditingService(null) }}
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
        onClose={() => { setIsFuelModalOpen(false); setEditingFuel(null) }}
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

      {/* Header */}
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
                title="Edit Vehicle"
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

      <StatsGrid
        lifetimeCost={lifetimeCost}
        totalServiceCost={totalServiceCost}
        totalFuelCost={totalFuelCost}
        monthlyCost={monthlyCost}
        currentOdometer={currentOdometer}
        reminderCount={reminders.length}
      />

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-neutral-200 dark:border-white/5 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={clsx(
              "px-4 py-3 text-sm font-medium whitespace-nowrap transition-all cursor-pointer",
              activeTab === tab.key
                ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
        {activeTab === 'service' && (
          <ServiceHistoryTab
            services={services}
            onEdit={(s) => { setEditingService(s); setIsServiceModalOpen(true) }}
            onDelete={handleDeleteService}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelLogsTab
            fuelLogs={fuelLogs}
            onEdit={(f) => { setEditingFuel(f); setIsFuelModalOpen(true) }}
            onDelete={handleDeleteFuel}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersTab
            reminders={reminders}
            currentOdometer={currentOdometer}
            onComplete={handleCompleteReminder}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab
            documents={documents}
            onAddDocument={() => setIsDocumentModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && stats && (
          <AnalyticsTab
            fuelLogs={fuelLogs}
            services={services}
            stats={stats}
          />
        )}
      </div>
    </div>
  )
}
