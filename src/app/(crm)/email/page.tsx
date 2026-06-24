'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { emailApi, customersApi, invoicesApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { Mail, Send, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function EmailPage() {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [customerId, setCustomerId] = useState('')

  const { data: logs, refetch } = useQuery({ queryKey: ['email-logs'], queryFn: emailApi.logs })
  const { data: customersData } = useQuery({ queryKey: ['customers-email'], queryFn: () => customersApi.list({ take: 500 }) })
  const { data: invoicesData } = useQuery({ queryKey: ['invoices-email'], queryFn: () => invoicesApi.list({ take: 100, status: 'OVERDUE' }) })

  const sendMutation = useMutation({
    mutationFn: emailApi.send,
    onSuccess: () => { toast.success('Email sent!'); refetch(); setBody(''); setSubject(''); setTo('') },
    onError: (e: any) => toast.error(e.message || 'Failed to send email')
  })

  const reminderMutation = useMutation({
    mutationFn: emailApi.sendReminder,
    onSuccess: () => { toast.success('Reminder sent!'); refetch() },
    onError: (e: any) => toast.error(e.message || 'Failed')
  })

  const customers = (customersData as any)?.customers || []
  const invoices = (invoicesData as any)?.invoices || []
  const logsList = Array.isArray(logs) ? logs : []

  const TEMPLATES = [
    { name: 'Payment Reminder', subject: 'Payment Reminder - Invoice #{INV}', body: `Dear {NAME},\n\nThis is a friendly reminder that your invoice is due.\n\nPlease arrange payment at your earliest convenience.\n\nBest regards,\nCitylink Group Collections Team` },
    { name: 'Overdue Notice', subject: 'OVERDUE: Invoice #{INV}', body: `Dear {NAME},\n\nYour account has an overdue balance. Please contact us immediately to resolve this matter.\n\nBest regards,\nCitylink Group Collections Team` },
    { name: 'Statement Request', subject: 'Your Account Statement - Citylink Group', body: `Dear {NAME},\n\nPlease find your latest account statement attached.\n\nFor any queries, please contact our collections team.\n\nBest regards,\nCitylink Group` },
  ]

  const onCustomerChange = (id: string) => {
    setCustomerId(id)
    const c = customers.find((x: any) => x.id === id)
    if (c?.email) setTo(c.email)
  }

  const applyTemplate = (tpl: any) => {
    const c = customers.find((x: any) => x.id === customerId)
    setSubject(tpl.subject.replace('{INV}', 'XXXX'))
    setBody(tpl.body.replace('{NAME}', c?.contactPerson || c?.customerName || 'Customer'))
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Mail size={24} className="text-blue-500" /> Email</h1>
        <p className="text-sm text-gray-500">Send invoices, statements & payment reminders</p>
      </div>

      {/* Quick Reminders */}
      {invoices.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3">🔴 Overdue Invoices — Send Reminders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {invoices.slice(0, 6).map((inv: any) => (
              <div key={inv.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-100 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{inv.customer?.customerName}</div>
                  <div className="text-xs text-gray-500">{inv.invoiceNumber} · SAR {Number(inv.balance).toLocaleString()}</div>
                </div>
                <button onClick={() => reminderMutation.mutate(inv.id)} disabled={reminderMutation.isPending}
                  className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50">
                  Send
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose */}
        <motion.div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="font-semibold mb-4">Compose Email</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Customer</label>
              <select value={customerId} onChange={e => onCustomerChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700">
                <option value="">Select customer...</option>
                {customers.map((c: any) => <option key={c.id} value={c.id}>{c.customerName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input value={to} onChange={e => setTo(e.target.value)} type="email" placeholder="email@example.com"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700" />
            </div>

            {/* Templates */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Templates</label>
              <div className="space-y-1">
                {TEMPLATES.map(t => (
                  <button key={t.name} onClick={() => applyTemplate(t)}
                    className="w-full text-left text-xs px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors">
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Body</label>
              <textarea rows={6} value={body} onChange={e => setBody(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none resize-none dark:bg-gray-700" />
            </div>
            <button onClick={() => sendMutation.mutate({ to, subject, html: body.replace(/\n/g,'<br>'), customerId: customerId || undefined })}
              disabled={!to || !subject || !body || sendMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              <Send size={15} /> {sendMutation.isPending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </motion.div>

        {/* Email Logs */}
        <motion.div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700"><h3 className="font-semibold">Email History</h3></div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
            {logsList.map((log: any) => (
              <div key={log.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{log.to}</span>
                      {log.status === 'SENT' && <CheckCircle size={13} className="text-green-500 flex-shrink-0" />}
                      {log.status === 'FAILED' && <XCircle size={13} className="text-red-500 flex-shrink-0" />}
                      {log.status === 'PENDING' && <Clock size={13} className="text-gray-400 flex-shrink-0" />}
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{log.subject}</p>
                    {log.errorMsg && <p className="text-xs text-red-500 mt-1">{log.errorMsg}</p>}
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {logsList.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No emails sent yet</div>}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
