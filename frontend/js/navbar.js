// Universal Navbar and Footer Injector & State Synchronizer

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
});

function renderNavbar() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const currentPath = window.location.pathname;
  const isHome = currentPath.endsWith('/') || currentPath.endsWith('index.html');
  const isDoctors = currentPath.includes('doctors.html') || currentPath.includes('doctor-details.html');
  const isAppointments = currentPath.includes('my-appointments.html');

  const user = window.Auth ? window.Auth.getUser() : null;

  let authNavHtml = '';
  if (user) {
    const dashUrl = window.Auth.getDashboardUrl();
    const avatar = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
    authNavHtml = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <a href="${dashUrl}" class="user-profile-menu">
          <img src="${avatar}" alt="${user.name}">
          <div class="user-info-text">
            <div class="user-name">${user.name.split(' ')[0]}</div>
            <div class="user-role-badge">${user.role}</div>
          </div>
        </a>
        <a href="${dashUrl}" class="btn btn-outline btn-sm">Dashboard</a>
        <button onclick="window.Auth.logout()" class="btn btn-secondary btn-sm" title="Log Out">Logout</button>
      </div>
    `;
  } else {
    authNavHtml = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <a href="login.html" class="btn btn-secondary btn-sm">Sign In</a>
        <a href="doctors.html" class="btn btn-primary btn-sm">Book Appointment</a>
      </div>
    `;
  }

  header.innerHTML = `
    <nav class="header-navbar">
      <div class="container nav-container">
        <a href="index.html" class="brand-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          Doctor<span class="brand-badge">P</span>
        </a>

        <ul class="nav-links" id="desktop-nav-links">
          <li><a href="index.html" class="${isHome ? 'active' : ''}">Home</a></li>
          <li><a href="doctors.html" class="${isDoctors ? 'active' : ''}">Find Doctors</a></li>
          <li><a href="index.html#symptom-checker">AI Symptom Checker</a></li>
          <li><a href="index.html#how-it-works">How It Works</a></li>
          ${user ? `<li><a href="my-appointments.html" class="${isAppointments ? 'active' : ''}">My Appointments</a></li>` : ''}
        </ul>

        <div class="nav-actions">
          ${authNavHtml}
          <button class="mobile-nav-toggle" id="mobile-toggle" aria-label="Toggle Navigation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Navigation -->
      <div id="mobile-menu" style="display: none; background: #ffffff; border-top: 1px solid var(--border-light); padding: 1.25rem 1.5rem;">
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 1rem;">
          <li><a href="index.html" style="font-weight: 600; color: var(--navy-dark);">Home</a></li>
          <li><a href="doctors.html" style="font-weight: 600; color: var(--navy-dark);">Find Doctors</a></li>
          <li><a href="index.html#symptom-checker" style="font-weight: 600; color: var(--navy-dark);">AI Symptom Checker</a></li>
          ${user ? `<li><a href="my-appointments.html" style="font-weight: 600; color: var(--navy-dark);">My Appointments</a></li>` : ''}
          ${user ? `<li><a href="${window.Auth.getDashboardUrl()}" style="font-weight: 600; color: var(--primary);">Go to Dashboard</a></li>` : ''}
        </ul>
      </div>
    </nav>
  `;

  const toggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isHidden = mobileMenu.style.display === 'none';
      mobileMenu.style.display = isHidden ? 'block' : 'none';
    });
  }
}

function renderFooter() {
  const footer = document.getElementById('main-footer');
  if (!footer) return;

  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3 style="display: flex; align-items: center; gap: 0.5rem;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              Doctor<span style="color: #0d9488;">P</span>
            </h3>
            <p>Smart, seamless, and reliable healthcare appointment platform connecting patients with top medical specialists nationwide.</p>
          </div>

          <div class="footer-col">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a href="index.html">Home</a></li>
              <li><a href="doctors.html">Find a Doctor</a></li>
              <li><a href="index.html#symptom-checker">AI Symptom Checker</a></li>
              <li><a href="index.html#how-it-works">Booking Process</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Specializations</h4>
            <ul class="footer-links">
              <li><a href="doctors.html?specialty=Cardiology">Cardiology</a></li>
              <li><a href="doctors.html?specialty=Dermatology">Dermatology</a></li>
              <li><a href="doctors.html?specialty=Neurology">Neurology</a></li>
              <li><a href="doctors.html?specialty=Pediatrics">Pediatrics</a></li>
              <li><a href="doctors.html?specialty=Orthopedics">Orthopedics</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Contact & Support</h4>
            <ul class="footer-links">
              <li><span style="color: #cbd5e1;">📍 Medical Enclave, New Delhi</span></li>
              <li><span style="color: #cbd5e1;">📞 +91 1800-DOCTORP</span></li>
              <li><span style="color: #cbd5e1;">✉️ support@doctorp.com</span></li>
              <li><span style="color: #10b981;">● System Operational (24/7)</span></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2026 DoctorP Healthcare Platform. Built with MVC Architecture & MERN Stack.</p>
          <p style="color: #64748b;">College Full-Stack Capstone Project</p>
        </div>
      </div>
    </footer>
  `;
}
