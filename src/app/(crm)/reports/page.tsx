'use client'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { Download, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ReportsPage() {
  const { data: agingData } = useQuery({ queryKey: ['aging'], queryFn: reportsApi.aging })
  const { data: outstanding } = useQuery({ queryKey: ['outstanding'], queryFn: reportsApi.outstanding })
  const { data: performance } = useQuery({ queryKey: ['user-performance'], queryFn: reportsApi.userPerformance })

  const aging = (agingData as any)?.buckets
  const agingChartData = aging ? [
    { label: 'Current', amount: aging.current },
    { label: '1-30 Days', amount: aging.days30 },
    { label: '31-60 Days', amount: aging.days60 },
    { label: '61-90 Days', amount: aging.days90 },
    { label: '90+ Days', amount: aging.over90 },
  ] : []

  const handleExport = async () => {
    const blob = await reportsApi.exportOutstanding() as any
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'outstanding_report.xlsx'; a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500">Collection analytics and performance</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          <Download size={16} /> Export Outstanding
        </button>
      </div>

      {/* Aging Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Aging Analysis</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agingChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v/1000}K`} />
              <Tooltip formatter={(v: any) => [`SAR ${v.toLocaleString()}`, 'Amount']} />
              <Bar dataKey="amount" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {agingChartData.map((b, i) => (
              <div key={b.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{b.label}</span>
                <span className="font-semibold">SAR {b.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* User Performance */}
        <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={16} /> Collection User Performance</h3>
          <div className="space-y-4">
            {Array.isArray(performance) && performance.map((p: any) => (
              <div key={p.user.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">{p.user.name}</div>
                  <div className="text-xs text-gray-500">{p.totalCustomers} customers</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-green-600">SAR {(p.collected/1000).toFixed(0)}K</div>
                    <div className="text-gray-400">Collected</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-600">SAR {(p.outstanding/1000).toFixed(0)}K</div>
                    <div className="text-gray-400">Outstanding</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{p.totalFollowUps}</div>
                    <div className="text-gray-400">Follow-ups</div>
                  </div>
                </div>
              </div>
            ))}
            {(!performance || (performance as any).length === 0) && (
              <p className="text-gray-400 text-sm text-center py-8">No data available</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Outstanding Table */}
      <motion.div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold">Outstanding Invoices</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900">
              {['Customer','Invoice No.','Due Date','Balance','Aging','Status','Assigned To'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {Array.isArray(outstanding) && outstanding.slice(0,20).map((inv: any) => (
              <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 font-medium">{inv.customer?.customerName}</td>
                <td className="px-4 py-3 text-blue-600">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-bold text-red-600">SAR {Number(inv.balance).toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`text-xs font-medium ${inv.agingDays > 30 ? 'text-red-600' : 'text-yellow-600'}`}>{inv.agingDays}d</span></td>
                <td className="px-4 py-3"><span className="badge-overdue inline-flex px-2 py-0.5 text-xs rounded-full">{inv.status}</span></td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inv.customer?.assignedUser?.name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
