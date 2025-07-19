import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-section">
          <h3>Sobre Nosotros</h3>
          <p>
            Somos tu tienda de confianza para encontrar las mejores prendas de vestir con la mejor calidad y precios.
          </p>
        </div>
        
        <div className="footer-section">
          <h3>Enlaces Útiles</h3>
          <ul>
            <li>
              <Link to="/" data-link="true">Inicio</Link>
            </li>
            <li>
              <a href="#">Términos y Condiciones</a>
            </li>
            <li>
              <a href="#">Política de Privacidad</a>
            </li>
            <li>
              <a href="#">Preguntas Frecuentes</a>
            </li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contacto</h3>
          <ul>
            <li>Email: info@mitienda.com</li>
            <li>Teléfono: (123) 456-7890</li>
            <li>Dirección: Calle Principal #123</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2025 Mi Tienda. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer