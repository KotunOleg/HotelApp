const uri = '/api/hotels';
let hotels = [];

function getHotels() {
  fetch(uri)
    .then(r => r.json())
    .then(data => displayHotels(data))
    .catch(err => console.error('Помилка завантаження готелів:', err));
}

function addHotel() {
  const hotel = {
    name:        document.getElementById('add-name').value.trim(),
    address:     document.getElementById('add-address').value.trim(),
    city:        document.getElementById('add-city').value.trim(),
    country:     document.getElementById('add-country').value.trim(),
    star_rating: parseInt(document.getElementById('add-stars').value),
    phone:       document.getElementById('add-phone').value.trim(),
  };

  fetch(uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(hotel),
  })
    .then(r => r.json())
    .then(() => {
      getHotels();
      ['add-name','add-address','add-city','add-country','add-stars','add-phone']
        .forEach(id => document.getElementById(id).value = '');
    })
    .catch(err => console.error('Помилка додавання:', err));
}

function deleteHotel(id) {
  if (!confirm('Видалити готель?')) return;
  fetch(`${uri}/${id}`, { method: 'DELETE' })
    .then(() => getHotels())
    .catch(err => console.error('Помилка видалення:', err));
}

function showEditForm(id) {
  const h = hotels.find(h => h.hotel_id === id);
  if (!h) return;
  document.getElementById('edit-id').value      = h.hotel_id;
  document.getElementById('edit-name').value    = h.name;
  document.getElementById('edit-address').value = h.address;
  document.getElementById('edit-city').value    = h.city;
  document.getElementById('edit-country').value = h.country;
  document.getElementById('edit-stars').value   = h.star_rating;
  document.getElementById('edit-phone').value   = h.phone;
  document.getElementById('editHotel').style.display = 'block';
}

function updateHotel() {
  const id = document.getElementById('edit-id').value;
  const hotel = {
    name:        document.getElementById('edit-name').value.trim(),
    address:     document.getElementById('edit-address').value.trim(),
    city:        document.getElementById('edit-city').value.trim(),
    country:     document.getElementById('edit-country').value.trim(),
    star_rating: parseInt(document.getElementById('edit-stars').value),
    phone:       document.getElementById('edit-phone').value.trim(),
  };

  fetch(`${uri}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(hotel),
  })
    .then(() => { getHotels(); closeEdit(); })
    .catch(err => console.error('Помилка оновлення:', err));
}

function closeEdit() {
  document.getElementById('editHotel').style.display = 'none';
}

function displayHotels(data) {
  const tbody = document.getElementById('hotels-body');
  tbody.innerHTML = '';
  hotels = data;

  document.getElementById('counter').textContent = `Всього готелів: ${data.length}`;

  data.forEach(h => {
    const tr = tbody.insertRow();
    [h.name, h.address, h.city, h.country, '⭐'.repeat(h.star_rating), h.phone || '—']
      .forEach(val => { tr.insertCell().textContent = val; });

    const td = tr.insertCell();
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Редагувати';
    editBtn.onclick = () => showEditForm(h.hotel_id);

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Видалити';
    delBtn.className = 'delete';
    delBtn.onclick = () => deleteHotel(h.hotel_id);

    td.appendChild(editBtn);
    td.appendChild(delBtn);
  });
}
