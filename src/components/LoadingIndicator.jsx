import React from 'react'

const LoadingIndicator = () => {
  return (
    <div id="loading-indicator" style={{ display: 'flex' }}>
      <div className="loader-container">
        <div className="modern-loader">
          <div className="loader-ring" />
          <div className="loader-dot" />
        </div>
      </div>
      <div className="loading-text">
        <div className="loading-main">Cargando...</div>
      </div>
    </div>
  )
}

export default LoadingIndicator
