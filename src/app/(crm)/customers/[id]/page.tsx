'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi, invoicesApi, followupsApi, whatsappApi, emailApi } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Phone, MessageSquare, Mail, FileText,
  Activity, Clock, DollarSign, AlertTriangle, CheckCircle,
  Building2, User, CreditCard, Calendar, Plus, Send
} from 'lucide-react'
import { toast } from 'sonner'

const ACTIVITY_ICONS: Record<string, any> = {
  INVOICE_CREATED:    { icon: FileText,      color: 'bg-blue-100 text-blue-600' },
  INVOICE_DELIVERED:  { icon: CheckCircle,   color: 'bg-green-100 text-green-600' },
  PAYMENT_RECEIVED:   { icon: DollarSign,    color: 'bg-green-100 text-green-600' },
  WHATSAPP_SENT:      { icon: MessageSquare, color: 'bg-emerald-100 text-emerald-600' },
  EMAIL_SENT:         { icon: Mail,          color: 'bg-purple-100 text-purple-600' },
  PHONE_CALL:         { icon: Phone,         color: 'bg-blue-100 text-blue-600' },
  FOLLOW_UP_SCHEDULED:{ icon: Clock,         color: 'bg-yellow-100 text-yellow-600' },
  STATUS_CHANGED:     { icon: Activity,      color: 'bg-gray-100 text-gray-600' },
  NOTE_ADDED:         { icon: FileText,      color: 'bg-orange-100 text-orange-600' },
  PROMISE_TO_PAY:     { icon: Calendar,      color: 'bg-indigo-100 text-indigo-600' },
}

