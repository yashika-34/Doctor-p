// Doctor Details & Real-Time Booking Page Logic

let currentDoctor = null;
let selectedDate = new Date().toISOString().slice(0, 10);
let selectedTime = null;
let slotCountdownTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const doctorId = params.get('id');

  if (!doctorId) {
    window.showToast('No doctor specified.', 'error');
    setTimeout(() => {
      window.location.href = 'doctors.html';
    }, 1500);
    return;
  }

  setupDatePicker();
  loadDoctorDetails(doctorId);
  setupBookingForm(doctorId);
});

// Configure minimum date as today and set default
function setupDatePicker() {
  const dateInput = document.getElementById('booking-date');
  if (!dateInput) return;

  const today = new Date().toISOString().slice(0, 10);
  dateInput.min = today;
  dateInput.value = today;
  selectedDate = today;

  dateInput.addEventListener('change', (e) => {
    selectedDate = e.target.value;
    selectedTime = null;
    clearSlotSelection();
    if (currentDoctor) {
      loadDoctorAvailability(currentDoctor._id, selectedDate);
    }
  });
}

// Fetch complete doctor details
async function loadDoctorDetails(doctorId) {
  const headerContainer = document.getElementById('doctor-profile-header-container');
  const bioContainer = document.getElementById('doctor-bio-container');
  const reviewsContainer = document.getElementById('doctor-reviews-container');

  try {
    const data = await window.apiFetch(`/doctors/${doctorId}`);
    const doctor = data.doctor;
    const reviews = data.reviews || [];
    currentDoctor = doctor;

    document.title = `${doctor.name} — Appointment Booking | DoctorP`;

    // Render Doctor Profile Header
    if (headerContainer) {
      headerContainer.innerHTML = `
        <div class="doctor-profile-header">
          <img src="${doctor.profileImage || doctor.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'}" alt="${doctor.name}" class="doctor-avatar-large">
          <div style="flex: 1;">
            <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap;">
              <span class="doctor-specialty-chip">${doctor.specialization}</span>
              <span style="font-size: 0.8rem; background: #d1fae5; color: #065f46; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700;">✓ Verified Clinician</span>
            </div>
            <h1 style="font-size: 1.85rem; margin-bottom: 0.35rem; color: var(--navy-dark);">${doctor.name}</h1>
            <p style="color: var(--navy-muted); font-size: 0.95rem; margin-bottom: 0.65rem;">
              ${doctor.qualifications ? (Array.isArray(doctor.qualifications) ? doctor.qualifications.join(', ') : doctor.qualifications) : 'MBBS, MD'}
            </p>
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: 0.9rem; color: var(--navy-slate);">
              <div>🩺 <strong>${doctor.experience || 5}+</strong> Years Experience</div>
              <div>🏥 <strong>${doctor.clinicName || 'Clinic'}</strong>, ${doctor.location?.city || 'New Delhi'}</div>
              <div>⭐ <strong>${doctor.rating ? doctor.rating.toFixed(1) : '4.9'}</strong> (${doctor.totalReviews || 12} Reviews)</div>
            </div>
          </div>
        </div>
      `;
    }

    // Render Bio & Clinic Details
    if (bioContainer) {
      bioContainer.innerHTML = `
        <h3 style="font-size: 1.25rem; margin-bottom: 0.75rem;">About Doctor</h3>
        <p style="color: var(--navy-slate); line-height: 1.7; margin-bottom: 1.5rem;">
          ${doctor.bio || 'Experienced and dedicated medical specialist committed to evidence-based healthcare and patient wellness.'}
        </p>

        <h3 style="font-size: 1.25rem; margin-bottom: 0.75rem;">Clinic Address & Location</h3>
        <div style="background: var(--navy-light); padding: 1rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 1.5rem;">
          <p style="font-weight: 600; color: var(--navy-dark); margin-bottom: 0.25rem;">${doctor.clinicName || 'Health Center'}</p>
          <p style="font-size: 0.9rem; color: var(--navy-muted);">${doctor.location?.address || 'Medical Enclave'}, ${doctor.location?.city || 'New Delhi'}</p>
        </div>

        <h3 style="font-size: 1.25rem; margin-bottom: 0.75rem;">Consultation Days</h3>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
          ${(doctor.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
            .map((day) => `<span style="background: var(--primary-light); color: var(--primary-hover); padding: 0.3rem 0.8rem; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600;">${day}</span>`)
            .join('')}
        </div>
      `;
    }

    // Render Patient Reviews
    if (reviewsContainer) {
      if (reviews.length === 0) {
        reviewsContainer.innerHTML = `<p style="color: var(--navy-muted); font-size: 0.9rem;">No patient reviews yet. Be the first to share your experience after consultation!</p>`;
      } else {
        reviewsContainer.innerHTML = reviews
          .map(
            (rev) => `
            <div style="border-bottom: 1px solid var(--border-light); padding: 1rem 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <img src="${rev.patientId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                  <span style="font-weight: 700; font-size: 0.9rem; color: var(--navy-dark);">${rev.patientId?.name || 'Verified Patient'}</span>
                </div>
                <div style="color: #f59e0b; font-size: 0.9rem;">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</div>
              </div>
              <p style="font-size: 0.9rem; color: var(--navy-slate); line-height: 1.5;">${rev.review}</p>
            </div>
          `
          )
          .join('');
      }
    }

    // Set Sidebar Fee
    const feeEl = document.getElementById('sidebar-fee');
    if (feeEl) feeEl.innerText = `₹${doctor.consultationFee || 500}`;

    // Load Live Slot Availability
    loadDoctorAvailability(doctorId, selectedDate);
  } catch (err) {
    console.error('Error loading doctor details:', err);
    window.showToast(err.message || 'Error loading doctor profile', 'error');
  }
}

