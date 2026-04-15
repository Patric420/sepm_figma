const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-2026';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('[BACKEND] GEMINI_API_KEY not found in .env. Falling back to local text processing.');
}

app.use(cors());
app.use(express.json());

const LEADS_FILE = path.join(__dirname, 'leads.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const WORKSPACE_FILE = path.join(__dirname, 'workspace.json');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const getDateStamp = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

function readJsonFile(filePath, fallbackValue) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallbackValue, null, 2));
    return fallbackValue;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`[BACKEND] Failed to parse ${path.basename(filePath)}: ${error.message}`);
    fs.writeFileSync(filePath, JSON.stringify(fallbackValue, null, 2));
    return fallbackValue;
  }
}

let leads = readJsonFile(LEADS_FILE, []);
let users = readJsonFile(USERS_FILE, []);
let workspaceStore = readJsonFile(WORKSPACE_FILE, { byUserId: {} });

const saveUsers = () => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
const saveLeads = () => fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
const saveWorkspace = () => fs.writeFileSync(WORKSPACE_FILE, JSON.stringify(workspaceStore, null, 2));

function createDefaultWorkspace(user) {
  const now = Date.now();

  return {
    metrics: {
      meetingsProcessed: 0,
      sowGenerated: 0,
      pendingReviews: 0,
      aiConfidenceScore: 94,
      deltas: {
        meetingsProcessed: 0,
        sowGenerated: 0,
        pendingReviews: 0,
        aiConfidenceScore: 0,
      },
    },
    charts: {
      sowOverTime: [
        { month: 'Jan', value: 0 },
        { month: 'Feb', value: 0 },
        { month: 'Mar', value: 0 },
        { month: 'Apr', value: 0 },
        { month: 'May', value: 0 },
        { month: 'Jun', value: 0 },
      ],
      monthlyPerformance: [
        { month: 'Jan', value: 0 },
        { month: 'Feb', value: 0 },
        { month: 'Mar', value: 0 },
        { month: 'Apr', value: 0 },
        { month: 'May', value: 0 },
        { month: 'Jun', value: 0 },
      ],
    },
    projects: [],
    activities: [],
    processing: {
      completion: 0,
      pipeline: [
        { name: 'Transcript Analysis', status: 'pending' },
        { name: 'Image Recognition', status: 'pending' },
        { name: 'Requirement Extraction', status: 'pending' },
        { name: 'Scope Identification', status: 'pending' },
        { name: 'SOW Generation', status: 'pending' },
      ],
      insights: {
        extractedRequirements: [],
        keyStakeholders: [user.name],
        suggestedDeliverables: [],
        timelineEstimates: [],
      },
    },
    generatedSows: [],
    templates: {
      stats: {
        total: 6,
        custom: 2,
        recentlyUsed: 2,
      },
      popular: [
        {
          id: makeId('tpl'),
          name: 'Software Development SOW',
          description:
            'Comprehensive template for custom software development projects including web and mobile applications.',
          sections: 8,
          lastUsedText: '2 days ago',
          popular: true,
        },
        {
          id: makeId('tpl'),
          name: 'Consulting Project SOW',
          description: 'Professional services template for consulting engagements and advisory services.',
          sections: 7,
          lastUsedText: '1 week ago',
          popular: true,
        },
      ],
      all: [
        {
          id: makeId('tpl'),
          name: 'Software Development SOW',
          description:
            'Comprehensive template for custom software development projects including web and mobile applications.',
          sections: 8,
          lastUsedText: '2 days ago',
          popular: true,
        },
        {
          id: makeId('tpl'),
          name: 'Consulting Project SOW',
          description: 'Professional services template for consulting engagements and advisory services.',
          sections: 7,
          lastUsedText: '1 week ago',
          popular: true,
        },
        {
          id: makeId('tpl'),
          name: 'Implementation SOW',
          description: 'Technical implementation template for deployments, integrations, and infrastructure.',
          sections: 9,
          lastUsedText: '2 weeks ago',
          popular: false,
        },
        {
          id: makeId('tpl'),
          name: 'UI/UX Design SOW',
          description: 'Creative services template for design projects and user research initiatives.',
          sections: 6,
          lastUsedText: '3 days ago',
          popular: false,
        },
        {
          id: makeId('tpl'),
          name: 'Data Analytics SOW',
          description: 'Data science and analytics template for BI implementations and reporting projects.',
          sections: 7,
          lastUsedText: '1 month ago',
          popular: false,
        },
        {
          id: makeId('tpl'),
          name: 'Cloud Migration SOW',
          description: 'Infrastructure template for cloud migration projects and DevOps implementations.',
          sections: 8,
          lastUsedText: '5 days ago',
          popular: false,
        },
      ],
    },
    collaboration: {
      documents: [],
      comments: [],
      teamMembers: [
        { id: makeId('usr'), name: user.name, role: 'Project Lead', online: true },
        { id: makeId('usr'), name: 'Sarah Johnson', role: 'Product Manager', online: true },
        { id: makeId('usr'), name: 'Michael Chen', role: 'Technical Lead', online: true },
      ],
      summary: {
        totalComments: 0,
        resolved: 0,
        open: 0,
        highlights: 0,
      },
    },
    lastUpdatedAt: now,
  };
}

