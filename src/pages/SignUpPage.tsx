import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await signUp(email, password)
    if (err) {
      setError(err.message)
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
          <h1 className="font-display text-2xl text-off-white mt-2">Create account</h1>
          <p className="mt-2 text-cream/40 text-sm">Start building your archive</p>
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
              placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="block font-mono text-xs tracking-widest uppercase text-cream/40 mb-2">Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
              className="w-full bg-cream/5 border border-cream/15 rounded-lg px-4 py-3 text-sm text-off-white placeholder-cream/25 focus:outline-none focus:border-cream/40 transition-colors"
              placeholder="••••••••" />
          </div>

          {error && <p className="text-dusty-pink text-xs font-mono text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-cream text-charcoal font-mono text-sm tracking-widest uppercase py-3 rounded-lg hover:bg-off-white transition-colors disabled:opacity-50">
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-cream/30 text-sm font-mono">
          Already have an account?{' '}
          <Link to="/login" className="text-cream/60 hover:text-cream underline underline-offset-4 transition-colors">
            Sign in
          </Link>
        </p>
        <div className="mt-4 text-center">
          <Link to="/" className="font-mono text-xs text-cream/20 hover:text-cream/40 transition-colors">← Back to gallery</Link>
        </div>
      </motion.div>
    </div>
  )
}
