/**
 * ASTRAL - Explainable Student Intelligence & Recommendation Engine
 * Transparent, deterministic rule-based evaluation system.
 * Analyzes attendance, subject scores, assignment completion, test trends, and extracurricular workload.
 */

export class AIEngine {
  /**
   * Transparently analyze student record and produce explainable intelligence dossier
   */
  static analyzeStudent(student) {
    if (!student || typeof student !== 'object') {
      return this.getFallbackIntelligence('Student');
    }

    const name = String(student.name || 'Student').trim();
    const evaluation = this.evaluateRules(student);
    const explanation = this.generateHumanReadableExplanation(student, evaluation);
    const actionPlan = this.generateActionPlan(student, evaluation);
    const peerMatch = this.suggestPeerMentor(student);
    const trajectory = this.calculateTrajectory(student);

    return {
      studentId: student.id || 'N/A',
      studentName: name,
      // 1. Overall Status / Classification
      status: evaluation.status, // 'At Risk' | 'Needs Attention' | 'On Track'
      riskLevel: evaluation.riskLevel, // 'High' | 'Moderate' | 'Low' (compatible with existing badge UI)
      
      // 2. Risk Score & Health Score (0 - 100)
      riskScore: evaluation.riskScore,
      healthScore: evaluation.healthScore,
      scoreBreakdown: evaluation.breakdown,

      // 3. Main Contributing Negative Factors
      contributingFactors: evaluation.contributingFactors,
      primaryRootCauses: evaluation.contributingFactors.map(f => f.detail), // compatibility alias

      // 4. Positive Factors / Strengths
      positiveFactors: evaluation.positiveFactors,

      // 5. Recommended Actions
      recommendedActions: evaluation.recommendedActions,

      // 6. Clear Natural Language Human-Readable Explanation
      explanation: explanation,
      diagnosticSummary: explanation, // compatibility alias

      // Additional Actionable Guidance
      retentionProbability: Math.max(10, Math.min(99, Math.round(evaluation.healthScore * 0.95))),
      predictedGpa: trajectory.predictedGpa,
      predictedGpaDelta: trajectory.delta,
      confidenceScore: trajectory.confidence,
      trajectoryTrend: trajectory.trend,
      actionPlan: actionPlan,
      peerMentorRecommendation: peerMatch
    };
  }

