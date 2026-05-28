import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Hotel, Eye, EyeOff, LogIn } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm]       = useState({ login: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()
  const { state } = useLocation()
  const { login } = useAuth()

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.auth.login(form)
      login({ user_id: data.user_id, full_name: data.full_name, email: data.email })
      navigate(state?.from ?? '/')
    } catch {
      setError('Невірний логін або пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4">
            <Hotel size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Вхід в акаунт</h1>
          <p className="text-gray-500 mt-1">Введіть свої дані для входу</p>
        </div>

        <div className="card p-8">
          {state?.message && (
            <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <LogIn size={15} /> {state.message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email або телефон</label>
              <input
                className="input"
                placeholder="example@email.com"
                value={form.login}
                onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Пароль</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Немає акаунту?{' '}
            <Link to="/register" className="text-brand-600 hover:underline font-medium">
              Зареєструватись
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
