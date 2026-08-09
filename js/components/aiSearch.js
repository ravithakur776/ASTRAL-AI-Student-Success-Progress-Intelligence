/**
 * ASTRAL - Natural Language Query & Filter Engine
 * Parses both plain text search and semantic/logical queries
 */
import { AIEngine } from '../services/aiEngine.js';

export class AISearchEngine {
  /**
   * Filter a list of students using search term / natural language intent
   */
  static filter(students, query) {
    if (!query || !query.trim()) return students;
    const q = query.toLowerCase().trim();

    // 1. Natural Language Intent Parsing
    if (q.includes('high risk') || q.includes('critical') || q.includes('at risk') || q.includes('danger')) {
      return students.filter(s => AIEngine.analyzeStudent(s).riskLevel === 'High');
    }

    if (q.includes('moderate risk') || q.includes('medium risk') || q.includes('warning')) {
      return students.filter(s => AIEngine.analyzeStudent(s).riskLevel === 'Moderate');
    }

    if (q.includes('on track') || q.includes('safe') || q.includes('low risk') || q.includes('thriving')) {
      return students.filter(s => AIEngine.analyzeStudent(s).riskLevel === 'Low');
    }

    if (q.includes('low attendance') || q.includes('attendance < 75') || q.includes('attendance drop')) {
      return students.filter(s => s.attendanceRate < 75);
    }

    if (q.includes('high attendance') || q.includes('attendance > 90')) {
      return students.filter(s => s.attendanceRate >= 90);
    }

    if (q.includes("dean's list") || q.includes('top') || q.includes('honors') || q.includes('gpa > 8.5') || q.includes('high gpa')) {
      return students.filter(s => s.cgpa >= 8.5);
    }

    if (q.includes('low gpa') || q.includes('failing') || q.includes('cgpa < 6.5') || q.includes('struggling')) {
      return students.filter(s => s.cgpa < 6.5);
    }

    if (q.includes('financial') || q.includes('hold') || q.includes('fee')) {
      return students.filter(s => s.financialHold);
    }

    if (q.includes('intervention') || q.includes('counseling') || q.includes('warning letter')) {
      return students.filter(s => s.interventions && s.interventions.length > 0);
    }

    if (q.includes('late submission') || q.includes('delayed')) {
      return students.filter(s => s.submissionLatencyAvgDays > 2);
    }

    // 2. Department or Standard Keyword Matching
    return students.filter(s => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchId = s.id.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      const matchDept = s.department.toLowerCase().includes(q);
      const matchTags = (s.tags || []).some(t => t.toLowerCase().includes(q));
      const matchSubjects = (s.subjects || []).some(sub => sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q));
      return matchName || matchId || matchEmail || matchDept || matchTags || matchSubjects;
    });
  }

  /**
   * Provide query suggestions for the UI
   */
  static getSuggestedQueries() {
    return [
      "High Risk students needing intervention",
      "Attendance < 75% alerts",
      "Dean's list honors (CGPA >= 8.5)",
      "Computer Science at-risk",
      "Late assignment turnaround",
      "Financial hold cases"
    ];
  }
}
