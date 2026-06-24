'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { Plus, Search, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_STYLE: Record<string, string> = {
  PAID: 'badge-paid', OVERDUE: 'badge-overdue', PENDING: 'badge-pending',
  FOLLOW_UP: 'badge-followup', DISPUTED: 'badge-disputed',
  PARTIALLY_PAID: 'badge-partial', DELIVERED: 'badge-followup', PROMISE_TO_PAY: 'badge-pending'
}

export default function InvoicesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [showPayment, setShowPayment] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search, status],
    queryFn: () => invoicesApi.list({ search, status }),
  })

  const payMutation = useMutation({
    mutationFn: ({ id, amount }: any) => invoicesApi.recordPayment(id, { amount: +amount, paymentDate: new Date().toISOString(), paymentMethod: 'Bank Transfer' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); setShowPayment(null); toast.success('Payment recorded!') },
    onError: (e: any) => toast.error(e.message || 'Failed')
  })

  const invoices = (data as any)?.invoices || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-gray-500">{(data as any)?.total || 0} total invoices</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice, customer..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none">
          <option value="">All Status</option>
          {['PENDING','DELIVERED','FOLLOW_UP','PROMISE_TO_PAY','PARTIALLY_PAID','PAID','OVERDUE','DISPUTED'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                {['Invoice No.','Customer','Invoice Date','Due Date','Amount','Balance','Aging','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {invoices.map((inv: any, i: number) => (
                <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-medium text-blue-600">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900 dark:text-white">{inv.customer?.customerName}</div>
                    <div className="text-xs text-gray-400">{inv.customer?.customerCode}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium">SAR {Number(inv.totalAmount).toLocaleString()}</td>
                  <td className={`px-4 py-3 font-bold ${Number(inv.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>SAR {Number(inv.balance).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${inv.agingDays > 30 ? 'text-red-600' : inv.agingDays > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                      {inv.agingDays > 0 ? `${inv.agingDays}d` : 'Current'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_STYLE[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                      {inv.status.replace('_',' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {inv.status !== 'PAID' && (
                      <button onClick={() => { setShowPayment(inv.id); setPayAmount(String(inv.balance)) }}
                        className="flex items-center gap-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded-lg">
                        <DollarSign size={12} /> Record
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={9} className="text-center py-12 text-gray-400">No invoices found</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">Record Payment</h2>
            <label className="block text-xs font-medium text-gray-500 mb-1">Payment Amount (SAR)</label>
            <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowPayment(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={() => payMutation.mutate({ id: showPayment, amount: payAmount })} disabled={payMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                {payMutation.isPending ? 'Saving...' : 'Record Payment'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
