const treatmentFilters = ['All', 'Massage', 'Facial', 'Sauna', 'Couples', 'Recovery'];

const spas = [
  {
    id: 'oasis',
    name: 'Oasis Spa',
    neighborhood: 'Union Square',
    subtitle: 'Calm treatment rooms, excellent therapists, same-day massage.',
    rating: 4.8,
    reviews: 212,
    distance: 0.8,
    open: true,
    priceLevel: '$$',
    image: '/assets/spa1.png',
    lat: 37.7895,
    lng: -122.4082,
    tags: ['Massage', 'Facial', 'Recovery'],
    amenities: ['Private suites', 'Aromatherapy', 'Quiet lounge'],
    services: [
      { id: 'swedish', name: 'Swedish Massage', minutes: 60, price: 120 },
      { id: 'deep', name: 'Deep Tissue Massage', minutes: 75, price: 145 },
      { id: 'facial', name: 'Glow Facial', minutes: 60, price: 125 }
    ],
    times: ['10:30 AM', '12:00 PM', '2:30 PM', '5:00 PM']
  },
  {
    id: 'zen',
    name: 'Zen Sanctuary',
    neighborhood: 'SoMa',
    subtitle: 'Thermal suites, hot stone bodywork, and deep reset rituals.',
    rating: 4.9,
    reviews: 142,
    distance: 1.2,
    open: true,
    priceLevel: '$$$',
    image: '/assets/spa2.png',
    lat: 37.7882,
    lng: -122.4012,
    tags: ['Sauna', 'Massage', 'Couples'],
    amenities: ['Thermal circuit', 'Couples suite', 'Rain showers'],
    services: [
      { id: 'hot-stone', name: 'Hot Stone Healing', minutes: 90, price: 170 },
      { id: 'thermal', name: 'Thermal Bath Pass', minutes: 120, price: 95 },
      { id: 'couples', name: 'Couples Retreat', minutes: 90, price: 310 }
    ],
    times: ['11:00 AM', '1:15 PM', '3:30 PM', '6:15 PM']
  },
  {
    id: 'luma',
    name: 'Luma Skin Studio',
    neighborhood: 'Hayes Valley',
    subtitle: 'Facials, LED therapy, and sculpting treatments with visible glow.',
    rating: 4.7,
    reviews: 98,
    distance: 1.7,
    open: false,
    priceLevel: '$$',
    image: '/assets/spa1.png',
    lat: 37.7767,
    lng: -122.4241,
    tags: ['Facial', 'Recovery'],
    amenities: ['LED therapy', 'Clean products', 'Skin scan'],
    services: [
      { id: 'signature-facial', name: 'Signature Facial', minutes: 50, price: 105 },
      { id: 'led', name: 'LED Recovery Facial', minutes: 45, price: 90 },
      { id: 'sculpt', name: 'Lift and Sculpt', minutes: 70, price: 150 }
    ],
    times: ['9:30 AM', '12:45 PM', '4:15 PM']
  },
  {
    id: 'harbor',
    name: 'Harbor Bathhouse',
    neighborhood: 'Embarcadero',
    subtitle: 'Bathhouse access, mineral soaks, sauna, and post-work recovery.',
    rating: 4.6,
    reviews: 176,
    distance: 2.1,
    open: true,
    priceLevel: '$',
    image: '/assets/spa2.png',
    lat: 37.7955,
    lng: -122.3937,
    tags: ['Sauna', 'Recovery'],
    amenities: ['Mineral pools', 'Cold plunge', 'Steam room'],
    services: [
      { id: 'day-pass', name: 'Bathhouse Day Pass', minutes: 150, price: 68 },
      { id: 'sports', name: 'Sports Recovery Massage', minutes: 60, price: 130 },
      { id: 'sauna', name: 'Private Sauna', minutes: 45, price: 72 }
    ],
    times: ['8:45 AM', '10:45 AM', '1:45 PM', '7:00 PM']
  }
];

