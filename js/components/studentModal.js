/**
 * ASTRAL - Comprehensive Student Intelligence Dossier Modal
 * Handles tabs, explainable diagnostics, 7-day personalized study plans, what-if simulation, intervention logging, profile editing, deletion, and PDF export
 */
import { AIEngine } from '../services/aiEngine.js';
import { StorageService } from '../services/storage.js';
import { UIUtils } from '../utils/ui.js';

export class StudentModal {
  constructor(analyticsManager, onStudentUpdated) {
    this.analyticsManager = analyticsManager;
    this.onStudentUpdated = onStudentUpdated;
    this.currentStudent = null;
    this.activeTab = 'overview';
    this.simParams = { attendanceDelta: 0, scoreDelta: 0, assignmentDelta: 0, latencyDelta: 0 };
    this.modalElement = null;
    this.isBackdropBound = false;
  }

  /**
   * Open modal for a given student
   */
  open(studentId) {
    const student = StorageService.getStudentById(studentId);
    if (!student) {
      UIUtils.showToast('Student record not found', 'danger');
      return;
    }
    this.currentStudent = student;
    this.activeTab = 'overview';
    this.simParams = { attendanceDelta: 0, scoreDelta: 0, assignmentDelta: 0, latencyDelta: 0 };
    this.render();
  }

  /**
   * Close modal safely
   */
  close() {
    if (this.analyticsManager) {
      this.analyticsManager.destroyChart('modal-attendance-spark');
      this.analyticsManager.destroyChart('modal-subject-radar');
    }
    if (this.modalElement) {
      this.modalElement.classList.remove('active');
      setTimeout(() => {
        if (this.modalElement && this.modalElement.parentNode) {
          this.modalElement.remove();
          this.modalElement = null;
          this.isBackdropBound = false;
        }
      }, 200);
    }
  }

  /**
   * Render modal structure
   */
  render() {
    const student = this.currentStudent;
    if (!student) return;

    const aiAnalysis = AIEngine.analyzeStudent(student);

    let modal = document.getElementById('student-dossier-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'student-dossier-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
      this.isBackdropBound = false;
    }
    this.modalElement = modal;

    modal.innerHTML = `
      <div class="modal-card modal-lg animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="modal-student-name">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="student-header-profile">
            <img src="${student.avatar}" alt="${student.name}" class="student-modal-avatar" />
            <div>
              <div class="flex items-center gap-3">
                <h2 id="modal-student-name" class="modal-title">${student.name}</h2>
                <span class="student-id-tag">${student.id}</span>
                ${UIUtils.getRiskBadge(aiAnalysis.status || aiAnalysis.riskLevel, aiAnalysis.riskScore)}
              </div>
              <p class="modal-subtitle">
                <i class="fa-solid fa-graduation-cap"></i> ${student.department} &bull; Semester ${student.semester} &bull; 
                <i class="fa-solid fa-envelope"></i> ${student.email}
              </p>
            </div>
          </div>
          <div class="modal-header-actions flex items-center gap-2">
            <button type="button" id="btn-export-dossier" class="btn btn-secondary btn-sm" title="Print or Export PDF Report">
              <i class="fa-solid fa-print"></i> Export Dossier
            </button>
            <button type="button" id="btn-delete-student" class="btn btn-outline btn-sm text-danger" title="Delete Student Record">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
            <button type="button" id="btn-close-modal" class="btn-icon" aria-label="Close modal">&times;</button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="modal-tabs">
          <button type="button" class="modal-tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
            <i class="fa-solid fa-chart-line"></i> Academic Overview
          </button>
          <button type="button" class="modal-tab-btn ${this.activeTab === 'ai-diagnostics' ? 'active' : ''}" data-tab="ai-diagnostics">
            <i class="fa-solid fa-brain"></i> Explainable Intelligence
          </button>
          <button type="button" class="modal-tab-btn ${this.activeTab === 'action-plan' ? 'active' : ''}" data-tab="action-plan">
            <i class="fa-solid fa-list-check"></i> 7-Day Study Plan
          </button>
          <button type="button" class="modal-tab-btn ${this.activeTab === 'simulator' ? 'active' : ''}" data-tab="simulator">
            <i class="fa-solid fa-flask"></i> What-If Simulator
          </button>
          <button type="button" class="modal-tab-btn ${this.activeTab === 'interventions' ? 'active' : ''}" data-tab="interventions">
            <i class="fa-solid fa-clipboard-user"></i> Interventions (${(student.interventions || []).length})
          </button>
          <button type="button" class="modal-tab-btn ${this.activeTab === 'edit-profile' ? 'active' : ''}" data-tab="edit-profile">
            <i class="fa-solid fa-user-pen"></i> Edit Profile
          </button>
        </div>

        <!-- Tab Content Body -->
        <div class="modal-body custom-scrollbar" id="modal-tab-content">
          ${this.getTabContentHTML(aiAnalysis)}
        </div>
      </div>
    `;

    // Activate backdrop
    requestAnimationFrame(() => {
      if (this.modalElement) this.modalElement.classList.add('active');
    });

    // Bind event listeners
    this.bindEvents(aiAnalysis);

    // Render charts if on overview
    if (this.activeTab === 'overview' && this.analyticsManager) {
      setTimeout(() => {
        this.analyticsManager.renderStudentModalCharts(student, 'modal-attendance-spark', 'modal-subject-radar');
      }, 50);
    }
  }

