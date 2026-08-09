/**
 * ASTRAL - Executive Dashboard & Student Roster Manager
 * Real-time metric aggregation, actionable priority alerts, filtering, and responsive roster view
 */
import { AIEngine } from '../services/aiEngine.js';
import { AISearchEngine } from './aiSearch.js';
import { StorageService } from '../services/storage.js';
import { UIUtils } from '../utils/ui.js';

export class DashboardManager {
  constructor(studentModal, newStudentModal, analyticsManager) {
    this.studentModal = studentModal;
    this.newStudentModal = newStudentModal;
    this.analyticsManager = analyticsManager;

    this.currentFilter = 'all'; // 'all' | 'high-risk' | 'moderate' | 'low-risk' | 'low-attendance'
    this.currentDept = 'all';
    this.currentSort = 'risk-desc'; // 'risk-desc' | 'risk-asc' | 'cgpa-asc' | 'cgpa-desc' | 'att-asc' | 'name-asc'
    this.searchQuery = '';
    this.viewMode = 'table'; // 'table' | 'cards'
    this.eventsBound = false;
  }

  /**
   * Initialize and render dashboard
   */
  render() {
    const students = StorageService.getStudents();
    this.renderKpiCards(students);
    this.renderPriorityAlerts(students);
    this.renderFilterPills(students);
    this.renderStudentRoster(students);
    if (this.analyticsManager) {
      this.analyticsManager.renderDashboardCharts(students);
    }
  }

  /**
   * Render Top 8 Key Metrics with dynamic calculation and zero hardcoding
   */
  renderKpiCards(students) {
    const safeStudents = Array.isArray(students) ? students : [];
    const total = safeStudents.length;

    let onTrackCount = 0;
    let needsAttentionCount = 0;
    let atRiskCount = 0;

    let totalCgpa = 0;
    let totalAttendance = 0;
    let totalAssignment = 0;
    let totalTrendDelta = 0;
    let studentsWithTrend = 0;

    safeStudents.forEach(s => {
      const analysis = AIEngine.analyzeStudent(s);
      if (analysis.status === 'At Risk' || analysis.riskLevel === 'High') {
        atRiskCount++;
      } else if (analysis.status === 'Needs Attention' || analysis.riskLevel === 'Moderate') {
        needsAttentionCount++;
      } else {
        onTrackCount++;
      }

      totalCgpa += typeof s.cgpa === 'number' ? s.cgpa : 7.0;
      totalAttendance += typeof s.attendanceRate === 'number' ? s.attendanceRate : 75;
      totalAssignment += typeof s.assignmentCompletionRate === 'number' ? s.assignmentCompletionRate : 80;

      if (Array.isArray(s.monthlyTestScores) && s.monthlyTestScores.length >= 2) {
        const delta = s.monthlyTestScores[s.monthlyTestScores.length - 1] - s.monthlyTestScores[0];
        totalTrendDelta += delta;
        studentsWithTrend++;
      }
    });

    const avgCgpa = total > 0 ? (totalCgpa / total) : 0;
    const avgAtt = total > 0 ? Math.round(totalAttendance / total) : 0;
    const avgAsg = total > 0 ? Math.round(totalAssignment / total) : 0;
    const avgTrend = studentsWithTrend > 0 ? (totalTrendDelta / studentsWithTrend).toFixed(1) : '0.0';

    const onTrackPct = total > 0 ? Math.round((onTrackCount / total) * 100) : 0;
    const needsAttentionPct = total > 0 ? Math.round((needsAttentionCount / total) * 100) : 0;
    const atRiskPct = total > 0 ? Math.round((atRiskCount / total) * 100) : 0;

    const depts = new Set(safeStudents.map(s => s.department)).size;

    // Elements
    const elTotal = document.getElementById('kpi-total-students');
    const elDept = document.getElementById('kpi-dept-count');
    const elOnTrack = document.getElementById('kpi-on-track-count');
    const elOnTrackPct = document.getElementById('kpi-on-track-pct');
    const elNeedsAtt = document.getElementById('kpi-needs-attention-count');
    const elNeedsAttPct = document.getElementById('kpi-needs-attention-pct');
    const elAtRisk = document.getElementById('kpi-at-risk-count');
    const elAtRiskPct = document.getElementById('kpi-at-risk-pct');
    const elCgpa = document.getElementById('kpi-avg-gpa');
    const elAttendance = document.getElementById('kpi-avg-attendance');
    const elAttendanceSub = document.getElementById('kpi-attendance-sub');
    const elAssignment = document.getElementById('kpi-avg-assignment');
    const elTrend = document.getElementById('kpi-performance-trend');
    const elTrendSub = document.getElementById('kpi-trend-sub');

    if (elTotal) UIUtils.animateValue(elTotal, 0, total, 350);
    if (elDept) elDept.textContent = total > 0 ? `Across ${depts} technical major${depts > 1 ? 's' : ''}` : 'No active majors';
    
    if (elOnTrack) UIUtils.animateValue(elOnTrack, 0, onTrackCount, 350);
    if (elOnTrackPct) elOnTrackPct.textContent = `${onTrackPct}% of cohort`;

    if (elNeedsAtt) UIUtils.animateValue(elNeedsAtt, 0, needsAttentionCount, 350);
    if (elNeedsAttPct) elNeedsAttPct.textContent = `${needsAttentionPct}% of cohort`;

    if (elAtRisk) UIUtils.animateValue(elAtRisk, 0, atRiskCount, 350);
    if (elAtRiskPct) elAtRiskPct.textContent = `${atRiskPct}% requires triage`;

    if (elCgpa) elCgpa.textContent = avgCgpa.toFixed(2);
    if (elAttendance) elAttendance.textContent = `${avgAtt}%`;
    if (elAttendanceSub) elAttendanceSub.textContent = avgAtt < 75 ? '⚠️ Below 75% requirement' : '✓ Safe cohort average';

    if (elAssignment) elAssignment.textContent = `${avgAsg}%`;

    if (elTrend) {
      const numTrend = parseFloat(avgTrend);
      elTrend.textContent = `${numTrend >= 0 ? '+' : ''}${avgTrend}%`;
      elTrend.className = `kpi-value ${numTrend >= 0 ? 'text-blue-400' : 'text-danger'}`;
    }
    if (elTrendSub) {
      const numTrend = parseFloat(avgTrend);
      elTrendSub.textContent = numTrend >= 0 ? '✓ Positive score momentum' : '⚠️ Net downward score momentum';
    }
  }