const state = {
  view: 'discover',
  filter: 'All',
  query: '',
  sort: 'recommended',
  selectedSpaId: spas[0].id,
  selectedServiceId: spas[0].services[0].id,
  selectedDate: 0,
  selectedTime: spas[0].times[2],
  openOnly: false,
  bookings: [
    {
      id: 'BK-991',
      spaName: 'Oasis Spa',
      serviceName: 'Swedish Massage',
      dateLabel: 'Today',
      time: '5:00 PM',
      price: 120,
      image: '/assets/spa1.png'
    }
  ]
};

let map;
let markers = new Map();

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  renderFilters();
  renderAll();
  initMap();
  refreshIcons();
});

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  document.querySelectorAll('[data-map-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-map-mode]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      state.openOnly = button.dataset.mapMode === 'open';
      renderAll();
    });
  });

  document.getElementById('profile-button').addEventListener('click', () => setView('bookings'));
  document.getElementById('near-me-button').addEventListener('click', () => {
    showToast('Showing spas near Union Square');
    state.sort = 'distance';
    document.getElementById('sort-select').value = 'distance';
    renderAll();
  });

  document.getElementById('search-input').addEventListener('input', (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderAll();
  });

  document.getElementById('clear-search').addEventListener('click', () => {
    state.query = '';
    document.getElementById('search-input').value = '';
    renderAll();
  });

  document.getElementById('sort-select').addEventListener('change', (event) => {
    state.sort = event.target.value;
    renderAll();
  });
}

function setView(view) {
  state.view = view;
  document.querySelectorAll('.view-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
  document.querySelectorAll('.panel-view').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `${view}-view`);
  });
  renderBookings();
  renderPartner();
  refreshIcons();
}

function renderAll() {
  renderResults();
  renderDetail();
  renderBookings();
  renderPartner();
  syncMapMarkers();
  refreshIcons();
}

function renderFilters() {
  const strip = document.getElementById('filter-strip');
  strip.innerHTML = treatmentFilters.map((filter) => `
    <button class="filter-chip ${filter === state.filter ? 'active' : ''}" type="button" data-filter="${filter}">
      ${filter}
    </button>
  `).join('');

  strip.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      renderFilters();
      renderAll();
    });
  });
}

function getFilteredSpas() {
  const matches = spas.filter((spa) => {
    const matchesFilter = state.filter === 'All' || spa.tags.includes(state.filter);
    const haystack = [spa.name, spa.neighborhood, spa.subtitle, ...spa.tags, ...spa.amenities, ...spa.services.map((service) => service.name)]
      .join(' ')
      .toLowerCase();
    const matchesSearch = !state.query || haystack.includes(state.query);
    const matchesOpen = !state.openOnly || spa.open;
    return matchesFilter && matchesSearch && matchesOpen;
  });

  return matches.sort((a, b) => {
    if (state.sort === 'distance') return a.distance - b.distance;
    if (state.sort === 'rating') return b.rating - a.rating;
    if (state.sort === 'price') return getLowestPrice(a) - getLowestPrice(b);
    return (b.rating * 10 - b.distance) - (a.rating * 10 - a.distance);
  });
}

