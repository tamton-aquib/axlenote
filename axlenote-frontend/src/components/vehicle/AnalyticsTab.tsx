import { useTheme } from '../../context/ThemeContext'
import { formatDate } from '../../utils'
import { type FuelLog, type ServiceRecord, type VehicleStats } from '../../types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'

interface AnalyticsTabProps {
  fuelLogs: FuelLog[]
  services: ServiceRecord[]
  stats: VehicleStats
}

export default function AnalyticsTab({ fuelLogs, services, stats }: AnalyticsTabProps) {
  const { theme } = useTheme()

  const totalServiceCost = services.reduce((sum, s) => sum + Number(s.cost), 0)
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + Number(f.total_cost), 0)

  const costData = [
    { name: 'Fuel', value: totalFuelCost, color: '#10b981' },
    { name: 'Service', value: totalServiceCost, color: '#3b82f6' },
  ].filter(d => d.value > 0)

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

  const mileageData = fuelLogs
    .filter(f => f.full_tank && f.mileage > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(f => ({
      date: formatDate(f.date),
      mileage: Number(f.mileage.toFixed(1)),
      fullDate: f.date
    }))

  const getMonthlyMileageData = () => {
    const months: { name: string; month: number; year: number; totalMileage: number; count: number }[] = []
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear(),
        totalMileage: 0,
        count: 0
      })
    }

    fuelLogs
      .filter(f => f.full_tank && f.mileage > 0)
      .forEach(l => {
        const d = new Date(l.date)
        const entry = months.find(m => m.month === d.getMonth() && m.year === d.getFullYear())
        if (entry) {
          entry.totalMileage += Number(l.mileage)
          entry.count++
        }
      })

    return months.map((m, index) => {
      const avgMileage = m.count > 0 ? Number((m.totalMileage / m.count).toFixed(1)) : 0
      const prevMileage = index > 0 && months[index - 1].count > 0
        ? months[index - 1].totalMileage / months[index - 1].count
        : avgMileage
      
      let color = '#10b981'
      if (avgMileage > 0 && prevMileage > 0) {
        const changePercent = ((avgMileage - prevMileage) / prevMileage) * 100
        if (changePercent < -10) color = '#ef4444'
        else if (changePercent < 0) color = '#f59e0b'
      }
      
      return { name: m.name, mileage: avgMileage, color, hasData: m.count > 0 }
    })
  }

  const monthlyMileageData = getMonthlyMileageData()

  const chartStyles = {
    grid: theme === 'dark' ? '#262626' : '#e5e5e5',
    axis: theme === 'dark' ? '#525252' : '#a3a3a3',
    tick: theme === 'dark' ? '#737373' : '#737373',
    tooltip: {
      backgroundColor: theme === 'dark' ? '#171717' : '#ffffff',
      borderColor: theme === 'dark' ? '#262626' : '#e5e5e5',
      borderRadius: '0.75rem',
      color: theme === 'dark' ? '#f5f5f5' : '#171717'
    },
    cursor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  }

  return (
    <div className="space-y-8">
      {mileageData.length > 1 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-6 rounded-xl shadow-sm dark:shadow-none">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Fuel Efficiency Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mileageData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid} vertical={false} />
                <XAxis dataKey="date" stroke={chartStyles.axis} tick={{ fill: chartStyles.tick, fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke={chartStyles.axis} tick={{ fill: chartStyles.tick, fontSize: 12 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={chartStyles.tooltip} cursor={{ stroke: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="mileage" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 6, fill: theme === 'dark' ? '#fff' : '#000' }} name="Efficiency (km/L)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {monthlyMileageData.some(m => m.hasData) && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-6 rounded-xl shadow-sm dark:shadow-none">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Monthly Avg. Mileage</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Color indicates month-over-month change</p>
            </div>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-neutral-500 dark:text-neutral-400">Good</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span><span className="text-neutral-500 dark:text-neutral-400">Slight Drop</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-neutral-500 dark:text-neutral-400">Significant Drop</span></div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyMileageData.filter(m => m.hasData)}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid} vertical={false} />
                <XAxis dataKey="name" stroke={chartStyles.axis} tick={{ fill: chartStyles.tick, fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke={chartStyles.axis} tick={{ fill: chartStyles.tick, fontSize: 12 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} unit=" km/L" />
                <Tooltip contentStyle={chartStyles.tooltip} cursor={{ fill: chartStyles.cursor }} formatter={(value) => [`${value ?? 0} km/L`, 'Avg Mileage']} />
                <Bar dataKey="mileage" name="Avg Mileage" radius={[6, 6, 0, 0]}>
                  {monthlyMileageData.filter(m => m.hasData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-6 rounded-xl shadow-sm dark:shadow-none">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Cost Distribution</h3>
          <div className="h-[300px]">
            {costData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartStyles.tooltip} itemStyle={{ color: theme === 'dark' ? '#e5e5e5' : '#171717' }} formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Cost']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">No data available</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-6 rounded-xl shadow-sm dark:shadow-none">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">6-Month Spending Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid} vertical={false} />
                <XAxis dataKey="name" stroke={chartStyles.axis} tick={{ fill: chartStyles.tick, fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke={chartStyles.axis} tick={{ fill: chartStyles.tick, fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip contentStyle={chartStyles.tooltip} cursor={{ fill: chartStyles.cursor }} />
                <Legend />
                <Bar dataKey="fuel" name="Fuel" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="service" name="Service" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

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
  )
}