function getWorkspaceForUser(user) {
  const userId = user.id;
  if (!workspaceStore.byUserId[userId]) {
    workspaceStore.byUserId[userId] = createDefaultWorkspace(user);
    saveWorkspace();
  }
  return workspaceStore.byUserId[userId];
}

function setProcessingState(workspace, state) {
  if (state === 'done') {
    workspace.processing.completion = 100;
    workspace.processing.pipeline = workspace.processing.pipeline.map((step) => ({
      ...step,
      status: step.name === 'SOW Generation' ? 'in_progress' : 'completed',
    }));
    return;
  }

  workspace.processing.completion = 20;
  workspace.processing.pipeline = workspace.processing.pipeline.map((step, idx) => {
    if (idx === 0) return { ...step, status: 'in_progress' };
    return { ...step, status: 'pending' };
  });
}

function shiftChartData(values, nextValue) {
  const shifted = values.slice(1);
  shifted.push({ ...values[values.length - 1], value: nextValue });
  return shifted;
}

function recalcTemplateStats(workspace) {
  workspace.templates.stats.total = workspace.templates.all.length;
  workspace.templates.stats.custom = workspace.templates.all.filter((tpl) => !tpl.popular).length;
  workspace.templates.stats.recentlyUsed = Math.min(4, workspace.templates.all.length);
}

function recalcCollaborationSummary(workspace) {
  const totalComments = workspace.collaboration.comments.length;
  const resolved = workspace.collaboration.comments.filter((comment) => comment.resolved).length;
  const highlights = workspace.collaboration.comments.filter((comment) => comment.highlighted).length;

  workspace.collaboration.summary = {
    totalComments,
    resolved,
    open: totalComments - resolved,
    highlights,
  };
}

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing token.' });
  }

  jwt.verify(token, JWT_SECRET, (err, tokenUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }

    const dbUser = users.find((user) => user.id === tokenUser.id);
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    req.user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.avatar,
    };
    return next();
  });
};

/* --- AUTHENTICATION ENDPOINTS --- */

app.post('/api/signup', async (req, res) => {
  await delay(500);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  if (users.find((user) => user.email === email)) {
    return res.status(400).json({ error: 'User already exists with this email.' });
  }

  const newUser = {
    id: makeId('usr'),
    name,
    email,
    password: bcrypt.hashSync(password, 8),
    avatar: `https://i.pravatar.cc/150?u=${email}`,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers();
  getWorkspaceForUser(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar },
  });
});

app.post('/api/login', async (req, res) => {
  await delay(500);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  getWorkspaceForUser(user);

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
  });
});

app.get('/api/me', authenticateToken, (req, res) => {
  return res.json({ user: req.user });
});

/* --- GENERAL ENDPOINTS --- */

app.post('/api/leads', async (req, res) => {
  await delay(250);
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  const newLead = {
    id: makeId('ld'),
    email,
    timestamp: new Date().toISOString(),
  };

  leads.push(newLead);
  saveLeads();
  return res.json({ success: true, id: newLead.id });
});

