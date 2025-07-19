// Admin Panel JavaScript
import './admin.css'

let adminToken = ''

async function login() {
  const key = document.getElementById('adminKey').value.trim()
  adminToken = key
  console.log('Intentando login con key:', key)

  try {
    const response = await fetch('/api/admin/products', {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      console.log('Login exitoso')
      document.getElementById('loginForm').style.display = 'none'
      document.getElementById('adminPanel').style.display = 'block'
      loadProducts()
    } else {
      const error = await response.json()
      console.error('Error de login:', error)
      alert('Contraseña incorrecta')
    }
  } catch (error) {
    console.error('Error en login:', error)
    alert('Error al iniciar sesión')
  }
}

async function loadProducts() {
  try {
    const response = await fetch('/api/admin/products', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })
    const products = await response.json()

    const grid = document.getElementById('productGrid')
    grid.innerHTML = products
      .map(
        (product) => {
          const imageUrl = product.assets && product.assets.length > 0 
            ? (product.assets[0].url || product.assets[0].url_local || '/placeholder.jpg')
            : '/placeholder.jpg'
          
          return `
              <div class="product-card">
                  <img src="${imageUrl}" alt="${product.name}">
                  <h3>${product.name}</h3>
                  <p class="description">${product.description || 'Sin descripción'}</p>
                  <p class="price">$${product.price}</p>
                  <button class="edit-btn" onclick="openEditModal('${product.id}', '${product.name}', '${product.price}', '${product.description || ''}')">Editar</button>
                  <button class="delete-btn" onclick="deleteProduct('${product.id}')">Eliminar</button>
              </div>
          `
        }
      )
      .join('')
  } catch (error) {
    alert('Error al cargar productos')
  }
}

async function addProduct(event) {
  event.preventDefault()

  const formData = new FormData()
  formData.append('name', document.getElementById('productName').value)
  formData.append('description', document.getElementById('productDescription').value)
  formData.append('price', document.getElementById('productPrice').value)
  formData.append(
    'file',
    document.getElementById('productImage').files[0]
  )

  try {
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    })

    if (response.ok) {
      document.getElementById('addProductForm').reset()
      loadProducts()
    } else {
      alert('Error al añadir producto')
    }
  } catch (error) {
    alert('Error al añadir producto')
  }
}

async function deleteProduct(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
    return
  }

  try {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })

    if (response.ok) {
      loadProducts()
    } else {
      alert('Error al eliminar producto')
    }
  } catch (error) {
    alert('Error al eliminar producto')
  }
}

function openEditModal(id, name, price, description) {
  document.getElementById('editProductId').value = id
  document.getElementById('editProductName').value = name
  document.getElementById('editProductDescription').value = description
  document.getElementById('editProductPrice').value = price
  document.getElementById('editModal').style.display = 'block'
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none'
  document.getElementById('editProductForm').reset()
}

async function updateProduct(event) {
  event.preventDefault()

  const formData = new FormData()
  formData.append('name', document.getElementById('editProductName').value)
  formData.append('description', document.getElementById('editProductDescription').value)
  formData.append('price', document.getElementById('editProductPrice').value)
  
  const fileInput = document.getElementById('editProductImage')
  if (fileInput.files[0]) {
    formData.append('file', fileInput.files[0])
  }

  const productId = document.getElementById('editProductId').value

  try {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    })

    if (response.ok) {
      closeEditModal()
      loadProducts()
      alert('Producto actualizado exitosamente')
    } else {
      alert('Error al actualizar producto')
    }
  } catch (error) {
    alert('Error al actualizar producto')
  }
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('editModal')
  if (event.target === modal) {
    closeEditModal()
  }
}

// Export functions to global scope for HTML onclick handlers
window.login = login
window.addProduct = addProduct
window.deleteProduct = deleteProduct
window.openEditModal = openEditModal
window.closeEditModal = closeEditModal
window.updateProduct = updateProduct