  /**
   * Transparent Rule Evaluation & Scoring Engine
   */
  static evaluateRules(student) {
    const contributingFactors = [];
    const positiveFactors = [];
    const recommendedActions = [];

    // ==========================================
    // RULE 1: Attendance Analysis (Weight: 30 pts)
    // ==========================================
    const attendance = typeof student.attendanceRate === 'number' && !isNaN(student.attendanceRate)
      ? Math.max(0, Math.min(100, student.attendanceRate))
      : 75;

    let attendancePoints = 0;
    let attendanceDetail = '';

    if (attendance >= 90) {
      attendancePoints = 30;
      attendanceDetail = `Exemplary attendance rate of ${attendance}%`;
      positiveFactors.push({
        factor: 'Exemplary Attendance',
        detail: `Regular classroom participation (${attendance}%) ensures strong continuity in lectures and lab work.`,
        impact: 'High'
      });
    } else if (attendance >= 75) {
      attendancePoints = Math.round(20 + ((attendance - 75) / 15) * 10);
      attendanceDetail = `Satisfactory attendance (${attendance}%), above the 75% institutional threshold`;
      positiveFactors.push({
        factor: 'Meets Attendance Requirement',
        detail: `Current attendance is ${attendance}%, maintaining good academic standing.`,
        impact: 'Medium'
      });
    } else if (attendance >= 60) {
      attendancePoints = Math.round(10 + ((attendance - 60) / 15) * 10);
      attendanceDetail = `Attendance warning (${attendance}%), below the statutory 75% minimum`;
      contributingFactors.push({
        factor: 'Attendance Shortfall',
        detail: `Attendance has fallen to ${attendance}%, below the required 75% mark.`,
        impact: 'Medium',
        metric: `${attendance}%`
      });
      recommendedActions.push(`Maintain regular attendance over the next 4 weeks to lift attendance above 75%.`);
    } else {
      attendancePoints = Math.max(0, Math.round((attendance / 60) * 10));
      attendanceDetail = `Severe attendance deficit (${attendance}%), putting course credit at risk`;
      contributingFactors.push({
        factor: 'Critical Attendance Deficit',
        detail: `Attendance of ${attendance}% is critically below statutory requirements, causing missed lab demonstrations and lectures.`,
        impact: 'High',
        metric: `${attendance}%`
      });
      recommendedActions.push(`Schedule urgent meeting with course coordinators to resolve attendance shortage (${attendance}%).`);
    }

    // ==========================================
    // RULE 2: Subject & Academic Performance (Weight: 35 pts)
    // ==========================================
    const subjects = Array.isArray(student.subjects) && student.subjects.length > 0
      ? student.subjects
      : [];

    let avgSubjectScore = 0;
    let academicPoints = 0;
    let academicDetail = '';

    if (subjects.length > 0) {
      const validScores = subjects.map(s => typeof s.score === 'number' && !isNaN(s.score) ? s.score : 60);
      avgSubjectScore = validScores.reduce((acc, v) => acc + v, 0) / validScores.length;

      // Check for weakest and strongest courses
      const sortedByScore = [...subjects].sort((a, b) => (a.score || 0) - (b.score || 0));
      const weakest = sortedByScore[0];
      const strongest = sortedByScore[sortedByScore.length - 1];

      // Base calculation on average
      academicPoints = Math.round((avgSubjectScore / 100) * 35);

      // Check failing subjects
      const failingCourses = subjects.filter(s => (s.score || 0) < 60);
      if (failingCourses.length > 0) {
        const courseNames = failingCourses.map(s => `${s.name || s.code} (${s.score}%)`).join(', ');
        contributingFactors.push({
          factor: 'Course Deficit / Low Marks',
          detail: `Underperforming in ${failingCourses.length} enrolled course${failingCourses.length > 1 ? 's' : ''}: ${courseNames}.`,
          impact: 'High',
          metric: `${Math.round(avgSubjectScore)}% Avg`
        });
        recommendedActions.push(`Enroll in guided tutoring or office hours for ${failingCourses[0].name || failingCourses[0].code}.`);
      }

      if (strongest && strongest.score >= 85) {
        positiveFactors.push({
          factor: 'High Subject Mastery',
          detail: `Demonstrated strong aptitude in ${strongest.name || strongest.code} (${strongest.score}%).`,
          impact: 'High'
        });
      }

      academicDetail = `Average course mark is ${Math.round(avgSubjectScore)}% across ${subjects.length} subjects`;
    } else {
      // Fallback if no granular subject array
      const cgpa = typeof student.cgpa === 'number' && !isNaN(student.cgpa) ? student.cgpa : 7.0;
      avgSubjectScore = cgpa * 10;
      academicPoints = Math.round((cgpa / 10) * 35);
      academicDetail = `Overall CGPA is ${cgpa.toFixed(2)}/10.0 (no granular subject scores provided)`;

      if (cgpa >= 8.5) {
        positiveFactors.push({
          factor: 'Dean\'s List CGPA',
          detail: `Maintains high cumulative CGPA of ${cgpa.toFixed(2)}.`,
          impact: 'High'
        });
      } else if (cgpa < 6.0) {
        contributingFactors.push({
          factor: 'Low Cumulative CGPA',
          detail: `Cumulative grade point average is ${cgpa.toFixed(2)}, below academic target.`,
          impact: 'High',
          metric: `${cgpa.toFixed(2)} CGPA`
        });
        recommendedActions.push(`Focus revision on major core modules to raise overall CGPA above 6.5.`);
      }
    }

    // ==========================================
    // RULE 3: Assignment Completion & Latency (Weight: 20 pts)
    // ==========================================
    const asgRate = typeof student.assignmentCompletionRate === 'number' && !isNaN(student.assignmentCompletionRate)
      ? Math.max(0, Math.min(100, student.assignmentCompletionRate))
      : 80;

    const latency = typeof student.submissionLatencyAvgDays === 'number' && !isNaN(student.submissionLatencyAvgDays)
      ? student.submissionLatencyAvgDays
      : 0;

    let assignmentPoints = Math.round((asgRate / 100) * 15);
    let latencyPoints = 0;

    if (latency <= 0) {
      latencyPoints = 5;
      positiveFactors.push({
        factor: 'Punctual Submissions',
        detail: `Assignments are submitted on time or ahead of deadlines with ${asgRate}% completion.`,
        impact: 'Medium'
      });
    } else if (latency <= 2.0) {
      latencyPoints = 3;
    } else {
      latencyPoints = 0;
      contributingFactors.push({
        factor: 'Chronic Submission Latency',
        detail: `Assignments submitted an average of ${latency.toFixed(1)} days late.`,
        impact: 'Medium',
        metric: `+${latency.toFixed(1)}d`
      });
      recommendedActions.push(`Establish structured weekly schedule to submit problem sets 24 hours before deadlines.`);
    }

    if (asgRate < 65) {
      contributingFactors.push({
        factor: 'Assignment Backlog',
        detail: `Only ${asgRate}% of homework and laboratory reports have been submitted.`,
        impact: 'High',
        metric: `${asgRate}%`
      });
      recommendedActions.push(`Submit outstanding laboratory reports to clear the ${100 - asgRate}% backlog.`);
    }

    const totalAssignmentPoints = Math.max(0, Math.min(20, assignmentPoints + latencyPoints));
    const assignmentDetail = `${asgRate}% assignments completed (Avg turnaround: ${latency > 0 ? `+${latency.toFixed(1)}d` : 'On time'})`;

    // ==========================================
    // RULE 4: Performance Trend / Trajectory (Weight: 15 pts)
    // ==========================================
    const testScores = Array.isArray(student.monthlyTestScores) && student.monthlyTestScores.length > 0
      ? student.monthlyTestScores.filter(n => typeof n === 'number' && !isNaN(n))
      : [];

    let trendPoints = 10; // Neutral default
    let trendDetail = 'Stable assessment trajectory';

    if (testScores.length >= 2) {
      const earliest = testScores[0];
      const latest = testScores[testScores.length - 1];
      const delta = latest - earliest;

      if (delta >= 5) {
        trendPoints = 15;
        trendDetail = `Positive score momentum (+${delta}% improvement across assessments)`;
        positiveFactors.push({
          factor: 'Upward Performance Momentum',
          detail: `Assessment scores have increased by ${delta}% over recent tests (${earliest}% -> ${latest}%).`,
          impact: 'High'
        });
      } else if (delta >= -3) {
        trendPoints = 10;
        trendDetail = `Consistent assessment cadence (${earliest}% -> ${latest}%)`;
      } else {
        trendPoints = Math.max(0, Math.round(10 + (delta / 2)));
        trendDetail = `Score decline of ${Math.abs(delta)}% across recent evaluations`;
        contributingFactors.push({
          factor: 'Declining Test Scores',
          detail: `Recent test evaluations show a ${Math.abs(delta)}% drop from ${earliest}% to ${latest}%.`,
          impact: 'High',
          metric: `${delta}%`
        });
        recommendedActions.push(`Review graded midterms to identify recurring conceptual errors before finals.`);
      }
    } else {
      trendPoints = 10;
      trendDetail = 'Initial assessment baseline active';
    }

    // ==========================================
    // TOTAL TRANSPARENT HEALTH & RISK SCORE
    // ==========================================
    const healthScore = Math.max(0, Math.min(100, attendancePoints + academicPoints + totalAssignmentPoints + trendPoints));
    const riskScore = Math.max(0, Math.min(100, 100 - healthScore));

    // Classification Thresholds
    // 80 - 100 = On Track
    // 60 - 79  = Needs Attention
    // 0 - 59   = At Risk
    let status = 'On Track';
    let riskLevel = 'Low';

    if (healthScore < 60) {
      status = 'At Risk';
      riskLevel = 'High';
    } else if (healthScore < 80) {
      status = 'Needs Attention';
      riskLevel = 'Moderate';
    } else {
      status = 'On Track';
      riskLevel = 'Low';
    }

    // Ensure at least one positive factor for strong students, or default
    if (positiveFactors.length === 0 && healthScore >= 70) {
      positiveFactors.push({
        factor: 'Balanced Academic Standing',
        detail: `Student maintains a functional academic rhythm across courses.`,
        impact: 'Medium'
      });
    }

    // Default recommendation if none added
    if (recommendedActions.length === 0) {
      if (status === 'On Track') {
        recommendedActions.push(`Continue current study habits and consider peer mentoring underclassmen.`);
      } else {
        recommendedActions.push(`Maintain regular faculty contact to sustain academic progress.`);
      }
    }

    return {
      status,
      riskLevel,
      healthScore,
      riskScore,
      breakdown: {
        attendance: { earned: attendancePoints, max: 30, details: attendanceDetail },
        subjectPerformance: { earned: academicPoints, max: 35, details: academicDetail },
        assignmentVelocity: { earned: totalAssignmentPoints, max: 20, details: assignmentDetail },
        trajectoryTrend: { earned: trendPoints, max: 15, details: trendDetail }
      },
      contributingFactors,
      positiveFactors,
      recommendedActions
    };
  }

