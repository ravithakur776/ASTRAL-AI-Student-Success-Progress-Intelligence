/**
 * ASTRAL - Add Student Modal Component
 */
import { StorageService } from '../services/storage.js';
import { UIUtils } from '../utils/ui.js';

export class NewStudentModal {
  constructor(onStudentCreated) {
    this.onStudentCreated = onStudentCreated;
    this.modalElement = null;
    this.isBackdropBound = false;
  }

  open() {
    let modal = document.getElementById('new-student-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'new-student-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
      this.isBackdropBound = false;
    }
    this.modalElement = modal;

    modal.innerHTML = `
      <div class="modal-card modal-md animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="new-student-modal-title">
        <div class="modal-header">
          <div>
            <h3 id="new-student-modal-title" class="modal-title"><i class="fa-solid fa-user-plus text-primary"></i> Enroll New Student Profile</h3>
            <p class="modal-subtitle">Add academic parameters for real-time ASTRAL AI risk indexing.</p>
          </div>
          <button type="button" id="btn-close-new-modal" class="btn-icon" aria-label="Close modal">&times;</button>
        </div>

        <form id="form-new-student" class="modal-body custom-scrollbar space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label" for="new-name">Full Name *</label>
              <input type="text" id="new-name" class="form-input" placeholder="e.g. Rahul Kapoor" required />
            </div>
            <div>
              <label class="form-label" for="new-email">Campus Email *</label>
              <input type="email" id="new-email" class="form-input" placeholder="e.g. rahul.k@campus.edu" required />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="form-label" for="new-dept">Department *</label>
              <select id="new-dept" class="form-input" required>
                <option value="Computer Science">Computer Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Data Science">Data Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Business Analytics">Business Analytics</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="new-sem">Semester (1-8) *</label>
              <input type="number" id="new-sem" class="form-input" min="1" max="8" value="4" required />
            </div>
            <div>
              <label class="form-label" for="new-cgpa">Current CGPA (0-10) *</label>
              <input type="number" id="new-cgpa" class="form-input" step="0.01" min="0" max="10" placeholder="e.g. 7.20" required />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="form-label" for="new-attendance">Attendance Rate (%) *</label>
              <input type="number" id="new-attendance" class="form-input" min="0" max="100" placeholder="e.g. 78" required />
            </div>
            <div>
              <label class="form-label" for="new-target-cgpa">Target CGPA (0-10)</label>
              <input type="number" id="new-target-cgpa" class="form-input" step="0.01" min="0" max="10" placeholder="e.g. 8.50" value="8.50" />
            </div>
            <div>
              <label class="form-label" for="new-extra">Extracurricular (h/wk)</label>
              <input type="number" id="new-extra" class="form-input" min="0" max="40" value="10" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label" for="new-asg">Assignment Completion (%)</label>
              <input type="number" id="new-asg" class="form-input" min="0" max="100" value="80" />
            </div>
            <div>
              <label class="form-label" for="new-latency">Avg Submission Latency (Days)</label>
              <input type="number" id="new-latency" class="form-input" step="0.1" value="0.5" />
            </div>
          </div>

          <div class="p-3 bg-slate-900/60 rounded border border-slate-800">
            <span class="text-xs font-semibold text-primary block mb-1">Standard Default Course Load</span>
            <p class="text-2xs text-muted">ASTRAL will automatically configure 5 departmental core courses mapped to the selected major.</p>
          </div>

          <div class="modal-footer flex justify-end gap-2 pt-2">
            <button type="button" id="btn-cancel-new" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-check"></i> Complete Enrollment
            </button>
          </div>
        </form>
      </div>
    `;

    requestAnimationFrame(() => {
      if (this.modalElement) this.modalElement.classList.add('active');
    });

    if (!this.isBackdropBound) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
      this.isBackdropBound = true;
    }

