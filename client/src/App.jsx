/* ============================================================
   NAVBAR ENHANCEMENTS
   ============================================================ */
.navbar-custom .brand-icon {
  font-size: 1.5rem;
  margin-right: 0.25rem;
}

.navbar-custom .brand-text {
  font-weight: 700;
}

.navbar-custom .nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.navbar-custom .user-greeting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--md-radius-full);
  backdrop-filter: blur(4px);
}

.navbar-custom .user-avatar {
  font-size: 1.2rem;
}

.navbar-custom .user-name {
  color: #ffffff;
  font-weight: 600;
  font-size: var(--md-typescale-label);
  white-space: nowrap;
}

.navbar-custom .nav-links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.navbar-custom .btn .btn-icon {
  margin-right: 0.2rem;
}

/* ============================================================
   LOADING SCREEN
   ============================================================ */
.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--md-background);
}

.loading-content {
  text-align: center;
  padding: 2rem;
}

.loading-content .spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.25em;
  margin-bottom: 1rem;
}

.loading-text {
  font-size: var(--md-typescale-body);
  color: var(--md-on-surface-variant);
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.loading-bar {
  width: 200px;
  height: 4px;
  background: var(--md-surface-container);
  border-radius: var(--md-radius-full);
  margin: 0 auto;
  overflow: hidden;
}

.loading-bar-fill {
  width: 40%;
  height: 100%;
  background: var(--md-secondary);
  border-radius: var(--md-radius-full);
  animation: loadingBar 1.2s ease-in-out infinite;
}

@keyframes loadingBar {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(150%); }
  100% { transform: translateX(-100%); }
}

.app-container {
  min-height: calc(100vh - 60px);
}

/* Responsive Navbar */
@media (max-width: 992px) {
  .navbar-custom .nav-actions {
    width: 100%;
    justify-content: space-between;
  }
  .navbar-custom .nav-links {
    justify-content: flex-start;
    gap: 0.3rem;
  }
}

@media (max-width: 768px) {
  .navbar-custom .container-fluid {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .navbar-custom .nav-actions {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
  .navbar-custom .nav-links {
    width: 100%;
    justify-content: flex-start;
  }
}