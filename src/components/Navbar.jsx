import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/index.js'

const Navbar = () => {
  const { user, isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async (e) => {
    e.preventDefault()
    await signOut()
    navigate('/')
  }

  return (
    <header>
      <nav>
        <Link to="/" data-link="true">
          <h1>Mi Tienda</h1>
        </Link>
        
        <ul id="main-nav-links">
          <li>
            <Link to="/" data-link="true">Inicio</Link>
          </li>
          
          {isAuthenticated && user ? (
            <>
              <li>
                <Link to="/profile" data-link="true">{user.name}</Link>
              </li>
              <li>
                <button 
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" data-link="true">Iniciar Sesión</Link>
              </li>
              <li>
                <Link to="/register" data-link="true">Registro</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar