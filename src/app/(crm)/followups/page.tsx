'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { followupsApi, customersApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { Plus, Phone, MessageSquare, Mail, Building2 } from 'lucide-react'
import { toast } from 'sonner'

const TYPE_ICONS: Record<string, any> = {
  PHONE_CALL: Phone, WHATSAPP: MessageSquare, EMAIL: Mail, OFFICE_VISIT: Building2
}
const TYPE_COLORS: Record<string, string> = {
  PHONE_CALL: 'bg-blue-100 text-blue-700', WHATSAPP: 'bg-green-100 text-green-700',
  EMAIL: 'bg-purple-100 text-purple-700',  OFFICE_VISIT: 'bg-orange-100 text-orange-700'
}

export default function FollowUpsPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ customerId: '', communicationType: 'PHONE_CALL', followUpDate: '', notes: '', promiseToPayDate: '', nextFollowUpDate: '', paymentExpected: '' })
  const qc = useQueryClient()

  const { data } = useQuery({ queryKey: ['followups'], queryFn: () => followupsApi.list() })
  const { data: todayData } = useQuery({ queryKey: ['followups-today'], queryFn: followupsApi.today })
  const { data: customersData } = useQuery({ queryKey: ['customers-list'], queryFn: () => customersApi.list({ take: 500 }) })

  const createMutation = useMutation({
    mutationFn: followupsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['followups'] }); setShowForm(false); toast.success('Follow-up recorded!') },
    onError: (e: any) => toast.error(e.message || 'Failed')
  })

  const followUps = (data as any)?.followUps || []
  const todayFollowUps = Array.isArray(todayData) ? todayData : []
  const customers = (customersData as any)?.customers || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Follow-ups</h1>
          <p className="text-sm text-gray-500">{todayFollowUps.length} due today</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Follow-up
        </button>
      </div>

      {/* Today's follow-ups */}
      {todayFollowUps.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">🔔 Today's Follow-ups ({todayFollowUps.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayFollowUps.map((f: any) => (
              <div key={f.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-100">
                <div className="font-medium text-sm">{f.customer?.customerName}</div>
                <div className="text-xs text-gray-500 mt-1">{f.communicationType.replace('_',' ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Follow-ups */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              {['Customer','Type','Date','Notes','Promise Date','Next Follow-up','By'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {followUps.map((f: any, i: number) => {
              const Icon = TYPE_ICONS[f.communicationType] || Phone
              return (
                <motion.tr key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{f.customer?.customerName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${TYPE_COLORS[f.communicationType]}`}>
                      <Icon size={11} />{f.communicationType.replace('_',' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(f.followUpDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{f.notes || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{f.promiseToPayDate ? new Date(f.promiseToPayDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    {f.nextFollowUpDate ? (
                      <span className={`text-xs font-medium ${new Date(f.nextFollowUpDate) <= new Date() ? 'text-red-600' : 'text-blue-600'}`}>
                        {new Date(f.nextFollowUpDate).toLocaleDateString()}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{f.user?.name}</td>
                </motion.tr>
              )
            })}
            {followUps.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">No follow-ups recorded</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Follow-up Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">Record Follow-up</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Customer *</label>
                <select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700">
                  <option value="">Select customer...</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id}>{c.customerName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Communication Type</label>
                  <select value={form.communicationType} onChange={e => setForm({ ...form, communicationType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700">
                    <option value="PHONE_CALL">Phone Call</option><option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option><option value="OFFICE_VISIT">Office Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Follow-up Date *</label>
                  <input type="datetime-local" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Promise to Pay Date</label>
                  <input type="date" value={form.promiseToPayDate} onChange={e => setForm({ ...form, promiseToPayDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Next Follow-up Date</label>
                  <input type="date" value={form.nextFollowUpDate} onChange={e => setForm({ ...form, nextFollowUpDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Payment Expected (SAR)</label>
                <input type="number" value={form.paymentExpected} onChange={e => setForm({ ...form, paymentExpected: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none resize-none dark:bg-gray-700" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={() => createMutation.mutate({ ...form, paymentExpected: form.paymentExpected ? +form.paymentExpected : undefined })}
                disabled={createMutation.isPending || !form.customerId || !form.followUpDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {createMutation.isPending ? 'Saving...' : 'Save Follow-up'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