  /**
   * Render Prominent AI Priority Insights & Attention Section
   */
  renderPriorityAlerts(students) {
    const container = document.getElementById('ai-priority-insights-container');
    if (!container) return;

    const safeStudents = Array.isArray(students) ? students : [];

    if (safeStudents.length === 0) {
      container.innerHTML = `
        <div class="card p-6 text-center border-slate-800">
          <i class="fa-solid fa-users-slash text-3xl text-muted mb-2"></i>
          <h4 class="text-sm font-bold text-slate-200">No Student Records Found</h4>
          <p class="text-xs text-muted mt-1">Enroll your first student profile to activate ASTRAL's explainable intelligence engine.</p>
        </div>
      `;
      return;
    }

    // Filter students requiring priority attention (At Risk or Needs Attention)
    const priorityList = safeStudents
      .map(s => ({ student: s, analysis: AIEngine.analyzeStudent(s) }))
      .filter(item => item.analysis.status === 'At Risk' || item.analysis.status === 'Needs Attention')
      .sort((a, b) => b.analysis.riskScore - a.analysis.riskScore)
      .slice(0, 3); // Top 3 priority cases

    if (priorityList.length === 0) {
      container.innerHTML = `
        <div class="card p-4 border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-success text-base">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-emerald-200">All Enrolled Students Are On Track</h4>
              <p class="text-xs text-emerald-400/80">No immediate early warning alerts or academic triage required across active cohorts.</p>
            </div>
          </div>
          <span class="badge badge-risk-low font-mono">Cohort Safe (100%)</span>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="ai-priority-banner">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-danger pulse-red"></span>
            <h3 class="text-sm font-bold text-slate-100 uppercase tracking-wider">
              <i class="fa-solid fa-bolt text-danger"></i> Urgent Faculty Attention Required (${priorityList.length} Students Flagged)
            </h3>
          </div>
          <span class="text-2xs text-muted font-mono">Sorted by Highest Risk Index</span>
        </div>

        <div class="grid grid-cols-3 gap-4">
          ${priorityList.map(({ student, analysis }) => {
            const topReason = analysis.contributingFactors && analysis.contributingFactors.length > 0
              ? analysis.contributingFactors[0].detail
              : 'Academic performance warrants monitoring.';
            const action = analysis.recommendedActions && analysis.recommendedActions.length > 0
              ? analysis.recommendedActions[0]
              : 'Review progress in faculty office hours.';

            return `
              <div class="priority-student-card">
                <div>
                  <div class="flex items-start justify-between gap-2 mb-2.5">
                    <div class="flex items-center gap-2.5">
                      <img src="${student.avatar}" alt="${student.name}" class="avatar-md" />
                      <div>
                        <h4 class="text-sm font-bold text-slate-100 hover:text-primary cursor-pointer student-name" data-id="${student.id}">${student.name}</h4>
                        <span class="text-2xs text-muted font-mono">${student.department} &bull; Sem ${student.semester}</span>
                      </div>
                    </div>
                    ${UIUtils.getRiskBadge(analysis.status || analysis.riskLevel, analysis.riskScore)}
                  </div>

                  <div class="p-2.5 bg-slate-950/80 rounded border border-slate-800 text-xs mb-3 space-y-1.5">
                    <p class="text-2xs text-slate-200">
                      <strong class="text-danger"><i class="fa-solid fa-triangle-exclamation"></i> Trigger:</strong> ${topReason}
                    </p>
                    <p class="text-2xs text-indigo-300">
                      <strong><i class="fa-solid fa-bullseye"></i> Action:</strong> ${action}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  <button type="button" class="btn btn-primary btn-xs flex-1 btn-quick-plan" data-id="${student.id}">
                    <i class="fa-solid fa-list-check"></i> 7-Day Plan
                  </button>
                  <button type="button" class="btn btn-secondary btn-xs btn-quick-intv" data-id="${student.id}" title="Log Intervention">
                    <i class="fa-solid fa-user-pen"></i> Intervene
                  </button>
                  <button type="button" class="btn btn-outline btn-xs btn-quick-sim" data-id="${student.id}" title="Simulate">
                    <i class="fa-solid fa-flask"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Attach click events on priority cards
    container.querySelectorAll('.student-name').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.dataset.id;
        if (id && this.studentModal) this.studentModal.open(id);
      });
    });

    container.querySelectorAll('.btn-quick-plan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        if (id && this.studentModal) {
          this.studentModal.open(id);
          this.studentModal.activeTab = 'action-plan';
          this.studentModal.render();
        }
      });
    });

    container.querySelectorAll('.btn-quick-intv').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        if (id && this.studentModal) {
          this.studentModal.open(id);
          this.studentModal.activeTab = 'interventions';
          this.studentModal.render();
        }
      });
    });

    container.querySelectorAll('.btn-quick-sim').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        if (id && this.studentModal) {
          this.studentModal.open(id);
          this.studentModal.activeTab = 'simulator';
          this.studentModal.render();
        }
      });
    });
  }

  /**
   * Render counts inside filter tabs
   */
  renderFilterPills(students) {
    const safeStudents = Array.isArray(students) ? students : [];
    const atRisk = safeStudents.filter(s => {
      const a = AIEngine.analyzeStudent(s);
      return a.status === 'At Risk' || a.riskLevel === 'High';
    }).length;

    const moderate = safeStudents.filter(s => {
      const a = AIEngine.analyzeStudent(s);
      return a.status === 'Needs Attention' || a.riskLevel === 'Moderate';
    }).length;

    const lowRisk = safeStudents.filter(s => {
      const a = AIEngine.analyzeStudent(s);
      return a.status === 'On Track' || a.riskLevel === 'Low';
    }).length;

    const lowAtt = safeStudents.filter(s => (s.attendanceRate || 75) < 75).length;

    const countAll = document.getElementById('filter-count-all');
    const countHigh = document.getElementById('filter-count-high');
    const countMod = document.getElementById('filter-count-mod');
    const countLow = document.getElementById('filter-count-low');
    const countAtt = document.getElementById('filter-count-att');

    if (countAll) countAll.textContent = safeStudents.length;
    if (countHigh) countHigh.textContent = atRisk;
    if (countMod) countMod.textContent = moderate;
    if (countLow) countLow.textContent = lowRisk;
    if (countAtt) countAtt.textContent = lowAtt;
  }

  /**
   * Filter and sort student dataset
   */
  getFilteredStudents(students) {
    let list = Array.isArray(students) ? [...students] : [];

    // 1. Search Query / Natural Language Parser
    if (this.searchQuery) {
      list = AISearchEngine.filter(list, this.searchQuery);
    }

    // 2. Tab Filter
    if (this.currentFilter === 'high-risk') {
      list = list.filter(s => {
        const a = AIEngine.analyzeStudent(s);
        return a.status === 'At Risk' || a.riskLevel === 'High';
      });
    } else if (this.currentFilter === 'moderate') {
      list = list.filter(s => {
        const a = AIEngine.analyzeStudent(s);
        return a.status === 'Needs Attention' || a.riskLevel === 'Moderate';
      });
    } else if (this.currentFilter === 'low-risk') {
      list = list.filter(s => {
        const a = AIEngine.analyzeStudent(s);
        return a.status === 'On Track' || a.riskLevel === 'Low';
      });
    } else if (this.currentFilter === 'low-attendance') {
      list = list.filter(s => (s.attendanceRate || 75) < 75);
    }

    // 3. Department Filter
    if (this.currentDept !== 'all') {
      list = list.filter(s => s.department === this.currentDept);
    }

    // 4. Sorting
    list.sort((a, b) => {
      const aAi = AIEngine.analyzeStudent(a);
      const bAi = AIEngine.analyzeStudent(b);

      if (this.currentSort === 'risk-desc') return bAi.riskScore - aAi.riskScore;
      if (this.currentSort === 'risk-asc') return aAi.riskScore - bAi.riskScore;
      if (this.currentSort === 'cgpa-asc') return (a.cgpa || 0) - (b.cgpa || 0);
      if (this.currentSort === 'cgpa-desc') return (b.cgpa || 0) - (a.cgpa || 0);
      if (this.currentSort === 'att-asc') return (a.attendanceRate || 0) - (b.attendanceRate || 0);
      if (this.currentSort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return list;
  }

  /**
   * Render student roster (Table or Cards view)
   */
  renderStudentRoster(students) {
    const container = document.getElementById('student-roster-container');
    if (!container) return;

    const safeStudents = Array.isArray(students) ? students : [];
    const filtered = this.getFilteredStudents(safeStudents);
    const countDisplay = document.getElementById('roster-match-count');
    if (countDisplay) {
      countDisplay.textContent = `Showing ${filtered.length} of ${safeStudents.length} students`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state card p-8 text-center">
          <i class="fa-solid fa-magnifying-glass text-4xl text-muted mb-3"></i>
          <h4 class="text-base font-bold text-slate-200">No matching student profiles found</h4>
          <p class="text-xs text-muted mt-1 mb-4">Try clearing your search query or selecting a different department filter.</p>
          <button type="button" id="btn-clear-filters" class="btn btn-secondary btn-sm">Clear All Filters</button>
        </div>
      `;
      const clearBtn = container.querySelector('#btn-clear-filters');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.currentFilter = 'all';
          this.currentDept = 'all';
          const searchInput = document.getElementById('input-search-students');
          if (searchInput) searchInput.value = '';
          const deptSelect = document.getElementById('select-dept-filter');
          if (deptSelect) deptSelect.value = 'all';
          document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
          const defaultTab = document.querySelector('.filter-tab[data-filter="all"]');
          if (defaultTab) defaultTab.classList.add('active');
          this.render();
        });
      }
      return;
    }

    if (this.viewMode === 'table') {
      container.innerHTML = `
        <div class="card overflow-hidden">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student Profile</th>
                  <th>Department / Sem</th>
                  <th>CGPA</th>
                  <th>Attendance</th>
                  <th>ASTRAL Health Status</th>
                  <th>Primary AI Diagnostic</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(student => {
                  const ai = AIEngine.analyzeStudent(student);
                  const primaryCause = ai.contributingFactors && ai.contributingFactors.length > 0
                    ? ai.contributingFactors[0].detail
                    : (ai.positiveFactors && ai.positiveFactors.length > 0 ? ai.positiveFactors[0].detail : 'Stable academic cadence');
                  const att = typeof student.attendanceRate === 'number' ? student.attendanceRate : 75;
                  const cgpa = typeof student.cgpa === 'number' ? student.cgpa : 7.0;
                  return `
                    <tr class="student-row hover-row" data-id="${student.id}">
                      <td>
                        <div class="flex items-center gap-3">
                          <img src="${student.avatar}" alt="${student.name}" class="avatar-sm" />
                          <div>
                            <span class="student-name font-semibold text-slate-100 block cursor-pointer hover:text-primary">${student.name}</span>
                            <span class="text-2xs text-muted font-mono">${student.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="text-xs text-slate-200 block">${student.department}</span>
                        <span class="text-2xs text-muted">Sem ${student.semester}</span>
                      </td>
                      <td>
                        <div class="flex items-center gap-1.5">
                          <span class="font-mono font-semibold">${cgpa.toFixed(2)}</span>
                          ${UIUtils.getGpaBadge(cgpa)}
                        </div>
                      </td>
                      <td>
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-semibold">${att}%</span>
                          <div class="progress-bar-bg" style="width: 50px;">
                            <div class="progress-bar-fill ${att < 75 ? 'bg-danger' : 'bg-success'}" style="width: ${att}%;"></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        ${UIUtils.getRiskBadge(ai.status || ai.riskLevel, ai.riskScore)}
                      </td>
                      <td>
                        <span class="text-xs text-slate-300 truncate max-w-xs block" title="${primaryCause}">
                          ${primaryCause}
                        </span>
                      </td>
                      <td class="text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <button type="button" class="btn btn-outline btn-xs btn-open-dossier" data-id="${student.id}" title="Deep Dive Dossier">
                            <i class="fa-solid fa-chart-line"></i> Inspect
                          </button>
                          <button type="button" class="btn btn-secondary btn-xs btn-quick-sim" data-id="${student.id}" title="Launch What-If Simulator">
                            <i class="fa-solid fa-flask"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      // Cards Grid View
      container.innerHTML = `
        <div class="grid grid-cols-3 gap-4">
          ${filtered.map(student => {
            const ai = AIEngine.analyzeStudent(student);
            const primaryCause = ai.contributingFactors && ai.contributingFactors.length > 0
              ? ai.contributingFactors[0].detail
              : (ai.positiveFactors && ai.positiveFactors.length > 0 ? ai.positiveFactors[0].detail : 'Stable academic cadence');
            const att = typeof student.attendanceRate === 'number' ? student.attendanceRate : 75;
            const cgpa = typeof student.cgpa === 'number' ? student.cgpa : 7.0;
            return `
              <div class="card p-4 student-card-interactive flex flex-col justify-between" data-id="${student.id}">
                <div>
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2.5">
                      <img src="${student.avatar}" alt="${student.name}" class="avatar-md" />
                      <div>
                        <h4 class="font-bold text-sm text-slate-100 hover:text-primary cursor-pointer student-name">${student.name}</h4>
                        <span class="text-2xs text-muted font-mono">${student.id} &bull; Sem ${student.semester}</span>
                      </div>
                    </div>
                    ${UIUtils.getRiskBadge(ai.status || ai.riskLevel, ai.riskScore)}
                  </div>
                  
                  <div class="grid grid-cols-2 gap-2 my-3 p-2 bg-slate-900/60 rounded border border-slate-800 text-xs">
                    <div>
                      <span class="text-muted block text-2xs">CGPA</span>
                      <span class="font-mono font-bold text-slate-200">${cgpa.toFixed(2)}</span>
                    </div>
                    <div>
                      <span class="text-muted block text-2xs">Attendance</span>
                      <span class="font-bold ${att < 75 ? 'text-danger' : 'text-success'}">${att}%</span>
                    </div>
                  </div>

                  <p class="text-2xs text-slate-300 line-clamp-2 mt-1">
                    <strong class="text-primary">Diagnostic:</strong> ${primaryCause}
                  </p>
                </div>

                <div class="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                  <button type="button" class="btn btn-primary btn-xs flex-1 btn-open-dossier" data-id="${student.id}">
                    <i class="fa-solid fa-brain"></i> Inspect Intelligence
                  </button>
                  <button type="button" class="btn btn-secondary btn-xs btn-quick-sim" data-id="${student.id}" title="Simulator">
                    <i class="fa-solid fa-flask"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // Attach Row / Card Click Events safely
    container.querySelectorAll('.btn-open-dossier, .student-name').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.dataset.id || el.closest('[data-id]')?.dataset.id;
        if (id && this.studentModal) {
          this.studentModal.open(id);
        }
      });
    });

    container.querySelectorAll('.btn-quick-sim').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.dataset.id;
        if (id && this.studentModal) {
          this.studentModal.open(id);
          this.studentModal.activeTab = 'simulator';
          this.studentModal.render();
        }
      });
    });
  }

  /**
   * Bind top navigation and toolbar actions (only once)
   */
  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;

    // Search input
    const searchInput = document.getElementById('input-search-students');
    if (searchInput) {
      searchInput.addEventListener('input', UIUtils.debounce((e) => {
        this.searchQuery = e.target.value;
        const students = StorageService.getStudents();
        this.renderStudentRoster(students);
      }, 150));
    }

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.filter;
        const students = StorageService.getStudents();
        this.renderStudentRoster(students);
      });
    });

    // Department filter dropdown
    const deptSelect = document.getElementById('select-dept-filter');
    if (deptSelect) {
      deptSelect.addEventListener('change', (e) => {
        this.currentDept = e.target.value;
        const students = StorageService.getStudents();
        this.renderStudentRoster(students);
      });
    }

    // Sort dropdown
    const sortSelect = document.getElementById('select-sort-students');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        const students = StorageService.getStudents();
        this.renderStudentRoster(students);
      });
    }

    // View mode toggle
    const btnViewTable = document.getElementById('btn-view-table');
    const btnViewCards = document.getElementById('btn-view-cards');
    if (btnViewTable && btnViewCards) {
      btnViewTable.addEventListener('click', () => {
        btnViewTable.classList.add('active');
        btnViewCards.classList.remove('active');
        this.viewMode = 'table';
        const students = StorageService.getStudents();
        this.renderStudentRoster(students);
      });

      btnViewCards.addEventListener('click', () => {
        btnViewCards.classList.add('active');
        btnViewTable.classList.remove('active');
        this.viewMode = 'cards';
        const students = StorageService.getStudents();
        this.renderStudentRoster(students);
      });
    }

    // Add Student Button
    const btnAddStudent = document.getElementById('btn-add-student-modal');
    if (btnAddStudent) {
      btnAddStudent.addEventListener('click', () => {
        if (this.newStudentModal) this.newStudentModal.open();
      });
    }

    // Reset Data to Defaults Button
    const btnResetData = document.getElementById('btn-reset-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('Reset student records to factory demo dataset?')) {
          StorageService.resetToDefaults();
          UIUtils.showToast('Student dataset reset to preloaded demo records!', 'info');
          this.render();
        }
      });
    }

    // Search Query Suggestion Chips
    document.querySelectorAll('.query-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        if (searchInput) {
          searchInput.value = query;
          this.searchQuery = query;
          const students = StorageService.getStudents();
          this.renderStudentRoster(students);
        }
      });
    });
  }
}
