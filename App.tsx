
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Database, 
  MessageSquare, 
  Cpu, 
  CreditCard, 
  Mail, 
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  Stethoscope,
  Briefcase,
  Send,
  User,
  ExternalLink,
  FileText,
  Clock,
  BarChart3,
  Smartphone,
  Gift
} from 'lucide-react';
import { getGeminiResponse } from './services/geminiService';
import { ChatMessage, Feature, PricingPlan, TeamMember } from './types';

// Referencing local images as strings instead of imports to avoid ESM module resolution errors
const sayaliImg = './sayali.jpeg';
const prashantImg = './prashant.jpeg';

const safeScroll = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const navbarHeight = 80;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - navbarHeight;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleNav = (id: string) => {
    safeScroll(id);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => safeScroll('hero')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-heading text-slate-900 tracking-tight">clincfloww</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => handleNav('features')} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Features</button>
            <button onClick={() => handleNav('about')} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">About</button>
            <button onClick={() => handleNav('contact')} className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Get Essentials Free</button>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 shadow-xl">
          <button onClick={() => handleNav('features')} className="block w-full text-left py-3 border-b border-slate-50">Features</button>
          <button onClick={() => handleNav('about')} className="block w-full text-left py-3 border-b border-slate-50">About</button>
          <button onClick={() => handleNav('contact')} className="block w-full bg-blue-600 text-white px-6 py-3 rounded-xl text-center">Get Essentials Free</button>
        </div>
      )}
    </nav>
  );
};

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-50/50 group">
    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      {feature.icon}
    </div>
    <h3 className="text-xl font-bold mb-3 font-heading">{feature.title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
  </div>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'Hello! I am your clincfloww Assistant. Ask me about our free Essentials access, WhatsApp integration, or local data security.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setLoading(true);
    const response = await getGeminiResponse(input);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6" />
              <div><p className="font-bold">clincfloww AI</p><p className="text-xs opacity-80">Essentials Support</p></div>
            </div>
            <button onClick={() => setIsOpen(false)}><X /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400 italic">Thinking...</div>}
          </div>
          <div className="p-4 bg-white border-t flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-xl"><ChevronRight /></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"><MessageSquare /></button>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const features: Feature[] = [
    {
      id: 'odontogram',
      title: 'Advanced Odontogram',
      description: 'Interactive visual teeth charts for adults and children. Mark Cavities, Crowns, and RCT with clinical precision.',
      icon: <Stethoscope />
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Integration',
      description: 'Send automated appointment reminders and follow-ups with a single click. Reduce no-shows significantly.',
      icon: <Smartphone />
    },
    {
      id: 'ai-prescriptions',
      title: 'AI Prescription Engine',
      description: 'Draft professional prescriptions in seconds using Gemini AI based on your symptom notes and diagnosis.',
      icon: <Cpu />
    },
    {
      id: 'financials',
      title: 'Billing & Accounting',
      description: 'Generate letterhead-ready Invoices and Quotations. Export to PDF and track income vs. expenses with ease.',
      icon: <CreditCard />
    },
    {
      id: 'privacy',
      title: 'Absolute Data Privacy',
      description: 'Desktop-first architecture means your data is stored locally. Enjoy full offline access and total ownership.',
      icon: <ShieldCheck />
    },
    {
      id: 'backups',
      title: 'Automated Backups',
      description: 'Peace of mind with database snapshots every 2 hours and hardware-locked licensing for maximum security.',
      icon: <Clock />
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section id="hero" className="pt-32 pb-20 px-4 md:pt-48 md:pb-32 bg-gradient-to-b from-blue-50/50 to-white text-center">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-8">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            Designed for Professional Practitioners
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 font-heading tracking-tight leading-tight">
            The Smart Way to Manage <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Your Dental Clinic.</span>
          </h1>
          <p className="text-2xl text-blue-600 font-bold mb-6 font-heading">
            Book your free access to Clinic Flow – Essentials today.
          </p>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12">
            Combine Odontogram precision, WhatsApp automation, and AI-driven prescriptions into a single, secure desktop platform.
          </p>
          <div className="flex flex-col sm:row gap-4 justify-center">
            <button onClick={() => safeScroll('contact')} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200">Claim Free Essentials Access</button>
            <button onClick={() => safeScroll('features')} className="bg-white border border-slate-200 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50">Explore Features</button>
          </div>
          <div className="mt-20 relative max-w-5xl mx-auto">
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200&h=800" className="rounded-3xl shadow-2xl border-4 border-white" alt="Dashboard" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading mb-4 text-slate-900">Comprehensive Clinical Suite</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Everything you need to run a modern dental practice, now part of our Essentials package.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(f => <FeatureCard key={f.id} feature={f} />)}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 font-heading">High-Performance. <br />Offline-Capable. Secure.</h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              clincfloww was built to solve the frustration of slow, cloud-dependent management tools. 
              By focusing on a desktop-first architecture, we provide a lightning-fast experience that works 
              with or without the internet, keeping your patient records private on your own hardware.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-100 ring-4 ring-blue-50/50">
                <Gift className="text-blue-600 mb-2" />
                <h4 className="font-bold text-sm">Free Essentials</h4>
                <p className="text-xs text-slate-500">Full core features at zero cost.</p>
              </div>
              <div className="p-4 bg-white rounded-2xl shadow-sm border">
                <FileText className="text-blue-600 mb-2" />
                <h4 className="font-bold text-sm">PDF Quotations</h4>
                <p className="text-xs text-slate-500">Professional letterhead-ready exports.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-center">
            <div className="group">
              <div className="w-40 h-40 mx-auto mb-4 bg-slate-200 rounded-3xl overflow-hidden ring-4 ring-white">
                <img src={sayaliImg} className="w-full h-full object-cover" alt="Dr. Sayali Jadhav" />
              </div>
              <h4 className="font-bold">Dr. Sayali Jadhav</h4>
              <p className="text-blue-600 text-sm font-semibold">Chief Executive Officer</p>
            </div>
            <div className="group">
              <div className="w-40 h-40 mx-auto mb-4 bg-slate-200 rounded-3xl overflow-hidden ring-4 ring-white">
                <img src={prashantImg} className="w-full h-full object-cover" alt="Dr. Prashant Hajare" />
              </div>
              <h4 className="font-bold">Dr. Prashant Hajare</h4>
              <p className="text-blue-600 text-sm font-semibold">Chief Marketing Lead</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Access CTA instead of Pricing */}
      <section className="py-24 px-4 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold font-heading mb-6">Stop Paying Monthly Subscriptions.</h2>
          <p className="text-xl opacity-90 mb-10">Get the clinical tools you deserve without the financial burden. Own your data, own your workflow.</p>
          <button onClick={() => safeScroll('contact')} className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-slate-50 transition-all shadow-2xl">
            Book Clinic Flow – Essentials
          </button>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-4 bg-slate-900 text-white rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-5xl font-bold font-heading mb-8">Get Your Clinic <br />Flowing.</h2>
            <p className="text-slate-400 text-xl mb-12">Submit an inquiry to book your free access to Clinic Flow – Essentials today.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"><Mail className="text-blue-400" /></div><div><p className="text-slate-400 text-sm">Direct Support</p><p className="text-xl">clincfloww@gmail.com</p></div></div>
              <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"><Briefcase className="text-blue-400" /></div><div><p className="text-slate-400 text-sm">Sales & Onboarding</p><p className="text-xl">clincfloww@gmail.com</p></div></div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 text-slate-900">
            {formSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center animate-in zoom-in"><CheckCircle2 size={48} className="text-green-600 mb-6" /><h3 className="text-3xl font-bold mb-2">Message Sent</h3><p className="text-slate-500">Check your inbox at clincfloww@gmail.com for next steps.</p></div>
            ) : (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }}>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="First Name" className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                  <input required placeholder="Last Name" className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <input required type="email" placeholder="Work Email" className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                <input required placeholder="Clinic Name & City" className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea required rows={4} placeholder="How can we help you get started with Essentials?" className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl hover:bg-blue-700 transition-all text-lg flex items-center justify-center gap-2"><Send size={20} /> Request Free Access</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-500 py-12 px-4 border-t border-white/5 text-center">
        <p>© 2024 clincfloww Management Systems. Email: clincfloww@gmail.com</p>
      </footer>

      <ChatBot />
    </div>
  );
};

export default App;
