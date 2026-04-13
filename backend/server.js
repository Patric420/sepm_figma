const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-2026';

app.use(cors());
app.use(express.json());

const LEADS_FILE = path.join(__dirname, 'leads.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize data stores
let leads = [];
if (fs.existsSync(LEADS_FILE)) {
  try { leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch (err) { console.error(err); }
} else {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
}

let users = [];
if (fs.existsSync(USERS_FILE)) {
  try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (err) { console.error(err); }
} else {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

const saveUsers = () => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ error: "Missing token." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token." });
    req.user = user;
    next();
  });
};

/* --- AUTHENTICATION ENDPOINTS --- */

app.post('/api/signup', async (req, res) => {
  await delay(1000);
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "User already exists with this email." });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = {
    id: "usr_" + Math.random().toString(36).substring(2, 9),
    name,
    email,
    password: hashedPassword,
    avatar: "https://i.pravatar.cc/150?u=" + email,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers();

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  
  console.log(`[BACKEND] New user registered: ${email}`);
  res.json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar }
  });
});

app.post('/api/login', async (req, res) => {
  await delay(1000);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required." });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  
  console.log(`[BACKEND] User logged in: ${email}`);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }
  });
});

app.get('/api/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  
  res.json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
});


/* --- OTHER ENDPOINTS --- */

app.post('/api/leads', async (req, res) => {
  await delay(1000);
  
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const newLead = {
    id: "ld_" + Math.random().toString(36).substring(2, 9),
    email,
    timestamp: new Date().toISOString()
  };
  leads.push(newLead);
  
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    console.log(`[BACKEND] New lead captured and saved: ${email}`);
  } catch (err) {
    console.error(`[BACKEND] Failed to save lead: ${err.message}`);
  }
  
  res.json({ success: true, id: newLead.id });
});

/**
 * Helper to extract project details from raw transcript using pattern matching
 */
function extractProjectDetails(transcript) {
  const details = {
    budget: "TBD",
    timeline: "6-8 weeks (Estimated)",
    deliverables: [],
    clientName: "Valued Client",
    projectFocus: "Technical Implementation"
  };

  // 1. Extract Budget (looking for currency patterns)
  const budgetMatch = transcript.match(/\$[\d,]+(\.\d+)?/);
  if (budgetMatch) details.budget = budgetMatch[0];

  // 2. Extract Timeline (looking for durations)
  const weekMatch = transcript.match(/(\d+)\s*weeks?/i);
  if (weekMatch) details.timeline = weekMatch[0];
  
  const monthMatch = transcript.match(/(\d+)\s*months?/i);
  if (monthMatch) details.timeline = monthMatch[0];

  // 3. Extract Deliverables (keyword mapping)
  const keywordMap = {
    'react': 'React Frontend Development',
    'node': 'Node.js Backend Systems',
    'api': 'RESTful API Integration',
    'design': 'UI/UX Design & Wireframing',
    'database': 'Database Schema Design',
    'mobile': 'Mobile Application Development',
    'security': 'JWT & Auth Security Implementation',
    'test': 'Quality Assurance & Testing'
  };

  Object.entries(keywordMap).forEach(([key, val]) => {
    if (transcript.toLowerCase().includes(key)) {
      details.deliverables.push(val);
    }
  });

  // Default if no deliverables found
  if (details.deliverables.length === 0) {
    details.deliverables = [
      "Discovery and Requirements Scoping",
      "Prototype Development",
      "User Acceptance Testing"
    ];
  }

  // 4. Extract Project Focus/Participants
  const participants = transcript.match(/Participants:[\s\S]*?(?=\n\n|\n---|$)/i);
  if (participants) details.projectFocus = participants[0].trim();

  return details;
}

app.post('/api/sow/generate', authenticateToken, async (req, res) => {
  await delay(2000); // Simulate deeper AI processing

  const { transcript } = req.body;
  if (!transcript || transcript.trim().length === 0) {
    return res.status(400).json({ error: "Transcript is required." });
  }

  const details = extractProjectDetails(transcript);

  const generatedSOW = `
# Statement of Work (SOW)

**Date Generated**: ${new Date().toLocaleDateString()}
**Prepared By**: AutoSOW Intelligent Agent
**Status**: Draft for Review

---

## 1. Project Overview
This Statement of Work outlines the development and delivery of a project focused on:
**${details.projectFocus.replace('Participants:', '').trim() || 'General Consulting'}**

The engagement will focus on translating meeting requirements into a robust technical solution while adhering to the specified constraints.

## 2. Scope of Work & Deliverables
The following core deliverables have been identifies from the project discovery:
${details.deliverables.map(d => `- ${d}`).join('\n')}

## 3. Financials & Timeline
The following commercial terms were identified during the discovery call:

- **Total Investment**: ${details.budget} (Initial Estimate)
- **Project Duration**: ${details.timeline}
- **Launch Milestone**: Beta version to be delivered at the 75% mark of the total duration.

## 4. Technical Constraints
- Integration with existing stack as discussed.
- Documentation of all new API endpoints and internal logic.
- Responsive design across modern browsers.

## 5. Acceptance Criteria
- All deliverables as listed in Section 2 must be verified against current specifications.
- Performance benchmarks must exceed 90 on core lighthouse metrics.
- User feedback during the Beta phase must be consolidated and addressed.

---
*This document was automatically generated by AutoSOW based on meeting transcripts.*
  `.trim();

  res.json({ sow: generatedSOW });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend API is running on http://localhost:${PORT}`);
});
