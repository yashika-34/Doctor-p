// Patient Dashboard Logic (Appointments, Cancellation, and Doctor Reviews)

let activeAppointmentForReview = null;

document.addEventListener('DOMContentLoaded', () => {
  // Auth guard: Require patient role
  if (!window.Auth.requireAuth('patient')) return;

  const user = window.Auth.getUser();
  const welcomeEl = document.getElementById('patient-welcome-name');
  if (welcomeEl) welcomeEl.innerText = user.name;

  loadPatientStats();
  loadPatientAppointments();
  setupReviewModal();
});

// Load patient overview stats
async function loadPatientStats() {
  try {
    const data = await window.apiFetch('/patients/stats');
    const stats = data.stats;

    document.getElementById('stat-upcoming').innerText = stats.upcoming || 0;
    document.getElementById('stat-completed').innerText = stats.completed || 0;
    document.getElementById('stat-total').innerText = stats.total || 0;
  } catch (err) {
    console.error('Error loading patient stats:', err);
  }
}

// Load patient appointments list
async function loadPatientAppointments() {
  const container = document.getElementById('patient-appointments-table-body');
  if (!container) return;

  container.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--navy-muted);">
        <div style="display: inline-block; width: 28px; height: 28px; border: 2.5px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="margin-top: 0.5rem; font-size: 0.85rem;">Loading your appointments...</p>
      </td>
    </tr>
  `;

  try {
    const data = await window.apiFetch('/appointments/my');
    const appointments = data.appointments || [];

    if (appointments.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 3rem; color: var(--navy-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📅</div>
            <h4>No Appointments Booked Yet</h4>
            <p style="font-size: 0.85rem; margin-bottom: 1rem;">Find a certified specialist and book your first clinical consultation.</p>
            <a href="doctors.html" class="btn btn-primary btn-sm">Find a Doctor</a>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = appointments
      .map((apt) => {
        const doc = apt.doctorId || {};
        const statusBadge = `<span class="badge badge-${apt.status}">${apt.status}</span>`;

        let actionHtml = '';
        if (apt.status === 'pending' || apt.status === 'confirmed') {
          actionHtml = `
            <button onclick="cancelAppointment('${apt._id}')" class="btn btn-danger btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
              Cancel
            </button>
          `;
        } else if (apt.status === 'completed' && !apt.isReviewed) {
          actionHtml = `
            <button onclick="openReviewModal('${apt._id}', '${doc.name || 'Doctor'}')" class="btn btn-primary btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
              Rate & Review
            </button>
          `;
        } else if (apt.isReviewed) {
          actionHtml = `<span style="font-size: 0.8rem; color: #059669; font-weight: 600;">✓ Reviewed</span>`;
        } else {
          actionHtml = `<span style="font-size: 0.8rem; color: var(--navy-muted);">-</span>`;
        }

        return `
          <tr>
            <td>
              <span style="font-family: monospace; font-weight: 700; color: var(--primary); font-size: 0.85rem;">
                ${apt.appointmentId || apt._id.slice(-6)}
              </span>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <img src="${doc.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=100&q=80'}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;">
                <div>
                  <div style="font-weight: 700; color: var(--navy-dark);">${doc.name || 'Doctor'}</div>
                  <div style="font-size: 0.75rem; color: var(--navy-muted);">${doc.specialization || 'Medicine'}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="font-weight: 600; color: var(--navy-dark);">${apt.appointmentDate}</div>
              <div style="font-size: 0.8rem; color: var(--navy-muted);">${apt.startTime}</div>
            </td>
            <td><strong>₹${apt.fee}</strong></td>
            <td>${statusBadge}</td>
            <td>${actionHtml}</td>
          </tr>
        `;
      })
      .join('');
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: 2rem;">Error: ${err.message}</td></tr>`;
  }
}

// Cancel Appointment
window.cancelAppointment = async (appointmentId) => {
  if (!confirm('Are you sure you want to cancel this appointment? The reserved slot will be released.')) {
    return;
  }

  try {
    await window.apiFetch(`/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason: 'Cancelled by patient from dashboard' }),
    });

    window.showToast('Appointment cancelled successfully.', 'success');
    loadPatientStats();
    loadPatientAppointments();
  } catch (err) {
    window.showToast(err.message || 'Failed to cancel appointment', 'error');
  }
};

// Standout Feature 4: Review Modal Logic
window.openReviewModal = (appointmentId, doctorName) => {
  activeAppointmentForReview = appointmentId;
  const modal = document.getElementById('review-modal');
  const docNameEl = document.getElementById('review-doc-name');

  if (docNameEl) docNameEl.innerText = doctorName;
  if (modal) modal.classList.add('active');
};

function setupReviewModal() {
  const form = document.getElementById('review-form');
  const closeBtn = document.getElementById('btn-close-review-modal');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('review-modal')?.classList.remove('active');
    });
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeAppointmentForReview) return;

    const rating = document.getElementById('review-rating').value;
    const review = document.getElementById('review-text').value.trim();

    try {
      await window.apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: activeAppointmentForReview,
          rating: Number(rating),
          review,
        }),
      });

      window.showToast('Review submitted successfully! Thank you for your feedback.', 'success');
      document.getElementById('review-modal')?.classList.remove('active');
      form.reset();
      loadPatientAppointments();
    } catch (err) {
      window.showToast(err.message || 'Error submitting review', 'error');
    }
  });
}
