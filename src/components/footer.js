import { createElement } from '../lib/spa.js'

export function createFooter() {
  const footer = createElement('footer')
  
  const footerContent = createElement('div', { className: 'footer-content' })
  
  // About section
  const aboutSection = createElement(
    'div',
    { className: 'footer-section' },
    createElement('h3', {}, 'Sobre Nosotros'),
    createElement(
      'p',
      {},
      'Somos tu tienda de confianza para encontrar las mejores prendas de vestir con la mejor calidad y precios.'
    )
  )
  
  // Links section
  const linksSection = createElement(
    'div',
    { className: 'footer-section' },
    createElement('h3', {}, 'Enlaces Útiles'),
    createElement(
      'ul',
      {},
      createElement(
        'li',
        {},
        createElement('a', { href: '/', 'data-link': true }, 'Inicio')
      ),
      createElement(
        'li',
        {},
        createElement('a', { href: '#' }, 'Términos y Condiciones')
      ),
      createElement(
        'li',
        {},
        createElement('a', { href: '#' }, 'Política de Privacidad')
      ),
      createElement(
        'li',
        {},
        createElement('a', { href: '#' }, 'Preguntas Frecuentes')
      )
    )
  )
  
  // Contact section
  const contactSection = createElement(
    'div',
    { className: 'footer-section' },
    createElement('h3', {}, 'Contacto'),
    createElement(
      'ul',
      {},
      createElement('li', {}, 'Email: info@mitienda.com'),
      createElement('li', {}, 'Teléfono: (123) 456-7890'),
      createElement('li', {}, 'Dirección: Calle Principal #123')
    )
  )
  
  footerContent.appendChild(aboutSection)
  footerContent.appendChild(linksSection)
  footerContent.appendChild(contactSection)
  
  const footerBottom = createElement(
    'div',
    { className: 'footer-bottom' },
    createElement('p', {}, '© 2025 Mi Tienda. Todos los derechos reservados.')
  )
  
  footer.appendChild(footerContent)
  footer.appendChild(footerBottom)
  
  return footer
}