    const closeBtn = modal.querySelector('#btn-close-new-modal');
    const cancelBtn = modal.querySelector('#btn-cancel-new');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());

    const form = modal.querySelector('#form-new-student');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }
  }

  close() {
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

  handleFormSubmit() {
    const nameEl = document.getElementById('new-name');
    const emailEl = document.getElementById('new-email');
    const deptEl = document.getElementById('new-dept');
    const semEl = document.getElementById('new-sem');
    const cgpaEl = document.getElementById('new-cgpa');
    const attEl = document.getElementById('new-attendance');
    const targetCgpaEl = document.getElementById('new-target-cgpa');
    const extraEl = document.getElementById('new-extra');
    const asgEl = document.getElementById('new-asg');
    const latencyEl = document.getElementById('new-latency');

    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const department = deptEl ? deptEl.value : 'Computer Science';
    const semester = semEl ? parseInt(semEl.value, 10) : 4;
    const cgpa = cgpaEl ? parseFloat(cgpaEl.value) : NaN;
    const attendanceRate = attEl ? parseInt(attEl.value, 10) : NaN;
    const targetCgpa = targetCgpaEl ? parseFloat(targetCgpaEl.value) : 8.5;
    const extracurricularHours = extraEl ? parseInt(extraEl.value, 10) : 8;
    const assignmentCompletionRate = asgEl ? parseInt(asgEl.value, 10) : 80;
    const submissionLatencyAvgDays = latencyEl ? parseFloat(latencyEl.value) : 0;

    // Strict Validation
    if (!name || name.length < 2) {
      UIUtils.showToast('Please enter a valid student name (at least 2 characters)', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      UIUtils.showToast('Please enter a valid email address (e.g. name@campus.edu)', 'warning');
      return;
    }

    if (isNaN(semester) || semester < 1 || semester > 8) {
      UIUtils.showToast('Semester must be an integer between 1 and 8', 'warning');
      return;
    }

    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      UIUtils.showToast('CGPA must be a valid number between 0.00 and 10.00', 'warning');
      return;
    }

    if (isNaN(attendanceRate) || attendanceRate < 0 || attendanceRate > 100) {
      UIUtils.showToast('Attendance Rate must be a percentage between 0 and 100', 'warning');
      return;
    }

    if (isNaN(targetCgpa) || targetCgpa < 0 || targetCgpa > 10) {
      UIUtils.showToast('Target CGPA must be between 0.00 and 10.00', 'warning');
      return;
    }

    const defaultSubjectsByDept = {
      'Computer Science': [
        { code: 'CS401', name: 'Algorithms & Complexity', score: Math.min(100, Math.round(cgpa * 9.5)), maxScore: 100, attendance: attendanceRate, difficulty: 'High' },
        { code: 'CS402', name: 'Computer Systems Architecture', score: Math.min(100, Math.round(cgpa * 10)), maxScore: 100, attendance: attendanceRate, difficulty: 'Medium' },
        { code: 'CS403', name: 'Operating Systems', score: Math.min(100, Math.round(cgpa * 9.2)), maxScore: 100, attendance: attendanceRate, difficulty: 'High' },
        { code: 'MA401', name: 'Discrete Structures', score: Math.min(100, Math.round(cgpa * 9.8)), maxScore: 100, attendance: attendanceRate, difficulty: 'High' },
        { code: 'CS404', name: 'Software Engineering', score: Math.min(100, Math.round(cgpa * 10.2)), maxScore: 100, attendance: attendanceRate, difficulty: 'Low' }
      ],
      'Artificial Intelligence': [
        { code: 'AI401', name: 'Neural Networks & Deep Learning', score: Math.min(100, Math.round(cgpa * 9.8)), maxScore: 100, attendance: attendanceRate, difficulty: 'High' },
        { code: 'AI402', name: 'Natural Language Systems', score: Math.min(100, Math.round(cgpa * 10)), maxScore: 100, attendance: attendanceRate, difficulty: 'High' },
        { code: 'AI403', name: 'Autonomous Robotics', score: Math.min(100, Math.round(cgpa * 9.4)), maxScore: 100, attendance: attendanceRate, difficulty: 'High' },
        { code: 'MA403', name: 'Probability & Random Processes', score: Math.min(100, Math.round(cgpa * 9.2)), maxScore: 100, attendance: attendanceRate, difficulty: 'Medium' }
      ]
    };

    const subjects = defaultSubjectsByDept[department] || [
      { code: 'CORE101', name: 'Core Foundations', score: Math.min(100, Math.round(cgpa * 10)), maxScore: 100, attendance: attendanceRate, difficulty: 'Medium' },
      { code: 'CORE102', name: 'Applied Mathematics', score: Math.min(100, Math.round(cgpa * 9.5)), maxScore: 100, attendance: attendanceRate, difficulty: 'High' },
      { code: 'CORE103', name: 'Laboratory Practicum', score: Math.min(100, Math.round(cgpa * 10.2)), maxScore: 100, attendance: attendanceRate, difficulty: 'Low' }
    ];

    const newStudent = StorageService.addStudent({
      name,
      email,
      department,
      semester,
      cgpa,
      targetCgpa,
      attendanceRate,
      assignmentCompletionRate: Math.max(0, Math.min(100, assignmentCompletionRate)),
      submissionLatencyAvgDays: isNaN(submissionLatencyAvgDays) ? 0 : submissionLatencyAvgDays,
      financialHold: false,
      extracurricularHours: Math.max(0, extracurricularHours),
      subjects,
      tags: ['New Enrollment']
    });

    UIUtils.showToast(`Student ${name} successfully enrolled and AI analyzed!`, 'success');
    this.close();

    if (this.onStudentCreated && newStudent) {
      this.onStudentCreated(newStudent.id);
    }
  }
}