function renderResults() {
  const results = getFilteredSpas();
  const summary = document.getElementById('result-summary');
  const container = document.getElementById('spa-results');

  summary.textContent = `${results.length} spa${results.length === 1 ? '' : 's'} available nearby`;

  if (!results.some((spa) => spa.id === state.selectedSpaId) && results[0]) {
    selectSpa(results[0].id, false);
  }

  if (!results.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="search-x"></i>
        <h3>No spas found</h3>
        <p>Try a different treatment or clear the search.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map((spa) => `
    <article class="spa-card ${spa.id === state.selectedSpaId ? 'selected' : ''}" data-spa-id="${spa.id}">
      <img src="${spa.image}" alt="${spa.name}">
      <div class="spa-card-body">
        <div class="spa-card-top">
          <h3>${spa.name}</h3>
          <span>${spa.priceLevel}</span>
        </div>
        <p>${spa.neighborhood} - ${spa.distance.toFixed(1)} mi</p>
        <div class="rating-line">
          <i data-lucide="star"></i>
          <strong>${spa.rating}</strong>
          <span>${spa.reviews} reviews</span>
        </div>
        <div class="tag-row">${spa.tags.slice(0, 3).map((tag) => `<span>${tag}</span>`).join('')}</div>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('[data-spa-id]').forEach((card) => {
    card.addEventListener('click', () => selectSpa(card.dataset.spaId));
  });
}

function renderDetail() {
  const spa = getSelectedSpa();
  const panel = document.getElementById('detail-panel');
  if (!spa) {
    panel.innerHTML = '';
    return;
  }

  if (!spa.services.some((service) => service.id === state.selectedServiceId)) {
    state.selectedServiceId = spa.services[0].id;
  }
  if (!spa.times.includes(state.selectedTime)) {
    state.selectedTime = spa.times[0];
  }

  const selectedService = getSelectedService();
  panel.innerHTML = `
    <div class="detail-media" style="background-image:url('${spa.image}')">
      <button class="icon-button glass" id="close-detail" type="button" aria-label="Close details">
        <i data-lucide="x"></i>
      </button>
    </div>
    <div class="detail-content">
      <div class="detail-heading">
        <div>
          <p class="eyebrow">${spa.neighborhood} - ${spa.open ? 'Open now' : 'Opens tomorrow'}</p>
          <h2>${spa.name}</h2>
        </div>
        <div class="score-pill">
          <i data-lucide="star"></i>
          ${spa.rating}
        </div>
      </div>
      <p class="detail-copy">${spa.subtitle}</p>
      <div class="amenity-row">
        ${spa.amenities.map((item) => `<span>${item}</span>`).join('')}
      </div>

      <div class="service-list">
        ${spa.services.map((service) => `
          <button class="service-option ${service.id === state.selectedServiceId ? 'active' : ''}" type="button" data-service-id="${service.id}">
            <span>
              <strong>${service.name}</strong>
              <small>${service.minutes} min</small>
            </span>
            <b>$${service.price}</b>
          </button>
        `).join('')}
      </div>

      <div class="date-strip" id="date-strip">
        ${getDateOptions().map((date, index) => `
          <button class="date-pill ${index === state.selectedDate ? 'active' : ''}" type="button" data-date-index="${index}">
            <span>${date.day}</span>
            <strong>${date.date}</strong>
          </button>
        `).join('')}
      </div>

      <div class="time-grid">
        ${spa.times.map((time) => `
          <button class="time-slot ${time === state.selectedTime ? 'active' : ''}" type="button" data-time="${time}">
            ${time}
          </button>
        `).join('')}
      </div>

      <button class="book-button" id="book-button" type="button">
        <i data-lucide="calendar-plus"></i>
        Book ${selectedService.name} - $${selectedService.price}
      </button>
    </div>
  `;

  panel.querySelector('#close-detail').addEventListener('click', () => {
    panel.classList.remove('open');
  });
  panel.querySelectorAll('[data-service-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedServiceId = button.dataset.serviceId;
      renderDetail();
    });
  });
  panel.querySelectorAll('[data-date-index]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedDate = Number(button.dataset.dateIndex);
      renderDetail();
    });
  });
  panel.querySelectorAll('[data-time]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedTime = button.dataset.time;
      renderDetail();
    });
  });
  panel.querySelector('#book-button').addEventListener('click', bookSelectedService);
  panel.classList.add('open');
}

async function bookSelectedService() {
  const spa = getSelectedSpa();
  const service = getSelectedService();
  const date = getDateOptions()[state.selectedDate];

  try {
    const response = await fetch('/api/v1/demo/hold-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spa_id: spa.id,
        slot_time: `${date.full}_${state.selectedTime}`
      })
    });

    if (!response.ok) {
      showToast('That time was just claimed. Pick another slot.');
      return;
    }
  } catch {
    showToast('Booked locally while offline from the lock service.');
  }

  const booking = {
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    spaName: spa.name,
    serviceName: service.name,
    dateLabel: date.label,
    time: state.selectedTime,
    price: service.price,
    image: spa.image
  };

  state.bookings.unshift(booking);
  renderBookings();
  renderPartner();
  setView('bookings');
  showToast(`${service.name} booked at ${spa.name}`);
}

function renderBookings() {
  const list = document.getElementById('booking-list');
  if (!list) return;

  if (!state.bookings.length) {
    list.innerHTML = `
      <div class="empty-state">
        <i data-lucide="calendar-x"></i>
        <h3>No bookings yet</h3>
        <p>Choose a spa and reserve your first treatment.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = state.bookings.map((booking) => `
    <article class="booking-card">
      <img src="${booking.image}" alt="${booking.spaName}">
      <div>
        <h3>${booking.serviceName}</h3>
        <p>${booking.spaName}</p>
        <span>${booking.dateLabel} at ${booking.time} - $${booking.price}</span>
      </div>
    </article>
  `).join('');
}

function renderPartner() {
  const feed = document.getElementById('partner-feed');
  if (!feed) return;

  const total = state.bookings.reduce((sum, booking) => sum + booking.price, 1480);
  document.getElementById('metric-revenue').textContent = `$${total.toLocaleString()}`;
  document.getElementById('metric-bookings').textContent = String(state.bookings.length + 5);

  feed.innerHTML = state.bookings.slice(0, 5).map((booking) => `
    <article class="partner-item">
      <div>
        <strong>${booking.serviceName}</strong>
        <p>${booking.spaName} - ${booking.dateLabel} at ${booking.time}</p>
      </div>
      <span>$${booking.price}</span>
    </article>
  `).join('');
}

function initMap() {
  if (!window.L) {
    document.getElementById('map-fallback').classList.add('visible');
    return;
  }

  map = L.map('leaflet-map', { zoomControl: false }).setView([37.789, -122.404], 14);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(map);
  syncMapMarkers();
}

function syncMapMarkers() {
  if (!map) return;

  const filtered = getFilteredSpas();
  const filteredIds = new Set(filtered.map((spa) => spa.id));

  markers.forEach((marker, id) => {
    if (!filteredIds.has(id)) {
      marker.remove();
      markers.delete(id);
    }
  });

  filtered.forEach((spa) => {
    const marker = markers.get(spa.id) || L.marker([spa.lat, spa.lng]).addTo(map);
    marker.bindTooltip(spa.name, { direction: 'top' });
    marker.off('click');
    marker.on('click', () => selectSpa(spa.id));
    markers.set(spa.id, marker);
  });

  const selected = getSelectedSpa();
  if (selected) {
    map.setView([selected.lat, selected.lng], 14, { animate: true });
  }
}

function selectSpa(spaId, rerender = true) {
  state.selectedSpaId = spaId;
  const spa = getSelectedSpa();
  state.selectedServiceId = spa.services[0].id;
  state.selectedTime = spa.times[0];
  if (rerender) renderAll();
}

function getSelectedSpa() {
  return spas.find((spa) => spa.id === state.selectedSpaId) || spas[0];
}

function getSelectedService() {
  const spa = getSelectedSpa();
  return spa.services.find((service) => service.id === state.selectedServiceId) || spa.services[0];
}

function getLowestPrice(spa) {
  return Math.min(...spa.services.map((service) => service.price));
}

function getDateOptions() {
  const base = new Date();
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    return {
      day: index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      label: index === 0 ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      full: date.toISOString().slice(0, 10)
    };
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('visible'), 2600);
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
