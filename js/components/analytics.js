/**
 * ASTRAL - Analytics & Interactive Charts Manager (Chart.js Integration)
 */
import { AIEngine } from '../services/aiEngine.js';

export class AnalyticsManager {
  constructor() {
    this.charts = {};
    this.initChartDefaults();
  }

  initChartDefaults() {
    if (typeof window !== 'undefined' && window.Chart) {
      try {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(99, 102, 241, 0.3)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.padding = 12;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.boxWidth = 8;
      } catch (e) {
        console.warn('Failed to configure Chart defaults:', e);
      }
    }
  }

  /**
   * Destroy chart instance if already exists
   */
  destroyChart(id) {
    if (this.charts && this.charts[id]) {
      try {
        this.charts[id].destroy();
      } catch (e) {
        console.warn(`Error destroying chart ${id}:`, e);
      }
      delete this.charts[id];
    }
  }

  /**
   * Render all dashboard charts
   */
  renderDashboardCharts(students) {
    if (typeof window === 'undefined' || !window.Chart) {
      console.warn('Chart.js is not loaded; charts will be skipped.');
      return;
    }
    if (!Array.isArray(students)) return;

    this.renderPerformanceDistributionChart(students);
    this.renderAttendanceGpaChart(students);
    this.renderRiskDistributionChart(students);
    this.renderDepartmentRadarChart(students);
  }

  /**
   * 1. Performance & Grade Distribution Bar Chart
   */
  renderPerformanceDistributionChart(students) {
    const canvas = document.getElementById('chart-performance-dist');
    if (!canvas || !window.Chart) return;
    this.destroyChart('performance-dist');

    // Group GPA into buckets
    const buckets = { '< 6.0 (At Risk)': 0, '6.0 - 6.9': 0, '7.0 - 7.9': 0, '8.0 - 8.9': 0, '9.0 - 10.0 (High)': 0 };
    students.forEach(s => {
      const gpa = typeof s.cgpa === 'number' ? s.cgpa : 7.0;
      if (gpa < 6.0) buckets['< 6.0 (At Risk)']++;
      else if (gpa < 7.0) buckets['6.0 - 6.9']++;
      else if (gpa < 8.0) buckets['7.0 - 7.9']++;
      else if (gpa < 9.0) buckets['8.0 - 8.9']++;
      else buckets['9.0 - 10.0 (High)']++;
    });

    try {
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.85)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.25)');

      const total = Math.max(1, students.length);

