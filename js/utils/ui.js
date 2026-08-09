/**
 * ASTRAL - UI Utilities & Helper Functions
 */

export class UIUtils {
  /**
   * Display toast notification
   */
  static showToast(message, type = 'info', duration = 3500) {
    if (typeof document === 'undefined') return;
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;
    
    const iconMap = {
      success: 'fa-solid fa-circle-check',
      warning: 'fa-solid fa-triangle-exclamation',
      danger: 'fa-solid fa-circle-exclamation',
      info: 'fa-solid fa-circle-info'
    };

    toast.innerHTML = `
      <div class="toast-content">
        <i class="${iconMap[type] || iconMap.info} toast-icon"></i>
        <span>${message}</span>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('animate-slide-out');
      setTimeout(() => toast.remove(), 250);
    });

    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('animate-slide-out');
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  }

  /**
   * Render risk/status badge HTML
   */
  static getRiskBadge(levelOrStatus, score = 0) {
    const s = String(levelOrStatus || '').toLowerCase();
    if (s === 'high' || s === 'at risk') {
      return `<span class="badge badge-risk-high" title="Critical Academic Attention Required"><span class="badge-dot pulse-red"></span>At Risk (${score}%)</span>`;
    } else if (s === 'moderate' || s === 'needs attention') {
      return `<span class="badge badge-risk-mod" title="Requires Targeted Academic Monitoring"><span class="badge-dot pulse-yellow"></span>Needs Attention (${score}%)</span>`;
    } else {
      return `<span class="badge badge-risk-low" title="On Track / Good Standing"><span class="badge-dot pulse-green"></span>On Track (${score}%)</span>`;
    }
  }

  /**
   * Format GPA with color indicator
   */
  static getGpaBadge(gpa) {
    const val = typeof gpa === 'number' && !isNaN(gpa) ? gpa : 0;
    if (val >= 8.5) return `<span class="gpa-pill gpa-high">${val.toFixed(2)}</span>`;
    if (val >= 7.0) return `<span class="gpa-pill gpa-mid">${val.toFixed(2)}</span>`;
    return `<span class="gpa-pill gpa-low">${val.toFixed(2)}</span>`;
  }

  /**
   * Format attendance percentage badge
   */
  static getAttendanceBadge(rate) {
    const val = typeof rate === 'number' && !isNaN(rate) ? Math.round(rate) : 0;
    if (val >= 85) return `<span class="att-pill att-good"><i class="fa-solid fa-check"></i> ${val}%</span>`;
    if (val >= 75) return `<span class="att-pill att-warn"><i class="fa-solid fa-triangle-exclamation"></i> ${val}%</span>`;
    return `<span class="att-pill att-crit"><i class="fa-solid fa-circle-xmark"></i> ${val}%</span>`;
  }

  /**
   * Animate a numeric counter with frame cancellation to prevent duplicate animation loops
   */
  static animateValue(element, start, end, duration = 350, prefix = '', suffix = '') {
    if (!element || typeof window === 'undefined') {
      if (element) element.textContent = `${prefix}${end}${suffix}`;
      return;
    }

    if (element._animFrameId) {
      window.cancelAnimationFrame(element._animFrameId);
      element._animFrameId = null;
    }

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      element.textContent = `${prefix}${current}${suffix}`;
      if (progress < 1) {
        element._animFrameId = window.requestAnimationFrame(step);
      } else {
        element.textContent = `${prefix}${end}${suffix}`;
        element._animFrameId = null;
      }
    };
    element._animFrameId = window.requestAnimationFrame(step);
  }

  /**
   * Debounce helper
   */
  static debounce(func, wait = 200) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}
