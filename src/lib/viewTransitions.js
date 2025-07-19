/**
 * View Transition Service for SPA - Factory Pattern
 * Manages smooth transitions between views with unique element references
 */

const createViewTransitionService = () => {
  const supportsViewTransitions = 'startViewTransition' in document
  const activeTransitions = new Map() // Store active transition references
  let transitionCounter = 0

  /**
   * Check if browser supports View Transitions API
   */
  const isSupported = () => supportsViewTransitions

  /**
   * Set unique transition name for an element
   * @param {HTMLElement} element - The element to set transition name
   * @param {string} identifier - Unique identifier (e.g., product-image-123)
   */
  const setTransitionName = (element, identifier) => {
    if (!element || !identifier) return

    if (supportsViewTransitions) {
      element.style.viewTransitionName = identifier
      activeTransitions.set(identifier, {
        element,
        timestamp: Date.now()
      })
    }
  }

  /**
   * Remove transition name from element
   * @param {string} identifier - The identifier to remove
   */
  const removeTransitionName = (identifier) => {
    if (activeTransitions.has(identifier)) {
      const transition = activeTransitions.get(identifier)
      if (transition.element && transition.element.style) {
        transition.element.style.viewTransitionName = ''
      }
      activeTransitions.delete(identifier)
    }
  }

  /**
   * Generate unique transition identifier
   * @param {string} type - Type of element (image, title, card)
   * @param {string|number} id - Unique ID (product ID, etc.)
   */
  const generateIdentifier = (type, id) => {
    return `${type}-${id}-${++transitionCounter}`
  }

  /**
   * Set product transition names (image and title)
   * @param {HTMLElement} container - Container element with image and title
   * @param {string|number} productId - Product ID
   */
  const setProductTransition = (container, productId) => {
    if (!container || !productId) return

    const img = container.querySelector('img')
    const title = container.querySelector('h3, h4, h1')

    if (img) {
      setTransitionName(img, `product-image-${productId}`)
    }
    if (title) {
      setTransitionName(title, `product-title-${productId}`)
    }

    return {
      imageId: img ? `product-image-${productId}` : null,
      titleId: title ? `product-title-${productId}` : null
    }
  }

  /**
   * Execute view transition with fallback
   * @param {Function} updateCallback - Function to execute during transition
   * @returns {Promise} - Transition promise
   */
  const executeTransition = async (updateCallback) => {
    if (!updateCallback || typeof updateCallback !== 'function') {
      throw new Error('Update callback is required')
    }

    // Fallback for browsers that don't support View Transitions
    if (!supportsViewTransitions) {
      updateCallback()
      return Promise.resolve()
    }

    // With View Transitions API
    try {
      const transition = document.startViewTransition(() => updateCallback())
      return transition.finished
    } catch (error) {
      console.warn('View transition failed, falling back:', error)
      updateCallback()
      return Promise.resolve()
    }
  }

  /**
   * Navigate with transition
   * @param {string} path - Path to navigate to
   * @param {Function} router - Router navigation function
   */
  const navigateWithTransition = async (path, router) => {
    await executeTransition(() => {
      router(path)
    })
  }

  /**
   * Clean up old transitions (older than 5 seconds)
   */
  const cleanup = () => {
    const now = Date.now()
    const maxAge = 5000 // 5 seconds

    for (const [identifier, transition] of activeTransitions.entries()) {
      if (now - transition.timestamp > maxAge) {
        removeTransitionName(identifier)
      }
    }
  }

  /**
   * Clear all active transitions
   */
  const clearAll = () => {
    for (const identifier of activeTransitions.keys()) {
      removeTransitionName(identifier)
    }
    activeTransitions.clear()
  }

  // Auto cleanup every 10 seconds
  setInterval(cleanup, 10000)

  return {
    isSupported,
    setTransitionName,
    removeTransitionName,
    generateIdentifier,
    setProductTransition,
    executeTransition,
    navigateWithTransition,
    cleanup,
    clearAll
  }
}

// Export factory function and create singleton instance
export const createViewTransitions = createViewTransitionService
export const viewTransitions = createViewTransitionService()