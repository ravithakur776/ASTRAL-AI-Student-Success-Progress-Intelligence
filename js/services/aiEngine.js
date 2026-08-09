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
    const actionPlan = student.savedStudyPlan || this.generate7DayActionPlan(student);
    const peerMatch = this.suggestPeerMentor(student);
    const trajectory = this.calculateTrajectory(student);

    return {
      studentId: student.id || 'N/A',
      studentName: name,
      // 1. Overall Status / Classification
      status: evaluation.status, // 'At Risk' | 'Needs Attention' | 'On Track'
      riskLevel: evaluation.riskLevel, // 'High' | 'Moderate' | 'Low'
      
      // 2. Risk Score & Health Score (0 - 100)
      riskScore: evaluation.riskScore,
      healthScore: evaluation.healthScore,
      scoreBreakdown: evaluation.breakdown,

      // 3. Main Contributing Negative Factors
      contributingFactors: evaluation.contributingFactors,
      primaryRootCauses: evaluation.contributingFactors.map(f => f.detail),

      // 4. Positive Factors / Strengths
      positiveFactors: evaluation.positiveFactors,

      // 5. Recommended Actions
      recommendedActions: evaluation.recommendedActions,

      // 6. Clear Natural Language Human-Readable Explanation
      explanation: explanation,
      diagnosticSummary: explanation,

      // Additional Guidance & Plans
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

    if (positiveFactors.length === 0 && healthScore >= 70) {
      positiveFactors.push({
        factor: 'Balanced Academic Standing',
        detail: `Student maintains a functional academic rhythm across courses.`,
        impact: 'Medium'
      });
    }

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
   * Generate a realistic, tailored 7-Day Action & Study Plan from student's actual parameters
   */
  static generate7DayActionPlan(student, customOptions = {}) {
    const name = String((student && student.name) || 'Student').trim();
    const subjects = Array.isArray(student && student.subjects) ? student.subjects : [];

    // 1. Identify Target Subject
    let targetSubject = null;
    if (customOptions.subjectCode && subjects.length > 0) {
      targetSubject = subjects.find(s => s.code === customOptions.subjectCode);
    }
    if (!targetSubject) {
      // Pick lowest score subject by default, or fallback
      const sorted = [...subjects].sort((a, b) => (a.score || 0) - (b.score || 0));
      targetSubject = sorted[0] || { code: 'CORE101', name: 'Core Foundations', score: 65, difficulty: 'Medium' };
    }

    // 2. Identify Current & Target Performance
    const currentScore = typeof targetSubject.score === 'number' ? targetSubject.score : 65;
    const targetScore = typeof customOptions.targetScore === 'number' && !isNaN(customOptions.targetScore)
      ? Math.max(50, Math.min(100, customOptions.targetScore))
      : Math.min(100, Math.max(75, currentScore + 15));

    // 3. Available Study Time per Day
    const availableHours = typeof customOptions.dailyHours === 'number' && !isNaN(customOptions.dailyHours)
      ? customOptions.dailyHours
      : (student && typeof student.extracurricularHours === 'number' && student.extracurricularHours > 15 ? 1.5 : 2.0);

    const minutesPerDay = Math.round(availableHours * 60);

    // 4. Topic Curriculum Library tailored to subject domain
    const curriculum = this.getSubjectCurriculum(targetSubject.name, targetSubject.code);

    // 5. Generate 7 Discrete Days
    const days = [
      {
        dayNumber: 1,
        dayLabel: 'Day 1: Diagnostics & Foundations',
        topic: curriculum.day1.topic,
        duration: `${Math.round(minutesPerDay * 0.9)} mins`,
        task: `${curriculum.day1.task} (Focus on closing the ${targetScore - currentScore}% score gap in ${targetSubject.code}).`,
        objective: curriculum.day1.objective,
        completed: false
      },
      {
        dayNumber: 2,
        dayLabel: 'Day 2: Core Concept Deep Dive',
        topic: curriculum.day2.topic,
        duration: `${minutesPerDay} mins`,
        task: curriculum.day2.task,
        objective: curriculum.day2.objective,
        completed: false
      },
      {
        dayNumber: 3,
        dayLabel: 'Day 3: Problem Solving & Lab Application',
        topic: curriculum.day3.topic,
        duration: `${Math.round(minutesPerDay * 1.1)} mins`,
        task: curriculum.day3.task,
        objective: curriculum.day3.objective,
        completed: false
      },
      {
        dayNumber: 4,
        dayLabel: 'Day 4: Assignment Backlog & Timeliness',
        topic: curriculum.day4.topic,
        duration: `${minutesPerDay} mins`,
        task: `${curriculum.day4.task} Address assignment turnaround pace for ${targetSubject.name}.`,
        objective: curriculum.day4.objective,
        completed: false
      },
      {
        dayNumber: 5,
        dayLabel: 'Day 5: Advanced Problem Sets & Peer Study',
        topic: curriculum.day5.topic,
        duration: `${minutesPerDay} mins`,
        task: curriculum.day5.task,
        objective: curriculum.day5.objective,
        completed: false
      },
      {
        dayNumber: 6,
        dayLabel: 'Day 6: Timed Mock Assessment',
        topic: curriculum.day6.topic,
        duration: `${Math.round(minutesPerDay * 1.2)} mins`,
        task: `Complete a 45-minute timed test targeting $\\ge$ ${targetScore}% accuracy in ${targetSubject.code}.`,
        objective: `Benchmark performance against target score (${targetScore}%).`,
        completed: false
      },
      {
        dayNumber: 7,
        dayLabel: 'Day 7: Error Catalog & Faculty Review',
        topic: curriculum.day7.topic,
        duration: `${Math.round(minutesPerDay * 0.8)} mins`,
        task: `Catalogue errors from Day 6 mock exam and formulate 3 targeted questions for faculty office hours.`,
        objective: `Lock in retention and transition to weekly maintenance cadence.`,
        completed: false
      }
    ];

    return {
      title: `7-Day Personalized Study & Recovery Plan: ${targetSubject.name}`,
      subjectCode: targetSubject.code,
      subjectName: targetSubject.name,
      currentScore: currentScore,
      targetScore: targetScore,
      dailyHours: availableHours,
      generatedAt: new Date().toISOString(),
      strategy: `Targeted 7-day boost from ${currentScore}% to ${targetScore}% with ${availableHours}h/day focused revision.`,
      days: days,
      recommendedResources: [
        { name: `${targetSubject.code} Video Lecture Archives`, type: "Online Portal" },
        { name: "Campus Learning Center Walk-In Tutoring (Tues/Thurs)", type: "On-Campus" },
        { name: "Curated Practice Problem Workbook", type: "Digital Reference" }
      ]
    };
  }

  /**
   * Domain-Specific Curriculum Topics
   */
  static getSubjectCurriculum(subjectName, subjectCode) {
    const s = `${subjectName} ${subjectCode}`.toLowerCase();

    if (s.includes('algorithm') || s.includes('data structure') || s.includes('cs401')) {
      return {
        day1: { topic: 'Asymptotic Complexity & Recursion Tracing', task: 'Map recurrence trees and analyze Big-O upper/lower bounds for core divide-and-conquer algorithms.', objective: 'Identify why midterm lost points on recursion tree analysis.' },
        day2: { topic: 'Dynamic Programming & Memoization Patterns', task: 'Solve 3 classic 1D & 2D memoization problems (Knapsack, Longest Common Subsequence).', objective: 'Master optimal substructure and overlapping subproblems.' },
        day3: { topic: 'Graph Algorithms (BFS/DFS & Shortest Paths)', task: 'Trace Dijkstra and Bellman-Ford on weighted directed graphs with edge cases.', objective: 'Achieve 100% accuracy on adjacency list graph traversals.' },
        day4: { topic: 'Balanced Trees, Heaps & Priority Queues', task: 'Implement Red-Black tree insertion cases and binary heap heapify operations.', objective: 'Eliminate runtime confusion between Min-Heaps and Max-Heaps.' },
        day5: { topic: 'Sorting Lower Bounds & Greedy Strategies', task: 'Complete 5 practical algorithmic scenario questions with proof sketches.', objective: 'Understand when greedy choice property holds vs when DP is required.' },
        day6: { topic: 'Timed Algorithmic Problem Solving Sprint', task: 'Simulate full exam conditions with 3 algorithmic coding/proof problems.', objective: 'Verify execution speed under timed pressure.' },
        day7: { topic: 'Complexity Proofs & Office Hour Synthesis', task: 'Review edge-case failures with Teaching Assistant and annotate master cheat-sheet.', objective: 'Solidify mastery for end-term assessment.' }
      };
    }

    if (s.includes('operating') || s.includes('system') || s.includes('cs403') || s.includes('cs402')) {
      return {
        day1: { topic: 'Process Lifecycle & CPU Scheduling', task: 'Calculate turnaround and waiting times for Round Robin, SJF, and Multi-level feedback queues.', objective: 'Master Gantt chart scheduling derivations.' },
        day2: { topic: 'Thread Synchronization & Deadlock Handling', task: 'Solve Producer-Consumer and Dining Philosophers problems using Semaphores and Mutexes.', objective: 'Prevent race conditions and deadlock cycles.' },
        day3: { topic: 'Virtual Memory & Page Replacement', task: 'Trace LRU, FIFO, and Optimal page replacement algorithms on a 12-reference string.', objective: 'Calculate exact page fault rates without arithmetic slips.' },
        day4: { topic: 'File System Inodes & Disk Scheduling', task: 'Trace SCAN, C-LOOK disk scheduling algorithms and multi-level index file layout.', objective: 'Understand filesystem block allocation and inode pointers.' },
        day5: { topic: 'Inter-Process Communication & Sockets', task: 'Review shared memory vs message passing tradeoffs in POSIX systems.', objective: 'Explain kernel vs user-space context switching.' },
        day6: { topic: 'Proctored Systems Architecture Quiz', task: 'Take 45-minute timed theoretical quiz covering concurrency and virtual memory.', objective: 'Identify remaining gaps in OS primitives.' },
        day7: { topic: 'Kernel Concepts Synthesis', task: 'Document complete summary mindmap of kernel memory and system calls.', objective: 'Finalize retention and test readiness.' }
      };
    }

    if (s.includes('neural') || s.includes('deep learning') || s.includes('ai') || s.includes('ai401')) {
      return {
        day1: { topic: 'Backpropagation & Loss Optimization Calculus', task: 'Manually derive partial gradients for a 2-layer MLP with Cross-Entropy Loss.', objective: 'Eliminate confusion on chain rule matrix dimensions.' },
        day2: { topic: 'CNN Architectures & Convolution Mechanics', task: 'Calculate receptive fields, padding, stride, and output dimensions across convolutional layers.', objective: 'Master spatial dimension transformations in vision models.' },
        day3: { topic: 'Regularization & Gradient Vanishing Fixes', task: 'Implement Batch Normalization, Layer Normalization, and Dropout math walkthroughs.', objective: 'Prevent overfitting and gradient saturation.' },
        day4: { topic: 'Recurrent Networks & Attention Primitives', task: 'Derive Query-Key-Value dot-product scaled attention and multi-head projection tensors.', objective: 'Understand transformer self-attention computations.' },
        day5: { topic: 'PyTorch Model Training Diagnostics Lab', task: 'Debug learning rate decay curves, loss divergence, and gradient clipping.', objective: 'Interpret loss curves and hyperparameter stability.' },
        day6: { topic: 'Deep Learning Architecture Milestone Test', task: 'Complete timed multi-choice and numerical problem set on neural design.', objective: 'Score $\\ge$ 85% on modern deep learning architectures.' },
        day7: { topic: 'Model Optimization & Peer Discussion', task: 'Discuss transformer attention scaling with peer mentor Ananya Deshmukh.', objective: 'Synthesize intuitive and mathematical grasp of attention.' }
      };
    }

    if (s.includes('math') || s.includes('discrete') || s.includes('probability') || s.includes('ma401')) {
      return {
        day1: { topic: 'Mathematical Proofs & Induction', task: 'Write formal induction proofs for summation formulas and divisibility theorems.', objective: 'Master base case and inductive step structure.' },
        day2: { topic: 'Combinatorics & Pigeonhole Principle', task: 'Solve 8 complex permutations, combinations, and inclusion-exclusion problems.', objective: 'Avoid overcounting errors in discrete probability.' },
        day3: { topic: 'Graph Theory, Trees & Isomorphism', task: 'Verify Euler paths, Hamiltonian cycles, and planar graph vertex coloring theorems.', objective: 'Accurately apply Handshaking lemma and Euler\'s formula.' },
        day4: { topic: 'Recurrence Relations & Generating Functions', task: 'Solve 4 second-order linear homogeneous recurrence relations with characteristic roots.', objective: 'Solve closed-form formulas for recursive sequences.' },
        day5: { topic: 'Modular Arithmetic & Cryptography Basics', task: 'Apply Extended Euclidean Algorithm and Fermat\'s Little Theorem on RSA calculations.', objective: 'Compute modular inverses quickly and accurately.' },
        day6: { topic: 'Timed Quantitative Mathematics Assessment', task: 'Complete 60-minute diagnostic exam on all semester discrete topics.', objective: 'Demonstrate rigorous step-by-step mathematical reasoning.' },
        day7: { topic: 'Error Analysis & Formula Synthesis', task: 'Create personal high-yield theorem summary sheet and review tricky proofs.', objective: 'Ensure total exam readiness.' }
      };
    }

    // Default Fallback Course Template
    return {
      day1: { topic: 'Diagnostic Review & Syllabus Gap Mapping', task: `Review past quizzes and assignment feedback in ${subjectName} to locate lost points.`, objective: 'Pinpoint the top 3 weak areas in course concepts.' },
      day2: { topic: 'Core Concept Module 1 Deep Dive', task: `Read core textbook chapter and create bulleted concept summaries for unit 1.`, objective: 'Rebuild fundamental theoretical understanding.' },
      day3: { topic: 'Targeted Problem Solving & Active Recall', task: `Solve 10 representative practice questions covering key course formulas/models.`, objective: 'Verify application of core concepts to sample problems.' },
      day4: { topic: 'Assignment Backlog & Lab Work', task: `Review and complete any pending coursework or lab demonstrations.`, objective: 'Ensure 100% assignment completion credit.' },
      day5: { topic: 'Core Concept Module 2 & Synthesis', task: `Consolidate secondary units and practice cross-topic integration questions.`, objective: 'Connect theoretical models to practical exam questions.' },
      day6: { topic: 'Timed Course Assessment Simulation', task: `Complete a 45-minute timed mock test under exam conditions.`, objective: 'Assess retention and time management.' },
      day7: { topic: 'Error Log Consolidation & Faculty Prep', task: `Log all missed questions and draft specific questions for professor office hours.`, objective: 'Establish long-term study habit for the course.' }
    };
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
      actionPlan: this.generate7DayActionPlan({ name, department: 'General', subjects: [] }),
      peerMentorRecommendation: { role: 'Mentee', badge: '🤝 Recommended Peer Match', recommendation: 'Consult department advisor.' }
    };
  }
}