// Load real-time slot availability
async function loadDoctorAvailability(doctorId, date) {
  const container = document.getElementById('slots-grid');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem;">
      <div style="display: inline-block; width: 28px; height: 28px; border: 2.5px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <p style="font-size: 0.8rem; color: var(--navy-muted); margin-top: 0.4rem;">Checking live slot availability...</p>
    </div>
  `;

  try {
    const data = await window.apiFetch(`/doctors/${doctorId}/availability?date=${date}`);
    const slots = data.slots || [];

    if (slots.length === 0) {
      container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--navy-muted); font-size: 0.85rem;">No slots scheduled for this date. Please select another date.</p>`;
      return;
    }

    container.innerHTML = slots
      .map((slot) => {
        let statusClass = 'available';
        let disabledAttr = '';
        let titleAttr = 'Available for booking';

        if (slot.status === 'booked') {
          statusClass = 'booked';
          disabledAttr = 'disabled';
          titleAttr = 'Slot already booked';
        } else if (slot.status === 'locked') {
          statusClass = 'locked';
          disabledAttr = 'disabled';
          titleAttr = 'Slot temporarily reserved by another patient';
        }

        return `
          <button type="button" class="slot-btn ${statusClass}" ${disabledAttr} title="${titleAttr}" data-time="${slot.time}">
            ${slot.time}
          </button>
        `;
      })
      .join('');

    // Attach click listeners on available slots
    container.querySelectorAll('.slot-btn.available').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.slot-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedTime = btn.dataset.time;
        updateSelectedSlotSummary();
        lockSelectedSlot(doctorId, date, selectedTime);
      });
    });
  } catch (err) {
    console.error('Error fetching availability:', err);
    container.innerHTML = `<p style="grid-column: 1 / -1; color: var(--danger); font-size: 0.85rem;">Failed to load slots.</p>`;
  }
}

