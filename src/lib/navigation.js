/**
 * Consistent navigation helper for smooth transitions
 */

/**
 * Navigate with consistent smooth transitions
 * @param {string} path - The path to navigate to
 * @param {Function} router - The router instance with navigateTo method
 */
export function smoothNavigate(path, router) {
  if ('startViewTransition' in document) {
    document.startViewTransition(() => {
      router.navigateTo(path)
    })
  } else {
    router.navigateTo(path)
  }
}

/**
 * Navigate to product with transition names for shared element animation
 * @param {string} productId - The product ID
 * @param {HTMLElement} element - The element containing product image/title
 * @param {Function} router - The router instance
 * @param {Object} viewTransitions - The view transitions service
 */
export function navigateToProduct(productId, element, router, viewTransitions) {
  // Set transition names for smooth navigation
  viewTransitions.setProductTransition(element, productId)
  
  // Navigate with transition
  smoothNavigate(`/product/${productId}`, router)
}

/**
 * Navigate to auth page with specific transition
 * @param {string} authPath - 'login' or 'register'
 * @param {Function} router - The router instance
 */
export function navigateToAuth(authPath, router) {
  smoothNavigate(`/${authPath}`, router)
}

/**
 * Navigate back to home with transition
 * @param {Function} router - The router instance
 */
export function navigateToHome(router) {
  smoothNavigate('/', router)
}