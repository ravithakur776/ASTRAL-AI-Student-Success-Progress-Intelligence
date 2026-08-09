/**
 * ASTRAL - Storage & State Persistence Service
 * LocalStorage wrapper with in-memory fallback, auto-seeding & event broadcast
 */
import { INITIAL_STUDENTS } from '../data/students.js';

const STORAGE_KEY = 'astral_students_intelligence_v1';
const LISTENERS_KEY = 'astral_storage_change';

// In-memory fallback if localStorage is blocked
let inMemoryFallback = null;

export class StorageService {
  /**
   * Check if localStorage is functional
   */
  static isLocalStorageAvailable() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    try {
      const testKey = '__astral_storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate next unique student ID (AST-1001, AST-1002...)
   */
  static generateNextId(students) {
    let maxNum = 1000;
    (students || []).forEach(s => {
      if (s && s.id && typeof s.id === 'string') {
        const match = s.id.match(/^AST-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });
    return `AST-${maxNum + 1}`;
  }

  /**
   * Validate and sanitize a student record structure
   */
  static sanitizeStudent(student, index = 0) {
    if (!student || typeof student !== 'object') {
      return null;
    }

    const cgpa = typeof student.cgpa === 'number' && !isNaN(student.cgpa) ? Math.max(0, Math.min(10, +(student.cgpa).toFixed(2))) : 7.0;
    const att = typeof student.attendanceRate === 'number' && !isNaN(student.attendanceRate) ? Math.max(0, Math.min(100, Math.round(student.attendanceRate))) : 75;

    return {
      id: student.id ? String(student.id).trim() : `AST-${1001 + index}`,
      name: String(student.name || 'Unnamed Student').trim(),
      email: String(student.email || 'student@campus.edu').trim(),
      avatar: student.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      department: String(student.department || 'Computer Science').trim(),
      semester: typeof student.semester === 'number' && !isNaN(student.semester) ? Math.max(1, Math.min(8, Math.round(student.semester))) : 4,
      cgpa,
      targetCgpa: typeof student.targetCgpa === 'number' && !isNaN(student.targetCgpa) ? Math.max(0, Math.min(10, +(student.targetCgpa).toFixed(2))) : 8.5,
      attendanceRate: att,
      assignmentCompletionRate: typeof student.assignmentCompletionRate === 'number' && !isNaN(student.assignmentCompletionRate) ? Math.max(0, Math.min(100, Math.round(student.assignmentCompletionRate))) : 80,
      submissionLatencyAvgDays: typeof student.submissionLatencyAvgDays === 'number' && !isNaN(student.submissionLatencyAvgDays) ? +(student.submissionLatencyAvgDays).toFixed(1) : 0,
      financialHold: Boolean(student.financialHold),
      extracurricularHours: typeof student.extracurricularHours === 'number' && !isNaN(student.extracurricularHours) ? Math.max(0, Math.round(student.extracurricularHours)) : 8,
      subjects: Array.isArray(student.subjects) ? student.subjects.map(s => ({
        code: String(s.code || 'SUB101').trim(),
        name: String(s.name || 'Course Subject').trim(),
        score: typeof s.score === 'number' && !isNaN(s.score) ? Math.max(0, Math.min(100, Math.round(s.score))) : Math.round(cgpa * 10),
        maxScore: 100,
        attendance: typeof s.attendance === 'number' && !isNaN(s.attendance) ? Math.max(0, Math.min(100, Math.round(s.attendance))) : att,
        difficulty: ['High', 'Medium', 'Low'].includes(s.difficulty) ? s.difficulty : 'Medium'
      })) : [],
      weeklyAttendanceHistory: Array.isArray(student.weeklyAttendanceHistory) && student.weeklyAttendanceHistory.length > 0
        ? student.weeklyAttendanceHistory.map(v => typeof v === 'number' && !isNaN(v) ? Math.max(0, Math.min(100, Math.round(v))) : att)
        : [att, att, att, att, att, att, att, att],
      monthlyTestScores: Array.isArray(student.monthlyTestScores) && student.monthlyTestScores.length > 0
        ? student.monthlyTestScores.map(v => typeof v === 'number' && !isNaN(v) ? Math.max(0, Math.min(100, Math.round(v))) : Math.round(cgpa * 10))
        : [Math.round(cgpa * 10), Math.round(cgpa * 10)],
      interventions: Array.isArray(student.interventions) ? student.interventions.map(i => ({
        id: String(i.id || `INT-${Date.now().toString().slice(-4)}`),
        date: String(i.date || new Date().toISOString().split('T')[0]),
        advisor: String(i.advisor || 'Academic Advisor').trim(),
        type: String(i.type || 'Academic Warning').trim(),
        notes: String(i.notes || '').trim(),
        status: ['Pending', 'In Progress', 'Resolved'].includes(i.status) ? i.status : 'In Progress'
      })) : [],
      tags: Array.isArray(student.tags) ? student.tags.map(String) : []
    };
  }

  /**
   * Get all students, initializing with default dataset if empty
   */
  static getStudents() {
    try {
      if (!this.isLocalStorageAvailable()) {
        if (!inMemoryFallback) {
          inMemoryFallback = INITIAL_STUDENTS.map((s, idx) => this.sanitizeStudent(s, idx));
        }
        return inMemoryFallback;
      }

      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        const sanitizedSeed = INITIAL_STUDENTS.map((s, idx) => this.sanitizeStudent(s, idx));
        this.saveStudents(sanitizedSeed);
        return sanitizedSeed;
      }

      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const sanitizedSeed = INITIAL_STUDENTS.map((s, idx) => this.sanitizeStudent(s, idx));
        this.saveStudents(sanitizedSeed);
        return sanitizedSeed;
      }

      return parsed.map((s, idx) => this.sanitizeStudent(s, idx)).filter(Boolean);
    } catch (e) {
      console.warn('Storage read error, falling back to seed data:', e);
      return INITIAL_STUDENTS.map((s, idx) => this.sanitizeStudent(s, idx));
    }
  }

  /**
   * Get student by ID
   */
  static getStudentById(id) {
    if (!id) return null;
    const students = this.getStudents();
    return students.find(s => String(s.id).toLowerCase() === String(id).toLowerCase()) || null;
  }

  /**
   * Save all students to storage and broadcast change event
   */
  static saveStudents(students) {
    if (!Array.isArray(students)) return;
    const sanitized = students.map((s, idx) => this.sanitizeStudent(s, idx)).filter(Boolean);

    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      } else {
        inMemoryFallback = sanitized;
      }
      
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent(LISTENERS_KEY, { detail: { students: sanitized } }));
      }
    } catch (e) {
      console.error('Failed to save students to storage:', e);
      inMemoryFallback = sanitized;
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent(LISTENERS_KEY, { detail: { students: sanitized } }));
      }
    }
  }

  /**
   * Update a specific student
   */
  static updateStudent(updatedStudent) {
    if (!updatedStudent || !updatedStudent.id) return null;
    const students = this.getStudents();
    const index = students.findIndex(s => String(s.id).toLowerCase() === String(updatedStudent.id).toLowerCase());
    if (index !== -1) {
      const sanitized = this.sanitizeStudent({ ...students[index], ...updatedStudent }, index);
      students[index] = sanitized;
      this.saveStudents(students);
      return sanitized;
    }
    return null;
  }

  /**
   * Add a new student with collision-proof unique ID
   */
  static addStudent(newStudent) {
    if (!newStudent) return null;
    const students = this.getStudents();

    // Ensure unique ID
    let finalId = newStudent.id ? String(newStudent.id).trim() : '';
    const idExists = finalId && students.some(s => s.id.toLowerCase() === finalId.toLowerCase());
    if (!finalId || idExists) {
      finalId = this.generateNextId(students);
    }

    const studentWithDefaults = this.sanitizeStudent({
      id: finalId,
      avatar: newStudent.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      weeklyAttendanceHistory: newStudent.weeklyAttendanceHistory || [80, 80, 80, 80, 80, 80, 80, newStudent.attendanceRate || 80],
      monthlyTestScores: newStudent.monthlyTestScores || [70, 72, 74, 75, 75],
      interventions: [],
      tags: newStudent.tags || [],
      ...newStudent
    }, students.length);

    students.unshift(studentWithDefaults);
    this.saveStudents(students);
    return studentWithDefaults;
  }

  /**
   * Delete student by ID
   */
  static deleteStudent(id) {
    if (!id) return [];
    let students = this.getStudents();
    students = students.filter(s => String(s.id).toLowerCase() !== String(id).toLowerCase());
    this.saveStudents(students);
    return students;
  }

  /**
   * Add an intervention note/plan to a student
   */
  static addIntervention(studentId, intervention) {
    if (!studentId || !intervention) return null;
    const students = this.getStudents();
    const student = students.find(s => String(s.id).toLowerCase() === String(studentId).toLowerCase());
    if (student) {
      if (!Array.isArray(student.interventions)) student.interventions = [];
      const newIntervention = {
        id: `INT-${Date.now().toString().slice(-4)}`,
        date: String(intervention.date || new Date().toISOString().split('T')[0]),
        advisor: String(intervention.advisor || 'Academic Advisor').trim(),
        type: String(intervention.type || 'Academic Warning').trim(),
        notes: String(intervention.notes || '').trim(),
        status: ['Pending', 'In Progress', 'Resolved'].includes(intervention.status) ? intervention.status : 'In Progress'
      };
      student.interventions.unshift(newIntervention);
      this.saveStudents(students);
      return newIntervention;
    }
    return null;
  }

  /**
   * Update intervention status (e.g., 'Pending' -> 'Resolved')
   */
  static updateInterventionStatus(studentId, interventionId, newStatus) {
    if (!studentId || !interventionId || !newStatus) return null;
    const students = this.getStudents();
    const student = students.find(s => String(s.id).toLowerCase() === String(studentId).toLowerCase());
    if (student && Array.isArray(student.interventions)) {
      const intv = student.interventions.find(i => String(i.id).toLowerCase() === String(interventionId).toLowerCase());
      if (intv) {
        intv.status = newStatus;
        this.saveStudents(students);
        return intv;
      }
    }
    return null;
  }

  /**
   * Reset data back to default factory state
   */
  static resetToDefaults() {
    const sanitizedSeed = INITIAL_STUDENTS.map((s, idx) => this.sanitizeStudent(s, idx));
    this.saveStudents(sanitizedSeed);
    return sanitizedSeed;
  }

  /**
   * Subscribe to storage updates
   */
  static onStorageChange(callback) {
    if (typeof window !== 'undefined' && typeof callback === 'function') {
      window.addEventListener(LISTENERS_KEY, (e) => callback(e.detail.students));
    }
  }
}