function extractProjectDetails(transcript) {
  const details = {
    budget: 'TBD',
    timeline: '6-8 weeks (Estimated)',
    deliverables: [],
    projectFocus: 'Technical Implementation',
    stakeholders: [],
  };

  const budgetMatch = transcript.match(/\$[\d,]+(\.\d+)?/);
  if (budgetMatch) details.budget = budgetMatch[0];

  const weekMatch = transcript.match(/(\d+)\s*weeks?/i);
  const monthMatch = transcript.match(/(\d+)\s*months?/i);
  if (weekMatch) details.timeline = weekMatch[0];
  if (monthMatch) details.timeline = monthMatch[0];

  const keywordMap = {
    react: 'React Frontend Development',
    node: 'Node.js Backend Systems',
    api: 'RESTful API Integration',
    design: 'UI/UX Design & Wireframing',
    database: 'Database Schema Design',
    mobile: 'Mobile Application Development',
    security: 'JWT & Auth Security Implementation',
    test: 'Quality Assurance & Testing',
  };

  Object.entries(keywordMap).forEach(([keyword, deliverable]) => {
    if (transcript.toLowerCase().includes(keyword)) {
      details.deliverables.push(deliverable);
    }
  });

  if (details.deliverables.length === 0) {
    details.deliverables = [
      'Discovery and Requirements Scoping',
      'Prototype Development',
      'User Acceptance Testing',
    ];
  }

  const participantsMatch = transcript.match(/participants?:\s*(.+)/i);
  if (participantsMatch) {
    details.stakeholders = participantsMatch[1]
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
  }

  const focusMatch = transcript.match(/project\s*focus:\s*(.+)/i);
  if (focusMatch) {
    details.projectFocus = focusMatch[1].trim();
  }

  return details;
}

function parseGeminiJson(text) {
  const normalized = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(normalized);
}

async function generateWithGemini(transcript, details) {
  if (!GEMINI_API_KEY) return null;

  const endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const prompt = `
You are an expert statement-of-work assistant.

Given this meeting transcript, return STRICT JSON (no markdown fences) with:
- sowMarkdown: string (full professional SOW in markdown)
- extractedRequirements: string[]
- keyStakeholders: string[]
- suggestedDeliverables: string[]
- timelineEstimates: string[]

Transcript:
${transcript}

Fallback details:
- Budget: ${details.budget}
- Timeline: ${details.timeline}
- Project focus: ${details.projectFocus}
- Deliverables: ${details.deliverables.join(', ')}
`.trim();

  const response = await fetch(`${endpoint}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API call failed: ${response.status} ${errorBody}`);
  }

  const payload = await response.json();
  const rawText = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n');
  if (!rawText) {
    throw new Error('Gemini response did not contain text output.');
  }

  const parsed = parseGeminiJson(rawText);
  if (!parsed || typeof parsed.sowMarkdown !== 'string' || parsed.sowMarkdown.trim().length === 0) {
    throw new Error('Gemini response missing required sowMarkdown field.');
  }

  return {
    sowMarkdown: parsed.sowMarkdown.trim(),
    extractedRequirements: Array.isArray(parsed.extractedRequirements)
      ? parsed.extractedRequirements.filter((item) => typeof item === 'string' && item.trim().length > 0)
      : [],
    keyStakeholders: Array.isArray(parsed.keyStakeholders)
      ? parsed.keyStakeholders.filter((item) => typeof item === 'string' && item.trim().length > 0)
      : [],
    suggestedDeliverables: Array.isArray(parsed.suggestedDeliverables)
      ? parsed.suggestedDeliverables.filter((item) => typeof item === 'string' && item.trim().length > 0)
      : [],
    timelineEstimates: Array.isArray(parsed.timelineEstimates)
      ? parsed.timelineEstimates.filter((item) => typeof item === 'string' && item.trim().length > 0)
      : [],
  };
}

app.get('/api/workspace/data', authenticateToken, (req, res) => {
  const workspace = getWorkspaceForUser(req.user);
  return res.json({ workspace });
});

