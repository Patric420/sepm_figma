# 🚀 AutoSOW

**Turn Meeting Transcripts into Actionable Statements of Work (SOWs) in Seconds.**

AutoSOW is an AI-powered platform designed for agencies, consultants, and developers to eliminate the administrative overhead of drafting project proposals. By processing raw transcripts from Zoom, Teams, or Google Meet, AutoSOW automatically extracts deliverables, timelines, and budgets, fitting them into professional, standardized templates.

![AutoSOW Logo](public/vite.svg)

---

## ✨ Key Features

- **🤖 Gemini-Powered SOW Generation:** Uses `GEMINI_API_KEY` (when configured) to generate SOW markdown and extract insights (requirements, stakeholders, deliverables, timelines).
- **🔁 Dynamic Workspace Data:** Dashboard, Upload, AI Processing, Generated SOWs, Templates, and Collaboration screens are powered by backend APIs (not hardcoded UI data).
- **💾 Persistent User Workspace:** User-scoped workspace state is stored locally in backend JSON stores and updated on every action (uploads, template creation, comments, SOW generation).
- **📄 Template Library + Custom Templates:** Includes starter templates and supports creating custom templates from the UI.
- **🛡️ JWT Security:** Robust authentication flow for managing private workspace data and generated documents.
- **🌓 Adaptive Theme:** Seamless Dark Mode/Light Mode support that mirrors OS preferences.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS 4, Lucide Icons
- **Backend:** Node.js, Express
- **Auth:** JWT + bcryptjs
- **Config:** dotenv
- **LLM Integration:** Google Gemini API (`gemini-2.0-flash`)

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

3. **Configure environment variables:**
   ```bash
   copy .env.example .env
   ```
   Then set your secrets:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Your dashboard will be available at `http://localhost:5173`.

---

## 🔌 Dynamic API Endpoints

Authenticated endpoints currently used by the frontend:

- `GET /api/workspace/data` — fetch user workspace state
- `POST /api/workspace/upload` — create a project from uploaded meeting data
- `POST /api/sow/generate` — generate SOW + update insights/metrics
- `POST /api/workspace/templates` — create custom templates
- `POST /api/workspace/comments/:commentId/resolve` — resolve collaboration comments

Auth + supporting endpoints:

- `POST /api/signup`
- `POST /api/login`
- `GET /api/me`
- `POST /api/leads`

---

## 🗂️ Local Data Stores (Backend)

The backend persists local development data in:

- `backend/users.json`
- `backend/leads.json`
- `backend/workspace.json`

These are runtime data files and are ignored from git.

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
