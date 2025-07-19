import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useStore } from './store/index.js'

// React Router components
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Import converted React components
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import FloatingCart from './components/FloatingCart.jsx'
import LoadingIndicator from './components/LoadingIndicator.jsx'

// Import converted React views
import HomeView from './views/Home.jsx'
import LoginView from './views/Login.jsx'
import RegisterView from './views/Register.jsx'
import ProfileView from './views/Profile.jsx'
import ProductView from './views/Product.jsx'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const { checkSession, syncCart } = useStore()

  useEffect(() => {
    let startTime = Date.now()
    
    async function initializeApp() {
      try {
        await checkSession()
        await syncCart()
      } catch (error) {
        console.error('Error al inicializar la aplicación:', error)
      } finally {
        // Ensure loader is visible for at least 300ms
        const elapsed = Date.now() - startTime
        const minDisplayTime = 300
        const remainingTime = Math.max(0, minDisplayTime - elapsed)
        
        setTimeout(() => {
          setIsLoading(false)
        }, remainingTime)
      }
    }

    initializeApp()
  }, [checkSession, syncCart])

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main id="app">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/product/:id" element={<ProductView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <FloatingCart />
      </div>
    </Router>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
