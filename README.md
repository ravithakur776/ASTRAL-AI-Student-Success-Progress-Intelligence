# ASTRAL — AI Student Success & Progress Intelligence

> **Next-Generation Explainable Academic Early Warning System (EWS) & Student Success Intelligence Platform**

ASTRAL is an explainable, multi-factor academic intelligence platform designed to identify students at risk, forecast performance trajectories, diagnose root causes from real data, and synthesize personalized 4-week recovery roadmaps.

---

## 🌟 Key Features

### 1. 🔍 Explainable Student Intelligence Engine (Rule-Based EWS)
- **Deterministic 100-Point Health Index:** Evaluates Attendance (30 pts), Course Mastery (35 pts), Assignment Velocity (20 pts), and Assessment Trajectory (15 pts).
- **Classification Categories:**
  - `80–100 pts` $\rightarrow$ **On Track / Thriving** 🟢
  - `60–79 pts` $\rightarrow$ **Needs Attention** 🟡
  - `0–59 pts` $\rightarrow$ **At Risk** 🔴
- **Actual-Data Human Explanations:** Dynamically synthesizes clear diagnostic sentences based strictly on the student's real metrics.
- **Zero Hallucinations:** No fake statistics or black-box claims.

### 2. 🧪 Interactive "What-If" Academic Scenario Simulator
- Live parameter sliders for attendance deltas, exam score changes, and assignment turnarounds.
- Real-time recalculation of risk scores and predicted GPA without mutating historical records.
- One-click application of simulated targets to student profiles.

### 3. 🎯 4-Week Tailored Recovery & Honors Roadmaps
- Customized 4-week milestone plans for students in need of academic triage.
- Honors acceleration paths for high-performing students.
- Peer mentorship recommendations and targeted campus learning resources.

### 4. 📊 Executive Multi-Role Dashboard & Analytics
- 5 Top KPI metric summary cards with animated counters.
- **Grade Distribution Chart:** Cohort GPA distribution histogram.
- **Attendance vs CGPA Scatter:** Real-time correlation analysis.
- **Cohort Risk Distribution Doughnut:** Tier breakdown.
- **Department Health Radar:** Comparative department performance.
- Role-switcher for Dean / Academic Director, Faculty Advisor, and Student Portal views.

### 5. ⚡ Natural Language Query Engine
- Smart search bar supporting natural queries like:
  - `"high risk"`
  - `"attendance < 75"`
  - `"dean's list"`
  - `"computer science"`

### 6. 💾 Centralized Reactive Storage Layer
- Single source of truth with collision-proof unique ID generation (`AST-1001`, `AST-1002`...).
- Full CRUD operations: Add new student, live profile edits, delete student, and log faculty interventions.
- Automatic persistence via `localStorage` with in-memory fallback.

---

## 🚀 Getting Started

### Prerequisites
A modern web browser (Chrome, Safari, Edge, Firefox). No backend or complex dependencies required.

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/ravithakur776/ASTRAL-AI-Student-Success-Progress-Intelligence.git
   cd ASTRAL-AI-Student-Success-Progress-Intelligence
   ```
2. Serve locally:
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Or using Node.js (npx serve)
   npx serve .
   ```
3. Open `http://localhost:8080` in your web browser.

---

## 📁 Project Architecture

```
ASTRAL — AI Student Success & Progress Intelligence/
├── index.html                   # Master HTML5 interface
├── css/
│   └── style.css                # Cyber-slate glassmorphism design system & print styles
├── js/
│   ├── app.js                   # Application bootstrap, role-switcher & keyboard shortcuts
│   ├── data/
│   │   └── students.js          # Preloaded 16-student multi-major benchmark dataset
│   ├── services/
│   │   ├── storage.js           # Centralized reactive localStorage service & fallback
│   │   └── aiEngine.js          # Explainable Rule-Based Intelligence & Simulator
│   ├── utils/
│   │   └── ui.js                # Toast notifications, badges, counter animations
│   └── components/
│       ├── dashboard.js         # Executive dashboard, KPIs, filter tabs & roster
│       ├── studentModal.js      # 5-Tab deep-dive student dossier modal
│       ├── newStudentModal.js   # Student enrollment modal with strict validation
│       ├── aiSearch.js          # Natural language filter & query engine
│       └── analytics.js         # Chart.js visualizer (Bar, Scatter, Doughnut, Radar)
└── README.md
```

---

## ⌨️ Keyboard Shortcuts
- `Cmd + K` or `Ctrl + K` or `/` : Focus Smart AI Search bar.
- `Escape` : Close active student dossier or enrollment modal.

---

## 🛡️ License
MIT License. Built for collegiate student success and hackathon presentation.



