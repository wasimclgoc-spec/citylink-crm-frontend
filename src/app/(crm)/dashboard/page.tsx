'use client'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { motion } from 'framer-motion'
import {
  Users, FileText, DollarSign, AlertTriangle,
  CheckCircle, Clock, TrendingUp, Phone, Activity
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function StatCard({ title, value, icon: Icon, color, subtitle, delay = 0 }: any) {
  return (
    <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}

const agingData = [
  { name: 'Current', amount: 45000 },
  { name: '1-30 Days', amount: 32000 },
  { name: '31-60 Days', amount: 18000 },
  { name: '61-90 Days', amount: 12000 },
  { name: '90+ Days', amount: 8000 },
]

const trendData = [
  { month: 'Jan', collected: 65000, outstanding: 45000 },
  { month: 'Feb', collected: 72000, outstanding: 38000 },
  { month: 'Mar', collected: 68000, outstanding: 52000 },
  { month: 'Apr', collected: 85000, outstanding: 41000 },
  { month: 'May', collected: 91000, outstanding: 35000 },
  { month: 'Jun', collected: 78000, outstanding: 48000 },
]

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get })
  const stats = (data as any)?.stats
  const activities = (data as any)?.recentActivities || []

  const fmt = (n: number) => n >= 1000000
    ? `SAR ${(n/1000000).toFixed(1)}M`
    : n >= 1000 ? `SAR ${(n/1000).toFixed(0)}K` : `SAR ${n?.toLocaleString() || 0}`

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  const statusData = [
    { name: 'Paid', value: stats?.paidInvoices || 0 },
    { name: 'Overdue', value: stats?.overdueInvoices || 0 },
    { name: 'Pending', value: (stats?.totalInvoices || 0) - (stats?.paidInvoices || 0) - (stats?.overdueInvoices || 0) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Collection performance overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Customers" value={stats?.totalCustomers || 0} icon={Users} color="bg-blue-500" delay={0} />
        <StatCard title="Outstanding" value={fmt(stats?.totalOutstanding)} icon={AlertTriangle} color="bg-red-500" delay={0.05} />
        <StatCard title="Collected" value={fmt(stats?.totalCollected)} icon={DollarSign} color="bg-green-500" delay={0.1} />
        <StatCard title="Overdue" value={fmt(stats?.overdueAmount)} icon={TrendingUp} color="bg-orange-500" delay={0.15} />
        <StatCard title="Success Rate" value={`${stats?.collectionRate || 0}%`} icon={CheckCircle} color="bg-purple-500" delay={0.2} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today Follow-ups" value={stats?.todayFollowUps || 0} icon={Phone} color="bg-teal-500" delay={0.25} />
        <StatCard title="Pending Follow-ups" value={stats?.pendingFollowUps || 0} icon={Clock} color="bg-yellow-500" delay={0.3} />
        <StatCard title="Paid Invoices" value={stats?.paidInvoices || 0} icon={FileText} color="bg-green-600" delay={0.35} />
        <StatCard title="Overdue Invoices" value={stats?.overdueInvoices || 0} icon={AlertTriangle} color="bg-red-600" delay={0.4} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Trend */}
        <motion.div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Collection Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v/1000}K`} />
              <Tooltip formatter={(v: any) => `SAR ${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="collected" stroke="#3b82f6" strokeWidth={2} dot={false} name="Collected" />
              <Line type="monotone" dataKey="outstanding" stroke="#ef4444" strokeWidth={2} dot={false} name="Outstanding" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Invoice Status Pie */}
        <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Invoice Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {statusData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} /><span className="text-gray-600 dark:text-gray-300">{s.name}</span></div>
                <span className="font-medium text-gray-900 dark:text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Aging & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Aging Analysis</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v/1000}K`} />
              <Tooltip formatter={(v: any) => `SAR ${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Activity size={16} /> Recent Activity</h3>
          <div className="space-y-3 overflow-y-auto max-h-52">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
            ) : activities.map((act: any) => (
              <div key={act.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Activity size={12} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white truncate">{act.description}</p>
                  <p className="text-xs text-gray-400">{act.user?.name} · {new Date(act.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
