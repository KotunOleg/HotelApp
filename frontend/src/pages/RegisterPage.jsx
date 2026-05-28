import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Hotel } from 'lucide-react'
import { api } from '../api'

export default function RegisterPage() {
  const [form, setForm]   = useState({ full_name: '', email: '', phone: '', password: '', permission_level: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const phoneValid = form.phone === '' || /^\+[1-9]\d{7,14}$/.test(form.phone)

  async function submit(e) {
    e.preventDefault()
    if (!phoneValid) {
      setError('Невірний формат телефону. Використовуйте формат +380XXXXXXXXX')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.auth.register(form)
      navigate('/login')
    } catch {
      setError('Помилка реєстрації. Можливо, email вже використовується.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4">
            <Hotel size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Створити акаунт</h1>
          <p className="text-gray-500 mt-1">Заповніть форму для реєстрації</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Повне ім'я</label>
              <input className="input" placeholder="Іван Петренко"
                value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="example@email.com"
                value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Телефон</label>
              <input
                type="tel"
                className={`input ${form.phone && !phoneValid ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="+380501234567"
                value={form.phone}
                onChange={set('phone')}
                required
              />
              {form.phone && !phoneValid && (
                <p className="text-red-500 text-xs mt-1">Формат: +380XXXXXXXXX (міжнародний)</p>
              )}
            </div>
            <div>
              <label className="label">Пароль</label>
              <input type="password" className="input" placeholder="Мінімум 6 символів"
                value={form.password} onChange={set('password')} required minLength={6} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Реєстрація...' : 'Зареєструватися'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Вже є акаунт?{' '}
            <Link to="/login" className="text-brand-600 hover:underline font-medium">Увійти</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
