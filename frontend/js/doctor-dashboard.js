// Doctor Dashboard Logic (Appointments Management, Slot Scheduling, Profile Update)

document.addEventListener('DOMContentLoaded', () => {
  // Auth guard: Require doctor role
  if (!window.Auth.requireAuth('doctor')) return;

  const user = window.Auth.getUser();
  const welcomeEl = document.getElementById('doctor-welcome-name');
  if (welcomeEl) welcomeEl.innerText = user.name;

  loadDoctorAppointments();
  setupTabs();
  setupAvailabilityForm();
  setupProfileForm();
});

// Setup Dashboard Tab Navigation
function setupTabs() {
  const tabs = document.querySelectorAll('.dash-menu-link');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const targetSection = tab.dataset.target;
      document.querySelectorAll('.dash-section').forEach((sec) => (sec.style.display = 'none'));
      const activeSec = document.getElementById(targetSection);
      if (activeSec) activeSec.style.display = 'block';
    });
  });
}

// Load Doctor Appointments
async function loadDoctorAppointments(statusFilter = 'all') {
  const container = document.getElementById('doctor-appointments-tbody');
  if (!container) return;

  container.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--navy-muted);">
        <div style="display: inline-block; width: 28px; height: 28px; border: 2.5px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="margin-top: 0.5rem; font-size: 0.85rem;">Loading patient consultations...</p>
      </td>
    </tr>
  `;

  try {
    const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
    const data = await window.apiFetch(`/appointments/my${query}`);
    const appointments = data.appointments || [];

    // Calculate metrics
    let pendingCount = 0;
    let confirmedCount = 0;
    let completedCount = 0;
    let totalRevenue = 0;

    appointments.forEach((a) => {
      if (a.status === 'pending') pendingCount++;
      if (a.status === 'confirmed') confirmedCount++;
      if (a.status === 'completed') {
        completedCount++;
        totalRevenue += a.fee || 0;
      }
    });

    document.getElementById('stat-doc-total').innerText = appointments.length;
    document.getElementById('stat-doc-pending').innerText = pendingCount;
    document.getElementById('stat-doc-confirmed').innerText = confirmedCount;
    document.getElementById('stat-doc-revenue').innerText = `₹${totalRevenue}`;

    if (appointments.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 3rem; color: var(--navy-muted);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
            <p>No appointments found for the selected filter.</p>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = appointments
      .map((apt) => {
        const patient = apt.patientId || {};
        const statusBadge = `<span class="badge badge-${apt.status}">${apt.status}</span>`;

        let actionBtns = '';
        if (apt.status === 'pending') {
          actionBtns = `
            <div style="display: flex; gap: 0.35rem;">
              <button onclick="updateStatus('${apt._id}', 'confirmed')" class="btn btn-success btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">Accept</button>
              <button onclick="updateStatus('${apt._id}', 'rejected')" class="btn btn-danger btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">Reject</button>
            </div>
          `;
        } else if (apt.status === 'confirmed') {
          actionBtns = `
            <div style="display: flex; gap: 0.35rem;">
              <button onclick="updateStatus('${apt._id}', 'completed')" class="btn btn-primary btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">Complete</button>
              <button onclick="updateStatus('${apt._id}', 'cancelled')" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">Cancel</button>
            </div>
          `;
        } else {
          actionBtns = `<span style="font-size: 0.8rem; color: var(--navy-muted); font-weight: 500;">No actions</span>`;
        }

        return `
          <tr>
            <td>
              <span style="font-family: monospace; font-weight: 700; color: var(--primary); font-size: 0.85rem;">
                ${apt.appointmentId || apt._id.slice(-6)}
              </span>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <img src="${patient.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                <div>
                  <div style="font-weight: 700; color: var(--navy-dark);">${patient.name || 'Patient'}</div>
                  <div style="font-size: 0.75rem; color: var(--navy-muted);">${patient.phone || patient.email || ''}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="font-weight: 600; color: var(--navy-dark);">${apt.appointmentDate}</div>
              <div style="font-size: 0.8rem; color: var(--navy-muted);">${apt.startTime}</div>
            </td>
            <td><span style="font-size: 0.85rem; color: var(--navy-slate);">${apt.reason || 'General'}</span></td>
            <td>${statusBadge}</td>
            <td>${actionBtns}</td>
          </tr>
        `;
      })
      .join('');
  } catch (err) {
    console.error('Error fetching doctor appointments:', err);
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: 2rem;">Error: ${err.message}</td></tr>`;
  }
}

// Update Appointment Status (Accept, Reject, Complete, Cancel)
window.updateStatus = async (appointmentId, newStatus) => {
  try {
    await window.apiFetch(`/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });

    window.showToast(`Appointment status updated to ${newStatus}.`, 'success');
    loadDoctorAppointments();
  } catch (err) {
    window.showToast(err.message || 'Error updating status', 'error');
  }
};

// Manage Availability Form
function setupAvailabilityForm() {
  const form = document.getElementById('doctor-availability-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedDays = Array.from(document.querySelectorAll('input[name="avail-days"]:checked')).map((cb) => cb.value);
    const slotsRaw = document.getElementById('avail-slots-input').value.trim();
    const timeSlots = slotsRaw ? slotsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];

    try {
      await window.apiFetch('/doctors/availability', {
        method: 'PUT',
        body: JSON.stringify({ availableDays: selectedDays, timeSlots }),
      });

      window.showToast('Availability and time slots updated successfully!', 'success');
    } catch (err) {
      window.showToast(err.message || 'Failed to update availability', 'error');
    }
  });
}

// Manage Profile Form
function setupProfileForm() {
  const form = document.getElementById('doctor-profile-form');
  if (!form) return;

  // Pre-fill existing doctor profile
  const docProfile = window.Auth.getDoctorProfile();
  if (docProfile) {
    if (document.getElementById('edit-fee')) document.getElementById('edit-fee').value = docProfile.consultationFee || 500;
    if (document.getElementById('edit-clinic')) document.getElementById('edit-clinic').value = docProfile.clinicName || '';
    if (document.getElementById('edit-city')) document.getElementById('edit-city').value = docProfile.location?.city || '';
    if (document.getElementById('edit-bio')) document.getElementById('edit-bio').value = docProfile.bio || '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const consultationFee = Number(document.getElementById('edit-fee').value);
    const clinicName = document.getElementById('edit-clinic').value.trim();
    const city = document.getElementById('edit-city').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();

    try {
      const data = await window.apiFetch('/doctors/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          consultationFee,
          clinicName,
          location: { city },
          bio,
        }),
      });

      if (data.doctor) {
        localStorage.setItem('doctorp_doctor_profile', JSON.stringify(data.doctor));
      }

      window.showToast('Profile updated successfully!', 'success');
    } catch (err) {
      window.showToast(err.message || 'Error updating profile', 'error');
    }
  });
}
