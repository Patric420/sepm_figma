import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  Circle,
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
import type { User } from './lib/backend';

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

type MetricCard = {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
};

type IconType = React.ComponentType<{ className?: string }>;

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'upload', label: 'Upload Meeting', icon: Upload },
  { key: 'processing', label: 'AI Processing', icon: Bot },
  { key: 'generated', label: 'Generated SOWs', icon: FileText },
  { key: 'templates', label: 'Templates', icon: FolderKanban },
  { key: 'collaboration', label: 'Collaboration', icon: Users },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const dashboardMetrics: MetricCard[] = [
  { title: 'Meetings Processed', value: '127', delta: '+12%', positive: true },
  { title: 'SOWs Generated', value: '84', delta: '+8%', positive: true },
  { title: 'Pending Reviews', value: '6', delta: '-3%', positive: false },
  { title: 'AI Confidence Score', value: '94%', delta: '+2%', positive: true },
];

const processingSteps: Array<{ step: string; done: boolean }> = [
  { step: 'Transcript Analysis', done: true },
  { step: 'Image Recognition', done: true },
  { step: 'Requirement Extraction', done: true },
  { step: 'Scope Identification', done: true },
  { step: 'SOW Generation', done: false },
];

const templateStats: Array<{ count: string; label: string; Icon: IconType }> = [
  { count: '12', label: 'Total Templates', Icon: FileText },
  { count: '6', label: 'Custom Templates', Icon: Star },
  { count: '4', label: 'Recently Used', Icon: Clock3 },
];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

