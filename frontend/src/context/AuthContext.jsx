import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kotu_user')) } catch { return null }
  })

  function login(userData) {
    setUser(userData)
    localStorage.setItem('kotu_user', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('kotu_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
