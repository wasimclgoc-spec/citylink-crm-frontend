'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { Plus, Search, Phone, Mail, MessageSquare, Eye, Filter } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700', INACTIVE: 'bg-gray-100 text-gray-600',
  BLOCKED: 'bg-red-100 text-red-700',    VIP: 'bg-purple-100 text-purple-700'
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ customerCode: '', customerName: '', companyName: '', contactPerson: '', mobileNumber: '', whatsappNumber: '', email: '', creditLimit: 0, paymentTerms: 30 })
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, status],
    queryFn: () => customersApi.list({ search, status }),
  })

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setShowForm(false); toast.success('Customer created!') },
    onError: (e: any) => toast.error(e.message || 'Failed')
  })

  const customers = (data as any)?.customers || []
  const total = (data as any)?.total || 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-500">{total} total customers</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
          <option value="VIP">VIP</option><option value="BLOCKED">Blocked</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Assigned To</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {customers.map((c: any, i: number) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{c.customerName}</div>
                    <div className="text-xs text-gray-400">{c.customerCode} · {c.companyName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-600 dark:text-gray-300">{c.contactPerson}</div>
                    <div className="text-xs text-gray-400">{c.mobileNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.assignedUser?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/customers/${c.id}`}>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600"><Eye size={15} /></button>
                      </Link>
                      {c.mobileNumber && (
                        <a href={`tel:${c.mobileNumber}`}>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-green-600"><Phone size={15} /></button>
                        </a>
                      )}
                      {c.whatsappNumber && (
                        <a href={`https://wa.me/${c.whatsappNumber.replace(/[^0-9]/g,'')}`} target="_blank">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-green-500"><MessageSquare size={15} /></button>
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`}>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-500"><Mail size={15} /></button>
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No customers found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">Add New Customer</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'customerCode', label: 'Customer Code *', type: 'text' },
                { key: 'customerName', label: 'Customer Name *', type: 'text' },
                { key: 'companyName', label: 'Company Name', type: 'text' },
                { key: 'contactPerson', label: 'Contact Person', type: 'text' },
                { key: 'mobileNumber', label: 'Mobile Number', type: 'text' },
                { key: 'whatsappNumber', label: 'WhatsApp Number', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'creditLimit', label: 'Credit Limit (SAR)', type: 'number' },
                { key: 'paymentTerms', label: 'Payment Terms (Days)', type: 'number' },
              ].map(f => (
                <div key={f.key} className={f.key === 'email' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                  <input type={f.type} value={(formData as any)[f.key]}
                    onChange={e => setFormData({ ...formData, [f.key]: f.type === 'number' ? +e.target.value : e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {createMutation.isPending ? 'Saving...' : 'Create Customer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