      this.charts['performance-dist'] = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: Object.keys(buckets),
          datasets: [{
            label: 'Student Count',
            data: Object.values(buckets),
            backgroundColor: [
              'rgba(239, 68, 68, 0.75)',
              'rgba(245, 158, 11, 0.75)',
              'rgba(59, 130, 246, 0.75)',
              'rgba(99, 102, 241, 0.75)',
              'rgba(16, 185, 129, 0.75)'
            ],
            borderColor: [
              '#ef4444',
              '#f59e0b',
              '#3b82f6',
              '#6366f1',
              '#10b981'
            ],
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.parsed.y} Students (${Math.round((context.parsed.y / total) * 100)}%)`
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
          }
        }
      });
    } catch (e) {
      console.warn('Error rendering performance distribution chart:', e);
    }
  }

  /**
   * 2. Attendance vs GPA Correlation Scatter/Line Chart
   */
  renderAttendanceGpaChart(students) {
    const canvas = document.getElementById('chart-attendance-gpa');
    if (!canvas || !window.Chart) return;
    this.destroyChart('attendance-gpa');

    const points = students.map(s => ({
      x: typeof s.attendanceRate === 'number' ? s.attendanceRate : 75,
      y: typeof s.cgpa === 'number' ? s.cgpa : 7.0,
      name: s.name || 'Student',
      dept: s.department || 'General'
    }));

    try {
      this.charts['attendance-gpa'] = new Chart(canvas, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Student Cohort',
            data: points,
            backgroundColor: points.map(p => {
              if (p.x < 75 || p.y < 6.5) return 'rgba(239, 68, 68, 0.8)';
              if (p.x < 85 || p.y < 8.0) return 'rgba(245, 158, 11, 0.8)';
              return 'rgba(16, 185, 129, 0.8)';
            }),
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 1,
            pointRadius: 6,
            pointHoverRadius: 9
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const pt = context.raw;
                  return ` ${pt.name} (${pt.dept}) | Attendance: ${pt.x}% | CGPA: ${pt.y.toFixed(2)}`;
                }
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Attendance Rate (%)', color: '#94a3b8' },
              min: 40,
              max: 100,
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
              title: { display: true, text: 'CGPA (0 - 10)', color: '#94a3b8' },
              min: 4.0,
              max: 10.0,
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
          }
        }
      });
    } catch (e) {
      console.warn('Error rendering attendance vs GPA chart:', e);
    }
  }

  /**
   * 3. Cohort Risk Distribution Doughnut Chart
   */
  renderRiskDistributionChart(students) {
    const canvas = document.getElementById('chart-risk-dist');
    if (!canvas || !window.Chart) return;
    this.destroyChart('risk-dist');

    let high = 0, moderate = 0, low = 0;
    students.forEach(s => {
      const analysis = AIEngine.analyzeStudent(s);
      if (analysis.riskLevel === 'High') high++;
      else if (analysis.riskLevel === 'Moderate') moderate++;
      else low++;
    });

    const total = Math.max(1, students.length);

    try {
      this.charts['risk-dist'] = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['High Risk', 'Moderate Risk', 'On Track (Low Risk)'],
          datasets: [{
            data: [high, moderate, low],
            backgroundColor: [
              '#ef4444',
              '#f59e0b',
              '#10b981'
            ],
            borderColor: '#111625',
            borderWidth: 3,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 16 }
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.label}: ${context.raw} Students (${Math.round((context.raw / total) * 100)}%)`
              }
            }
          }
        }
      });
    } catch (e) {
      console.warn('Error rendering risk distribution chart:', e);
    }
  }

  /**
   * 4. Department Comparative Health Radar Chart
   */
  renderDepartmentRadarChart(students) {
    const canvas = document.getElementById('chart-dept-radar');
    if (!canvas || !window.Chart) return;
    this.destroyChart('dept-radar');

    const depts = [...new Set(students.map(s => s.department || 'Computer Science'))];
    if (depts.length === 0) depts.push('Computer Science');

    const deptStats = depts.map(dept => {
      const deptStudents = students.filter(s => s.department === dept);
      const count = Math.max(1, deptStudents.length);
      const avgGpa = deptStudents.reduce((acc, s) => acc + (s.cgpa || 7), 0) / count;
      const avgAtt = deptStudents.reduce((acc, s) => acc + (s.attendanceRate || 75), 0) / count;
      const avgAsg = deptStudents.reduce((acc, s) => acc + (s.assignmentCompletionRate || 80), 0) / count;
      const atRiskPct = (deptStudents.filter(s => AIEngine.analyzeStudent(s).riskLevel === 'High').length / count) * 100;
      return {
        dept,
        avgGpaPct: (avgGpa / 10) * 100,
        avgAtt,
        avgAsg,
        safetyPct: 100 - atRiskPct
      };
    });

    try {
      this.charts['dept-radar'] = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: depts,
          datasets: [
            {
              label: 'Avg Attendance (%)',
              data: deptStats.map(d => Math.round(d.avgAtt)),
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              pointBackgroundColor: '#06b6d4',
              pointRadius: 4
            },
            {
              label: 'Avg CGPA Score (%)',
              data: deptStats.map(d => Math.round(d.avgGpaPct)),
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              pointBackgroundColor: '#6366f1',
              pointRadius: 4
            },
            {
              label: 'Cohort Safety Score (%)',
              data: deptStats.map(d => Math.round(d.safetyPct)),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              pointBackgroundColor: '#10b981',
              pointRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
              grid: { color: 'rgba(255, 255, 255, 0.08)' },
              pointLabels: { color: '#cbd5e1', font: { size: 11 } },
              ticks: { display: false, stepSize: 20 },
              min: 0,
              max: 100
            }
          },
          plugins: {
            legend: { position: 'bottom', labels: { padding: 12 } }
          }
        }
      });
    } catch (e) {
      console.warn('Error rendering department radar chart:', e);
    }
  }

  /**
   * Render student modal specific charts: 8-Week Attendance Sparkline & Subject Mastery Radar
   */
  renderStudentModalCharts(student, canvasAttendanceId, canvasSubjectRadarId) {
    if (!student || typeof window === 'undefined' || !window.Chart) return;

    // 1. Attendance Trend Line Chart
    const attCanvas = document.getElementById(canvasAttendanceId);
    if (attCanvas) {
      this.destroyChart(canvasAttendanceId);
      try {
        const ctx = attCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 160);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        const history = Array.isArray(student.weeklyAttendanceHistory) && student.weeklyAttendanceHistory.length > 0
          ? student.weeklyAttendanceHistory
          : [75, 75, 75, 75, 75, 75, 75, student.attendanceRate || 75];

        this.charts[canvasAttendanceId] = new Chart(attCanvas, {
          type: 'line',
          data: {
            labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
            datasets: [{
              label: 'Weekly Attendance (%)',
              data: history,
              borderColor: '#6366f1',
              backgroundColor: gradient,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#818cf8',
              pointRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
              y: { min: 40, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            }
          }
        });
      } catch (e) {
        console.warn('Error rendering student attendance chart:', e);
      }
    }

    // 2. Subject Mastery Radar Chart
    const subCanvas = document.getElementById(canvasSubjectRadarId);
    if (subCanvas && Array.isArray(student.subjects) && student.subjects.length > 0) {
      this.destroyChart(canvasSubjectRadarId);
      try {
        this.charts[canvasSubjectRadarId] = new Chart(subCanvas, {
          type: 'radar',
          data: {
            labels: student.subjects.map(s => s.code || 'COURSE'),
            datasets: [{
              label: 'Marks (%)',
              data: student.subjects.map(s => typeof s.score === 'number' ? s.score : 60),
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.25)',
              pointBackgroundColor: '#06b6d4',
              pointRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
                grid: { color: 'rgba(255, 255, 255, 0.08)' },
                pointLabels: { color: '#cbd5e1', font: { size: 10 } },
                ticks: { display: false },
                min: 0,
                max: 100
              }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      } catch (e) {
        console.warn('Error rendering student subject radar chart:', e);
      }
    }
  }
}
