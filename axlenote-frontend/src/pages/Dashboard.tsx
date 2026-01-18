import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { type Vehicle } from '../types'
import AddVehicleModal from '../components/AddVehicleModal'
import CountUp from '../components/CountUp'

export default function Dashboard() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [fleetStats, setFleetStats] = useState<{ totalCost: number, totalFuel: number, totalServices: number }>({ totalCost: 0, totalFuel: 0, totalServices: 0 })

    const fetchVehicles = () => {
        setLoading(true)
        fetch('/api/v1/vehicles')
            .then(res => res.json())
            .then(async (data) => {
                const list = data && data.data ? data.data : []
                setVehicles(list)

                // Fetch stats for all vehicles
                if (list.length > 0) {
                    let cost = 0, fuel = 0, serv = 0;

                    for (const v of list) {
                        try {
                            // Get aggregated totals
                            const s = await fetch(`/api/v1/vehicles/${v.id}/stats`).then(r => r.json());
                            if (s.data) {
                                cost += Number(s.data.total_cost || 0);
                                fuel += Number(s.data.total_liters || 0);
                                serv += Number(s.data.total_services || 0);
                            }
                        } catch (e) { }
                    }
                    setFleetStats({ totalCost: cost, totalFuel: fuel, totalServices: serv })
                }
                setLoading(false)
            })
            .catch(err => {
                console.error("Failed to fetch vehicles", err)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchVehicles()
    }, [])

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <AddVehicleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchVehicles}
            />

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                        My <span className="text-violet-600 dark:text-violet-500">Garage</span>
                    </h1>
                    <p className="text-neutral-500 dark:text-zinc-400 text-lg max-w-xl">
                        Track maintenance, fuel efficiency, and expenses across your entire fleet.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-white/5 px-6 py-3 rounded-2xl shadow-xl shadow-neutral-200/50 dark:shadow-black/20">
                        <p className="text-[10px] text-neutral-500 dark:text-zinc-500 uppercase font-bold tracking-wider mb-1">Total Fleet Cost</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
                            <CountUp end={fleetStats.totalCost} prefix="₹" />
                        </p>
                    </div>
                </div>
            </div>

            {/* Fleet Overview Cards (if data exists) */}
            {fleetStats.totalCost > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-zinc-900 dark:to-zinc-950 border border-neutral-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-violet-500/20 transition-all duration-500 shadow-sm dark:shadow-none">
                        <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity">
                            <svg className="w-24 h-24 text-violet-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                        </div>
                        <p className="text-neutral-500 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Fuel Consumed</p>
                        <p className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
                            <CountUp end={fleetStats.totalFuel} decimals={1} suffix="" /> <span className="text-lg text-neutral-400 dark:text-zinc-600 font-medium">L</span>
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-zinc-900 dark:to-zinc-950 border border-neutral-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-500 shadow-sm dark:shadow-none">
                        <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity">
                            <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                        </div>
                        <p className="text-neutral-500 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Service Records</p>
                        <p className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
                            <CountUp end={fleetStats.totalServices} />
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-sm dark:shadow-none">
                        <div className="absolute inset-0 bg-violet-500/5 blur-3xl rounded-full transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700"></div>
                        <p className="relative z-10 text-neutral-500 dark:text-zinc-400 text-sm font-medium mb-1">Active Vehicles</p>
                        <p className="relative z-10 text-5xl font-black text-neutral-900 dark:text-white">
                            <CountUp end={vehicles.length} />
                        </p>
                    </div>
                </div>
            )}

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mb-4"></div>
                        <p className="text-zinc-500 font-medium">Loading garage...</p>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900/30 rounded-3xl border border-dashed border-neutral-300 dark:border-zinc-800">
                        <p className="text-neutral-500 dark:text-zinc-400 text-lg mb-4">Your garage is empty.</p>
                        <button onClick={() => setIsModalOpen(true)} className="text-violet-600 dark:text-violet-400 font-bold hover:text-violet-500 dark:hover:text-violet-300 underline underline-offset-4 cursor-pointer">Add your first vehicle</button>
                    </div>
                ) : (
                    <>
                        {vehicles.map(v => (
                            <Link key={v.id} to={`/vehicle/${v.id}`} className="block h-full card-hover-effect">
                                <div className="group relative bg-white dark:bg-zinc-900 rounded-3xl p-1 border border-neutral-200 dark:border-white/5 hover:border-violet-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 h-full flex flex-col overflow-hidden">
                                    {v.image_url && (
                                        <>
                                            <div className="absolute inset-0 z-0">
                                                <img src={v.image_url} alt={v.name} className="w-full h-full object-cover opacity-90 dark:opacity-40 group-hover:scale-105 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 dark:to-transparent" />
                                            </div>
                                        </>
                                    )}
                                    <div className="p-6 flex-1 flex flex-col relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner ${v.image_url ? 'bg-black/50 backdrop-blur-md text-white border border-white/10' : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-500 group-hover:bg-violet-500 group-hover:text-white'}`}>
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 tracking-wide uppercase backdrop-blur-md">
                                                Active
                                            </span>
                                        </div>

                                        <h3 className={`text-2xl font-bold mb-1 transition-colors drop-shadow-md ${v.image_url ? 'text-white group-hover:text-violet-200' : 'text-neutral-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-200'}`}>{v.name}</h3>
                                        <p className={`font-medium drop-shadow-md ${v.image_url ? 'text-zinc-300' : 'text-neutral-500 dark:text-zinc-300'}`}>{v.year} {v.make} {v.model}</p>

                                        <div className={`mt-8 pt-6 border-t grid grid-cols-2 gap-4 ${v.image_url ? 'border-white/10' : 'border-neutral-200 dark:border-white/10'}`}>
                                            <div>
                                                <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${v.image_url ? 'text-zinc-400' : 'text-neutral-400 dark:text-zinc-400'}`}>VIN</p>
                                                <p className={`font-mono text-xs truncate opacity-70 group-hover:opacity-100 transition-opacity ${v.image_url ? 'text-zinc-200' : 'text-neutral-700 dark:text-zinc-200'}`}>{v.vin || '—'}</p>
                                            </div>
                                            <div>
                                                <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${v.image_url ? 'text-zinc-400' : 'text-neutral-400 dark:text-zinc-400'}`}>Plate</p>
                                                <p className={`font-mono text-xs px-2 py-1 rounded inline-block backdrop-blur-md border ${v.image_url ? 'bg-zinc-800/50 text-zinc-100 border-white/5' : 'bg-neutral-100 dark:bg-zinc-800/50 text-neutral-800 dark:text-zinc-100 border-neutral-200 dark:border-white/5'}`}>{v.license_plate || '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity relative z-20"></div>
                                </div>
                            </Link>
                        ))}

                        {/* Add New Card */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group relative h-full min-h-[280px] rounded-3xl border-2 border-dashed border-neutral-300 dark:border-zinc-800 hover:border-violet-500/30 hover:bg-white dark:hover:bg-zinc-900/30 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer"
                        >
                            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:border-violet-500/50 group-hover:shadow-lg group-hover:shadow-violet-500/20 transition-all duration-300">
                                <svg className="w-8 h-8 text-neutral-400 dark:text-zinc-600 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="font-bold text-neutral-500 dark:text-zinc-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">Add Vehicle</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
