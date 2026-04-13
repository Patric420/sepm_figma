import { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight, Quote, Box, Layout, BarChart, Database, FileText, CheckCircle, Loader2, X, UploadCloud, Copy, Moon, Sun } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { backend } from './lib/backend';
import type { User } from './lib/backend';

function ThemeToggle({ isDark, toggleDark }: { isDark: boolean, toggleDark: () => void }) {
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

function AuthModal({ isOpen, onClose, onLoginSuccess }: { isOpen: boolean, onClose: () => void, onLoginSuccess: (u: User) => void }) {
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
      let user;
      if (isLogin) {
        user = await backend.login(email, password);
        toast.success("Welcome back!");
      } else {
        user = await backend.signup(name, email, password);
        toast.success("Account created successfully!");
      }
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full p-1.5 focus:outline-none">
          <X className="w-4 h-4" />
        </button>
        <div className="px-8 py-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{isLogin ? "Welcome back" : "Create an account"}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">{isLogin ? "Enter your credentials to access your account." : "Start generating instant SOWs today."}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500" placeholder="Jane Doe" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500" placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500" placeholder="••••••••" />
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-semibold py-3 rounded-xl transition-colors mt-6 flex justify-center items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? "Sign in" : "Register"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar({ user, onOpenAuth, onLogout, isDark, toggleDark }: { user: User | null, onOpenAuth: () => void, onLogout: () => void, isDark: boolean, toggleDark: () => void }) {
  const navLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
    } else {
      toast("Feature coming soon!", { icon: "🛠️" });
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="w-8 h-8 rounded shrink-0 bg-gradient-to-br from-indigo-500 to-primary-700 flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">AutoSOW</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
        <a href="#" onClick={navLinkClick} className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">Templates <ChevronDown className="w-4 h-4" /></a>
        <a href="#" onClick={navLinkClick} className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">Use Cases <ChevronDown className="w-4 h-4" /></a>
        <a href="#" onClick={navLinkClick} className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle isDark={isDark} toggleDark={toggleDark} />
        {user ? (
          <div className="flex items-center gap-4 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 shadow-sm">
            <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full ring-2 ring-primary-50 dark:ring-primary-900/50 bg-slate-100 dark:bg-slate-800" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block pr-2">{user.name}</span>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <button onClick={onLogout} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">Log out</button>
          </div>
        ) : (
          <>
            <button onClick={onOpenAuth} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hidden sm:block">
              Log in
            </button>
            <button 
              onClick={onOpenAuth} 
              className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-primary-600/20"
            >
              Get started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function Hero({ onOpenAuth }: { onOpenAuth: () => void }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email to join the waitlist!");
      return;
    }
    setIsSubmitting(true);
    try {
      await backend.submitLead(email);
      toast.success("Success! You've joined the waitlist.");
      setEmail('');
    } catch (e: any) {
      toast.error(e.message || "Failed to submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-6 border border-primary-100/50 dark:border-primary-800/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
          AI-Powered Workflows
        </div>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
          Turn Meetings Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">Actionable SOWs.</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
          Stop writing Statements of Work from scratch. AutoSOW processes your meeting transcripts and automatically extracts deliverables, timelines, and budgets.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email for early access" 
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500 flex-1 sm:max-w-xs shadow-sm"
          />
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 dark:disabled:bg-slate-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-md whitespace-nowrap flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-current" />}
            Join Waitlist
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
          Already got an account? <button onClick={onOpenAuth} className="text-primary-600 dark:text-primary-400 hover:underline">Log in to your dashboard</button>
        </p>
      </div>
      
      <div className="relative aspect-square lg:aspect-auto lg:h-[500px] w-full bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-primary-50 dark:from-slate-900 dark:to-primary-950/20" />
        
        <div className="w-full h-full relative">
           {/* Mock Transcript Box */}
           <div className="absolute top-4 left-4 w-64 h-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 transform -rotate-3 z-10 transition-transform">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Transcript.txt</span>
              </div>
              <div className="w-11/12 h-2 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700/50 rounded mb-2" />
              <div className="w-4/5 h-2 bg-slate-100 dark:bg-slate-700/50 rounded mb-2" />
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700/50 rounded mb-2" />
              <div className="w-5/6 h-2 bg-slate-100 dark:bg-slate-700/50 rounded" />
           </div>
           
           {/* Arrow / Connection */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-full p-3 shadow-lg z-30 border border-slate-100 dark:border-slate-700">
             <ArrowRight className="w-6 h-6 text-primary-500 dark:text-primary-400" />
           </div>

           {/* Mock SOW Document Box */}
           <div className="absolute bottom-12 right-4 w-72 h-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 transform rotate-2 z-20">
             <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
               <h4 className="font-bold text-slate-800 dark:text-white text-sm">Statement of Work</h4>
               <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
             </div>
             <div className="space-y-3">
               <div className="w-1/2 h-3 bg-slate-800 dark:bg-slate-300 rounded" />
               <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded" />
               <div className="w-4/5 h-2 bg-slate-100 dark:bg-slate-700 rounded" />
               <div className="w-full h-20 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded p-2 pt-3">
                 <div className="w-1/3 h-2 bg-primary-100 dark:bg-primary-900/50 rounded mb-2" />
                 <div className="w-1/4 h-2 bg-primary-100 dark:bg-primary-900/50 rounded" />
               </div>
             </div>
           </div>
           
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-500 dark:bg-primary-600 rounded-2xl opacity-10 mix-blend-multiply dark:mix-blend-lighten blur-2xl z-0" />
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// NEW DASHBOARD VIEW FOR AUTHENTICATED USERS
// -------------------------------------------------------------
function Dashboard({ user }: { user: User }) {
  const [transcript, setTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sowResult, setSowResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      toast.error("Please paste a meeting transcript first.");
      return;
    }
    
    setIsGenerating(true);
    setSowResult(null);
    try {
      const response = await backend.generateSOW(transcript);
      setSowResult(response.sow);
      toast.success("Statement of Work generated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate SOW.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (sowResult) {
      navigator.clipboard.writeText(sowResult);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome to your AutoSOW Dashboard, {user.name.split(' ')[0]}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Paste a meeting transcript below to automatically extract requirements, scope, and generate a Statement of Work.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Transcript Input Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary-600 dark:text-primary-400" /> Input Transcript
            </h2>
            <button 
              onClick={() => setTranscript('')} 
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
            >
              Clear
            </button>
          </div>
          <textarea 
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={isGenerating}
            placeholder="Paste your Zoom/Teams/Meet transcript here...&#10;&#10;e.g.&#10;Client: 'We need the new SaaS dashboard built by end of Q2. It should involve a full frontend rewrite using React and an API layer matching our existing REST specs. Budget is roughly $40k.'&#10;Agent: 'Understood. We will split that into three phases...'"
            className="flex-1 w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none font-mono text-sm leading-relaxed"
          ></textarea>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !transcript.trim()}
            className="mt-6 w-full bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 disabled:bg-slate-400 dark:disabled:bg-slate-800 text-white font-semibold py-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Transcript & Synthesizing SOW...
              </>
            ) : "Generate Statement of Work"}
          </button>
        </div>

        {/* SOW Result Area */}
        <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-800 dark:border-slate-800/50 shadow-xl p-6 flex flex-col h-[600px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-indigo-500 dark:from-primary-600 dark:to-indigo-600" />
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-400 dark:text-primary-500" /> Generated Document
            </h2>
            {sowResult && (
              <button 
                onClick={copyToClipboard}
                className="text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Markdown
              </button>
            )}
          </div>
          
          <div className="flex-1 w-full p-6 rounded-xl border border-slate-700 dark:border-slate-800/80 bg-slate-950/50 dark:bg-slate-900/50 text-slate-300 overflow-y-auto custom-scrollbar">
            {sowResult ? (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-300 dark:text-slate-400">
                {sowResult}
              </pre>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-600 gap-4 opacity-50">
                <Box className="w-12 h-12" />
                <p className="text-sm font-medium">Your generated SOW will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


function Feature({ title, description, reverse = false }: { title: string, description: string, reverse?: boolean }) {
  const handleLearnMore = (e: React.MouseEvent) => {
    e.preventDefault();
    toast(`Learning more about: ${title}`, { icon: 'ℹ️' });
  };
  return (
    <section className="py-20 lg:py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className={`max-w-7xl mx-auto px-6 flex flex-col gap-12 items-center ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
        <div className="flex-1 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl aspect-[4/3] border border-slate-200 dark:border-slate-800 shadow-lg relative p-2 overflow-hidden flex flex-col group">
          <div className="h-6 w-full border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-1.5 shrink-0 bg-white dark:bg-slate-950 rounded-t-xl mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
          <div className="flex-1 bg-white dark:bg-slate-950 rounded-b-xl overflow-hidden border border-slate-100 dark:border-slate-800/50 p-6 relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
             <div className="relative z-10 w-full h-full flex items-center justify-center">
               <div className="w-48 h-48 rounded-full bg-primary-100/50 dark:bg-primary-900/30 absolute blur-3xl group-hover:bg-primary-200/50 dark:group-hover:bg-primary-800/30 transition-colors" />
               <FileText className="w-16 h-16 text-primary-500/80 dark:text-primary-500/60 drop-shadow-lg" />
             </div>
          </div>
        </div>
        <div className="flex-1 max-w-xl">
          <div className="h-1 w-12 bg-primary-600 dark:bg-primary-500 rounded mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">{title}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">{description}</p>
          <a href="#" onClick={handleLearnMore} className="inline-flex items-center gap-2 font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors group">
            Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}

const templates = [
  { name: "Software Development", icon: Layout, color: "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400" },
  { name: "IT Consulting", icon: Database, color: "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400" },
  { name: "Marketing Retainer", icon: BarChart, color: "bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400" },
  { name: "Design & UX Audit", icon: Box, color: "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400" },
];

function Templates({ onTemplateClick }: { onTemplateClick: (name: string) => void }) {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">Supported SOW Templates</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((tpl, idx) => {
            const Icon = tpl.icon;
            return (
              <div key={idx} onClick={() => onTemplateClick(tpl.name)} className="group cursor-pointer bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-black/50 transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${tpl.color}`}>
                   <Icon strokeWidth={2} className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{tpl.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Auto-formatting for {tpl.name.toLowerCase()} projects.</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1A1D24] dark:bg-slate-950 text-slate-300 dark:text-slate-400 py-16 dark:border-t dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-500">
        <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold tracking-tight">AutoSOW</span>
        </div>
        <p>© 2026 AutoSOW Inc. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white dark:hover:text-slate-300">Privacy</a>
          <a href="#" className="hover:text-white dark:hover:text-slate-300">Terms</a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Dark mode state implementation
  const [isDark, setIsDark] = useState(() => {
    // Check if user has explicitly saved a preference, otherwise prefer dark scheme if os does
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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

  const toggleDark = () => setIsDark(!isDark);

  // Rehydrate JWT session on page load
  useEffect(() => {
    backend.me().then(sessionUser => {
      if (sessionUser) setUser(sessionUser);
    }).finally(() => {
      setIsInitializing(false);
    });
  }, []);

  const handleLogout = async () => {
    await backend.logout();
    setUser(null);
    toast.success("Logged out successfully.");
  };

  const checkAuthFirst = (action: () => void) => {
    if (!user) {
      toast("Please log in to use this feature.", { icon: "🔒" });
      setIsAuthOpen(true);
    } else {
      action();
    }
  };

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-primary-200 dark:selection:bg-primary-900/50 transition-colors duration-200">
      <Toaster position="top-center" toastOptions={{ className: isDark ? '!bg-slate-800 !text-white' : '' }} />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={(u) => setUser(u)} 
      />
      
      <Navbar user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} isDark={isDark} toggleDark={toggleDark} />
      
      <main>
        {user ? (
          <Dashboard user={user} />
        ) : (
          <>
            <Hero onOpenAuth={() => setIsAuthOpen(true)} />
            <Feature 
              title="Automated Requirement Extraction" 
              description="Simply paste your meeting transcript. AutoSOW identifies action items, timelines, technical requirements, and core deliverables out of messy conversation history."
            />
            <Feature 
              title="Standardized Templates" 
              description="Whether you run a marketing agency or a custom software shop, AutoSOW forces the AI-generated proposals to conform to your specific legal templates."
              reverse
            />
            <Templates onTemplateClick={(name) => checkAuthFirst(() => toast.success(`Viewing ${name} configuration...`))} />
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