app.post('/api/workspace/upload', authenticateToken, async (req, res) => {
  await delay(300);
  const { projectName, clientName, meetingDate, participants, transcript } = req.body;
  if (!projectName || !clientName || !transcript || transcript.trim().length === 0) {
    return res.status(400).json({ error: 'projectName, clientName and transcript are required.' });
  }

  const workspace = getWorkspaceForUser(req.user);
  const nowIso = new Date().toISOString();
  const project = {
    id: makeId('prj'),
    name: `${projectName} - ${clientName}`,
    company: clientName,
    status: 'Draft',
    aiConfidence: 0,
    dateText: meetingDate || getDateStamp(nowIso),
    createdAt: nowIso,
    transcript,
    participants: participants || '',
  };

  workspace.projects.unshift(project);
  workspace.metrics.meetingsProcessed += 1;
  workspace.metrics.pendingReviews += 1;
  workspace.metrics.deltas.meetingsProcessed = 1;
  workspace.metrics.deltas.pendingReviews = 1;
  workspace.activities.unshift({
    id: makeId('act'),
    title: 'Meeting Uploaded',
    subtitle: project.name,
    timestamp: nowIso,
  });
  workspace.collaboration.documents.unshift({
    id: project.id,
    name: project.name,
    status: 'Pending Review',
    comments: 0,
    collaborators: 1,
    highlighted: 0,
    timestamp: nowIso,
  });
  setProcessingState(workspace, 'started');
  workspace.lastUpdatedAt = Date.now();
  saveWorkspace();

  return res.json({ success: true, project });
});

app.post('/api/workspace/templates', authenticateToken, (req, res) => {
  const { name, description, sections } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'name and description are required.' });
  }

  const workspace = getWorkspaceForUser(req.user);
  const template = {
    id: makeId('tpl'),
    name,
    description,
    sections: Number.isFinite(Number(sections)) && Number(sections) > 0 ? Number(sections) : 6,
    lastUsedText: 'Just now',
    popular: false,
  };
  workspace.templates.all.unshift(template);
  recalcTemplateStats(workspace);
  workspace.activities.unshift({
    id: makeId('act'),
    title: 'Template Created',
    subtitle: name,
    timestamp: new Date().toISOString(),
  });
  workspace.lastUpdatedAt = Date.now();
  saveWorkspace();

  return res.json({ success: true, template });
});

