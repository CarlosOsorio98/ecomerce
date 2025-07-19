import { createElement } from '../lib/spa.js'
import { toggleFavorite, isFavorite, isAuthenticated } from '../lib/state.js'

export function createHeartButton(productId, options = {}) {
  const { size = '24', className = '' } = options
  
  const createHeartSVG = (isFav) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', size)
    svg.setAttribute('height', size)
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('class', 'heart-svg')
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')
    path.setAttribute('stroke', '#666')
    path.setAttribute('stroke-width', '2')
    path.setAttribute('fill', isFav ? '#e74c3c' : 'none')
    path.setAttribute('class', 'heart-path')
    
    svg.appendChild(path)
    return svg
  }

  const updateHeartButton = (button, isFav) => {
    const svg = button.querySelector('.heart-svg')
    const path = svg.querySelector('.heart-path')
    
    // Add animation class
    button.classList.add('heart-animating')
    
    // Update fill and stroke
    path.setAttribute('fill', isFav ? '#e74c3c' : 'none')
    path.setAttribute('stroke', isFav ? '#e74c3c' : '#666')
    
    // Update aria label
    button.setAttribute('aria-label', isFav ? 'Quitar de favoritos' : 'Agregar a favoritos')
    button.classList.toggle('favorite', isFav)
    
    // Remove animation class after animation completes
    setTimeout(() => {
      button.classList.remove('heart-animating')
    }, 300)
  }

  const heartButton = createElement('button', {
    className: `heart-button ${className}`,
    onclick: async (e) => {
      e.stopPropagation() // Prevent parent click events
      
      if (!isAuthenticated()) {
        alert('Debes iniciar sesión para usar favoritos')
        return
      }

      try {
        heartButton.disabled = true
        await toggleFavorite(productId)
        // State is updated optimistically, just update UI
        const newIsFavorite = isFavorite(productId)
        updateHeartButton(heartButton, newIsFavorite)
      } catch (error) {
        console.error('Error toggling favorite:', error)
        alert('Error al actualizar favoritos')
      } finally {
        heartButton.disabled = false
      }
    }
  })

  // Initial state
  const initialIsFavorite = isFavorite(productId)
  const svg = createHeartSVG(initialIsFavorite)
  heartButton.appendChild(svg)
  heartButton.setAttribute('aria-label', initialIsFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos')
  heartButton.classList.toggle('favorite', initialIsFavorite)

  return heartButton
}