import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError('Invalid credentials. Please try again.')
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-cream/40 mb-2">Crony</p>
          <h1 className="font-display text-2xl text-off-white">Admin Access</h1>
          <p className="mt-2 text-cream/40 text-sm">Sign in to manage your archive</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs tracking-widest uppercase text-cream/40 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-cream/5 border border-cream/15 rounded-lg px-4 py-3 text-sm text-off-white placeholder-cream/25 focus:outline-none focus:border-cream/40 transition-colors font-sans"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block font-mono text-xs tracking-widest uppercase text-cream/40 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-cream/5 border border-cream/15 rounded-lg px-4 py-3 text-sm text-off-white placeholder-cream/25 focus:outline-none focus:border-cream/40 transition-colors font-sans"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-dusty-pink text-xs font-mono text-center">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-cream text-charcoal font-mono text-sm tracking-widest uppercase py-3 rounded-lg hover:bg-off-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/" className="font-mono text-xs tracking-widest uppercase text-cream/25 hover:text-cream/50 transition-colors">
            ← Back to Gallery
          </a>
        </div>
      </motion.div>
    </div>
  )
}
