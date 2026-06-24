'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'

declare global { interface Window { google: any } }

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('crm_token')) { router.push('/dashboard'); return }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: async (res: any) => {
          try {
            const data: any = await authApi.googleLogin(res.credential)
            localStorage.setItem('crm_token', data.token)
            router.push('/dashboard')
          } catch (err: any) {
            alert(err.message || 'Login failed')
          }
        }
      })
      window.google?.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', width: 320, text: 'signin_with' }
      )
    }
    document.head.appendChild(script)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <motion.div className="bg-white rounded-2xl p-10 w-full max-w-sm text-center shadow-2xl"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Building2 size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">Citylink Group</h1>
        <p className="text-sm text-gray-500 mb-2">Collection CRM</p>
        <div className="h-px bg-gray-100 my-6" />
        <p className="text-sm text-gray-500 mb-5">Sign in to your account</p>
        <div id="google-btn" className="flex justify-center" />
        <p className="text-xs text-gray-400 mt-6">Authorized users only · Internal system</p>
      </motion.div>
    </div>
  )
}
