window.onload = function () {
  fetch('/get-items')
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const items = data.items
        items.forEach((item) => {
          addItemToList(item.item, item.id, item.imagePath)
        })
      }
    })
}

document.getElementById('groceryForm').onsubmit = function (event) {
  event.preventDefault()
  const newItem = document.getElementById('newItem').value
  if (newItem) {
    fetch('/add-item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ item: newItem }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          addItemToList(newItem, data.id, '/public/images/' + newItem + '.png')
          document.getElementById('newItem').value = '' // Clear input after adding
        }
      })
  }
}

function addItemToList(item, id, imagePath) {
  const ul = document.getElementById('itemList')
  const li = document.createElement('li')
  li.textContent = item
  li.id = 'item-' + id

  const img = document.createElement('img')
  img.src = imagePath
  img.alt = item
  img.style.height = '50px' // Set image size as needed

  const deleteButton = document.createElement('button')
  deleteButton.className = 'btn btn-danger btn-sm' // Bootstrap classes for small, red button
  deleteButton.innerHTML = '<i class="bi bi-trash"></i>' // Using Bootstrap Icons
  deleteButton.onclick = function () {
    fetch('/delete-item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const itemElement = document.getElementById('item-' + id)
          itemElement.remove() // Remove the item from the list
        }
      })
  }

  li.appendChild(img)
  li.appendChild(deleteButton)
  ul.appendChild(li)
}