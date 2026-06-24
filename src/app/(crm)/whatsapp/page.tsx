'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { whatsappApi, customersApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { MessageSquare, Send, CheckCheck, Clock, XCircle } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_ICONS: Record<string, any> = {
  SENT: { icon: CheckCheck, color: 'text-blue-500' },
  DELIVERED: { icon: CheckCheck, color: 'text-green-500' },
  READ: { icon: CheckCheck, color: 'text-green-600' },
  FAILED: { icon: XCircle, color: 'text-red-500' },
  PENDING: { icon: Clock, color: 'text-gray-400' },
}

export default function WhatsAppPage() {
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  const [customerId, setCustomerId] = useState('')

  const { data: logs, refetch } = useQuery({ queryKey: ['wa-logs'], queryFn: whatsappApi.logs })
  const { data: templates } = useQuery({ queryKey: ['wa-templates'], queryFn: whatsappApi.templates })
  const { data: customersData } = useQuery({ queryKey: ['customers-wa'], queryFn: () => customersApi.list({ take: 500 }) })

  const sendMutation = useMutation({
    mutationFn: whatsappApi.send,
    onSuccess: (res: any) => {
      toast.success('WhatsApp message sent!')
      if (res.waLink) window.open(res.waLink, '_blank')
      refetch(); setMessage(''); setTo('')
    },
    onError: (e: any) => toast.error(e.message || 'Send failed')
  })

  const customers = (customersData as any)?.customers || []
  const logsList = Array.isArray(logs) ? logs : []
  const tplList = Array.isArray(templates) ? templates : []

  const onCustomerChange = (id: string) => {
    setCustomerId(id)
    const c = customers.find((x: any) => x.id === id)
    if (c?.whatsappNumber) setTo(c.whatsappNumber)
  }

  const applyTemplate = (body: string) => {
    const c = customers.find((x: any) => x.id === customerId)
    setMessage(body
      .replace('{customerName}', c?.customerName || '')
      .replace('{invoiceNumber}', 'INV-XXXX')
      .replace('{amount}', '0')
      .replace('{dueDate}', new Date().toLocaleDateString())
      .replace('{balance}', '0')
      .replace('{agingDays}', '0')
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare size={24} className="text-green-500" /> WhatsApp
        </h1>
        <p className="text-sm text-gray-500">Send messages and payment reminders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose */}
        <motion.div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="font-semibold mb-4">Send Message</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Customer</label>
              <select value={customerId} onChange={e => onCustomerChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700">
                <option value="">Select customer...</option>
                {customers.map((c: any) => <option key={c.id} value={c.id}>{c.customerName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">WhatsApp Number</label>
              <input value={to} onChange={e => setTo(e.target.value)} placeholder="+966XXXXXXXXX"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700" />
            </div>

            {/* Templates */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Quick Templates</label>
              <div className="space-y-1">
                {tplList.map((t: any) => (
                  <button key={t.id} onClick={() => applyTemplate(t.body)}
                    className="w-full text-left text-xs px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 transition-colors">
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
              <textarea rows={5} value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none dark:bg-gray-700" />
              <div className="text-right text-xs text-gray-400 mt-1">{message.length}/1000</div>
            </div>

            <button onClick={() => sendMutation.mutate({ to, message, customerId: customerId || undefined })}
              disabled={!to || !message || sendMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
              <Send size={15} />
              {sendMutation.isPending ? 'Sending...' : 'Send via WhatsApp'}
            </button>
            <p className="text-xs text-gray-400 text-center">Opens WhatsApp with pre-filled message</p>
          </div>
        </motion.div>

        {/* Message Logs */}
        <motion.div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold">Message History</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {logsList.map((log: any) => {
              const s = STATUS_ICONS[log.status] || STATUS_ICONS.PENDING
              return (
                <div key={log.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{log.to}</span>
                        <s.icon size={14} className={s.color} />
                        <span className="text-xs text-gray-400">{log.status}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{log.message}</p>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              )
            })}
            {logsList.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">No messages sent yet</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
