# 🚀 AutoSOW

**Turn Meeting Transcripts into Actionable Statements of Work (SOWs) in Seconds.**

AutoSOW is an AI-powered platform designed for agencies, consultants, and developers to eliminate the administrative overhead of drafting project proposals. By processing raw transcripts from Zoom, Teams, or Google Meet, AutoSOW automatically extracts deliverables, timelines, and budgets, fitting them into professional, standardized templates.

![AutoSOW Logo](public/vite.svg)

---

## ✨ Key Features

- **🧠 Intelligent Extraction:** Automatically separates "small talk" from core technical requirements and business goals.
- **📄 Template Library:** Pre-formatted SOW structures for Software Development, IT Consulting, Marketing Retainers, and UX/UI Audits.
- **🌓 Adaptive Theme:** Seamless Dark Mode/Light Mode support that mirrors your OS preferences and enhances late-night productivity.
- **⚡ Dual-Pane Dashboard:** Paste your transcript on the left, watch your SOW materialize on the right in ready-to-copy Markdown.
- **🛡️ JWT Security:** Robust authentication flow for managing your private lead captures and generated documents.
- **🗓️ Microsoft Planner Integration:** Automated workflow to inject project tasks directly into your team's Planner buckets.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS 4, Lucide Icons
- **Backend:** Node.js, Express (Mocked for Demo)
- **Integration:** Microsoft Graph API (Planner automation)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/autosow.git
   cd autosow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

Your dashboard will be available at `http://localhost:5173`.

---

## 📁 Project Resources

- **[User Case Studies](USER_CASE_STUDIES.md):** Explore how different industries use AutoSOW to save 5+ hours per proposal.
- **[Example Transcript](EXAMPLE_TRANSCRIPT.md):** A sample discovery call transcript to test the generation engine.
- **[Planner Automation Script](populate_planner.cjs):** Custom Node.js utility for injecting tasks into Microsoft Planner.

---

## 👤 Author

Developed by **Akshay** with **Antigravity** — building the future of agentic coding.

---

© 2026 AutoSOW Inc. All rights reserved.