const STATUS_STYLE: Record<string, string> = {
  PAID: 'badge-paid', OVERDUE: 'badge-overdue', PENDING: 'badge-pending',
  FOLLOW_UP: 'badge-followup', DISPUTED: 'badge-disputed',
  PARTIALLY_PAID: 'badge-partial',
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()

  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'followups' | 'timeline' | 'communication'>('overview')
  const [showFollowupForm, setShowFollowupForm] = useState(false)
  const [showWAForm, setShowWAForm] = useState(false)
  const [waMessage, setWaMessage] = useState('')
  const [followupForm, setFollowupForm] = useState({
    communicationType: 'PHONE_CALL', followUpDate: '', notes: '',
    promiseToPayDate: '', nextFollowUpDate: '', paymentExpected: ''
  })

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.get(id),
  })
  const { data: summary } = useQuery({
    queryKey: ['customer-summary', id],
    queryFn: () => customersApi.summary(id),
  })

  const followupMutation = useMutation({
    mutationFn: (data: any) => followupsApi.create({ ...data, customerId: id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer', id] }); setShowFollowupForm(false); toast.success('Follow-up recorded!') },
  })
  const waMutation = useMutation({
    mutationFn: (msg: string) => whatsappApi.send({ to: (customer as any)?.whatsappNumber, message: msg, customerId: id }),
    onSuccess: (res: any) => { if (res.waLink) window.open(res.waLink, '_blank'); setShowWAForm(false); toast.success('WhatsApp opened!') },
  })
  const emailReminderMutation = useMutation({
    mutationFn: (invId: string) => emailApi.sendReminder(invId),
    onSuccess: () => toast.success('Reminder email sent!'),
    onError: () => toast.error('Failed to send email'),
  })

  const c = customer as any
  const s = summary as any

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )
  if (!c) return <div className="text-center py-20 text-gray-400">Customer not found</div>

  const tabs = [
    { key: 'overview',       label: 'Overview' },
    { key: 'invoices',       label: `Invoices (${c.invoices?.length || 0})` },
    { key: 'followups',      label: `Follow-ups (${c.followUps?.length || 0})` },
    { key: 'timeline',       label: 'Timeline' },
    { key: 'communication',  label: 'Communication' },
  ]

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{c.customerName}</h1>
          <p className="text-sm text-gray-500">{c.customerCode} · {c.companyName}</p>
        </div>
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {c.mobileNumber && (
            <a href={`tel:${c.mobileNumber}`}>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                <Phone size={14} /> Call
              </button>
            </a>
          )}
          {c.whatsappNumber && (
            <button onClick={() => setShowWAForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition-colors">
              <MessageSquare size={14} /> WhatsApp
            </button>
          )}
          <button onClick={() => setShowFollowupForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={14} /> Follow-up
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: s?.totalInvoices || 0, icon: FileText, color: 'bg-blue-500' },
          { label: 'Outstanding', value: `SAR ${(s?.totalOutstanding || 0).toLocaleString()}`, icon: AlertTriangle, color: 'bg-red-500' },
          { label: 'Collected', value: `SAR ${(s?.totalPaid || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-500' },
          { label: 'Overdue', value: s?.overdueCount || 0, icon: Clock, color: 'bg-orange-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} className="stat-card"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><User size={16} /> Customer Info</h3>
              <div className="space-y-3">
                {[
                  { label: 'Customer Code', value: c.customerCode },
                  { label: 'Company', value: c.companyName },
                  { label: 'Contact Person', value: c.contactPerson },
                  { label: 'Mobile', value: c.mobileNumber },
                  { label: 'WhatsApp', value: c.whatsappNumber },
                  { label: 'Email', value: c.email },
                ].map(f => f.value && (
                  <div key={f.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{f.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><CreditCard size={16} /> Account Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Credit Limit', value: `SAR ${Number(c.creditLimit).toLocaleString()}` },
                  { label: 'Payment Terms', value: `${c.paymentTerms} Days` },
                  { label: 'Status', value: c.status },
                  { label: 'Assigned To', value: c.assignedUser?.name || 'Unassigned' },
                  { label: 'Since', value: new Date(c.createdAt).toLocaleDateString() },
                ].map(f => (
                  <div key={f.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{f.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                  {['Invoice No.', 'Date', 'Due Date', 'Amount', 'Balance', 'Aging', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {(c.invoices || []).map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium text-blue-600">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium">SAR {Number(inv.totalAmount).toLocaleString()}</td>
                    <td className={`px-4 py-3 font-bold ${Number(inv.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      SAR {Number(inv.balance).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${inv.agingDays > 30 ? 'text-red-600' : inv.agingDays > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {inv.agingDays > 0 ? `${inv.agingDays}d` : 'Current'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_STYLE[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {inv.status !== 'PAID' && c.email && (
                        <button onClick={() => emailReminderMutation.mutate(inv.id)}
                          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-lg">
                          <Send size={11} /> Reminder
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!c.invoices || c.invoices.length === 0) && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No invoices found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* FOLLOW-UPS TAB */}
        {activeTab === 'followups' && (
          <div className="space-y-3">
            {(c.followUps || []).map((f: any) => (
              <div key={f.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Phone size={15} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{f.communicationType.replace('_', ' ')}</div>
                      <div className="text-xs text-gray-500">{new Date(f.followUpDate).toLocaleString()} · by {f.user?.name}</div>
                    </div>
                  </div>
                  {f.promiseToPayDate && (
                    <div className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">
                      Promise: {new Date(f.promiseToPayDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {f.notes && <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 ml-12">{f.notes}</p>}
                {f.nextFollowUpDate && (
                  <div className="mt-2 ml-12 text-xs text-blue-600">
                    Next follow-up: {new Date(f.nextFollowUpDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
            {(!c.followUps || c.followUps.length === 0) && (
              <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                No follow-ups yet
              </div>
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-4">
              {(c.activities || []).map((act: any, i: number) => {
                const cfg = ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.STATUS_CHANGED
                const Icon = cfg.icon
                return (
                  <motion.div key={act.id} className="flex gap-4 relative"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${cfg.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{act.description}</p>
                          <p className="text-xs text-gray-500 mt-1">by {act.user?.name}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                          {new Date(act.createdAt).toLocaleDateString()} {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              {(!c.activities || c.activities.length === 0) && (
                <div className="ml-16 text-gray-400 text-sm text-center py-12">No activity recorded yet</div>
              )}
            </div>
          </div>
        )}

        {/* COMMUNICATION TAB */}
        {activeTab === 'communication' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WhatsApp Log */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <MessageSquare size={16} className="text-green-500" />
                <h3 className="font-semibold text-sm">WhatsApp Messages</h3>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-72 overflow-y-auto">
                {(c.whatsAppMessages || []).map((m: any) => (
                  <div key={m.id} className="px-5 py-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{m.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleDateString()} · {m.status}</p>
                  </div>
                ))}
                {(!c.whatsAppMessages || c.whatsAppMessages.length === 0) && (
                  <div className="text-center py-8 text-gray-400 text-sm">No WhatsApp messages</div>
                )}
              </div>
            </div>
            {/* Email Log */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                <h3 className="font-semibold text-sm">Emails Sent</h3>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-72 overflow-y-auto">
                {(c.emailLogs || []).map((e: any) => (
                  <div key={e.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{e.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(e.createdAt).toLocaleDateString()} · {e.status}</p>
                  </div>
                ))}
                {(!c.emailLogs || c.emailLogs.length === 0) && (
                  <div className="text-center py-8 text-gray-400 text-sm">No emails sent</div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Follow-up Modal */}
      {showFollowupForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">Record Follow-up — {c.customerName}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Communication Type</label>
                  <select value={followupForm.communicationType}
                    onChange={e => setFollowupForm({ ...followupForm, communicationType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700">
                    <option value="PHONE_CALL">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="OFFICE_VISIT">Office Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Follow-up Date *</label>
                  <input type="datetime-local" value={followupForm.followUpDate}
                    onChange={e => setFollowupForm({ ...followupForm, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Promise to Pay Date</label>
                  <input type="date" value={followupForm.promiseToPayDate}
                    onChange={e => setFollowupForm({ ...followupForm, promiseToPayDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Next Follow-up</label>
                  <input type="date" value={followupForm.nextFollowUpDate}
                    onChange={e => setFollowupForm({ ...followupForm, nextFollowUpDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Payment Expected (SAR)</label>
                <input type="number" value={followupForm.paymentExpected}
                  onChange={e => setFollowupForm({ ...followupForm, paymentExpected: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <textarea rows={3} value={followupForm.notes}
                  onChange={e => setFollowupForm({ ...followupForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none resize-none dark:bg-gray-700" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowFollowupForm(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={() => followupMutation.mutate(followupForm)}
                disabled={followupMutation.isPending || !followupForm.followUpDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {followupMutation.isPending ? 'Saving...' : 'Save Follow-up'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWAForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h2 className="text-lg font-bold mb-1">WhatsApp — {c.customerName}</h2>
            <p className="text-sm text-gray-500 mb-4">{c.whatsappNumber}</p>
            <textarea rows={5} value={waMessage} onChange={e => setWaMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none resize-none dark:bg-gray-700 mb-3" />
            <div className="flex gap-3">
              <button onClick={() => setShowWAForm(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={() => waMutation.mutate(waMessage)} disabled={!waMessage || waMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                <MessageSquare size={14} /> {waMutation.isPending ? 'Opening...' : 'Send via WhatsApp'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
