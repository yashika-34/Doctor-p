// Admin Dashboard Logic (System Overview, Doctor Approvals, Patient Management, All Appointments)

document.addEventListener('DOMContentLoaded', () => {
  // Auth guard: Require admin role
  if (!window.Auth.requireAuth('admin')) return;

  loadAdminStats();
  loadAdminDoctors();
  setupAdminTabs();
});

function setupAdminTabs() {
  const tabs = document.querySelectorAll('.dash-menu-link');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.target;
      document.querySelectorAll('.admin-section').forEach((s) => (s.style.display = 'none'));
      const activeSec = document.getElementById(target);
      if (activeSec) activeSec.style.display = 'block';

      if (target === 'sec-admin-doctors') loadAdminDoctors();
      else if (target === 'sec-admin-patients') loadAdminPatients();
      else if (target === 'sec-admin-appointments') loadAdminAppointments();
    });
  });
}

// Load System Overview Stats
async function loadAdminStats() {
  try {
    const data = await window.apiFetch('/admin/dashboard');
    const stats = data.stats;

    document.getElementById('stat-admin-doctors').innerText = stats.totalDoctors || 0;
    document.getElementById('stat-admin-patients').innerText = stats.totalPatients || 0;
    document.getElementById('stat-admin-apts').innerText = stats.totalAppointments || 0;
    document.getElementById('stat-admin-revenue').innerText = `₹${stats.totalRevenue || 0}`;
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
  }
}

// Load Doctors Table with Approval Controls
async function loadAdminDoctors() {
  const tbody = document.getElementById('admin-doctors-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading registered doctors...</td></tr>`;

  try {
    const data = await window.apiFetch('/admin/doctors');
    const doctors = data.doctors || [];

    if (doctors.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No doctors registered in the system.</td></tr>`;
      return;
    }

    tbody.innerHTML = doctors
      .map((doc) => {
        const isApproved = doc.approvalStatus === 'approved';
        const statusBadge = `<span class="badge ${isApproved ? 'badge-completed' : 'badge-pending'}">${doc.approvalStatus}</span>`;

        let toggleBtn = '';
        if (isApproved) {
          toggleBtn = `
            <button onclick="toggleDoctorApproval('${doc._id}', 'rejected')" class="btn btn-danger btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
              Reject
            </button>
          `;
        } else {
          toggleBtn = `
            <button onclick="toggleDoctorApproval('${doc._id}', 'approved')" class="btn btn-success btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
              Approve
            </button>
          `;
        }

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <img src="${doc.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=80&q=80'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                <span style="font-weight: 700; color: var(--navy-dark);">${doc.name}</span>
              </div>
            </td>
            <td>${doc.specialization}</td>
            <td>${doc.location?.city || 'New Delhi'}</td>
            <td>${doc.experience || 0} Yrs</td>
            <td>₹${doc.consultationFee || 500}</td>
            <td>${statusBadge}</td>
            <td>${toggleBtn}</td>
          </tr>
        `;
      })
      .join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger); padding: 2rem;">Error: ${err.message}</td></tr>`;
  }
}

// Toggle Doctor Approval
window.toggleDoctorApproval = async (doctorId, status) => {
  try {
    await window.apiFetch(`/admin/doctors/${doctorId}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    window.showToast(`Doctor registration ${status}!`, 'success');
    loadAdminStats();
    loadAdminDoctors();
  } catch (err) {
    window.showToast(err.message || 'Error updating doctor status', 'error');
  }
};

// Load Registered Patients
async function loadAdminPatients() {
  const tbody = document.getElementById('admin-patients-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">Loading patients...</td></tr>`;

  try {
    const data = await window.apiFetch('/admin/patients');
    const patients = data.patients || [];

    if (patients.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">No patients registered yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = patients
      .map(
        (p) => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <img src="${p.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
              <span style="font-weight: 700; color: var(--navy-dark);">${p.name}</span>
            </div>
          </td>
          <td>${p.email}</td>
          <td>${p.phone || 'N/A'}</td>
          <td>${p.gender || 'Not specified'} (${p.age || 'N/A'} yrs)</td>
          <td><span class="badge badge-completed">${p.status || 'active'}</span></td>
        </tr>
      `
      )
      .join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--danger); padding: 2rem;">Error: ${err.message}</td></tr>`;
  }
}

// Load All Appointments Overview
async function loadAdminAppointments() {
  const tbody = document.getElementById('admin-appointments-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading all platform bookings...</td></tr>`;

  try {
    const data = await window.apiFetch('/admin/appointments');
    const appointments = data.appointments || [];

    if (appointments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">No appointments recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = appointments
      .map(
        (apt) => `
        <tr>
          <td><span style="font-family: monospace; font-weight: 700; color: var(--primary);">${apt.appointmentId || apt._id.slice(-6)}</span></td>
          <td>${apt.patientId?.name || 'Patient'}</td>
          <td>${apt.doctorId?.name || 'Doctor'} (${apt.doctorId?.specialization || 'Medical'})</td>
          <td>${apt.appointmentDate} at ${apt.startTime}</td>
          <td>₹${apt.fee}</td>
          <td><span class="badge badge-${apt.status}">${apt.status}</span></td>
        </tr>
      `
      )
      .join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: 2rem;">Error: ${err.message}</td></tr>`;
  }
}
