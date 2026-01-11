import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import VehicleDetails from './pages/VehicleDetails'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500/30">
        {/* Navbar */}
        <nav className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-3 group">
                  <img src="/axlenote-favicon.png" alt="AxleNote" className="w-8 h-8 rounded-lg shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300 object-cover" />
                  <span className="text-xl font-bold tracking-tight text-white group-hover:text-violet-200 transition-colors">
                    AxleNote
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-6">
                <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Garage</Link>
                <div className="h-4 w-px bg-white/10"></div>

                {/* User/Settings Placeholder */}
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center hover:border-violet-500/50 transition-colors cursor-pointer">
                  <span className="text-xs font-medium text-zinc-500">TJ</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicle/:id" element={<VehicleDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