function ThemeToggle({ isDark, toggleDark }: { isDark: boolean; toggleDark: () => void }) {
  return (
    <button
      onClick={toggleDark}
      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle dark mode"
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
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      onLoginSuccess(user);
      onClose();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Authentication failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full p-1.5"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="px-8 py-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            {isLogin
              ? 'Enter your credentials to access your account.'
              : 'Start generating instant SOWs today.'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Jane Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors mt-6 flex justify-center items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? 'Sign in' : 'Register'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingNavbar({
  onOpenAuth,
  isDark,
  toggleDark,
}: {
  onOpenAuth: () => void;
  isDark: boolean;
  toggleDark: () => void;
}) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-primary-700 flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">AutoSOW</span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle isDark={isDark} toggleDark={toggleDark} />
        <button
          onClick={onOpenAuth}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
        >
          Get started
        </button>
      </div>
    </nav>
  );
}

function Landing({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
          Build SOWs Faster With <span className="text-primary-600 dark:text-primary-400">AI + Templates</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
          Upload meetings, extract requirements, collaborate on drafts, and ship polished Statements of Work.
        </p>
        <button
          onClick={onOpenAuth}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white px-8 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2"
        >
          Launch Workspace <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-900">
            <p className="font-semibold text-primary-700 dark:text-primary-300">1. Upload Transcript</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-900">
            <p className="font-semibold text-emerald-700 dark:text-emerald-300">2. AI Requirement Extraction</p>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900">
            <p className="font-semibold text-indigo-700 dark:text-indigo-300">3. Generate Structured SOW</p>
          </div>
        </div>
      </div>
    </section>
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
  const menuClasses = mobileOpen
    ? 'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 shadow-xl border-r border-slate-200 dark:border-slate-800'
    : 'hidden md:flex md:flex-col md:w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800';

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      <aside className={menuClasses}>
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-primary-700 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white">AutoSOW</span>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onChange(item.key);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-sm font-medium transition-colors ${
                  isActive
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
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"
            />
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

function DashboardView() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Welcome back! Here's an overview of your SOW generation activity.
        </p>
      </div>

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-4">
        {dashboardMetrics.map((metric) => (
          <div
            key={metric.title}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{metric.title}</span>
              <span
                className={`text-xs font-semibold ${
                  metric.positive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {metric.delta}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">SOWs Generated Over Time</h3>
          <svg viewBox="0 0 400 140" className="w-full h-44">
            <polyline
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              points="10,95 75,70 140,82 205,54 270,64 335,40"
            />
            {[10, 75, 140, 205, 270, 335].map((x) => (
              <circle key={x} cx={x} cy={x === 10 ? 95 : x === 75 ? 70 : x === 140 ? 82 : x === 205 ? 54 : x === 270 ? 64 : 40} r="3" fill="#4f46e5" />
            ))}
          </svg>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Monthly Performance</h3>
          <svg viewBox="0 0 400 140" className="w-full h-44">
            {[50, 80, 65, 105, 92, 118].map((height, idx) => (
              <rect
                key={idx}
                x={12 + idx * 63}
                y={130 - height}
                width="48"
                height={height}
                rx="4"
                fill="#14b8a6"
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Projects</h3>
            <button className="text-sm text-primary-600 dark:text-primary-400">View All</button>
          </div>
          <div className="space-y-2">
            {[
              ['Mobile App Development - Acme Corp', 'Completed', '96%'],
              ['Cloud Migration Project - TechStart', 'In Review', '92%'],
              ['CRM Implementation - Global Sales', 'Completed', '98%'],
              ['Data Analytics Platform - DataCo', 'Draft', '88%'],
            ].map(([name, status, confidence]) => (
              <div
                key={name}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2.5 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">AI Confidence: {confidence}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {[
              'SOW Generated - Mobile App Development',
              'Meeting Uploaded - E-commerce Redesign',
              'SOW Approved - Cloud Migration',
              'Template Created - Custom Consulting',
            ].map((item) => (
              <div key={item} className="flex gap-2 text-sm">
                <Circle className="w-2.5 h-2.5 mt-1.5 fill-primary-500 text-primary-500" />
                <p className="text-slate-600 dark:text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadView() {
  const [transcript, setTranscript] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [participants, setParticipants] = useState('');

  const runGeneration = async () => {
    if (!transcript.trim()) {
      toast.error('Please paste meeting transcript text first.');
      return;
    }
    try {
      const result = await backend.generateSOW(transcript);
      await navigator.clipboard.writeText(result.sow);
      toast.success('SOW generated and copied to clipboard.');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to generate SOW.'));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upload Meeting Data</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload your meeting transcript and any relevant images to generate a structured SOW.
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Meeting Transcript</h3>
          <label className="block mb-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center cursor-pointer">
            <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">.txt or .docx files accepted</p>
            <input type="file" className="hidden" accept=".txt,.doc,.docx" />
          </label>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Or Paste Transcript</p>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here..."
            className="w-full h-44 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm"
          />
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Images & Photos</h3>
          <label className="block rounded-lg border border-dashed border-teal-400/60 p-8 text-center cursor-pointer">
            <Upload className="w-6 h-6 mx-auto text-teal-500 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload whiteboard photos or slides</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, or PDF accepted</p>
            <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf" multiple />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Meeting Information</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2"
          />
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client Name"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2"
          />
          <input
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            placeholder="dd-mm-yyyy"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2"
          />
          <input
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="Participants"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          AI will analyze your transcript and images to generate a structured SOW.
        </p>
        <button
          onClick={runGeneration}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-teal-500 text-white font-semibold text-sm"
        >
          Generate SOW with AI
        </button>
      </div>
    </div>
  );
}

function ProcessingView() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Processing</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Our AI is analyzing your meeting data and generating a structured SOW.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex justify-between mb-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
            <span className="font-semibold text-slate-900 dark:text-white">Processing Your Data</span>
          </div>
          <span className="font-semibold text-primary-600">100%</span>
        </div>
        <div className="w-full h-2 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className="h-full w-full bg-slate-900 dark:bg-primary-500" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Processing Pipeline</h3>
        <div className="space-y-4">
          {processingSteps.map(({ step, done }) => (
            <div key={step} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                )}
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{step}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{done ? 'Completed' : 'In progress...'}</p>
                </div>
              </div>
              {done && <Check className="w-4 h-4 text-emerald-500" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <InsightCard
          title="Extracted Requirements"
          items={[
            'Develop mobile application for iOS and Android',
            'Implement user authentication system',
            'Create admin dashboard for content management',
            'Integrate payment gateway',
          ]}
        />
        <InsightCard
          title="Key Stakeholders"
          items={['John Smith - Project Sponsor', 'Sarah Johnson - Product Manager', 'Michael Chen - Technical Lead']}
        />
        <InsightCard
          title="Suggested Deliverables"
          items={['Native iOS application', 'Native Android application', 'Admin web portal', 'API documentation']}
        />
        <InsightCard
          title="Timeline Estimates"
          items={['Phase 1: Design & Planning - 3 weeks', 'Phase 2: Development - 10 weeks', 'Phase 3: QA - 3 weeks']}
        />
      </div>
    </div>
  );
}

function InsightCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeneratedSOWsView() {
  const [generated, setGenerated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const sampleTranscript =
    'Client needs a SaaS dashboard with role-based auth, analytics widgets, and monthly rollout milestones.';

  const generateNow = async () => {
    setIsLoading(true);
    try {
      const response = await backend.generateSOW(sampleTranscript);
      setGenerated(response.sow);
      toast.success('Generated a new SOW draft.');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Unable to generate SOW.'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyOutput = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    toast.success('Copied generated SOW.');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Generated SOWs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review and export your latest generated documents.</p>
        </div>
        <button
          onClick={generateNow}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Generate New
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Latest Draft</h3>
        {generated ? (
          <>
            <pre className="text-xs md:text-sm whitespace-pre-wrap rounded-lg p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 max-h-[420px] overflow-auto">
              {generated}
            </pre>
            <button
              onClick={copyOutput}
              className="mt-3 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy markdown
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No generated draft yet. Click “Generate New”.</p>
        )}
      </div>
    </div>
  );
}

function TemplatesView() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">SOW Templates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose from pre-built templates or create your own custom SOW structure.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Custom Template
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {templateStats.map(({ count, label, Icon }) => {
          const I = Icon;
          return (
            <div key={label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <I className="w-4 h-4" />
                <span className="text-xs font-medium">{label}</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{count}</p>
            </div>
          );
        })}
      </div>

      <h3 className="font-semibold text-slate-900 dark:text-white">Popular Templates</h3>
      <div className="grid xl:grid-cols-3 gap-4">
        {['Software Development SOW', 'Consulting Project SOW', 'UI/UX Design SOW'].map((name) => (
          <TemplateCard key={name} name={name} popular />
        ))}
      </div>

      <h3 className="font-semibold text-slate-900 dark:text-white">All Templates</h3>
      <div className="grid xl:grid-cols-3 gap-4">
        {[
          'Software Development SOW',
          'Consulting Project SOW',
          'Implementation SOW',
          'UI/UX Design SOW',
          'Data Analytics SOW',
          'Cloud Migration SOW',
        ].map((name) => (
          <TemplateCard key={name} name={name} />
        ))}
      </div>

      <div className="rounded-2xl p-10 bg-gradient-to-r from-indigo-600 to-teal-500 text-white text-center">
        <div className="w-12 h-12 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Create Your Own Template</h3>
        <p className="text-sm text-indigo-100 mb-5">
          Build a custom SOW template tailored to your organization's specific needs and workflows.
        </p>
        <button className="px-5 py-2.5 rounded-lg bg-white text-indigo-700 font-semibold">Get Started</button>
      </div>
    </div>
  );
}

function TemplateCard({ name, popular = false }: { name: string; popular?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-slate-900 dark:text-white">{name}</h4>
        {popular && <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">Popular</span>}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Professional structure for consistent SOW delivery and review.
      </p>
      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>7 sections</span>
        <span>2 days ago</span>
      </div>
    </div>
  );
}

function CollaborationView() {
  return (
    <div className="grid xl:grid-cols-[1fr_280px] gap-4">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Collaboration</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review, comment, and collaborate on SOW documents with your team.
          </p>
        </div>

        <div className="space-y-3">
          {[
            ['Mobile App Development - Acme Corp', 'In Review'],
            ['Cloud Migration Project - TechStart', 'Approved'],
            ['CRM Implementation - Global Sales', 'Pending Review'],
          ].map(([name, status]) => (
            <div key={name} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{name}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">12 comments • 4 collaborators • 2 hours ago</p>
              <button className="w-full rounded-lg bg-primary-600 text-white py-2 text-sm font-medium">Open Document</button>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
            <div className="flex gap-2 text-xs">
              <button className="px-2 py-1 rounded bg-primary-600 text-white">Comments</button>
              <button className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Highlights</button>
              <button className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Versions</button>
            </div>
          </div>
          <div className="space-y-3">
            {[
              ['Sarah Johnson', 'Timeline looks reasonable; add one buffer week.'],
              ['Michael Chen', 'Include automated testing in deliverables?'],
              ['Emily Davis', 'Need clarification on offline mode requirements.'],
            ].map(([author, message]) => (
              <div key={author} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{author}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{message}</p>
                <div className="text-xs mt-2 text-primary-600 dark:text-primary-400 flex items-center gap-4">
                  <button>Reply</button>
                  <button>Mark as Resolved</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Team Members</h3>
          <button className="p-1 rounded border border-slate-200 dark:border-slate-700">
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {[
            ['John Doe', 'Project Lead'],
            ['Sarah Johnson', 'Product Manager'],
            ['Michael Chen', 'Technical Lead'],
            ['Emily Davis', 'UX Designer'],
            ['David Wilson', 'QA Manager'],
          ].map(([name, role], idx) => (
            <div key={name} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-sky-500 text-white flex items-center justify-center text-xs font-bold">
                {name
                  .split(' ')
                  .map((x) => x[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{role}</p>
              </div>
              {idx < 3 && <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />}
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">Activity Summary</h4>
          <div className="space-y-1 text-sm">
            <SummaryRow label="Total Comments" value="25" />
            <SummaryRow label="Resolved" value="18" />
            <SummaryRow label="Open" value="7" />
            <SummaryRow label="Highlights" value="5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your workspace preferences.</p>
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
          Signed in as <span className="font-semibold">{user.email}</span>
        </p>
        <button
          onClick={onLogout}
          className="mt-3 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

function AppWorkspace({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderContent = () => {
    if (activeView === 'dashboard') return <DashboardView />;
    if (activeView === 'upload') return <UploadView />;
    if (activeView === 'processing') return <ProcessingView />;
    if (activeView === 'generated') return <GeneratedSOWsView />;
    if (activeView === 'templates') return <TemplatesView />;
    if (activeView === 'collaboration') return <CollaborationView />;
    return <SettingsView user={user} onLogout={onLogout} />;
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
      <Sidebar
        user={user}
        active={activeView}
        onChange={setActiveView}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 min-w-0">
        <div className="md:hidden h-14 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded border border-slate-200 dark:border-slate-700">
            <Menu className="w-4 h-4" />
          </button>
          <p className="font-semibold text-slate-900 dark:text-white">AutoSOW</p>
          <span className="w-8" />
        </div>
        <main className="p-4 md:p-6 lg:p-8">{renderContent()}</main>
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
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  const handleLogout = async () => {
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
      <Toaster
        position="top-center"
        toastOptions={{ className: isDark ? '!bg-slate-800 !text-white' : '' }}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => setUser(loggedUser)}
      />
      {user ? (
        <AppWorkspace user={user} onLogout={handleLogout} />
      ) : (
        <>
          <LandingNavbar
            onOpenAuth={() => setIsAuthOpen(true)}
            isDark={isDark}
            toggleDark={() => setIsDark(!isDark)}
          />
          <Landing onOpenAuth={() => setIsAuthOpen(true)} />
        </>
      )}
      <button
        onClick={() => toast('Comments panel can be opened from Collaboration view.', { icon: <MessageSquare /> })}
        className="fixed bottom-5 right-5 rounded-full bg-primary-600 text-white p-3 shadow-lg"
        aria-label="Open quick help"
      >
        <MessageSquare className="w-4 h-4" />
      </button>
    </div>
  );
}