  /**
   * Synthesize Human-Readable Natural Explanation from ACTUAL student data
   */
  static generateHumanReadableExplanation(student, evaluation) {
    const name = String(student.name || 'Student').trim();
    const status = evaluation.status;
    const contributing = evaluation.contributingFactors;
    const positive = evaluation.positiveFactors;

    // AT RISK CASE
    if (status === 'At Risk') {
      const topReasons = contributing.slice(0, 2).map(c => c.detail.toLowerCase());
      if (topReasons.length >= 2) {
        return `${name} is currently at risk because ${topReasons[0]} Additionally, ${topReasons[1]}`;
      } else if (topReasons.length === 1) {
        return `${name} is currently at risk because ${topReasons[0]}`;
      }
      return `${name} is currently at risk due to combined deficits in attendance and subject assessments. Immediate intervention is advised.`;
    }

    // NEEDS ATTENTION CASE
    if (status === 'Needs Attention') {
      if (contributing.length > 0) {
        const mainCause = contributing[0].detail;
        const mainStrength = positive.length > 0 ? positive[0].detail : '';
        return `${name} needs attention because ${mainCause.toLowerCase()}${mainStrength ? ` However, ${mainStrength.toLowerCase()}` : ''}`;
      }
      return `${name} is in the watch zone. Minor targeted study adjustments are recommended to prevent further academic slippage.`;
    }

    // ON TRACK CASE
    const topStrength = positive.length > 0 ? positive[0].detail : 'regular course engagement';
    const secondStrength = positive.length > 1 ? positive[1].detail : '';
    if (secondStrength) {
      return `${name} is on track and performing well. ${topStrength} Furthermore, ${secondStrength.toLowerCase()}`;
    }
    return `${name} is on track with steady academic progress. ${topStrength}`;
  }