app.post('/api/sow/generate', authenticateToken, async (req, res) => {
  await delay(900);

  const { transcript, projectName, clientName } = req.body;
  if (!transcript || transcript.trim().length === 0) {
    return res.status(400).json({ error: 'Transcript is required.' });
  }

  const details = extractProjectDetails(transcript);
  const generatedAt = new Date().toISOString();
  const generatedTitle = projectName && clientName ? `${projectName} - ${clientName}` : 'Generated SOW';

  const fallbackGeneratedSOW = `
# Statement of Work (SOW)

**Date Generated**: ${getDateStamp(generatedAt)}
**Prepared By**: AutoSOW Intelligent Agent
**Status**: Draft for Review

---

## 1. Project Overview
This Statement of Work outlines delivery for:
**${details.projectFocus || 'General Consulting'}**

## 2. Scope of Work & Deliverables
${details.deliverables.map((deliverable) => `- ${deliverable}`).join('\n')}

## 3. Financials & Timeline
- **Total Investment**: ${details.budget}
- **Project Duration**: ${details.timeline}
- **Milestone**: Beta release at 75% of project timeline.

## 4. Technical Constraints
- Integrate with existing stack and API constraints.
- Provide technical documentation.
- Deliver responsive UX across modern browsers.

## 5. Acceptance Criteria
- Deliverables must pass client review.
- Performance score target: 90+.
- Beta feedback incorporated before final sign-off.

---
*This document was automatically generated by AutoSOW based on meeting transcripts.*
`.trim();

  let geminiOutput = null;
  if (GEMINI_API_KEY) {
    try {
      geminiOutput = await generateWithGemini(transcript, details);
    } catch (error) {
      console.error(`[BACKEND] Gemini generation failed. Falling back to local processor: ${error.message}`);
    }
  }

  const generatedSOW = geminiOutput?.sowMarkdown || fallbackGeneratedSOW;

  const workspace = getWorkspaceForUser(req.user);
  const sowRecord = {
    id: makeId('sow'),
    title: generatedTitle,
    content: generatedSOW,
    createdAt: generatedAt,
  };

  workspace.generatedSows.unshift(sowRecord);
  workspace.metrics.sowGenerated += 1;
  workspace.metrics.deltas.sowGenerated = 1;
  workspace.metrics.aiConfidenceScore = geminiOutput
    ? Math.max(92, Math.min(99, 95 + Math.floor(Math.random() * 4)))
    : Math.max(85, Math.min(99, 88 + Math.floor(Math.random() * 10)));
  workspace.metrics.deltas.aiConfidenceScore = 2;
  workspace.processing.completion = 100;
  workspace.processing.pipeline = workspace.processing.pipeline.map((step) => ({
    ...step,
    status: 'completed',
  }));
  workspace.processing.insights.extractedRequirements =
    geminiOutput?.extractedRequirements.length > 0 ? geminiOutput.extractedRequirements : details.deliverables;
  workspace.processing.insights.keyStakeholders =
    geminiOutput?.keyStakeholders.length > 0
      ? geminiOutput.keyStakeholders
      : details.stakeholders.length > 0
        ? details.stakeholders
        : workspace.processing.insights.keyStakeholders;
  workspace.processing.insights.suggestedDeliverables =
    geminiOutput?.suggestedDeliverables.length > 0
      ? geminiOutput.suggestedDeliverables
      : details.deliverables.slice(0, 4);
  workspace.processing.insights.timelineEstimates =
    geminiOutput?.timelineEstimates.length > 0
      ? geminiOutput.timelineEstimates
      : [`Phase 1: Discovery - ${details.timeline}`, 'Phase 2: Build - 6 weeks', 'Phase 3: QA - 2 weeks'];

  if (workspace.projects.length > 0) {
    workspace.projects[0].status = 'In Review';
    workspace.projects[0].aiConfidence = workspace.metrics.aiConfidenceScore;
  }

  workspace.activities.unshift({
    id: makeId('act'),
    title: 'SOW Generated',
    subtitle: generatedTitle,
    timestamp: generatedAt,
  });

  workspace.charts.sowOverTime = shiftChartData(
    workspace.charts.sowOverTime,
    workspace.charts.sowOverTime[workspace.charts.sowOverTime.length - 1].value + 1
  );
  workspace.charts.monthlyPerformance = shiftChartData(
    workspace.charts.monthlyPerformance,
    Math.min(32, workspace.charts.monthlyPerformance[workspace.charts.monthlyPerformance.length - 1].value + 3)
  );

  if (workspace.collaboration.documents.length > 0) {
    workspace.collaboration.documents[0].comments += 1;
    workspace.collaboration.documents[0].highlighted += 1;
    workspace.collaboration.documents[0].status = 'In Review';
  }

  workspace.collaboration.comments.unshift({
    id: makeId('cmt'),
    author: req.user.name,
    role: 'Project Lead',
    message: 'Initial SOW draft generated from latest meeting transcript.',
    resolved: false,
    highlighted: true,
    timestamp: generatedAt,
  });
  recalcCollaborationSummary(workspace);

  workspace.lastUpdatedAt = Date.now();
  saveWorkspace();

  return res.json({ sow: generatedSOW, sowRecord });
});

app.post('/api/workspace/comments/:commentId/resolve', authenticateToken, (req, res) => {
  const { commentId } = req.params;
  const workspace = getWorkspaceForUser(req.user);
  const comment = workspace.collaboration.comments.find((item) => item.id === commentId);
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found.' });
  }

  comment.resolved = true;
  recalcCollaborationSummary(workspace);
  workspace.lastUpdatedAt = Date.now();
  saveWorkspace();
  return res.json({ success: true, comment });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend API is running on http://localhost:${PORT}`);
});
