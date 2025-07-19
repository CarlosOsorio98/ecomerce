import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/index.js'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await signIn(email, password)
      navigate('/')
    } catch (loginError) {
      console.error('Login error:', loginError)
      let msg = 'Error al iniciar sesión'
      
      if (loginError instanceof Error) {
        msg = loginError.message
      } else if (loginError && typeof loginError === 'object') {
        if (loginError.error) msg = loginError.error
        else if (loginError.message) msg = loginError.message
        else msg = 'Error desconocido al iniciar sesión'
      } else if (typeof loginError === 'string') {
        msg = loginError
      }
      
      setError(msg)
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        
        {error && (
          <div className="error-message" style={{ marginBottom: '1rem', color: 'red' }}>
            {error}
          </div>
        )}
        
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        
        <div className="auth-footer">
          <p>¿No tienes cuenta? </p>
          <Link to="/register" data-link="true">
            Regístrate
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Login