  /**
   * Trajectory and GPA Delta Estimation
   */
  static calculateTrajectory(student) {
    const currentCgpa = typeof student.cgpa === 'number' && !isNaN(student.cgpa) ? student.cgpa : 7.0;
    const scores = Array.isArray(student.monthlyTestScores) && student.monthlyTestScores.length > 0
      ? student.monthlyTestScores.filter(n => typeof n === 'number' && !isNaN(n))
      : [currentCgpa * 10];

    const slope = scores.length > 1 ? (scores[scores.length - 1] - scores[0]) / Math.max(1, scores.length) : 0;
    const deltaGpa = (slope / 25) * 0.8;
    const predictedGpa = Math.max(2.0, Math.min(10.0, +(currentCgpa + deltaGpa).toFixed(2)));

    let trend = 'stable';
    if (deltaGpa > 0.15) trend = 'improving';
    else if (deltaGpa < -0.15) trend = 'declining';

    return {
      predictedGpa,
      delta: +(predictedGpa - currentCgpa).toFixed(2),
      confidence: Math.round(85 + Math.min(10, scores.length * 2)),
      trend
    };
  }

  /**
   * 4-Week Tailored Recovery/Growth Action Plan
   */
  static generateActionPlan(student, evaluation) {
    const subjects = Array.isArray(student.subjects) ? student.subjects : [];
    const weakSubject = subjects.slice().sort((a, b) => (a.score || 0) - (b.score || 0))[0] || { name: 'Core Major Courses', code: 'CORE' };
    const dept = student.department || 'Engineering';

    if (evaluation.status === 'At Risk') {
      return {
        title: "Intensive 4-Week Academic Recovery Roadmap",
        strategy: "Immediate stabilization via attendance tracking, professor 1-on-1s, and peer tutoring.",
        targetGpaBoost: "+0.65 Target Delta",
        weeks: [
          {
            week: 1,
            focus: "Immediate Stabilization & Triage",
            tasks: [
              `Schedule mandatory faculty office hour with ${weakSubject.name} instructor.`,
              `Establish daily attendance check-in agreement with Academic Success Counselor.`,
              `Clear outstanding assignment backlog for ${weakSubject.code}.`
            ]
          },
          {
            week: 2,
            focus: "Concept Remediation & Problem Solving",
            tasks: [
              `Attend 2x/week peer study sessions for ${weakSubject.name}.`,
              `Complete 3 foundational problem sets to close prerequisite gaps.`,
              `Cap non-academic activities to maximum 6 hours this week.`
            ]
          },
          {
            week: 3,
            focus: "Mid-Term Milestone & Mock Exam",
            tasks: [
              `Take proctored diagnostic test in ${weakSubject.code} targeting 70%+ score.`,
              `Submit all upcoming assignments at least 12 hours prior to deadline.`,
              `Review lab practical submissions with Teaching Assistant.`
            ]
          },
          {
            week: 4,
            focus: "Progress Evaluation & Final Target Lock",
            tasks: [
              `Formal review with Department Advisor on trajectory improvement.`,
              `Verify attendance has climbed above 75% statutory safety mark.`,
              `Transition from remediation to regular maintenance study group.`
            ]
          }
        ],
        recommendedResources: [
          { name: `${weakSubject.code} Video Lecture Archives`, type: "Online Portal" },
          { name: "Campus Learning Center Walk-In Tutoring (Tues/Thurs)", type: "On-Campus" }
        ]
      };
    } else if (evaluation.status === 'Needs Attention') {
      return {
        title: "Targeted Performance Optimization Plan",
        strategy: "Reinforce weakest subject modules and stabilize weekly study cadence.",
        targetGpaBoost: "+0.35 Target Delta",
        weeks: [
          {
            week: 1,
            focus: "Gap Identification",
            tasks: [
              `Review graded papers in ${weakSubject.name} to pinpoint recurring errors.`,
              `Set up a dedicated 45-minute daily revision block.`
            ]
          },
          {
            week: 2,
            focus: "Reinforcement & Lab Practice",
            tasks: [
              `Engage in active problem solving for ${weakSubject.code}.`,
              `Maintain 90%+ attendance across all lectures.`
            ]
          },
          {
            week: 3,
            focus: "Peer Collaboration",
            tasks: [
              `Form study triad for upcoming mid-semester assessments.`,
              `Submit course project draft early for faculty feedback.`
            ]
          },
          {
            week: 4,
            focus: "Assessment Readiness",
            tasks: [
              `Complete timed mock test for ${weakSubject.code}.`,
              `Verify CGPA projection is on track.`
            ]
          }
        ],
        recommendedResources: [
          { name: `${weakSubject.code} Concept Mindmaps`, type: "Study Aid" },
          { name: "Weekly Faculty Q&A Office Hours", type: "Faculty" }
        ]
      };
    } else {
      return {
        title: "Honors & Leadership Growth Roadmap",
        strategy: "Accelerate advanced research, competitive hackathons, and peer mentoring leadership.",
        targetGpaBoost: "Maintain Dean's List Standing",
        weeks: [
          {
            week: 1,
            focus: "Research & Advanced Topics",
            tasks: [
              `Initiate departmental research paper exploration or capstone prototype.`,
              `Register for upcoming regional technical hackathon.`
            ]
          },
          {
            week: 2,
            focus: "Peer Mentorship Leadership",
            tasks: [
              `Lead 1 peer tutoring session in ${dept} department.`,
              `Publish technical notes/tutorials on course forum.`
            ]
          },
          {
            week: 3,
            focus: "Industry Capstone Alignment",
            tasks: [
              `Connect with campus industry liaison for summer research fellowships.`,
              `Benchmark algorithm runtime optimizations for semester project.`
            ]
          },
          {
            week: 4,
            focus: "Portfolio Showcase",
            tasks: [
              `Finalize project showcase and submit paper draft for faculty review.`
            ]
          }
        ],
        recommendedResources: [
          { name: "IEEE / ACM Digital Library Research Access", type: "Research Portal" },
          { name: "Honors Undergraduate Research Grant Program", type: "Fellowship" }
        ]
      };
    }
  }

