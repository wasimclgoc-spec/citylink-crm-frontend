'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Bell, Mail, MessageSquare, Shield, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [smtp, setSmtp] = useState({ host: '', port: '587', user: '', pass: '', from: '' })
  const [reminders, setReminders] = useState({
    beforeDueDays: 3, onDueDay: true, afterDueDays: 3,
    weeklyEnabled: true, monthlyEnabled: false
  })

  const save = (section: string) => toast.success(`${section} settings saved!`)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings size={22} /> Settings
        </h1>
        <p className="text-sm text-gray-500">Configure CRM preferences and integrations</p>
      </div>

      {/* SMTP */}
      <motion.div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Mail size={16} /> Email / SMTP Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
            { key: 'port', label: 'Port', placeholder: '587' },
            { key: 'user', label: 'Username / Email', placeholder: 'your@email.com' },
            { key: 'pass', label: 'Password / App Password', placeholder: '••••••••' },
            { key: 'from', label: 'From Name', placeholder: 'Citylink Group Collections' },
          ].map(f => (
            <div key={f.key} className={f.key === 'from' ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
              <input type={f.key === 'pass' ? 'password' : 'text'}
                value={(smtp as any)[f.key]} onChange={e => setSmtp({ ...smtp, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
            </div>
          ))}
        </div>
        <button onClick={() => save('SMTP')}
          className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Save size={14} /> Save SMTP Settings
        </button>
      </motion.div>

      {/* Reminder Schedule */}
      <motion.div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Bell size={16} /> Reminder Automation</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div>
              <div className="font-medium text-sm">Before Due Date</div>
              <div className="text-xs text-gray-500">Send reminder N days before invoice due</div>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" value={reminders.beforeDueDays} min={1} max={30}
                onChange={e => setReminders({ ...reminders, beforeDueDays: +e.target.value })}
                className="w-16 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg text-center dark:bg-gray-800" />
              <span className="text-sm text-gray-500">days</span>
            </div>
          </div>
          {[
            { key: 'onDueDay', label: 'On Due Date', desc: 'Send reminder on the invoice due date' },
            { key: 'weeklyEnabled', label: 'Weekly Overdue Reminder', desc: 'Repeat weekly for overdue invoices' },
            { key: 'monthlyEnabled', label: 'Monthly Statement', desc: 'Send monthly account statement' },
          ].map(opt => (
            <div key={opt.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div>
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
              <button onClick={() => setReminders({ ...reminders, [opt.key]: !(reminders as any)[opt.key] })}
                className={`relative w-11 h-6 rounded-full transition-colors ${(reminders as any)[opt.key] ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${(reminders as any)[opt.key] ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => save('Reminder')}
          className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Save size={14} /> Save Reminder Settings
        </button>
      </motion.div>

      {/* Security */}
      <motion.div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield size={16} /> Security</h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <span>Google OAuth Authentication</span><span className="text-green-600 font-medium">✓ Enabled</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <span>JWT Token Expiry (7 days)</span><span className="text-green-600 font-medium">✓ Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <span>Role-Based Access Control</span><span className="text-green-600 font-medium">✓ Enabled</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <span>Audit Logging</span><span className="text-green-600 font-medium">✓ Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
