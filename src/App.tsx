import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  FolderKanban,
  Loader2,
  Menu,
  MessageSquare,
  Moon,
  Plus,
  Settings,
  Star,
  Sun,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { backend } from './lib/backend';
import type { User, WorkspaceData } from './lib/backend';

type ViewKey =
  | 'dashboard'
  | 'upload'
  | 'processing'
  | 'generated'
  | 'templates'
  | 'collaboration'
  | 'settings';

type NavItem = {
  key: ViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'upload', label: 'Upload Meeting', icon: Upload },
  { key: 'processing', label: 'AI Processing', icon: Bot },
  { key: 'generated', label: 'Generated SOWs', icon: FileText },
  { key: 'templates', label: 'Templates', icon: FolderKanban },
  { key: 'collaboration', label: 'Collaboration', icon: Users },
  { key: 'settings', label: 'Settings', icon: Settings },
];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  return fallback;
}

function formatTimeAgo(isoString: string): string {
  const deltaMs = Date.now() - new Date(isoString).getTime();
  const deltaHours = Math.floor(deltaMs / (1000 * 60 * 60));
  if (deltaHours < 1) return 'just now';
  if (deltaHours < 24) return `${deltaHours}h ago`;
  const deltaDays = Math.floor(deltaHours / 24);
  return `${deltaDays}d ago`;
}

