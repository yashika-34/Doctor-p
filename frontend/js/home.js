// Home Page Dynamic Logic (Hero search, categories, featured doctors, AI symptom checker)

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedDoctors();
  setupHeroSearch();
  setupSymptomChecker();
});

// Load top rated doctors for the featured section
async function loadFeaturedDoctors() {
  const container = document.getElementById('featured-doctors-container');
  if (!container) return;

  try {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--navy-muted);">Loading top doctors...</p>
      </div>
    `;

    const data = await window.apiFetch('/doctors?limit=4&sortBy=rating');
    const doctors = data.doctors || [];

    if (doctors.length === 0) {
      container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--navy-muted);">No verified doctors currently available.</p>`;
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
              <span>${doc.rating ? doc.rating.toFixed(1) : '4.9'}</span>
              <span style="font-size: 0.75rem; color: var(--navy-muted); font-weight: 500;">(${doc.totalReviews || 12})</span>
            </div>
          </div>
          <div class="doctor-card-body">
            <span class="doctor-specialty-chip">${doc.specialization}</span>
            <h3 class="doctor-card-name">${doc.name}</h3>
            <div class="doctor-clinic-info">
              <span>🏥</span>
              <span>${doc.clinicName || 'City Health Center'}, ${doc.location?.city || 'New Delhi'}</span>
            </div>
            <div class="doctor-experience-info">
              <span>🩺</span>
              <span>${doc.experience || 5}+ Years Experience</span>
            </div>
            <div class="doctor-card-footer">
              <div class="doctor-fee">
                <span>Consultation Fee</span>
                <strong>₹${doc.consultationFee || 500}</strong>
              </div>
              <a href="doctor-details.html?id=${doc._id}" class="btn btn-primary btn-sm">Book Visit</a>
            </div>
          </div>
        </div>
      `
      )
      .join('');
  } catch (err) {
    console.error('Error fetching doctors:', err);
    container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--danger);">Failed to load doctors. Please ensure the backend server is running.</p>`;
  }
}

// Hero Search Box
function setupHeroSearch() {
  const form = document.getElementById('hero-search-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const search = document.getElementById('hero-search-query').value.trim();
    const specialty = document.getElementById('hero-specialty-select').value;
    const city = document.getElementById('hero-city-select').value;

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (specialty) params.set('specialty', specialty);
    if (city) params.set('city', city);

    window.location.href = `doctors.html?${params.toString()}`;
  });
}

// AI Symptom Checker Widget
function setupSymptomChecker() {
  const btn = document.getElementById('btn-analyze-symptoms');
  const input = document.getElementById('symptom-input');
  const resultContainer = document.getElementById('symptom-result-container');

  if (!btn || !input || !resultContainer) return;

  btn.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) {
      window.showToast('Please type your symptoms to analyze.', 'warning');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span>Analyzing...</span>`;

    try {
      const data = await window.apiFetch('/symptoms/check', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });

      const rec = data.recommendation;
      const urgencyColor = rec.urgency === 'high' ? '#ef4444' : rec.urgency === 'medium' ? '#f59e0b' : '#10b981';

      resultContainer.style.display = 'block';
      resultContainer.innerHTML = `
        <div style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: var(--radius-lg); padding: 1.75rem; margin-top: 1.5rem; text-align: left; animation: fadeIn 0.4s ease;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.5rem;">🩺</span>
              <h4 style="color: #ffffff; font-size: 1.3rem; margin: 0;">Recommended Specialist: <span style="color: var(--primary-light);">${rec.specialty}</span></h4>
            </div>
            <span style="background: ${urgencyColor}; color: #ffffff; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
              ${rec.urgency} Urgency
            </span>
          </div>
          <p style="color: #cbd5e1; font-size: 0.95rem; margin-bottom: 1.25rem; line-height: 1.6;">${rec.description}</p>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <a href="doctors.html?specialty=${encodeURIComponent(rec.specialty)}" class="btn btn-primary btn-sm">Find ${rec.specialty} Doctors</a>
            <button onclick="document.getElementById('symptom-input').value=''; document.getElementById('symptom-result-container').style.display='none';" class="btn btn-secondary btn-sm">Clear Analysis</button>
          </div>
        </div>
      `;
    } catch (err) {
      window.showToast(err.message || 'Error analyzing symptoms', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>Analyze Symptoms</span>`;
    }
  });
}
