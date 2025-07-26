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
                  <p class="price">${product.sizes && product.sizes.length > 0 ? `$${product.price} (promedio)` : 'Sin tallas configuradas'}</p>
                  <button class="edit-btn" onclick="openEditModal('${product.id}', '${product.name}', '${product.description || ''}')">Editar</button>
                  <button class="sizes-btn" onclick="openSizesModal('${product.id}', '${product.name}')">Tallas</button>
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
  formData.append('price', '0') // Temporary price, will be set via sizes
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

function openEditModal(id, name, description) {
  document.getElementById('editProductId').value = id
  document.getElementById('editProductName').value = name
  document.getElementById('editProductDescription').value = description
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
  formData.append('price', '0') // Price is managed via sizes
  
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


// Size management functions
async function openSizesModal(productId, productName) {
  document.getElementById('sizesProductId').value = productId
  document.getElementById('sizesProductName').textContent = productName
  document.getElementById('sizesModal').style.display = 'block'
  await loadProductSizes(productId)
}

function closeSizesModal() {
  document.getElementById('sizesModal').style.display = 'none'
  document.getElementById('addSizeForm').reset()
}

async function loadProductSizes(productId) {
  try {
    const response = await fetch(`/api/admin/products/${productId}/sizes`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })
    const sizes = await response.json()

    const sizesList = document.getElementById('sizesList')
    sizesList.innerHTML = sizes
      .map(
        (size) => `
          <div class="size-item">
            <span class="size-info">
              <strong>${size.size}</strong> - $${size.price}
              ${size.stock ? ` (Stock: ${size.stock})` : ''}
            </span>
            <div class="size-actions">
              <button class="edit-size-btn" onclick="openEditSizeModal(${size.id}, '${size.size}', ${size.price}, ${size.stock || 0})">Editar</button>
              <button class="delete-size-btn" onclick="deleteSize(${size.id})">Eliminar</button>
            </div>
          </div>
        `
      )
      .join('')
  } catch (error) {
    alert('Error al cargar las tallas')
  }
}

async function addSize(event) {
  event.preventDefault()

  const productId = document.getElementById('sizesProductId').value
  const size = document.getElementById('sizeSize').value
  const price = parseFloat(document.getElementById('sizePrice').value)
  const stock = parseInt(document.getElementById('sizeStock').value) || 0

  try {
    const response = await fetch(`/api/admin/products/${productId}/sizes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ size, price, stock }),
    })

    if (response.ok) {
      document.getElementById('addSizeForm').reset()
      await loadProductSizes(productId)
    } else {
      alert('Error al añadir talla')
    }
  } catch (error) {
    alert('Error al añadir talla')
  }
}

function openEditSizeModal(sizeId, size, price, stock) {
  document.getElementById('editSizeId').value = sizeId
  document.getElementById('editSizeSize').value = size
  document.getElementById('editSizePrice').value = price
  document.getElementById('editSizeStock').value = stock
  document.getElementById('editSizeModal').style.display = 'block'
}

function closeEditSizeModal() {
  document.getElementById('editSizeModal').style.display = 'none'
  document.getElementById('editSizeForm').reset()
}

async function updateSize(event) {
  event.preventDefault()

  const sizeId = document.getElementById('editSizeId').value
  const size = document.getElementById('editSizeSize').value
  const price = parseFloat(document.getElementById('editSizePrice').value)
  const stock = parseInt(document.getElementById('editSizeStock').value) || 0

  try {
    const response = await fetch(`/api/admin/products/0/sizes/${sizeId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ size, price, stock }),
    })

    if (response.ok) {
      closeEditSizeModal()
      const productId = document.getElementById('sizesProductId').value
      await loadProductSizes(productId)
    } else {
      alert('Error al actualizar talla')
    }
  } catch (error) {
    alert('Error al actualizar talla')
  }
}

async function deleteSize(sizeId) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta talla?')) {
    return
  }

  try {
    const response = await fetch(`/api/admin/products/0/sizes/${sizeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })

    if (response.ok) {
      const productId = document.getElementById('sizesProductId').value
      await loadProductSizes(productId)
    } else {
      alert('Error al eliminar talla')
    }
  } catch (error) {
    alert('Error al eliminar talla')
  }
}

// Close modals when clicking outside
window.onclick = function(event) {
  const editModal = document.getElementById('editModal')
  const sizesModal = document.getElementById('sizesModal')
  const editSizeModal = document.getElementById('editSizeModal')
  
  if (event.target === editModal) {
    closeEditModal()
  } else if (event.target === sizesModal) {
    closeSizesModal()
  } else if (event.target === editSizeModal) {
    closeEditSizeModal()
  }
}

// Export functions to global scope for HTML onclick handlers
window.login = login
window.addProduct = addProduct
window.deleteProduct = deleteProduct
window.openEditModal = openEditModal
window.closeEditModal = closeEditModal
window.updateProduct = updateProduct
window.openSizesModal = openSizesModal
window.closeSizesModal = closeSizesModal
window.addSize = addSize
window.openEditSizeModal = openEditSizeModal
window.closeEditSizeModal = closeEditSizeModal
window.updateSize = updateSize
window.deleteSize = deleteSize