  /**
   * Suggest peer mentor pairing
   */
  static suggestPeerMentor(student) {
    const cgpa = typeof student.cgpa === 'number' ? student.cgpa : 7.0;
    const name = student.name || 'Student';
    const dept = student.department || 'Computer Science';

    if (cgpa >= 8.5) {
      return {
        role: "Mentor",
        badge: "⭐ Qualified Peer Mentor",
        recommendation: `${name} qualifies to mentor underclassmen in ${dept}.`
      };
    }
    return {
      role: "Mentee",
      badge: "🤝 Recommended Peer Match",
      recommendedPeer: "Ananya Deshmukh (AI, CGPA: 9.35)",
      focusArea: "Algorithms & Quantitative Problem Solving"
    };
  }

  /**
   * What-If Scenario Simulator: Calculate dynamic changes without mutating original
   */
  static simulateScenario(student, params = {}) {
    if (!student) return this.analyzeStudent(null);
    const cloned = JSON.parse(JSON.stringify(student));

    if (!Array.isArray(cloned.weeklyAttendanceHistory)) cloned.weeklyAttendanceHistory = [75, 75, 75, 75, 75, 75, 75, 75];
    if (!Array.isArray(cloned.monthlyTestScores)) cloned.monthlyTestScores = [70, 70, 70];
    if (!Array.isArray(cloned.subjects)) cloned.subjects = [];

    if (typeof params.attendanceDelta === 'number' && !isNaN(params.attendanceDelta)) {
      const currentAtt = typeof cloned.attendanceRate === 'number' ? cloned.attendanceRate : 75;
      cloned.attendanceRate = Math.max(20, Math.min(100, currentAtt + params.attendanceDelta));
      cloned.weeklyAttendanceHistory = [...cloned.weeklyAttendanceHistory.slice(1), cloned.attendanceRate];
    }

    if (typeof params.scoreDelta === 'number' && !isNaN(params.scoreDelta)) {
      cloned.subjects = cloned.subjects.map(s => ({
        ...s,
        score: Math.max(25, Math.min(100, (typeof s.score === 'number' ? s.score : 60) + params.scoreDelta))
      }));
      const avg = cloned.subjects.length > 0
        ? Math.round(cloned.subjects.reduce((sum, s) => sum + s.score, 0) / cloned.subjects.length)
        : 70;
      cloned.monthlyTestScores = [...cloned.monthlyTestScores.slice(1), avg];
    }

    if (typeof params.latencyDelta === 'number' && !isNaN(params.latencyDelta)) {
      const currentLatency = typeof cloned.submissionLatencyAvgDays === 'number' ? cloned.submissionLatencyAvgDays : 0;
      cloned.submissionLatencyAvgDays = Math.max(-2, +(currentLatency + params.latencyDelta).toFixed(1));
    }

    if (typeof params.assignmentDelta === 'number' && !isNaN(params.assignmentDelta)) {
      const currentAsg = typeof cloned.assignmentCompletionRate === 'number' ? cloned.assignmentCompletionRate : 80;
      cloned.assignmentCompletionRate = Math.max(10, Math.min(100, currentAsg + params.assignmentDelta));
    }

    return this.analyzeStudent(cloned);
  }