// Temporarily lock slot during checkout to prevent duplicate bookings
async function lockSelectedSlot(doctorId, date, time) {
  if (!window.Auth.isLoggedIn()) return; // Anonymous patients can still select, token checked on confirm

  try {
    await window.apiFetch('/doctors/slots/lock', {
      method: 'POST',
      body: JSON.stringify({ doctorId, date, time }),
    });

    startSlotCountdown();
  } catch (err) {
    if (err.status === 409) {
      window.showToast('This slot was just selected by another patient. Please choose another slot.', 'warning');
      selectedTime = null;
      loadDoctorAvailability(doctorId, date);
    }
  }
}

function startSlotCountdown() {
  const timerBadge = document.getElementById('slot-lock-countdown');
  if (!timerBadge) return;

  if (slotCountdownTimer) clearInterval(slotCountdownTimer);

  let seconds = 300; // 5 minutes
  timerBadge.style.display = 'block';

  slotCountdownTimer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(slotCountdownTimer);
      timerBadge.innerText = 'Reservation expired. Re-select slot.';
      selectedTime = null;
      clearSlotSelection();
      if (currentDoctor) loadDoctorAvailability(currentDoctor._id, selectedDate);
    } else {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timerBadge.innerText = `🔒 Slot held for ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  }, 1000);
}

function clearSlotSelection() {
  selectedTime = null;
  const timerBadge = document.getElementById('slot-lock-countdown');
  if (timerBadge) timerBadge.style.display = 'none';
  if (slotCountdownTimer) clearInterval(slotCountdownTimer);
  updateSelectedSlotSummary();
}

function updateSelectedSlotSummary() {
  const summaryEl = document.getElementById('booking-slot-summary');
  const btn = document.getElementById('btn-confirm-booking');

  if (!summaryEl || !btn) return;

  if (selectedTime) {
    summaryEl.innerHTML = `<strong>${selectedDate}</strong> at <strong>${selectedTime}</strong>`;
    btn.disabled = false;
  } else {
    summaryEl.innerHTML = `<span style="color: var(--navy-muted);">No slot selected yet</span>`;
    btn.disabled = true;
  }
}

// Setup Booking Form Submission
function setupBookingForm(doctorId) {
  const form = document.getElementById('appointment-booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Enforce authentication
    if (!window.Auth.isLoggedIn()) {
      window.showToast('Please sign in or create an account to book your appointment.', 'info');
      setTimeout(() => {
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
      }, 1000);
      return;
    }

    if (!selectedDate || !selectedTime) {
      window.showToast('Please pick an available time slot.', 'warning');
      return;
    }

    const reason = document.getElementById('consultation-reason')?.value.trim() || 'General Consultation';
    const submitBtn = document.getElementById('btn-confirm-booking');

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Booking Appointment...</span>`;

    try {
      const data = await window.apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctorId,
          appointmentDate: selectedDate,
          startTime: selectedTime,
          reason,
        }),
      });

      const appointment = data.appointment;
      showBookingConfirmationModal(appointment);
    } catch (err) {
      window.showToast(err.message || 'Error booking appointment', 'error');
      // If conflict, refresh slots
      if (err.status === 409) {
        loadDoctorAvailability(doctorId, selectedDate);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Confirm & Book Appointment</span>`;
    }
  });
}

// Show Confirmation Modal
function showBookingConfirmationModal(appointment) {
  const modal = document.getElementById('confirmation-modal');
  if (!modal) return;

  const idEl = document.getElementById('confirmed-apt-id');
  const docEl = document.getElementById('confirmed-doc-name');
  const dateEl = document.getElementById('confirmed-datetime');
  const feeEl = document.getElementById('confirmed-fee');

  if (idEl) idEl.innerText = appointment.appointmentId || appointment._id;
  if (docEl) docEl.innerText = currentDoctor ? currentDoctor.name : 'Your Doctor';
  if (dateEl) dateEl.innerText = `${appointment.appointmentDate} at ${appointment.startTime}`;
  if (feeEl) feeEl.innerText = `₹${appointment.fee}`;

  modal.classList.add('active');
}

window.closeModal = () => {
  const modal = document.getElementById('confirmation-modal');
  if (modal) modal.classList.remove('active');
};
