/**
 * ASTRAL - Main Application Bootstrap & Lifecycle Coordinator
 */
import { StorageService } from './services/storage.js';
import { AnalyticsManager } from './components/analytics.js';
import { StudentModal } from './components/studentModal.js';
import { NewStudentModal } from './components/newStudentModal.js';
import { DashboardManager } from './components/dashboard.js';
import { UIUtils } from './utils/ui.js';

class AstralApp {
  constructor() {
    this.analyticsManager = null;
    this.studentModal = null;
    this.newStudentModal = null;
    this.dashboardManager = null;
    this.currentRole = 'faculty'; // 'dean' | 'faculty' | 'student'
  }

  init() {
    console.log('🚀 Initializing ASTRAL - AI Student Success & Progress Intelligence Platform');

    // 1. Initialize Analytics Engine
    this.analyticsManager = new AnalyticsManager();

    // 2. Initialize Modals
    this.studentModal = new StudentModal(this.analyticsManager, (studentId, actionType) => {
      this.dashboardManager.render();
    });

    this.newStudentModal = new NewStudentModal((newStudentId) => {
      this.dashboardManager.render();
      if (newStudentId) {
        this.studentModal.open(newStudentId);
      }
    });

    // 3. Initialize Dashboard Manager
    this.dashboardManager = new DashboardManager(
      this.studentModal,
      this.newStudentModal,
      this.analyticsManager
    );

    // 4. Initial Render & Event Binding
    this.dashboardManager.render();
    this.dashboardManager.bindEvents();
    this.bindGlobalActions();
    this.bindRoleSwitcher();
    this.bindKeyboardShortcuts();

    // 5. Storage Event Sync
    StorageService.onStorageChange(() => {
      this.dashboardManager.render();
    });

    // Notify ready
    setTimeout(() => {
      UIUtils.showToast('ASTRAL AI Intelligence Engine Loaded & Active', 'success', 2800);
    }, 400);
  }

  bindGlobalActions() {
    // Top Bar quick action to open new student modal
    const btnEnroll = document.getElementById('btn-top-enroll');
    if (btnEnroll) {
      btnEnroll.addEventListener('click', () => this.newStudentModal.open());
    }

    // Refresh analytics
    const btnRefresh = document.getElementById('btn-refresh-charts');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        const students = StorageService.getStudents();
        this.analyticsManager.renderDashboardCharts(students);
        UIUtils.showToast('Analytics & AI forecasts synchronized', 'info', 2000);
      });
    }
  }

  bindRoleSwitcher() {
    const roleSelect = document.getElementById('select-user-role');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        this.currentRole = e.target.value;
        const roleLabel = document.getElementById('current-role-badge');
        if (roleLabel) {
          if (this.currentRole === 'dean') {
            roleLabel.textContent = 'Dean / Academic Director View';
            roleLabel.className = 'role-badge role-dean';
            UIUtils.showToast('Switched to Dean Executive Overview', 'info');
          } else if (this.currentRole === 'faculty') {
            roleLabel.textContent = 'Faculty Success Advisor View';
            roleLabel.className = 'role-badge role-faculty';
            UIUtils.showToast('Switched to Faculty Advisor Workspace', 'info');
          } else {
            roleLabel.textContent = 'Student Self-Service Portal';
            roleLabel.className = 'role-badge role-student';
            UIUtils.showToast('Switched to Student Portal View', 'info');
            // Auto open top student dossier for preview
            const students = StorageService.getStudents();
            if (students.length > 0) {
              this.studentModal.open(students[0].id);
            }
          }
        }
      });
    }
  }

  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K or '/' focuses search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        const searchInput = document.getElementById('input-search-students');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Escape closes any open modal
      if (e.key === 'Escape') {
        if (this.studentModal) this.studentModal.close();
        if (this.newStudentModal) this.newStudentModal.close();
      }
    });
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.ASTRAL = new AstralApp();
  window.ASTRAL.init();
});