  /**
   * Fallback intelligence when student is missing or corrupted
   */
  static getFallbackIntelligence(name = 'Student') {
    return {
      studentId: 'UNKNOWN',
      studentName: name,
      status: 'Needs Attention',
      riskLevel: 'Moderate',
      riskScore: 35,
      healthScore: 65,
      scoreBreakdown: {
        attendance: { earned: 20, max: 30, details: 'Baseline assumption (75%)' },
        subjectPerformance: { earned: 24, max: 35, details: 'Baseline CGPA (7.00/10)' },
        assignmentVelocity: { earned: 12, max: 20, details: 'Baseline completion (80%)' },
        trajectoryTrend: { earned: 9, max: 15, details: 'No prior assessment data' }
      },
      contributingFactors: [{
        factor: 'Incomplete Evaluation History',
        detail: 'Student record lacks granular subject or attendance logs.',
        impact: 'Medium',
        metric: 'N/A'
      }],
      positiveFactors: [{
        factor: 'Active Enrollment',
        detail: 'Student is officially registered in the department.',
        impact: 'Low'
      }],
      recommendedActions: ['Update student record with recent attendance and test marks.'],
      explanation: `${name}'s profile has limited assessment records. Performance is currently held at baseline watch until first coursework marks are recorded.`,
      diagnosticSummary: `${name}'s profile has limited assessment records. Performance is currently held at baseline watch until first coursework marks are recorded.`,
      primaryRootCauses: ['Student record lacks granular subject or attendance logs.'],
      retentionProbability: 65,
      predictedGpa: 7.0,
      predictedGpaDelta: 0,
      confidenceScore: 60,
      trajectoryTrend: 'stable',
      actionPlan: this.generateActionPlan({ name, department: 'General' }, { status: 'Needs Attention' }),
      peerMentorRecommendation: { role: 'Mentee', badge: '🤝 Recommended Peer Match', recommendation: 'Consult department advisor.' }
    };
  }
}
