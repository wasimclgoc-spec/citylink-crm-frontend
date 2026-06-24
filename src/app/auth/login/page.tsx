'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react'

// Simple hardcoded users - no backend needed
const USERS = [
  { email: 'admin@citylink.com', password: 'citylink2024', name: 'Admin User', role: 'admin' },
  { email: 'manager@citylink.com', password: 'manager123', name: 'Manager', role: 'manager' },
  { email: 'wasimclgoc@gmail.com', password: 'citylink2024', name: 'Wasim', role: 'admin' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    await new Promise(r => setTimeout(r, 600))

    const user = USERS.find(u => u.email === email && u.password === password)
    if (user) {
      localStorage.setItem('crm_token', btoa(JSON.stringify(user)))
      localStorage.setItem('crm_user', JSON.stringify(user))
      router.push('/dashboard')
    } else {
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="bg-white rounded-2xl p-10 w-full max-w-sm shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Citylink Group</h1>
          <p className="text-sm text-gray-500">Collection CRM — Internal System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3 text-gray-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">
          <p className="font-medium mb-1">Demo Credentials</p>
          <p>admin@citylink.com / citylink2024</p>
        </div>
      </div>
    </div>
  )
}
