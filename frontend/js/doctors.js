// Doctors Directory Page Logic

let currentPage = 1;
const limit = 9;

document.addEventListener('DOMContentLoaded', () => {
  initFiltersFromUrl();
  loadDoctors();
  setupFilterListeners();
});

// Parse query params from URL (e.g., from hero search or department cards)
function initFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search');
  const specialty = params.get('specialty');
  const city = params.get('city');

  if (search) document.getElementById('filter-search').value = search;
  if (specialty) document.getElementById('filter-specialty').value = specialty;
  if (city) document.getElementById('filter-city').value = city;
}

// Set up event listeners on filter inputs
function setupFilterListeners() {
  const form = document.getElementById('doctors-filter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      currentPage = 1;
      loadDoctors();
    });
  }

  const sortSelect = document.getElementById('filter-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentPage = 1;
      loadDoctors();
    });
  }

  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('filter-search').value = '';
      document.getElementById('filter-specialty').value = '';
      document.getElementById('filter-city').value = '';
      document.getElementById('filter-min-rating').value = '';
      document.getElementById('filter-max-fee').value = '';
      currentPage = 1;
      loadDoctors();
    });
  }
}

// Fetch doctors with all active filters
async function loadDoctors() {
  const container = document.getElementById('doctors-list-container');
  const countEl = document.getElementById('doctors-count-text');
  const paginationContainer = document.getElementById('pagination-container');

  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
      <div style="display: inline-block; width: 44px; height: 44px; border: 3px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <p style="margin-top: 1rem; color: var(--navy-muted); font-size: 0.95rem;">Loading doctors according to your preferences...</p>
    </div>
  `;

  const search = document.getElementById('filter-search')?.value.trim() || '';
  const specialty = document.getElementById('filter-specialty')?.value || '';
  const city = document.getElementById('filter-city')?.value || '';
  const minRating = document.getElementById('filter-min-rating')?.value || '';
  const maxFee = document.getElementById('filter-max-fee')?.value || '';
  const sortBy = document.getElementById('filter-sort')?.value || 'rating';

  const queryParams = new URLSearchParams({
    page: currentPage,
    limit,
    sortBy,
  });

  if (search) queryParams.set('search', search);
  if (specialty) queryParams.set('specialty', specialty);
  if (city) queryParams.set('city', city);
  if (minRating) queryParams.set('minRating', minRating);
  if (maxFee) queryParams.set('maxFee', maxFee);

  try {
    const data = await window.apiFetch(`/doctors?${queryParams.toString()}`);
    const doctors = data.doctors || [];
    const total = data.total || 0;
    const pages = data.pages || 1;

    if (countEl) {
      countEl.innerText = `Showing ${doctors.length} of ${total} verified doctor${total === 1 ? '' : 's'}`;
    }

    if (doctors.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; background: #ffffff; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="margin-bottom: 0.5rem;">No Doctors Found</h3>
          <p style="color: var(--navy-muted); max-width: 400px; margin: 0 auto 1.5rem;">We couldn't find any doctors matching your search criteria. Try removing some filters or adjusting your keywords.</p>
          <button onclick="document.getElementById('btn-reset-filters').click()" class="btn btn-primary">Clear All Filters</button>
        </div>
      `;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    container.innerHTML = doctors
      .map(
        (doc) => `
        <div class="doctor-card">
          <div class="doctor-card-img-wrap">
            <img src="${doc.profileImage || doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}" alt="${doc.name}" loading="lazy">
            <div class="doctor-badge-rating">
              <span style="color: #f59e0b;">★</span>
              <span>${doc.rating ? doc.rating.toFixed(1) : '4.8'}</span>
              <span style="font-size: 0.75rem; color: var(--navy-muted);">(${doc.totalReviews || 12})</span>
            </div>
          </div>
          <div class="doctor-card-body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span class="doctor-specialty-chip">${doc.specialization}</span>
              <span style="font-size: 0.75rem; color: #059669; font-weight: 700; background: #d1fae5; padding: 0.2rem 0.5rem; border-radius: 4px;">● Available</span>
            </div>
            <h3 class="doctor-card-name">${doc.name}</h3>
            <p style="font-size: 0.8rem; color: var(--navy-muted); margin-bottom: 0.4rem;">
              ${doc.qualifications ? (Array.isArray(doc.qualifications) ? doc.qualifications.join(', ') : doc.qualifications) : 'MBBS, MD'}
            </p>
            <div class="doctor-clinic-info">
              <span>🏥</span>
              <span>${doc.clinicName || 'Care Clinic'}, ${doc.location?.city || 'New Delhi'}</span>
            </div>
            <div class="doctor-experience-info">
              <span>🩺</span>
              <span>${doc.experience || 5}+ Years Clinical Experience</span>
            </div>
            <div class="doctor-card-footer">
              <div class="doctor-fee">
                <span>Consultation</span>
                <strong>₹${doc.consultationFee || 500}</strong>
              </div>
              <div style="display: flex; gap: 0.4rem;">
                <a href="doctor-details.html?id=${doc._id}" class="btn btn-secondary btn-sm">Profile</a>
                <a href="doctor-details.html?id=${doc._id}" class="btn btn-primary btn-sm">Book</a>
              </div>
            </div>
          </div>
        </div>
      `
      )
      .join('');

    renderPagination(pages);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--danger);">Failed to load doctors: ${err.message}</p>`;
  }
}

// Render Pagination Controls
function renderPagination(totalPages) {
  const container = document.getElementById('pagination-container');
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = `<div style="display: flex; gap: 0.5rem; align-items: center; justify-content: center; margin-top: 3rem;">`;

  if (currentPage > 1) {
    html += `<button onclick="changePage(${currentPage - 1})" class="btn btn-secondary btn-sm">← Prev</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    const isCurrent = i === currentPage;
    html += `
      <button onclick="changePage(${i})" class="btn ${isCurrent ? 'btn-primary' : 'btn-secondary'} btn-sm" style="min-width: 38px;">
        ${i}
      </button>
    `;
  }

  if (currentPage < totalPages) {
    html += `<button onclick="changePage(${currentPage + 1})" class="btn btn-secondary btn-sm">Next →</button>`;
  }

  html += `</div>`;
  container.innerHTML = html;
}

window.changePage = (p) => {
  currentPage = p;
  loadDoctors();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
