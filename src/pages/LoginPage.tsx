import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'

export default function LoginPage() {
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
    const { error: err } = await signIn(email, password)
    if (err) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link to="/" className="font-mono text-xs tracking-[0.2em] uppercase text-cream/40 hover:text-cream/60 transition-colors">
            Crony
          </Link>
          <h1 className="font-display text-2xl text-off-white mt-2">Welcome back</h1>
          <p className="mt-2 text-cream/40 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs tracking-widest uppercase text-cream/40 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-cream/5 border border-cream/15 rounded-lg px-4 py-3 text-sm text-off-white placeholder-cream/25 focus:outline-none focus:border-cream/40 transition-colors"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block font-mono text-xs tracking-widest uppercase text-cream/40 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-cream/5 border border-cream/15 rounded-lg px-4 py-3 text-sm text-off-white placeholder-cream/25 focus:outline-none focus:border-cream/40 transition-colors"
              placeholder="••••••••" />
          </div>

          {error && <p className="text-dusty-pink text-xs font-mono text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-cream text-charcoal font-mono text-sm tracking-widest uppercase py-3 rounded-lg hover:bg-off-white transition-colors disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-cream/30 text-sm font-mono">
          No account?{' '}
          <Link to="/signup" className="text-cream/60 hover:text-cream underline underline-offset-4 transition-colors">
            Sign up
          </Link>
        </p>
        <div className="mt-4 text-center">
          <Link to="/" className="font-mono text-xs text-cream/20 hover:text-cream/40 transition-colors">← Back to gallery</Link>
        </div>
      </motion.div>
    </div>
  )
}