function ThemeToggle({
  isDark,
  toggleDark,
  className = '',
}: {
  isDark: boolean;
  toggleDark: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={toggleDark}
      className={`p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (u: User) => void;
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = isLogin
        ? await backend.login(email, password)
        : await backend.signup(name, email, password);
      onLoginSuccess(user);
      onClose();
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Authentication failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md relative border border-slate-200 dark:border-slate-800">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-full bg-slate-100 dark:bg-slate-800">
          <X className="w-4 h-4" />
        </button>
        <div className="px-8 py-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            {isLogin ? 'Enter your credentials to continue.' : 'Start generating SOWs instantly.'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                placeholder="Full name"
              />
            )}
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              placeholder="Email address"
            />
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              placeholder="Password"
            />
            <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? 'Sign in' : 'Register'}
            </button>
          </form>
          <button
            onClick={() => setIsLogin((current) => !current)}
            className="text-sm mt-6 text-primary-600 dark:text-primary-400 font-semibold"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Landing({
  onOpenAuth,
  isDark,
  toggleDark,
}: {
  onOpenAuth: () => void;
  isDark: boolean;
  toggleDark: () => void;
}) {
  return (
    <div>
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-primary-700 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">AutoSOW</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle isDark={isDark} toggleDark={toggleDark} />
          <button onClick={onOpenAuth} className="bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">
            Get started
          </button>
        </div>
      </nav>
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            Dynamic AI Workspace For Statement of Work Generation
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Sign in to upload meetings, process transcripts, collaborate in real-time, and manage template-driven SOWs.
          </p>
          <button onClick={onOpenAuth} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-semibold">
            Open Workspace
          </button>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-lg space-y-4">
          {['Upload Meeting Data', 'Run AI Processing', 'Review & Collaborate', 'Export Final SOW'].map((step) => (
            <div key={step} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-medium">
              {step}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Sidebar({
  user,
  active,
  onChange,
  mobileOpen,
  setMobileOpen,
}: {
  user: User;
  active: ViewKey;
  onChange: (view: ViewKey) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  const classes = mobileOpen
    ? 'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800'
    : 'hidden md:flex md:flex-col md:w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800';

  return (
    <>
      {mobileOpen && <button className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={classes}>
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-primary-700 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white">AutoSOW</span>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onChange(item.key);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-sm font-medium ${
                  active === item.key
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-4">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function DashboardView({ workspace }: { workspace: WorkspaceData }) {
  const metrics = [
    {
      label: 'Meetings Processed',
      value: workspace.metrics.meetingsProcessed,
      delta: workspace.metrics.deltas.meetingsProcessed,
    },
    {
      label: 'SOWs Generated',
      value: workspace.metrics.sowGenerated,
      delta: workspace.metrics.deltas.sowGenerated,
    },
    {
      label: 'Pending Reviews',
      value: workspace.metrics.pendingReviews,
      delta: workspace.metrics.deltas.pendingReviews,
    },
    {
      label: 'AI Confidence Score',
      value: `${workspace.metrics.aiConfidenceScore}%`,
      delta: workspace.metrics.deltas.aiConfidenceScore,
    },
  ];

  const sowValues = workspace.charts.sowOverTime;
  const maxLineValue = Math.max(...sowValues.map((point) => point.value), 1);
  const linePoints = sowValues
    .map((point, index) => `${20 + index * 64},${120 - (point.value / maxLineValue) * 90}`)
    .join(' ');

  const perfValues = workspace.charts.monthlyPerformance;
  const maxBarValue = Math.max(...perfValues.map((point) => point.value), 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Live workspace analytics from backend data.</p>
      </div>

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{metric.label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
            <p className={`text-xs mt-2 ${metric.delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {metric.delta >= 0 ? `+${metric.delta}` : metric.delta}%
            </p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">SOWs Generated Over Time</h3>
          <svg viewBox="0 0 400 140" className="w-full h-44">
            <polyline fill="none" stroke="#4f46e5" strokeWidth="2.5" points={linePoints} />
            {sowValues.map((point, idx) => {
              const cx = 20 + idx * 64;
              const cy = 120 - (point.value / maxLineValue) * 90;
              return <circle key={point.month} cx={cx} cy={cy} r="3" fill="#4f46e5" />;
            })}
          </svg>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Monthly Performance</h3>
          <svg viewBox="0 0 400 140" className="w-full h-44">
            {perfValues.map((point, idx) => (
              <rect
                key={point.month}
                x={16 + idx * 62}
                y={130 - (point.value / maxBarValue) * 110}
                width="44"
                height={(point.value / maxBarValue) * 110}
                rx="4"
                fill="#14b8a6"
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Recent Projects</h3>
          <div className="space-y-2">
            {workspace.projects.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No projects uploaded yet.</p>
            ) : (
              workspace.projects.slice(0, 5).map((project) => (
                <div key={project.id} className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2.5 flex justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{project.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {project.dateText} • AI Confidence: {project.aiConfidence || 0}%
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{project.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {workspace.activities.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet.</p>
            ) : (
              workspace.activities.slice(0, 6).map((activity) => (
                <div key={activity.id}>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{activity.subtitle}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadView({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [transcript, setTranscript] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [participants, setParticipants] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!transcript.trim() || !projectName || !clientName) {
      toast.error('Project name, client name, and transcript are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await backend.uploadMeeting({ projectName, clientName, meetingDate, participants, transcript });
      await onRefresh();
      toast.success('Meeting data uploaded.');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Upload failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upload Meeting Data</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Submit transcript and metadata to create a live project.</p>
      </div>
      <div className="grid xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Meeting Transcript</h3>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here..."
            className="w-full h-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm"
          />
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Meeting Information</h3>
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project Name" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2" />
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2" />
          <input value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} placeholder="Meeting Date (dd-mm-yyyy)" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2" />
          <input value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Participants (comma separated)" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2" />
          <button onClick={submit} disabled={isSubmitting} className="w-full mt-2 rounded-lg bg-gradient-to-r from-primary-600 to-teal-500 text-white py-2.5 font-semibold flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Meeting
          </button>
        </div>
      </div>
    </div>
  );
}

function ProcessingView({ workspace }: { workspace: WorkspaceData }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Processing</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Live processing status from backend pipeline.</p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-slate-900 dark:text-white">Processing Your Data</span>
          <span className="font-semibold text-primary-600">{workspace.processing.completion}%</span>
        </div>
        <div className="w-full h-2 rounded bg-slate-200 dark:bg-slate-700">
          <div className="h-2 rounded bg-slate-900 dark:bg-primary-500" style={{ width: `${workspace.processing.completion}%` }} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Processing Pipeline</h3>
        <div className="space-y-3">
          {workspace.processing.pipeline.map((step) => (
            <div key={step.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {step.status === 'in_progress' && <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />}
                {step.status === 'pending' && <Clock3 className="w-5 h-5 text-slate-400" />}
                <span className="text-sm font-medium text-slate-900 dark:text-white">{step.name}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{step.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <InsightCard title="Extracted Requirements" items={workspace.processing.insights.extractedRequirements} />
        <InsightCard title="Key Stakeholders" items={workspace.processing.insights.keyStakeholders} />
        <InsightCard title="Suggested Deliverables" items={workspace.processing.insights.suggestedDeliverables} />
        <InsightCard title="Timeline Estimates" items={workspace.processing.insights.timelineEstimates} />
      </div>
    </div>
  );
}

function InsightCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No data yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GeneratedSOWsView({ workspace, onRefresh }: { workspace: WorkspaceData; onRefresh: () => Promise<void> }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    const latestProject = workspace.projects[0];
    const transcript = latestProject?.transcript || 'Participants: Product Manager, Engineering Lead. Need API + React dashboard in 8 weeks.';
    setIsGenerating(true);
    try {
      await backend.generateSOW({
        transcript,
        projectName: latestProject?.name.split(' - ')[0] || 'Generated Project',
        clientName: latestProject?.company || 'Client',
      });
      await onRefresh();
      toast.success('SOW generated from latest transcript.');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Generation failed.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLatest = async () => {
    const latest = workspace.generatedSows[0];
    if (!latest) return;
    await navigator.clipboard.writeText(latest.content);
    toast.success('Copied latest SOW.');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Generated SOWs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">All generated drafts are loaded dynamically from backend storage.</p>
        </div>
        <button onClick={generate} disabled={isGenerating} className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold flex items-center gap-2">
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Generate New
        </button>
      </div>

      {workspace.generatedSows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm text-slate-500 dark:text-slate-400">
          No SOW drafts yet.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">{workspace.generatedSows[0].title}</h3>
            <button onClick={copyLatest} className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
          <pre className="text-xs md:text-sm whitespace-pre-wrap rounded-lg p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 max-h-[420px] overflow-auto">
            {workspace.generatedSows[0].content}
          </pre>
        </div>
      )}
    </div>
  );
}

function TemplatesView({ workspace, onRefresh }: { workspace: WorkspaceData; onRefresh: () => Promise<void> }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState('6');
  const [creating, setCreating] = useState(false);
  const [activatingTemplateId, setActivatingTemplateId] = useState<string | null>(null);

  const create = async () => {
    if (!name || !description) {
      toast.error('Template name and description are required.');
      return;
    }
    setCreating(true);
    try {
      await backend.createTemplate({ name, description, sections: Number(sections) });
      await onRefresh();
      setName('');
      setDescription('');
      setSections('6');
      toast.success('Template created.');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Template creation failed.'));
    } finally {
      setCreating(false);
    }
  };

  const stats = [
    { count: workspace.templates.stats.total, label: 'Total Templates', icon: FileText },
    { count: workspace.templates.stats.custom, label: 'Custom Templates', icon: Star },
    { count: workspace.templates.stats.recentlyUsed, label: 'Recently Used', icon: Clock3 },
  ];
  const prebuiltTemplates = workspace.templates.all.filter(
    (template) => template.source === 'prebuilt' || template.popular
  );
  const customTemplates = workspace.templates.all.filter((template) => template.source === 'custom');

  const useTemplate = async (template: WorkspaceData['templates']['all'][number]) => {
    setActivatingTemplateId(template.id);
    try {
      await backend.useTemplate(template.id);
      await onRefresh();
      toast.success(`Created draft from ${template.name}.`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Template application failed.'));
    } finally {
      setActivatingTemplateId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">SOW Templates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Templates are loaded and managed from backend data.</p>
        </div>
      </div>

      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/70 dark:bg-indigo-950/30 p-4">
        <p className="text-sm text-indigo-700 dark:text-indigo-200">
          Pick any prebuilt template to instantly generate a ready-to-edit SOW draft in the Generated SOWs view.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.count}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">Create Custom Template</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template Name" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2" />
        <input value={sections} onChange={(e) => setSections(e.target.value)} placeholder="Sections" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2" />
        <button onClick={create} disabled={creating} className="rounded-lg bg-primary-600 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Template
        </button>
      </div>

      <TemplateSection
        title="Prebuilt Templates"
        templates={prebuiltTemplates}
        onUseTemplate={useTemplate}
        activatingTemplateId={activatingTemplateId}
        emptyMessage="No prebuilt templates available."
      />
      <TemplateSection
        title="Custom Templates"
        templates={customTemplates}
        onUseTemplate={useTemplate}
        activatingTemplateId={activatingTemplateId}
        emptyMessage="No custom templates yet. Create one above."
      />
    </div>
  );
}

function TemplateSection({
  title,
  templates,
  onUseTemplate,
  activatingTemplateId,
  emptyMessage,
}: {
  title: string;
  templates: WorkspaceData['templates']['all'];
  onUseTemplate: (template: WorkspaceData['templates']['all'][number]) => Promise<void>;
  activatingTemplateId: string | null;
  emptyMessage: string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">{title}</h3>
      <div className="grid xl:grid-cols-3 gap-4">
        {templates.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        ) : (
          templates.map((template) => {
            const previewSections =
              template.sectionHeadings && template.sectionHeadings.length > 0
                ? template.sectionHeadings.slice(0, 3)
                : Array.from({ length: Math.min(3, Math.max(1, template.sections)) }, (_, idx) => `Section ${idx + 1}`);
            const isApplying = activatingTemplateId === template.id;
            const sourceLabel = template.source === 'custom' ? 'Custom' : 'Prebuilt';

            return (
              <div key={template.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{template.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sourceLabel}
                    </span>
                    {template.popular && (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-orange-100 text-orange-700">Popular</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{template.description}</p>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>{template.sections} sections</span>
                  <span>{template.lastUsedText}</span>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Section Preview</p>
                  <div className="space-y-1">
                    {previewSections.map((section) => (
                      <p key={section} className="text-xs text-slate-700 dark:text-slate-300">
                        • {section}
                      </p>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => void onUseTemplate(template)}
                  disabled={isApplying}
                  className="w-full rounded-lg bg-primary-600 text-white py-2 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Use Template
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function CollaborationView({ workspace, onRefresh }: { workspace: WorkspaceData; onRefresh: () => Promise<void> }) {
  const resolve = async (commentId: string) => {
    try {
      await backend.resolveComment(commentId);
      await onRefresh();
      toast.success('Comment resolved.');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to resolve comment.'));
    }
  };

  return (
    <div className="grid xl:grid-cols-[1fr_280px] gap-4">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Collaboration</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Collaborative data sourced from backend.</p>
        </div>

        <div className="space-y-3">
          {workspace.collaboration.documents.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm text-slate-500 dark:text-slate-400">
              No active documents yet.
            </div>
          ) : (
            workspace.collaboration.documents.map((doc) => (
              <div key={doc.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{doc.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{doc.status}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {doc.comments} comments • {doc.collaborators} collaborators • {doc.highlighted} highlighted • {formatTimeAgo(doc.timestamp)}
                </p>
                <button className="w-full rounded-lg bg-primary-600 text-white py-2 text-sm font-medium">Open Document</button>
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {workspace.collaboration.comments.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No comments yet.</p>
            ) : (
              workspace.collaboration.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <div className="flex justify-between">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{comment.author}</p>
                    <span className={`text-xs ${comment.resolved ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {comment.resolved ? 'Resolved' : 'Open'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{comment.role} • {formatTimeAgo(comment.timestamp)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{comment.message}</p>
                  {!comment.resolved && (
                    <button onClick={() => resolve(comment.id)} className="text-sm mt-2 text-primary-600 dark:text-primary-400 font-medium">
                      Mark as Resolved
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 h-fit">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Team Members</h3>
        <div className="space-y-3">
          {workspace.collaboration.teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-sky-500 text-white flex items-center justify-center text-xs font-bold">
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{member.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
              </div>
              {member.online && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />}
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1 text-sm">
          <SummaryRow label="Total Comments" value={workspace.collaboration.summary.totalComments} />
          <SummaryRow label="Resolved" value={workspace.collaboration.summary.resolved} />
          <SummaryRow label="Open" value={workspace.collaboration.summary.open} />
          <SummaryRow label="Highlights" value={workspace.collaboration.summary.highlights} />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}

function SettingsView({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Signed in as <span className="font-semibold">{user.email}</span>
        </p>
        <button onClick={onLogout} className="mt-3 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold">
          Log out
        </button>
      </div>
    </div>
  );
}

function AppWorkspace({
  user,
  onLogout,
  isDark,
  toggleDark,
}: {
  user: User;
  onLogout: () => Promise<void>;
  isDark: boolean;
  toggleDark: () => void;
}) {
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkspace = async () => {
    const data = await backend.getWorkspaceData();
    setWorkspace(data);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        await refreshWorkspace();
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Failed to load workspace.'));
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const viewContent = useMemo(() => {
    if (!workspace) return null;
    if (activeView === 'dashboard') return <DashboardView workspace={workspace} />;
    if (activeView === 'upload') return <UploadView onRefresh={refreshWorkspace} />;
    if (activeView === 'processing') return <ProcessingView workspace={workspace} />;
    if (activeView === 'generated') return <GeneratedSOWsView workspace={workspace} onRefresh={refreshWorkspace} />;
    if (activeView === 'templates') return <TemplatesView workspace={workspace} onRefresh={refreshWorkspace} />;
    if (activeView === 'collaboration') return <CollaborationView workspace={workspace} onRefresh={refreshWorkspace} />;
    return <SettingsView user={user} onLogout={() => void onLogout()} />;
  }, [activeView, onLogout, user, workspace]);

  if (loading || !workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
      <Sidebar user={user} active={activeView} onChange={setActiveView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 min-w-0">
        <div className="md:hidden h-14 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded border border-slate-200 dark:border-slate-700">
            <Menu className="w-4 h-4" />
          </button>
          <p className="font-semibold text-slate-900 dark:text-white">AutoSOW</p>
          <ThemeToggle isDark={isDark} toggleDark={toggleDark} />
        </div>
        <div className="hidden md:flex h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur items-center justify-end">
          <ThemeToggle isDark={isDark} toggleDark={toggleDark} className="border border-slate-200 dark:border-slate-700" />
        </div>
        <main className="p-4 md:p-6 lg:p-8">{viewContent}</main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  useEffect(() => {
    backend
      .me()
      .then((sessionUser) => {
        if (sessionUser) setUser(sessionUser);
      })
      .finally(() => setIsInitializing(false));
  }, []);

  const logout = async () => {
    await backend.logout();
    setUser(null);
    toast.success('Logged out successfully.');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Toaster position="top-center" toastOptions={{ className: isDark ? '!bg-slate-800 !text-white' : '' }} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={setUser} />
      {user ? (
        <AppWorkspace user={user} onLogout={logout} isDark={isDark} toggleDark={() => setIsDark((v) => !v)} />
      ) : (
        <Landing onOpenAuth={() => setIsAuthOpen(true)} isDark={isDark} toggleDark={() => setIsDark((v) => !v)} />
      )}
      <button
        onClick={() => toast('Use Collaboration view for comments and mentions.', { icon: <MessageSquare /> })}
        className="fixed bottom-5 right-5 rounded-full bg-primary-600 text-white p-3 shadow-lg"
        aria-label="Open quick help"
      >
        <MessageSquare className="w-4 h-4" />
      </button>
    </div>
  );
}
