'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { UserCheck, UserX, Trash2, Shield, User } from 'lucide-react'
import { toast } from 'sonner'

export default function UsersPage() {
  const qc = useQueryClient()
  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: usersApi.list })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => usersApi.toggle(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User status updated') }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted') },
    onError: (e: any) => toast.error(e.message || 'Cannot delete')
  })

  const usersList = Array.isArray(users) ? users : []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-sm text-gray-500">{usersList.length} users registered</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
          </div>
        ) : usersList.map((user: any, i: number) => (
          <motion.div key={user.id}
            className={`bg-white dark:bg-gray-800 rounded-xl border p-5 ${!user.isActive ? 'opacity-60 border-gray-200' : 'border-gray-100 dark:border-gray-700'}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                    {user.name[0]}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</div>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role === 'SUPER_ADMIN' ? <Shield size={11} /> : <User size={11} />}
                {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Collection User'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{user._count?.assignedCustomers || 0}</div>
                <div className="text-xs text-gray-400">Customers</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{user._count?.followUps || 0}</div>
                <div className="text-xs text-gray-400">Follow-ups</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => toggleMutation.mutate(user.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition-colors ${
                  user.isActive
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}>
                {user.isActive ? <><UserX size={13} /> Disable</> : <><UserCheck size={13} /> Enable</>}
              </button>
              {user.role !== 'SUPER_ADMIN' && (
                <button onClick={() => { if (confirm(`Delete ${user.name}?`)) deleteMutation.mutate(user.id) }}
                  className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-400">
              Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
