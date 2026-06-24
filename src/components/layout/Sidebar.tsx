'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, FileText, PhoneCall,
  MessageSquare, Mail, BarChart2, Settings,
  ChevronLeft, Building2, Bell, LogOut, UserCog
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/customers',   icon: Users,            label: 'Customers' },
  { href: '/invoices',    icon: FileText,         label: 'Invoices' },
  { href: '/followups',   icon: PhoneCall,        label: 'Follow-ups' },
  { href: '/whatsapp',    icon: MessageSquare,    label: 'WhatsApp' },
  { href: '/email',       icon: Mail,             label: 'Email' },
  { href: '/reports',     icon: BarChart2,        label: 'Reports' },
]

const adminItems = [
  { href: '/users',    icon: UserCog, label: 'Users' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  collapsed: boolean
  onCollapse: (v: boolean) => void
  userRole?: string
  userName?: string
  userAvatar?: string
}

export function Sidebar({ collapsed, onCollapse, userRole, userName, userAvatar }: SidebarProps) {
  const pathname = usePathname()
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 top-0 h-screen bg-[#0f172a] text-white flex flex-col z-50 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={18} />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="font-bold text-sm leading-tight">Citylink Group</div>
            <div className="text-xs text-blue-400">Collection CRM</div>
          </motion.div>
        )}
        <button onClick={() => onCollapse(!collapsed)} className="ml-auto text-white/40 hover:text-white flex-shrink-0">
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <ChevronLeft size={16} />
          </motion.div>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`sidebar-link ${active ? 'active' : 'text-white/60 hover:text-white'}`}>
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}

        {userRole === 'SUPER_ADMIN' && (
          <>
            <div className={`px-3 py-2 text-xs text-white/30 uppercase tracking-wider ${collapsed ? 'hidden' : ''}`}>Admin</div>
            {adminItems.map(item => {
              const active = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}
                  className={`sidebar-link ${active ? 'active' : 'text-white/60 hover:text-white'}`}>
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
              {userName?.[0] || 'U'}
            </div>
          )}
          {!collapsed && (
            <motion.div className="flex-1 min-w-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-sm font-medium truncate">{userName}</div>
              <div className="text-xs text-white/40 truncate">{userRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Collection User'}</div>
            </motion.div>
          )}
          {!collapsed && (
            <button onClick={() => { localStorage.removeItem('crm_token'); window.location.href = '/auth/login' }}
              className="text-white/40 hover:text-white flex-shrink-0">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