  /**
   * Generate HTML for active tab
   */
  getTabContentHTML(aiAnalysis) {
    const student = this.currentStudent;
    if (!student) return '';

    if (this.activeTab === 'overview') {
      return `
        <div class="tab-pane animate-fade-in">
          <!-- Top Metric Pills -->
          <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="kpi-mini-card">
              <span class="kpi-mini-label">Current CGPA</span>
              <div class="kpi-mini-value flex items-center justify-between">
                <span>${student.cgpa.toFixed(2)}</span>
                ${UIUtils.getGpaBadge(student.cgpa)}
              </div>
              <span class="text-xs text-muted">Target: ${student.targetCgpa.toFixed(2)}</span>
            </div>
            <div class="kpi-mini-card">
              <span class="kpi-mini-label">Attendance Rate</span>
              <div class="kpi-mini-value flex items-center justify-between">
                <span>${student.attendanceRate}%</span>
                ${UIUtils.getAttendanceBadge(student.attendanceRate)}
              </div>
              <span class="text-xs ${student.attendanceRate < 75 ? 'text-danger' : 'text-success'}">
                ${student.attendanceRate < 75 ? '⚠️ Below 75% threshold' : '✓ Good Standing'}
              </span>
            </div>
            <div class="kpi-mini-card">
              <span class="kpi-mini-label">Assignment Velocity</span>
              <div class="kpi-mini-value">${student.assignmentCompletionRate}%</div>
              <span class="text-xs text-muted">Avg Turnaround: ${student.submissionLatencyAvgDays > 0 ? `+${student.submissionLatencyAvgDays}d` : 'On Time'}</span>
            </div>
            <div class="kpi-mini-card">
              <span class="kpi-mini-label">Academic Health Score</span>
              <div class="kpi-mini-value text-accent">${aiAnalysis.healthScore || 70} / 100</div>
              <span class="text-xs text-muted">Status: ${aiAnalysis.status || 'On Track'}</span>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <div class="chart-container-card">
              <div class="flex justify-between items-center mb-3">
                <h4 class="font-semibold text-sm"><i class="fa-solid fa-chart-line text-primary"></i> 8-Week Attendance Trajectory</h4>
                <span class="text-xs text-muted">Statutory safety line: 75%</span>
              </div>
              <div style="height: 170px;">
                <canvas id="modal-attendance-spark"></canvas>
              </div>
            </div>
            <div class="chart-container-card">
              <div class="flex justify-between items-center mb-3">
                <h4 class="font-semibold text-sm"><i class="fa-solid fa-compass-drafting text-cyan-400"></i> Subject Mastery Radar</h4>
                <span class="text-xs text-muted">Scale 0 - 100</span>
              </div>
              <div style="height: 170px;">
                <canvas id="modal-subject-radar"></canvas>
              </div>
            </div>
          </div>

          <!-- Enrolled Subjects Table -->
          <div class="card p-4">
            <h4 class="font-semibold text-sm mb-3"><i class="fa-solid fa-book-bookmark text-indigo-400"></i> Enrolled Course Performance Matrix</h4>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Difficulty</th>
                    <th>Attendance</th>
                    <th>Score / 100</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${(student.subjects || []).map(sub => {
                    const isFailing = (sub.score || 0) < 60;
                    return `
                      <tr>
                        <td class="font-mono text-primary font-medium">${sub.code}</td>
                        <td>${sub.name}</td>
                        <td><span class="difficulty-pill diff-${(sub.difficulty || 'medium').toLowerCase()}">${sub.difficulty || 'Medium'}</span></td>
                        <td>${sub.attendance || 0}%</td>
                        <td>
                          <div class="flex items-center gap-2">
                            <span class="font-semibold ${isFailing ? 'text-danger' : 'text-slate-200'}">${sub.score || 0}%</span>
                            <div class="progress-bar-bg" style="width: 70px;">
                              <div class="progress-bar-fill ${isFailing ? 'bg-danger' : 'bg-primary'}" style="width: ${sub.score || 0}%;"></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          ${isFailing ? '<span class="status-pill status-warn">Needs Remediation</span>' : '<span class="status-pill status-good">Proficient</span>'}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'ai-diagnostics') {
      const breakdown = aiAnalysis.scoreBreakdown || {
        attendance: { earned: 20, max: 30, details: '' },
        subjectPerformance: { earned: 25, max: 35, details: '' },
        assignmentVelocity: { earned: 15, max: 20, details: '' },
        trajectoryTrend: { earned: 10, max: 15, details: '' }
      };

      return `
        <div class="tab-pane animate-fade-in space-y-6">
          <!-- Top Explainable Summary & Score Gauge -->
          <div class="grid grid-cols-3 gap-6">
            <!-- Health / Risk Status Card -->
            <div class="card p-5 flex flex-col items-center justify-center text-center">
              <span class="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Student Health Index</span>
              <div class="risk-gauge-circle ${aiAnalysis.status === 'At Risk' ? 'gauge-high' : aiAnalysis.status === 'Needs Attention' ? 'gauge-mod' : 'gauge-low'}">
                <span class="gauge-number">${aiAnalysis.healthScore || (100 - aiAnalysis.riskScore)} / 100</span>
                <span class="gauge-label">${aiAnalysis.status || 'On Track'}</span>
              </div>
              <span class="text-xs font-semibold ${aiAnalysis.status === 'At Risk' ? 'text-danger' : aiAnalysis.status === 'Needs Attention' ? 'text-warn' : 'text-success'} mt-3">
                Risk Score: ${aiAnalysis.riskScore}% (${aiAnalysis.status})
              </span>
            </div>

            <!-- Natural Language Explanation Box -->
            <div class="card p-5 col-span-2 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="badge ${aiAnalysis.status === 'At Risk' ? 'badge-risk-high' : aiAnalysis.status === 'Needs Attention' ? 'badge-risk-mod' : 'badge-risk-low'}">
                    <i class="fa-solid fa-circle-info"></i> Transparent Diagnostic Assessment
                  </span>
                  <span class="text-2xs text-muted font-mono">Rule Engine v1.2</span>
                </div>
                <div class="p-4 bg-slate-900/80 rounded-lg border border-slate-800 my-2">
                  <p class="text-sm text-slate-100 font-medium leading-relaxed">
                    "${aiAnalysis.explanation}"
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 mt-2 text-xs text-muted">
                <div>
                  <span>Predicted End-Term CGPA:</span>
                  <strong class="text-slate-100 ml-1 font-mono">${aiAnalysis.predictedGpa.toFixed(2)}</strong>
                  <span class="${aiAnalysis.predictedGpaDelta < 0 ? 'text-danger' : 'text-success'}">(${aiAnalysis.predictedGpaDelta >= 0 ? '+' : ''}${aiAnalysis.predictedGpaDelta})</span>
                </div>
                <div class="text-right">
                  <span>Confidence Score:</span>
                  <strong class="text-slate-100 ml-1">${aiAnalysis.confidenceScore}%</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- 4 Transparent Score Pillars -->
          <div class="card p-5">
            <h4 class="font-semibold text-sm mb-3"><i class="fa-solid fa-list-ol text-primary"></i> Explainable Health Score Breakdown (100-Point Rule System)</h4>
            <div class="grid grid-cols-4 gap-4">
              <div class="p-3 bg-slate-900/50 rounded border border-slate-800">
                <div class="flex justify-between items-center text-xs mb-1">
                  <span class="text-slate-300 font-semibold">1. Attendance</span>
                  <span class="font-mono font-bold text-primary">${breakdown.attendance.earned} / ${breakdown.attendance.max} pts</span>
                </div>
                <div class="progress-bar-bg mb-2">
                  <div class="progress-bar-fill bg-primary" style="width: ${(breakdown.attendance.earned / breakdown.attendance.max) * 100}%;"></div>
                </div>
                <p class="text-2xs text-muted">${breakdown.attendance.details}</p>
              </div>

              <div class="p-3 bg-slate-900/50 rounded border border-slate-800">
                <div class="flex justify-between items-center text-xs mb-1">
                  <span class="text-slate-300 font-semibold">2. Course Mastery</span>
                  <span class="font-mono font-bold text-cyan-400">${breakdown.subjectPerformance.earned} / ${breakdown.subjectPerformance.max} pts</span>
                </div>
                <div class="progress-bar-bg mb-2">
                  <div class="progress-bar-fill bg-cyan-400" style="width: ${(breakdown.subjectPerformance.earned / breakdown.subjectPerformance.max) * 100}%;"></div>
                </div>
                <p class="text-2xs text-muted">${breakdown.subjectPerformance.details}</p>
              </div>

              <div class="p-3 bg-slate-900/50 rounded border border-slate-800">
                <div class="flex justify-between items-center text-xs mb-1">
                  <span class="text-slate-300 font-semibold">3. Assignments</span>
                  <span class="font-mono font-bold text-indigo-400">${breakdown.assignmentVelocity.earned} / ${breakdown.assignmentVelocity.max} pts</span>
                </div>
                <div class="progress-bar-bg mb-2">
                  <div class="progress-bar-fill bg-indigo-400" style="width: ${(breakdown.assignmentVelocity.earned / breakdown.assignmentVelocity.max) * 100}%;"></div>
                </div>
                <p class="text-2xs text-muted">${breakdown.assignmentVelocity.details}</p>
              </div>

              <div class="p-3 bg-slate-900/50 rounded border border-slate-800">
                <div class="flex justify-between items-center text-xs mb-1">
                  <span class="text-slate-300 font-semibold">4. Score Momentum</span>
                  <span class="font-mono font-bold text-emerald-400">${breakdown.trajectoryTrend.earned} / ${breakdown.trajectoryTrend.max} pts</span>
                </div>
                <div class="progress-bar-bg mb-2">
                  <div class="progress-bar-fill bg-emerald-400" style="width: ${(breakdown.trajectoryTrend.earned / breakdown.trajectoryTrend.max) * 100}%;"></div>
                </div>
                <p class="text-2xs text-muted">${breakdown.trajectoryTrend.details}</p>
              </div>
            </div>
          </div>

          <!-- 2-Column: Contributing Factors vs Positive Factors -->
          <div class="grid grid-cols-2 gap-6">
            <!-- Main Contributing Risk Triggers -->
            <div class="card p-4">
              <h4 class="font-semibold text-sm mb-3 flex items-center gap-2 text-danger">
                <i class="fa-solid fa-triangle-exclamation"></i> Main Contributing Risk Factors
              </h4>
              <div class="space-y-2.5">
                ${(aiAnalysis.contributingFactors || []).map(cf => `
                  <div class="p-3 rounded bg-slate-900/40 border border-red-500/20">
                    <div class="flex justify-between items-center mb-1">
                      <span class="font-semibold text-xs text-slate-200">${cf.factor}</span>
                      <span class="risk-impact-badge impact-${(cf.impact || 'medium').toLowerCase()}">${cf.impact} Impact</span>
                    </div>
                    <p class="text-xs text-slate-300">${cf.detail}</p>
                  </div>
                `).join('')}
                ${(!aiAnalysis.contributingFactors || aiAnalysis.contributingFactors.length === 0) ? `
                  <div class="p-3 rounded bg-slate-900/30 border border-slate-800 text-xs text-success">
                    ✓ No critical risk triggers identified. All core academic indicators are within safe thresholds.
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Positive Factors & Strengths -->
            <div class="card p-4">
              <h4 class="font-semibold text-sm mb-3 flex items-center gap-2 text-success">
                <i class="fa-solid fa-circle-check"></i> Positive Academic Factors & Strengths
              </h4>
              <div class="space-y-2.5">
                ${(aiAnalysis.positiveFactors || []).map(pf => `
                  <div class="p-3 rounded bg-slate-900/40 border border-emerald-500/20">
                    <div class="flex justify-between items-center mb-1">
                      <span class="font-semibold text-xs text-slate-200">${pf.factor}</span>
                      <span class="risk-impact-badge impact-low">${pf.impact} Strength</span>
                    </div>
                    <p class="text-xs text-slate-300">${pf.detail}</p>
                  </div>
                `).join('')}
                ${(!aiAnalysis.positiveFactors || aiAnalysis.positiveFactors.length === 0) ? `
                  <div class="p-3 rounded bg-slate-900/30 border border-slate-800 text-xs text-muted">
                    No standout strengths recorded yet.
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Recommended Next Actions -->
          <div class="card p-4">
            <h4 class="font-semibold text-sm mb-3 text-indigo-300">
              <i class="fa-solid fa-bullseye"></i> Recommended Next Actions
            </h4>
            <div class="space-y-2">
              ${(aiAnalysis.recommendedActions || []).map((action, idx) => `
                <div class="flex items-start gap-2.5 p-2.5 rounded bg-slate-900/40 border border-slate-800 text-xs text-slate-200">
                  <span class="font-bold text-primary font-mono mt-0.5">${idx + 1}.</span>
                  <span>${action}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'action-plan') {
      const plan = aiAnalysis.actionPlan || AIEngine.generate7DayActionPlan(student);
      const subjects = student.subjects || [];
      const completedDays = (plan.days || []).filter(d => d.completed).length;
      const totalDays = (plan.days || []).length || 7;
      const progressPct = Math.round((completedDays / totalDays) * 100);

      return `
        <div class="tab-pane animate-fade-in space-y-6">
          <!-- Plan Customization Header & Generator Controls -->
          <div class="card p-5">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-slate-800">
              <div>
                <span class="badge badge-risk-low mb-1.5"><i class="fa-solid fa-bolt text-primary"></i> Deterministic Action Engine</span>
                <h3 class="text-base font-bold text-slate-100">${plan.title}</h3>
                <p class="text-xs text-slate-300 mt-0.5">${plan.strategy}</p>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" id="btn-regenerate-plan" class="btn btn-primary btn-sm">
                  <i class="fa-solid fa-arrows-rotate"></i> Regenerate Plan
                </button>
                <button type="button" id="btn-clear-plan" class="btn btn-outline btn-sm text-danger" title="Clear and Reset Plan">
                  <i class="fa-solid fa-trash-can"></i> Clear Plan
                </button>
              </div>
            </div>

            <!-- Parameters Customizer Form -->
            <div class="grid grid-cols-3 gap-4 pt-1">
              <div>
                <label class="form-label text-xs" for="plan-subject-select">Target Course Module</label>
                <select id="plan-subject-select" class="form-input form-input-sm">
                  ${subjects.map(sub => `
                    <option value="${sub.code}" ${sub.code === plan.subjectCode ? 'selected' : ''}>
                      ${sub.code} - ${sub.name} (Current: ${sub.score}%)
                    </option>
                  `).join('')}
                  ${subjects.length === 0 ? '<option value="CORE101">Core Foundations (65%)</option>' : ''}
                </select>
              </div>

              <div>
                <label class="form-label text-xs" for="plan-target-score">Target Performance Score (%)</label>
                <input type="number" id="plan-target-score" class="form-input form-input-sm" min="50" max="100" value="${plan.targetScore || 85}" />
              </div>

              <div>
                <label class="form-label text-xs" for="plan-daily-hours">Daily Available Study Time</label>
                <select id="plan-daily-hours" class="form-input form-input-sm">
                  <option value="1" ${plan.dailyHours === 1 ? 'selected' : ''}>1.0 Hour / Day (60 mins)</option>
                  <option value="1.5" ${plan.dailyHours === 1.5 ? 'selected' : ''}>1.5 Hours / Day (90 mins)</option>
                  <option value="2" ${plan.dailyHours === 2 || !plan.dailyHours ? 'selected' : ''}>2.0 Hours / Day (120 mins)</option>
                  <option value="3" ${plan.dailyHours === 3 ? 'selected' : ''}>3.0 Hours / Day (180 mins)</option>
                  <option value="4" ${plan.dailyHours === 4 ? 'selected' : ''}>4.0 Hours / Day (Intensive 240 mins)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Progress Completion Meter -->
          <div class="card p-4">
            <div class="flex justify-between items-center mb-2 text-xs">
              <span class="font-semibold text-slate-200"><i class="fa-solid fa-list-check text-success"></i> 7-Day Plan Execution Progress</span>
              <span class="font-mono font-bold text-primary">${completedDays} of ${totalDays} Days Completed (${progressPct}%)</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill bg-success" style="width: ${progressPct}%;"></div>
            </div>
          </div>

          <!-- 7-Day Discrete Schedule Cards -->
          <div class="space-y-3">
            ${(plan.days || []).map((day, idx) => `
              <div class="card p-4 transition-all hover:border-slate-700 ${day.completed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-900/50'}">
                <div class="flex items-start justify-between gap-4 mb-2">
                  <div class="flex items-center gap-3">
                    <input type="checkbox" class="task-checkbox plan-day-checkbox" id="check-day-${idx}" data-idx="${idx}" ${day.completed ? 'checked' : ''} />
                    <div>
                      <span class="text-2xs font-bold uppercase tracking-wider text-primary font-mono">${day.dayLabel}</span>
                      <h4 class="text-sm font-bold text-slate-100 ${day.completed ? 'line-through text-slate-400' : ''}">${day.topic}</h4>
                    </div>
                  </div>
                  <span class="badge ${day.completed ? 'badge-risk-low' : 'badge-risk-mod'} font-mono text-2xs">
                    <i class="fa-solid fa-stopwatch"></i> ${day.duration}
                  </span>
                </div>

                <p class="text-xs text-slate-300 mt-2 ml-7">${day.task}</p>

                <div class="ml-7 mt-2.5 p-2 rounded bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                  <i class="fa-solid fa-bullseye text-cyan-400 text-xs"></i>
                  <span class="text-2xs text-cyan-200"><strong>Objective:</strong> ${day.objective}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Mentorship & Recommended Learning Resources -->
          <div class="grid grid-cols-2 gap-4">
            <div class="card p-4">
              <h4 class="font-semibold text-sm mb-2"><i class="fa-solid fa-users text-cyan-400"></i> Peer Mentorship Connection</h4>
              <div class="p-3 bg-slate-900/60 rounded border border-slate-800">
                <span class="badge badge-risk-low mb-1">${aiAnalysis.peerMentorRecommendation.badge}</span>
                <p class="text-xs text-slate-300 mt-1">${aiAnalysis.peerMentorRecommendation.recommendation || `Matched with: <strong>${aiAnalysis.peerMentorRecommendation.recommendedPeer}</strong> for ${aiAnalysis.peerMentorRecommendation.focusArea}`}</p>
              </div>
            </div>
            <div class="card p-4">
              <h4 class="font-semibold text-sm mb-2"><i class="fa-solid fa-book-open-reader text-indigo-400"></i> Targeted Study Resources</h4>
              <ul class="space-y-1.5 text-xs text-slate-300">
                ${(plan.recommendedResources || []).map(r => `
                  <li class="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-800">
                    <span>${r.name}</span>
                    <span class="text-2xs uppercase text-muted font-semibold">${r.type}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'simulator') {
      const simulatedAnalysis = AIEngine.simulateScenario(student, this.simParams);
      return `
        <div class="tab-pane animate-fade-in">
          <div class="card p-4 mb-6">
            <h3 class="text-base font-bold text-slate-100 mb-1"><i class="fa-solid fa-sliders text-primary"></i> Interactive "What-If" Academic Scenario Simulator</h3>
            <p class="text-xs text-muted">Test how hypothetical changes in student attendance, exam scores, and submission timeliness affect the AI Risk Score in real time.</p>
          </div>

          <!-- Live Comparison Cards -->
          <div class="grid grid-cols-3 gap-6 mb-6">
            <!-- Current Real State -->
            <div class="card p-4 border-slate-700 text-center">
              <span class="text-xs uppercase font-semibold text-muted">Current Live Record</span>
              <div class="text-3xl font-bold font-mono my-2 text-slate-200">${aiAnalysis.healthScore || 70}/100</div>
              ${UIUtils.getRiskBadge(aiAnalysis.status || aiAnalysis.riskLevel, aiAnalysis.riskScore)}
              <div class="mt-3 text-2xs text-muted">Predicted GPA: ${aiAnalysis.predictedGpa.toFixed(2)}</div>
            </div>

            <!-- Transition Arrow -->
            <div class="flex flex-col items-center justify-center">
              <i class="fa-solid fa-angles-right text-2xl text-primary animate-pulse"></i>
              <span class="text-xs text-muted mt-2">Recalculating Rules</span>
            </div>

            <!-- Simulated State -->
            <div class="card p-4 border-primary/40 bg-primary/5 text-center">
              <span class="text-xs uppercase font-semibold text-primary">Simulated Outcome</span>
              <div class="text-3xl font-bold font-mono my-2 ${simulatedAnalysis.healthScore < aiAnalysis.healthScore ? 'text-danger' : 'text-success'}">
                ${simulatedAnalysis.healthScore || 70}/100
              </div>
              ${UIUtils.getRiskBadge(simulatedAnalysis.status || simulatedAnalysis.riskLevel, simulatedAnalysis.riskScore)}
              <div class="mt-3 text-2xs text-muted">
                Simulated GPA: <strong>${simulatedAnalysis.predictedGpa.toFixed(2)}</strong> (${simulatedAnalysis.predictedGpa - aiAnalysis.predictedGpa >= 0 ? '+' : ''}${(simulatedAnalysis.predictedGpa - aiAnalysis.predictedGpa).toFixed(2)})
              </div>
            </div>
          </div>

          <!-- Simulation Sliders -->
          <div class="card p-5 mb-6 space-y-4">
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span>Attendance Delta (Current: ${student.attendanceRate}%)</span>
                <span class="font-mono text-primary">${this.simParams.attendanceDelta >= 0 ? '+' : ''}${this.simParams.attendanceDelta}%</span>
              </div>
              <input type="range" class="slider" id="sim-slider-att" min="-30" max="30" value="${this.simParams.attendanceDelta}" />
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span>Upcoming Exam Scores Delta</span>
                <span class="font-mono text-primary">${this.simParams.scoreDelta >= 0 ? '+' : ''}${this.simParams.scoreDelta} pts</span>
              </div>
              <input type="range" class="slider" id="sim-slider-score" min="-30" max="30" value="${this.simParams.scoreDelta}" />
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span>Assignment Completion Delta</span>
                <span class="font-mono text-primary">${this.simParams.assignmentDelta >= 0 ? '+' : ''}${this.simParams.assignmentDelta}%</span>
              </div>
              <input type="range" class="slider" id="sim-slider-asg" min="-30" max="30" value="${this.simParams.assignmentDelta}" />
            </div>
          </div>

          <!-- Quick Scenario Presets -->
          <div class="flex items-center gap-3">
            <span class="text-xs font-semibold text-muted">Quick Presets:</span>
            <button type="button" class="btn btn-secondary btn-xs preset-btn" data-att="-15" data-score="-12" data-asg="-20">
              🔴 Simulate 3 Missed Labs & Test Drop
            </button>
            <button type="button" class="btn btn-secondary btn-xs preset-btn" data-att="12" data-score="15" data-asg="20">
              🟢 Simulate Full Remediation & A+ Midterm
            </button>
            <button type="button" id="btn-reset-sim" class="btn btn-outline btn-xs ml-auto">
              <i class="fa-solid fa-rotate-left"></i> Reset
            </button>
            <button type="button" id="btn-apply-sim" class="btn btn-primary btn-xs">
              <i class="fa-solid fa-floppy-disk"></i> Apply to Student Profile
            </button>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'interventions') {
      const interventions = student.interventions || [];
      return `
        <div class="tab-pane animate-fade-in">
          <!-- Log New Intervention Form -->
          <div class="card p-4 mb-6">
            <h4 class="font-semibold text-sm mb-3"><i class="fa-solid fa-user-pen text-primary"></i> Log Faculty / Counselor Intervention</h4>
            <form id="form-add-intervention" class="grid grid-cols-3 gap-3">
              <div>
                <label class="form-label text-xs" for="int-advisor">Faculty Advisor Name *</label>
                <input type="text" id="int-advisor" class="form-input" placeholder="e.g. Dr. K. Rao" required value="Dr. K. Rao" />
              </div>
              <div>
                <label class="form-label text-xs" for="int-type">Intervention Type</label>
                <select id="int-type" class="form-input">
                  <option value="Academic Warning">Academic Warning</option>
                  <option value="Math/Physics Remediation">Math/Physics Remediation</option>
                  <option value="Urgent Counseling">Urgent Counseling</option>
                  <option value="Peer Tutoring Enrollment">Peer Tutoring Enrollment</option>
                  <option value="Financial / Administrative Assistance">Financial Assistance</option>
                </select>
              </div>
              <div>
                <label class="form-label text-xs" for="int-date">Target Resolution Date</label>
                <input type="date" id="int-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
              </div>
              <div class="col-span-3">
                <label class="form-label text-xs" for="int-notes">Actionable Notes & Commitments *</label>
                <textarea id="int-notes" class="form-input" rows="2" placeholder="Describe agreed recovery steps and student commitments..." required></textarea>
              </div>
              <div class="col-span-3 text-right">
                <button type="submit" class="btn btn-primary btn-sm">
                  <i class="fa-solid fa-plus"></i> Record Intervention
                </button>
              </div>
            </form>
          </div>

          <!-- History of Interventions -->
          <div class="card p-4">
            <h4 class="font-semibold text-sm mb-3"><i class="fa-solid fa-clock-rotate-left text-muted"></i> Logged Interventions History</h4>
            <div class="space-y-3">
              ${interventions.map(intv => `
                <div class="intervention-card p-3 rounded bg-slate-900/50 border border-slate-800 flex justify-between items-start">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-xs text-slate-200">${intv.type}</span>
                      <span class="text-2xs text-muted">&bull; ${intv.date} &bull; Advisor: <strong>${intv.advisor}</strong></span>
                    </div>
                    <p class="text-xs text-slate-300 mt-1.5">${intv.notes}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <select class="form-input form-input-xs select-int-status" data-id="${intv.id}" aria-label="Update status">
                      <option value="Pending" ${intv.status === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="In Progress" ${intv.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                      <option value="Resolved" ${intv.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                  </div>
                </div>
              `).join('')}
              ${interventions.length === 0 ? '<p class="text-xs text-muted text-center py-4">No active interventions logged for this student yet.</p>' : ''}
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'edit-profile') {
      return `
        <div class="tab-pane animate-fade-in">
          <div class="card p-5 mb-6">
            <h3 class="text-base font-bold text-slate-100 mb-1"><i class="fa-solid fa-user-pen text-primary"></i> Edit Student Profile & Academic Record</h3>
            <p class="text-xs text-muted">Update core parameters. Changes immediately recompute ASTRAL explainable diagnostics and sync across the entire platform.</p>
          </div>

          <form id="form-edit-student" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label" for="edit-name">Full Name *</label>
                <input type="text" id="edit-name" class="form-input" value="${student.name}" required />
              </div>
              <div>
                <label class="form-label" for="edit-email">Campus Email *</label>
                <input type="email" id="edit-email" class="form-input" value="${student.email}" required />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="form-label" for="edit-dept">Department *</label>
                <select id="edit-dept" class="form-input" required>
                  <option value="Computer Science" ${student.department === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                  <option value="Artificial Intelligence" ${student.department === 'Artificial Intelligence' ? 'selected' : ''}>Artificial Intelligence</option>
                  <option value="Data Science" ${student.department === 'Data Science' ? 'selected' : ''}>Data Science</option>
                  <option value="Electrical Engineering" ${student.department === 'Electrical Engineering' ? 'selected' : ''}>Electrical Engineering</option>
                  <option value="Mechanical Engineering" ${student.department === 'Mechanical Engineering' ? 'selected' : ''}>Mechanical Engineering</option>
                  <option value="Business Analytics" ${student.department === 'Business Analytics' ? 'selected' : ''}>Business Analytics</option>
                </select>
              </div>
              <div>
                <label class="form-label" for="edit-sem">Semester (1-8) *</label>
                <input type="number" id="edit-sem" class="form-input" min="1" max="8" value="${student.semester}" required />
              </div>
              <div>
                <label class="form-label" for="edit-cgpa">Current CGPA (0-10) *</label>
                <input type="number" id="edit-cgpa" class="form-input" step="0.01" min="0" max="10" value="${student.cgpa}" required />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="form-label" for="edit-attendance">Attendance Rate (%) *</label>
                <input type="number" id="edit-attendance" class="form-input" min="0" max="100" value="${student.attendanceRate}" required />
              </div>
              <div>
                <label class="form-label" for="edit-target-cgpa">Target CGPA (0-10)</label>
                <input type="number" id="edit-target-cgpa" class="form-input" step="0.01" min="0" max="10" value="${student.targetCgpa}" />
              </div>
              <div>
                <label class="form-label" for="edit-extra">Extracurricular (h/wk)</label>
                <input type="number" id="edit-extra" class="form-input" min="0" max="40" value="${student.extracurricularHours}" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label" for="edit-asg">Assignment Completion (%)</label>
                <input type="number" id="edit-asg" class="form-input" min="0" max="100" value="${student.assignmentCompletionRate}" />
              </div>
              <div>
                <label class="form-label" for="edit-latency">Avg Submission Latency (Days)</label>
                <input type="number" id="edit-latency" class="form-input" step="0.1" value="${student.submissionLatencyAvgDays}" />
              </div>
            </div>

            <!-- Subject Marks Quick Edit -->
            <div class="card p-4 mt-4">
              <h4 class="font-semibold text-xs text-primary uppercase mb-3">Enrolled Course Scores</h4>
              <div class="grid grid-cols-2 gap-3">
                ${(student.subjects || []).map((sub, sIdx) => `
                  <div class="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span class="text-xs font-mono font-medium">${sub.code} - ${sub.name}</span>
                    <input type="number" class="form-input form-input-xs edit-sub-score" style="width: 70px;" min="0" max="100" data-idx="${sIdx}" value="${sub.score}" />
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button type="button" id="btn-cancel-edit" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i class="fa-solid fa-check"></i> Save & Recalculate Explainable Intelligence
              </button>
            </div>
          </form>
        </div>
      `;
    }

    return '';
  }

  /**
   * Bind event listeners for modal interactions
   */
  bindEvents(aiAnalysis) {
    if (!this.modalElement) return;

    // Bind backdrop once
    if (!this.isBackdropBound) {
      this.modalElement.addEventListener('click', (e) => {
        if (e.target === this.modalElement) this.close();
      });
      this.isBackdropBound = true;
    }

    // Close button
    const closeBtn = this.modalElement.querySelector('#btn-close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Delete Student button
    const deleteBtn = this.modalElement.querySelector('#btn-delete-student');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to permanently delete student profile "${this.currentStudent.name}" (${this.currentStudent.id})?`)) {
          const studentName = this.currentStudent.name;
          const studentId = this.currentStudent.id;
          StorageService.deleteStudent(studentId);
          UIUtils.showToast(`Student ${studentName} (${studentId}) removed from system.`, 'info');
          this.close();
          if (this.onStudentUpdated) {
            this.onStudentUpdated(null, 'delete');
          }
        }
      });
    }

    // Tab switching
    this.modalElement.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Print / Export
    const exportBtn = this.modalElement.querySelector('#btn-export-dossier');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // 7-DAY ACTION PLAN EVENT HANDLERS
    if (this.activeTab === 'action-plan') {
      const btnRegenerate = this.modalElement.querySelector('#btn-regenerate-plan');
      const btnClear = this.modalElement.querySelector('#btn-clear-plan');
      const subjectSelect = this.modalElement.querySelector('#plan-subject-select');
      const targetScoreInput = this.modalElement.querySelector('#plan-target-score');
      const dailyHoursSelect = this.modalElement.querySelector('#plan-daily-hours');

      if (btnRegenerate) {
        btnRegenerate.addEventListener('click', () => {
          const subjectCode = subjectSelect ? subjectSelect.value : null;
          const targetScore = targetScoreInput ? parseInt(targetScoreInput.value, 10) : 85;
          const dailyHours = dailyHoursSelect ? parseFloat(dailyHoursSelect.value) : 2.0;

          const newPlan = AIEngine.generate7DayActionPlan(this.currentStudent, {
            subjectCode,
            targetScore,
            dailyHours
          });

          this.currentStudent.savedStudyPlan = newPlan;
          StorageService.updateStudent(this.currentStudent);
          UIUtils.showToast(`Synthesized new 7-Day Plan for ${newPlan.subjectName}!`, 'success');
          this.render();
        });
      }

      if (btnClear) {
        btnClear.addEventListener('click', () => {
          if (confirm('Clear currently saved study plan and reset to automatic default?')) {
            delete this.currentStudent.savedStudyPlan;
            StorageService.updateStudent(this.currentStudent);
            UIUtils.showToast('Study plan cleared and reset.', 'info');
            this.render();
          }
        });
      }

      // Day Checkboxes
      this.modalElement.querySelectorAll('.plan-day-checkbox').forEach(box => {
        box.addEventListener('change', (e) => {
          const dayIdx = parseInt(e.target.dataset.idx, 10);
          if (this.currentStudent.savedStudyPlan && this.currentStudent.savedStudyPlan.days[dayIdx]) {
            this.currentStudent.savedStudyPlan.days[dayIdx].completed = e.target.checked;
          } else {
            // First time marking default plan
            const plan = AIEngine.generate7DayActionPlan(this.currentStudent);
            plan.days[dayIdx].completed = e.target.checked;
            this.currentStudent.savedStudyPlan = plan;
          }
          StorageService.updateStudent(this.currentStudent);
          this.render();
        });
      });
    }

    // Edit Profile Form
    if (this.activeTab === 'edit-profile') {
      const formEdit = this.modalElement.querySelector('#form-edit-student');
      const cancelEditBtn = this.modalElement.querySelector('#btn-cancel-edit');

      if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
          this.activeTab = 'overview';
          this.render();
        });
      }

      if (formEdit) {
        formEdit.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameEl = document.getElementById('edit-name');
          const emailEl = document.getElementById('edit-email');
          const deptEl = document.getElementById('edit-dept');
          const semEl = document.getElementById('edit-sem');
          const cgpaEl = document.getElementById('edit-cgpa');
          const attEl = document.getElementById('edit-attendance');
          const targetCgpaEl = document.getElementById('edit-target-cgpa');
          const extraEl = document.getElementById('edit-extra');
          const asgEl = document.getElementById('edit-asg');
          const latencyEl = document.getElementById('edit-latency');

          const name = nameEl ? nameEl.value.trim() : '';
          const email = emailEl ? emailEl.value.trim() : '';
          const department = deptEl ? deptEl.value : this.currentStudent.department;
          const semester = semEl ? parseInt(semEl.value, 10) : this.currentStudent.semester;
          const cgpa = cgpaEl ? parseFloat(cgpaEl.value) : this.currentStudent.cgpa;
          const attendanceRate = attEl ? parseInt(attEl.value, 10) : this.currentStudent.attendanceRate;
          const targetCgpa = targetCgpaEl ? parseFloat(targetCgpaEl.value) : this.currentStudent.targetCgpa;
          const extracurricularHours = extraEl ? parseInt(extraEl.value, 10) : this.currentStudent.extracurricularHours;
          const assignmentCompletionRate = asgEl ? parseInt(asgEl.value, 10) : this.currentStudent.assignmentCompletionRate;
          const submissionLatencyAvgDays = latencyEl ? parseFloat(latencyEl.value) : this.currentStudent.submissionLatencyAvgDays;

          // Validation
          if (!name || name.length < 2) {
            UIUtils.showToast('Please enter a valid student name (at least 2 characters)', 'warning');
            return;
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!email || !emailRegex.test(email)) {
            UIUtils.showToast('Please enter a valid email address', 'warning');
            return;
          }

          if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
            UIUtils.showToast('CGPA must be between 0.00 and 10.00', 'warning');
            return;
          }

          if (isNaN(attendanceRate) || attendanceRate < 0 || attendanceRate > 100) {
            UIUtils.showToast('Attendance Rate must be between 0% and 100%', 'warning');
            return;
          }

          // Update subject scores if edited
          const updatedSubjects = (this.currentStudent.subjects || []).map((sub, sIdx) => {
            const inputScore = formEdit.querySelector(`.edit-sub-score[data-idx="${sIdx}"]`);
            const scoreVal = inputScore ? parseInt(inputScore.value, 10) : sub.score;
            return {
              ...sub,
              score: !isNaN(scoreVal) ? Math.max(0, Math.min(100, scoreVal)) : sub.score
            };
          });

          const updated = StorageService.updateStudent({
            id: this.currentStudent.id,
            name,
            email,
            department,
            semester,
            cgpa,
            targetCgpa,
            attendanceRate,
            extracurricularHours,
            assignmentCompletionRate,
            submissionLatencyAvgDays,
            subjects: updatedSubjects
          });

          if (updated) {
            this.currentStudent = updated;
            UIUtils.showToast(`Updated profile & AI diagnostics for ${name}!`, 'success');
            this.activeTab = 'overview';
            this.render();
            if (this.onStudentUpdated) {
              this.onStudentUpdated(this.currentStudent.id, 'update');
            }
          }
        });
      }
    }

    // Simulator events
    if (this.activeTab === 'simulator') {
      const sliderAtt = this.modalElement.querySelector('#sim-slider-att');
      const sliderScore = this.modalElement.querySelector('#sim-slider-score');
      const sliderAsg = this.modalElement.querySelector('#sim-slider-asg');

      const handleSliderChange = () => {
        this.simParams.attendanceDelta = sliderAtt ? parseInt(sliderAtt.value, 10) : 0;
        this.simParams.scoreDelta = sliderScore ? parseInt(sliderScore.value, 10) : 0;
        this.simParams.assignmentDelta = sliderAsg ? parseInt(sliderAsg.value, 10) : 0;
        this.render();
      };

      if (sliderAtt) sliderAtt.addEventListener('input', handleSliderChange);
      if (sliderScore) sliderScore.addEventListener('input', handleSliderChange);
      if (sliderAsg) sliderAsg.addEventListener('input', handleSliderChange);

      // Presets
      this.modalElement.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.simParams.attendanceDelta = parseInt(btn.dataset.att, 10) || 0;
          this.simParams.scoreDelta = parseInt(btn.dataset.score, 10) || 0;
          this.simParams.assignmentDelta = parseInt(btn.dataset.asg, 10) || 0;
          this.render();
        });
      });

      // Reset
      const resetBtn = this.modalElement.querySelector('#btn-reset-sim');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.simParams = { attendanceDelta: 0, scoreDelta: 0, assignmentDelta: 0, latencyDelta: 0 };
          this.render();
        });
      }

      // Apply to Student Profile
      const applyBtn = this.modalElement.querySelector('#btn-apply-sim');
      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          const student = this.currentStudent;
          if (!student) return;

          if (this.simParams.attendanceDelta) {
            student.attendanceRate = Math.max(20, Math.min(100, student.attendanceRate + this.simParams.attendanceDelta));
            const hist = Array.isArray(student.weeklyAttendanceHistory) ? student.weeklyAttendanceHistory : [75, 75, 75, 75, 75, 75, 75, 75];
            student.weeklyAttendanceHistory = [...hist.slice(1), student.attendanceRate];
          }
          if (this.simParams.scoreDelta) {
            student.subjects = (student.subjects || []).map(s => ({
              ...s,
              score: Math.max(25, Math.min(100, (s.score || 60) + this.simParams.scoreDelta))
            }));
            const avg = student.subjects.length > 0 
              ? Math.round(student.subjects.reduce((sum, s) => sum + s.score, 0) / student.subjects.length)
              : 70;
            const tests = Array.isArray(student.monthlyTestScores) ? student.monthlyTestScores : [70, 70];
            student.monthlyTestScores = [...tests.slice(1), avg];
          }
          if (this.simParams.assignmentDelta) {
            student.assignmentCompletionRate = Math.max(10, Math.min(100, (student.assignmentCompletionRate || 80) + this.simParams.assignmentDelta));
          }

          StorageService.updateStudent(student);
          UIUtils.showToast(`Applied simulated updates to ${student.name}'s profile!`, 'success');
          this.simParams = { attendanceDelta: 0, scoreDelta: 0, assignmentDelta: 0, latencyDelta: 0 };
          this.render();
        });
      }
    }

    // Interventions events
    if (this.activeTab === 'interventions') {
      const form = this.modalElement.querySelector('#form-add-intervention');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const advisorInput = document.getElementById('int-advisor');
          const typeSelect = document.getElementById('int-type');
          const dateInput = document.getElementById('int-date');
          const notesInput = document.getElementById('int-notes');

          const advisor = advisorInput ? advisorInput.value.trim() : 'Academic Advisor';
          const type = typeSelect ? typeSelect.value : 'Academic Warning';
          const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
          const notes = notesInput ? notesInput.value.trim() : '';

          if (!advisor || advisor.length < 2) {
            UIUtils.showToast('Please enter a valid advisor name', 'warning');
            return;
          }

          if (!notes || notes.length < 5) {
            UIUtils.showToast('Please provide detailed intervention notes (at least 5 characters)', 'warning');
            return;
          }

          StorageService.addIntervention(this.currentStudent.id, {
            advisor,
            type,
            date,
            notes,
            status: 'In Progress'
          });

          this.currentStudent = StorageService.getStudentById(this.currentStudent.id);
          UIUtils.showToast('Intervention successfully logged & stored!', 'success');
          this.render();
        });
      }

      // Status dropdown change
      this.modalElement.querySelectorAll('.select-int-status').forEach(select => {
        select.addEventListener('change', (e) => {
          const intId = e.target.dataset.id;
          const newStatus = e.target.value;
          StorageService.updateInterventionStatus(this.currentStudent.id, intId, newStatus);
          UIUtils.showToast(`Updated intervention status to ${newStatus}`, 'info');
        });
      });
    }
  }
}
