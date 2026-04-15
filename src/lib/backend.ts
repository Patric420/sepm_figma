export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface MetricBlock {
  meetingsProcessed: number;
  sowGenerated: number;
  pendingReviews: number;
  aiConfidenceScore: number;
  deltas: {
    meetingsProcessed: number;
    sowGenerated: number;
    pendingReviews: number;
    aiConfidenceScore: number;
  };
}

export interface ChartPoint {
  month: string;
  value: number;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  company: string;
  status: string;
  aiConfidence: number;
  dateText: string;
  createdAt: string;
  transcript?: string;
  participants?: string;
}

export interface WorkspaceActivity {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ProcessingInsights {
  extractedRequirements: string[];
  keyStakeholders: string[];
  suggestedDeliverables: string[];
  timelineEstimates: string[];
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  sections: number;
  lastUsedText: string;
  popular: boolean;
}

export interface CollaborationDocument {
  id: string;
  name: string;
  status: string;
  comments: number;
  collaborators: number;
  highlighted: number;
  timestamp: string;
}

export interface CollaborationComment {
  id: string;
  author: string;
  role: string;
  message: string;
  resolved: boolean;
  highlighted: boolean;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  online: boolean;
}

export interface GeneratedSowRecord {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface WorkspaceData {
  metrics: MetricBlock;
  charts: {
    sowOverTime: ChartPoint[];
    monthlyPerformance: ChartPoint[];
  };
  projects: WorkspaceProject[];
  activities: WorkspaceActivity[];
  processing: {
    completion: number;
    pipeline: ProcessingStep[];
    insights: ProcessingInsights;
  };
  generatedSows: GeneratedSowRecord[];
  templates: {
    stats: {
      total: number;
      custom: number;
      recentlyUsed: number;
    };
    popular: WorkspaceTemplate[];
    all: WorkspaceTemplate[];
  };
  collaboration: {
    documents: CollaborationDocument[];
    comments: CollaborationComment[];
    teamMembers: TeamMember[];
    summary: {
      totalComments: number;
      resolved: number;
      open: number;
      highlights: number;
    };
  };
  lastUpdatedAt: number;
}

const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function parseResponse<T>(response: Response, fallbackError: string): Promise<T> {
  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorData.error || fallbackError);
  }

  return (await response.json()) as T;
}

export const backend = {
  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseResponse<{ token: string; user: User }>(response, 'Login failed.');
    localStorage.setItem('token', data.token);
    return data.user;
  },

  async signup(name: string, email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await parseResponse<{ token: string; user: User }>(response, 'Signup failed.');
    localStorage.setItem('token', data.token);
    return data.user;
  },

  async me(): Promise<User | null> {
    if (!localStorage.getItem('token')) return null;
    const response = await fetch(`${API_URL}/me`, { method: 'GET', headers: getAuthHeaders() });
    if (!response.ok) {
      localStorage.removeItem('token');
      return null;
    }
    const data = await response.json();
    return data.user as User;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  },

  async submitLead(email: string): Promise<{ success: boolean; id: string }> {
    const response = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    });
    return parseResponse<{ success: boolean; id: string }>(
      response,
      'Failed to submit lead. Please try again.'
    );
  },

  async getWorkspaceData(): Promise<WorkspaceData> {
    const response = await fetch(`${API_URL}/workspace/data`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<{ workspace: WorkspaceData }>(
      response,
      'Failed to load workspace data.'
    );
    return data.workspace;
  },

  async uploadMeeting(payload: {
    projectName: string;
    clientName: string;
    meetingDate: string;
    participants: string;
    transcript: string;
  }): Promise<void> {
    const response = await fetch(`${API_URL}/workspace/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    await parseResponse<{ success: boolean }>(response, 'Failed to upload meeting data.');
  },

  async createTemplate(payload: {
    name: string;
    description: string;
    sections: number;
  }): Promise<void> {
    const response = await fetch(`${API_URL}/workspace/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    await parseResponse<{ success: boolean }>(response, 'Failed to create template.');
  },

  async resolveComment(commentId: string): Promise<void> {
    const response = await fetch(`${API_URL}/workspace/comments/${commentId}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    await parseResponse<{ success: boolean }>(response, 'Failed to resolve comment.');
  },

  async generateSOW(input: {
    transcript: string;
    projectName?: string;
    clientName?: string;
  }): Promise<{ sow: string; sowRecord: GeneratedSowRecord }> {
    const response = await fetch(`${API_URL}/sow/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
    return parseResponse<{ sow: string; sowRecord: GeneratedSowRecord }>(
      response,
      'Failed to generate SOW.'
    );
  },
};
