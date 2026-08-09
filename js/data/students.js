/**
 * ASTRAL - AI Student Success & Progress Intelligence
 * Preloaded Comprehensive Student Dataset
 */

export const INITIAL_STUDENTS = [
  {
    id: "AST-1001",
    name: "Aarav Sharma",
    email: "aarav.sharma@campus.edu",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    department: "Computer Science",
    semester: 4,
    cgpa: 6.42,
    targetCgpa: 8.50,
    attendanceRate: 64, // percentage
    assignmentCompletionRate: 68,
    submissionLatencyAvgDays: 2.8, // avg days late
    financialHold: false,
    extracurricularHours: 14,
    subjects: [
      { code: "CS401", name: "Data Structures & Algorithms", score: 58, maxScore: 100, attendance: 60, difficulty: "High" },
      { code: "CS402", name: "Database Management Systems", score: 68, maxScore: 100, attendance: 72, difficulty: "Medium" },
      { code: "CS403", name: "Operating Systems", score: 54, maxScore: 100, attendance: 58, difficulty: "High" },
      { code: "MA401", name: "Discrete Mathematics", score: 52, maxScore: 100, attendance: 62, difficulty: "High" },
      { code: "CS404", name: "Computer Networks", score: 76, maxScore: 100, attendance: 75, difficulty: "Medium" }
    ],
    weeklyAttendanceHistory: [85, 80, 75, 70, 62, 58, 55, 64],
    monthlyTestScores: [74, 71, 66, 60, 58],
    interventions: [
      { id: "INT-1", date: "2026-02-15", advisor: "Dr. K. Rao", type: "Academic Warning", notes: "Discussed steep decline in DSA scores; referred to peer tutor group.", status: "In Progress" }
    ],
    tags: ["Drop in Midterms", "Prerequisite Risk", "Attendance Deficit"]
  },
  {
    id: "AST-1002",
    name: "Ananya Deshmukh",
    email: "ananya.d@campus.edu",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    department: "Artificial Intelligence",
    semester: 6,
    cgpa: 9.35,
    targetCgpa: 9.50,
    attendanceRate: 96,
    assignmentCompletionRate: 98,
    submissionLatencyAvgDays: -0.8, // early submit
    financialHold: false,
    extracurricularHours: 8,
    subjects: [
      { code: "AI601", name: "Deep Learning Architectures", score: 94, maxScore: 100, attendance: 98, difficulty: "High" },
      { code: "AI602", name: "Natural Language Processing", score: 91, maxScore: 100, attendance: 95, difficulty: "High" },
      { code: "AI603", name: "Computer Vision", score: 95, maxScore: 100, attendance: 94, difficulty: "High" },
      { code: "MA601", name: "Optimization Methods", score: 92, maxScore: 100, attendance: 96, difficulty: "Medium" },
      { code: "AI604", name: "AI Ethics & Governance", score: 96, maxScore: 100, attendance: 98, difficulty: "Low" }
    ],
    weeklyAttendanceHistory: [94, 96, 95, 98, 96, 96, 97, 96],
    monthlyTestScores: [90, 92, 93, 94, 95],
    interventions: [],
    tags: ["Dean's List", "Research Lead", "Honor Roll"]
  },
  {
    id: "AST-1003",
    name: "Rohan Varma",
    email: "rohan.v@campus.edu",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    department: "Data Science",
    semester: 4,
    cgpa: 5.80,
    targetCgpa: 7.50,
    attendanceRate: 52,
    assignmentCompletionRate: 48,
    submissionLatencyAvgDays: 4.2,
    financialHold: true,
    extracurricularHours: 2,
    subjects: [
      { code: "DS401", name: "Statistical Machine Learning", score: 48, maxScore: 100, attendance: 45, difficulty: "High" },
      { code: "DS402", name: "Big Data Systems (Spark/Hadoop)", score: 51, maxScore: 100, attendance: 50, difficulty: "High" },
      { code: "DS403", name: "Data Visualization & BI", score: 62, maxScore: 100, attendance: 65, difficulty: "Medium" },
      { code: "MA402", name: "Linear Algebra & Probability", score: 44, maxScore: 100, attendance: 48, difficulty: "High" },
      { code: "DS404", name: "Cloud Computing for Data", score: 58, maxScore: 100, attendance: 55, difficulty: "Medium" }
    ],
    weeklyAttendanceHistory: [70, 65, 60, 52, 48, 45, 50, 52],
    monthlyTestScores: [65, 58, 54, 49, 48],
    interventions: [
      { id: "INT-2", date: "2026-02-18", advisor: "Prof. Sen", type: "Critical Intervention", notes: "Attendance dropped below 55%; financial stress reported. Connected with campus financial aid & remedial tutoring.", status: "Pending" }
    ],
    tags: ["Critical Risk", "Financial Assistance", "Attendance Deficit"]
  },
  {
    id: "AST-1004",
    name: "Priya Sundaram",
    email: "priya.s@campus.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    department: "Electrical Engineering",
    semester: 6,
    cgpa: 7.85,
    targetCgpa: 8.50,
    attendanceRate: 88,
    assignmentCompletionRate: 84,
    submissionLatencyAvgDays: 0.5,
    financialHold: false,
    extracurricularHours: 10,
    subjects: [
      { code: "EE601", name: "Control Systems Engineering", score: 76, maxScore: 100, attendance: 85, difficulty: "High" },
      { code: "EE602", name: "Power Electronics", score: 81, maxScore: 100, attendance: 90, difficulty: "High" },
      { code: "EE603", name: "Digital Signal Processing", score: 74, maxScore: 100, attendance: 86, difficulty: "High" },
      { code: "EE604", name: "Embedded Microcontrollers", score: 85, maxScore: 100, attendance: 92, difficulty: "Medium" },
      { code: "EE605", name: "Renewable Energy Systems", score: 88, maxScore: 100, attendance: 90, difficulty: "Medium" }
    ],
    weeklyAttendanceHistory: [88, 86, 90, 89, 87, 88, 88, 88],
    monthlyTestScores: [76, 78, 80, 79, 81],
    interventions: [],
    tags: ["Consistent Performer", "Lab Excellence"]
  },
  {
    id: "AST-1005",
    name: "Kabir Mehta",
    email: "kabir.m@campus.edu",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    department: "Computer Science",
    semester: 2,
    cgpa: 7.15,
    targetCgpa: 8.00,
    attendanceRate: 74,
    assignmentCompletionRate: 72,
    submissionLatencyAvgDays: 1.5,
    financialHold: false,
    extracurricularHours: 16,
    subjects: [
      { code: "CS201", name: "Object Oriented Programming", score: 72, maxScore: 100, attendance: 75, difficulty: "Medium" },
      { code: "MA201", name: "Calculus & Multivariable", score: 60, maxScore: 100, attendance: 68, difficulty: "High" },
      { code: "CS202", name: "Digital Logic Design", score: 78, maxScore: 100, attendance: 80, difficulty: "Medium" },
      { code: "PH201", name: "Engineering Physics", score: 65, maxScore: 100, attendance: 72, difficulty: "Medium" },
      { code: "HU201", name: "Professional Communication", score: 84, maxScore: 100, attendance: 82, difficulty: "Low" }
    ],
    weeklyAttendanceHistory: [82, 80, 78, 74, 72, 70, 73, 74],
    monthlyTestScores: [75, 72, 70, 68, 70],
    interventions: [
      { id: "INT-3", date: "2026-02-10", advisor: "Prof. Iyer", type: "Math Mentoring", notes: "Assigned calculus review worksheets for upcoming test.", status: "Resolved" }
    ],
    tags: ["Math Remediation", "Active Sports Club"]
  },
  {
    id: "AST-1006",
    name: "Sneha Patel",
    email: "sneha.patel@campus.edu",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    department: "Business Analytics",
    semester: 4,
    cgpa: 8.60,
    targetCgpa: 9.00,
    attendanceRate: 92,
    assignmentCompletionRate: 95,
    submissionLatencyAvgDays: -0.5,
    financialHold: false,
    extracurricularHours: 6,
    subjects: [
      { code: "BA401", name: "Predictive Business Modeling", score: 88, maxScore: 100, attendance: 94, difficulty: "Medium" },
      { code: "BA402", name: "Financial Econometrics", score: 85, maxScore: 100, attendance: 90, difficulty: "High" },
      { code: "BA403", name: "Supply Chain Analytics", score: 89, maxScore: 100, attendance: 92, difficulty: "Medium" },
      { code: "BA404", name: "Database Querying & SQL", score: 92, maxScore: 100, attendance: 95, difficulty: "Medium" },
      { code: "HU401", name: "Strategic Management", score: 90, maxScore: 100, attendance: 91, difficulty: "Low" }
    ],
    weeklyAttendanceHistory: [90, 92, 91, 93, 92, 94, 92, 92],
    monthlyTestScores: [82, 85, 87, 88, 89],
    interventions: [],
    tags: ["Top 5% Cohort", "Analytics Lead"]
  },
  {
    id: "AST-1007",
    name: "Vikram Malhotra",
    email: "vikram.m@campus.edu",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    department: "Mechanical Engineering",
    semester: 6,
    cgpa: 5.40,
    targetCgpa: 6.80,
    attendanceRate: 49,
    assignmentCompletionRate: 42,
    submissionLatencyAvgDays: 5.1,
    financialHold: false,
    extracurricularHours: 20,
    subjects: [
      { code: "ME601", name: "Thermodynamics & Heat Transfer", score: 45, maxScore: 100, attendance: 42, difficulty: "High" },
      { code: "ME602", name: "Fluid Mechanics & Machinery", score: 48, maxScore: 100, attendance: 46, difficulty: "High" },
      { code: "ME603", name: "Kinematics of Machines", score: 52, maxScore: 100, attendance: 55, difficulty: "High" },
      { code: "ME604", name: "CAD/CAM Manufacturing", score: 64, maxScore: 100, attendance: 60, difficulty: "Medium" },
      { code: "ME605", name: "Industrial Engineering", score: 58, maxScore: 100, attendance: 50, difficulty: "Medium" }
    ],
    weeklyAttendanceHistory: [68, 62, 55, 50, 46, 44, 48, 49],
    monthlyTestScores: [62, 57, 52, 47, 46],
    interventions: [
      { id: "INT-4", date: "2026-02-20", advisor: "Dr. N. Bannerjee", type: "Urgent Counseling", notes: "Extracurricular club overcommitment impacting lab attendance. Agreement signed to limit club hours to 5h/wk.", status: "Pending" }
    ],
    tags: ["High Risk", "Attendance Red Alert", "Club Overcommitment"]
  },
  {
    id: "AST-1008",
    name: "Meera Krishnan",
    email: "meera.k@campus.edu",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    department: "Artificial Intelligence",
    semester: 4,
    cgpa: 8.92,
    targetCgpa: 9.20,
    attendanceRate: 94,
    assignmentCompletionRate: 96,
    submissionLatencyAvgDays: -1.0,
    financialHold: false,
    extracurricularHours: 8,
    subjects: [
      { code: "AI401", name: "Reinforcement Learning", score: 92, maxScore: 100, attendance: 95, difficulty: "High" },
      { code: "AI402", name: "Probabilistic Graphical Models", score: 88, maxScore: 100, attendance: 93, difficulty: "High" },
      { code: "CS401", name: "Data Structures & Algorithms", score: 90, maxScore: 100, attendance: 96, difficulty: "High" },
      { code: "MA403", name: "Matrix Computations", score: 89, maxScore: 100, attendance: 92, difficulty: "Medium" },
      { code: "AI403", name: "Autonomous Systems Lab", score: 95, maxScore: 100, attendance: 96, difficulty: "Medium" }
    ],
    weeklyAttendanceHistory: [92, 94, 95, 93, 95, 96, 94, 94],
    monthlyTestScores: [86, 88, 90, 91, 92],
    interventions: [],
    tags: ["High Velocity", "Research Fellow"]
  },
  {
    id: "AST-1009",
    name: "Aditya Nair",
    email: "aditya.n@campus.edu",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    department: "Computer Science",
    semester: 6,
    cgpa: 7.30,
    targetCgpa: 8.00,
    attendanceRate: 78,
    assignmentCompletionRate: 80,
    submissionLatencyAvgDays: 0.8,
    financialHold: false,
    extracurricularHours: 12,
    subjects: [
      { code: "CS601", name: "Compiler Design", score: 68, maxScore: 100, attendance: 75, difficulty: "High" },
      { code: "CS602", name: "Distributed Systems", score: 74, maxScore: 100, attendance: 80, difficulty: "High" },
      { code: "CS603", name: "Information Security", score: 82, maxScore: 100, attendance: 82, difficulty: "Medium" },
      { code: "CS604", name: "Web Systems Engineering", score: 85, maxScore: 100, attendance: 86, difficulty: "Medium" },
      { code: "HU601", name: "Engineering Economics", score: 76, maxScore: 100, attendance: 78, difficulty: "Low" }
    ],
    weeklyAttendanceHistory: [82, 80, 78, 76, 77, 78, 78, 78],
    monthlyTestScores: [71, 73, 75, 76, 77],
    interventions: [],
    tags: ["Stable Progress", "CyberSec Enthusiast"]
  },
  {
    id: "AST-1010",
    name: "Tanya Sen",
    email: "tanya.sen@campus.edu",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    department: "Data Science",
    semester: 2,
    cgpa: 6.70,
    targetCgpa: 7.80,
    attendanceRate: 71,
    assignmentCompletionRate: 65,
    submissionLatencyAvgDays: 2.2,
    financialHold: false,
    extracurricularHours: 10,
    subjects: [
      { code: "DS201", name: "Python for Data Science", score: 78, maxScore: 100, attendance: 76, difficulty: "Medium" },
      { code: "MA202", name: "Foundations of Statistics", score: 58, maxScore: 100, attendance: 65, difficulty: "High" },
      { code: "DS202", name: "Data Wrangling & ETL", score: 72, maxScore: 100, attendance: 75, difficulty: "Medium" },
      { code: "CS203", name: "Intro to Algorithms", score: 62, maxScore: 100, attendance: 68, difficulty: "High" },
      { code: "HU202", name: "Technical Writing", score: 80, maxScore: 100, attendance: 78, difficulty: "Low" }
    ],
    weeklyAttendanceHistory: [78, 75, 72, 70, 68, 69, 70, 71],
    monthlyTestScores: [72, 69, 68, 67, 68],
    interventions: [
      { id: "INT-5", date: "2026-02-12", advisor: "Dr. Sen", type: "Study Plan Check", notes: "Assigned targeted statistics problem sets.", status: "In Progress" }
    ],
    tags: ["Stats Vulnerability", "Moderate Risk"]
  },
  {
    id: "AST-1011",
    name: "Ishaan Gupta",
    email: "ishaan.g@campus.edu",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80",
    department: "Mechanical Engineering",
    semester: 4,
    cgpa: 8.20,
    targetCgpa: 8.80,
    attendanceRate: 89,
    assignmentCompletionRate: 91,
    submissionLatencyAvgDays: 0.1,
    financialHold: false,
    extracurricularHours: 10,
    subjects: [
      { code: "ME401", name: "Solid Mechanics", score: 84, maxScore: 100, attendance: 90, difficulty: "High" },
      { code: "ME402", name: "Manufacturing Processes", score: 86, maxScore: 100, attendance: 88, difficulty: "Medium" },
      { code: "ME403", name: "Engineering Materials", score: 82, maxScore: 100, attendance: 89, difficulty: "Medium" },
      { code: "MA404", name: "Numerical Analysis", score: 79, maxScore: 100, attendance: 86, difficulty: "High" },
      { code: "ME404", name: "Fluid Lab Practicum", score: 90, maxScore: 100, attendance: 92, difficulty: "Low" }
    ],
    weeklyAttendanceHistory: [88, 90, 89, 91, 88, 90, 89, 89],
    monthlyTestScores: [79, 81, 82, 83, 84],
    interventions: [],
    tags: ["Solid Performer", "Robotics Club"]
  },
  {
    id: "AST-1012",
    name: "Zoya Fatima",
    email: "zoya.f@campus.edu",
    avatar: "https://images.unsplash.com/photo-1534751516642-a171edd25218?auto=format&fit=crop&w=150&q=80",
    department: "Electrical Engineering",
    semester: 2,
    cgpa: 6.20,
    targetCgpa: 7.50,
    attendanceRate: 61,
    assignmentCompletionRate: 58,
    submissionLatencyAvgDays: 3.5,
    financialHold: false,
    extracurricularHours: 15,
    subjects: [
      { code: "EE201", name: "Circuit Analysis & Networks", score: 54, maxScore: 100, attendance: 58, difficulty: "High" },
      { code: "EE202", name: "Electromagnetic Field Theory", score: 52, maxScore: 100, attendance: 60, difficulty: "High" },
      { code: "MA203", name: "Differential Equations", score: 58, maxScore: 100, attendance: 62, difficulty: "High" },
      { code: "CS204", name: "C++ Programming for Engineers", score: 76, maxScore: 100, attendance: 70, difficulty: "Medium" },
      { code: "EE203", name: "Circuits Hardware Lab", score: 70, maxScore: 100, attendance: 68, difficulty: "Medium" }
    ],
    weeklyAttendanceHistory: [75, 70, 68, 62, 59, 58, 60, 61],
    monthlyTestScores: [68, 64, 60, 58, 56],
    interventions: [
      { id: "INT-6", date: "2026-02-19", advisor: "Dr. K. Rao", type: "Academic Advisory", notes: "Circuit theory struggle flagged by professor. Enrolled in supplemental peer tutoring.", status: "In Progress" }
    ],
    tags: ["Circuit Theory Struggle", "Moderate Risk", "Attendance Slip"]
  },
  {
    id: "AST-1013",
    name: "Devendra Patel",
    email: "devendra.p@campus.edu",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    department: "Computer Science",
    semester: 8,
    cgpa: 8.75,
    targetCgpa: 9.00,
    attendanceRate: 91,
    assignmentCompletionRate: 96,
    submissionLatencyAvgDays: -0.2,
    financialHold: false,
    extracurricularHours: 12,
    subjects: [
      { code: "CS801", name: "Capstone Project & Thesis", score: 92, maxScore: 100, attendance: 95, difficulty: "High" },
      { code: "CS802", name: "Advanced Cloud Architecture", score: 88, maxScore: 100, attendance: 90, difficulty: "Medium" },
      { code: "CS803", name: "Quantum Computing Foundations", score: 84, maxScore: 100, attendance: 89, difficulty: "High" },
      { code: "MG801", name: "Tech Entrepreneurship", score: 90, maxScore: 100, attendance: 92, difficulty: "Low" }
    ],
    weeklyAttendanceHistory: [90, 92, 91, 90, 93, 91, 91, 91],
    monthlyTestScores: [85, 87, 88, 89, 90],
    interventions: [],
    tags: ["Graduating Senior", "Patent Pending", "High Honoree"]
  },
  {
    id: "AST-1014",
    name: "Ritika Sen",
    email: "ritika.s@campus.edu",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    department: "Business Analytics",
    semester: 2,
    cgpa: 7.60,
    targetCgpa: 8.20,
    attendanceRate: 83,
    assignmentCompletionRate: 86,
    submissionLatencyAvgDays: 0.4,
    financialHold: false,
    extracurricularHours: 10,
    subjects: [
      { code: "BA201", name: "Managerial Economics", score: 78, maxScore: 100, attendance: 84, difficulty: "Medium" },
      { code: "BA202", name: "Marketing Analytics", score: 82, maxScore: 100, attendance: 86, difficulty: "Medium" },
      { code: "BA203", name: "Financial Accounting", score: 70, maxScore: 100, attendance: 79, difficulty: "High" },
      { code: "MA204", name: "Business Calculus", score: 74, maxScore: 100, attendance: 82, difficulty: "Medium" }
    ],
    weeklyAttendanceHistory: [85, 84, 82, 83, 85, 84, 83, 83],
    monthlyTestScores: [74, 76, 75, 77, 78],
    interventions: [],
    tags: ["Steady Growth", "Case Competition"]
  },
  {
    id: "AST-1015",
    name: "Manish Joshi",
    email: "manish.j@campus.edu",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    department: "Artificial Intelligence",
    semester: 2,
    cgpa: 5.65,
    targetCgpa: 7.00,
    attendanceRate: 55,
    assignmentCompletionRate: 50,
    submissionLatencyAvgDays: 3.8,
    financialHold: false,
    extracurricularHours: 18,
    subjects: [
      { code: "AI201", name: "Introduction to AI & Ethics", score: 62, maxScore: 100, attendance: 65, difficulty: "Low" },
      { code: "MA205", name: "Linear Algebra for AI", score: 48, maxScore: 100, attendance: 50, difficulty: "High" },
      { code: "CS205", name: "Python Data Structures", score: 54, maxScore: 100, attendance: 56, difficulty: "High" },
      { code: "PH202", name: "Applied Physics", score: 56, maxScore: 100, attendance: 52, difficulty: "Medium" }
    ],
    weeklyAttendanceHistory: [70, 65, 60, 56, 52, 54, 55, 55],
    monthlyTestScores: [64, 60, 56, 52, 51],
    interventions: [
      { id: "INT-7", date: "2026-02-14", advisor: "Dr. K. Rao", type: "Academic Warning", notes: "Algebra foundation gap. Suggested 1-on-1 tutoring sessions.", status: "Pending" }
    ],
    tags: ["High Risk", "Linear Algebra Deficit", "Early Warning"]
  },
  {
    id: "AST-1016",
    name: "Kavya Menon",
    email: "kavya.m@campus.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    department: "Data Science",
    semester: 6,
    cgpa: 8.85,
    targetCgpa: 9.10,
    attendanceRate: 95,
    assignmentCompletionRate: 97,
    submissionLatencyAvgDays: -0.6,
    financialHold: false,
    extracurricularHours: 10,
    subjects: [
      { code: "DS601", name: "Deep Learning for Vision & NLP", score: 92, maxScore: 100, attendance: 96, difficulty: "High" },
      { code: "DS602", name: "Data Engineering Pipelines", score: 90, maxScore: 100, attendance: 95, difficulty: "High" },
      { code: "DS603", name: "Bayesian Statistics", score: 88, maxScore: 100, attendance: 94, difficulty: "High" },
      { code: "MG601", name: "Product Analytics", score: 94, maxScore: 100, attendance: 96, difficulty: "Low" }
    ],
    weeklyAttendanceHistory: [94, 95, 96, 95, 94, 96, 95, 95],
    monthlyTestScores: [88, 89, 91, 92, 93],
    interventions: [],
    tags: ["High Performer", "Data Engineering Lead"]
  }
];
