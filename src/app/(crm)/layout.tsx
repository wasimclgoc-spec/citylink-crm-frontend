'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { authApi, notificationsApi } from '@/lib/api'
import { Bell, Search, Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  const { data: user, isError } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    retry: false,
  })

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (isError || !localStorage.getItem('crm_token')) router.push('/auth/login')
  }, [isError, router])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const unread = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed}
        userRole={(user as any).role} userName={(user as any).name} userAvatar={(user as any).avatar} />

      <div className="flex-1 flex flex-col" style={{ marginLeft: collapsed ? 72 : 240, transition: 'margin 0.2s' }}>
        {/* Top Nav */}
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 h-14 flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search customers, invoices..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <motion.main className="flex-1 p-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.main>
      </div>
    </div>
  )
}
