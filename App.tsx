
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
  User
} from 'lucide-react';
import { getGeminiResponse } from './services/geminiService';
import { ChatMessage, Feature, PricingPlan, TeamMember } from './types';

/**
 * UTILITY: Manual Smooth Scroll
 * This avoids "Page Errors" caused by browser hash-routing in certain hosting environments.
 */
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const offset = 80; // Height of the fixed navbar
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavClick = (id: string) => {
    scrollToSection(id);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => scrollToSection('hero')}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-heading text-slate-900 tracking-tight">DentalFlow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => handleNavClick('features')} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Features</button>
            <button onClick={() => handleNavClick('about')} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">About</button>
            <button onClick={() => handleNavClick('pricing')} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Pricing</button>
            <button 
              onClick={() => handleNavClick('contact')} 
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              Get DentalFlow
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 shadow-xl">
          <button onClick={() => handleNavClick('features')} className="block w-full text-left text-slate-600 font-medium py-2">Features</button>
          <button onClick={() => handleNavClick('about')} className="block w-full text-left text-slate-600 font-medium py-2">About</button>
          <button onClick={() => handleNavClick('pricing')} className="block w-full text-left text-slate-600 font-medium py-2">Pricing</button>
          <button onClick={() => handleNavClick('contact')} className="block w-full bg-blue-600 text-white px-6 py-2.5 rounded-xl text-center font-semibold">Get DentalFlow</button>
        </div>
      )}
    </nav>
  );
};

const FeatureCard = ({ feature }: { feature: Feature }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-50/50 group">
    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      {feature.icon}
    </div>
    <h3 className="text-xl font-bold mb-3 font-heading">{feature.title}</h3>
    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
  </div>
);

const PricingCard = ({ plan }: { plan: PricingPlan }) => (
  <div className={`p-8 rounded-3xl border ${plan.recommended ? 'border-blue-600 bg-white ring-4 ring-blue-50 shadow-2xl scale-105' : 'border-slate-200 bg-slate-50'} relative`}>
    {plan.recommended && (
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Introductory Offer</span>
    )}
    <h3 className="text-2xl font-bold mb-2 font-heading">{plan.name}</h3>
    <p className="text-slate-500 mb-6">{plan.description}</p>
    <div className="mb-8">
      <div className="flex flex-col">
        <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
        <span className="text-slate-500 font-semibold text-sm mt-1">+ ₹1,999 Annual Subscription</span>
      </div>
    </div>
    <ul className="space-y-4 mb-8">
      {plan.features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-slate-700">
          <CheckCircle2 className="text-blue-600 w-5 h-5 flex-shrink-0" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
    <button 
      onClick={() => scrollToSection('contact')}
      className={`block w-full py-4 rounded-2xl font-bold text-center transition-all ${plan.recommended ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-50'}`}
    >
      Inquire Now
    </button>
  </div>
);

const TeamCard = ({ member }: { member: TeamMember }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="text-center group">
      <div className="w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden ring-4 ring-white shadow-lg shadow-slate-200 group-hover:ring-blue-100 transition-all bg-slate-100 flex items-center justify-center">
        {!imgError ? (
          <img 
            src={member.image} 
            alt={member.name} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
          />
        ) : (
          <div className="flex flex-col items-center text-slate-300">
            <User size={64} />
            <span className="text-xs font-bold mt-2">PHOTO NEEDED</span>
          </div>
        )}
      </div>
      <h4 className="text-xl font-bold font-heading text-slate-900">{member.name}</h4>
      <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
      <p className="text-slate-600 text-sm max-w-xs mx-auto leading-relaxed">{member.bio}</p>
    </div>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am the DentalFlow AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await getGeminiResponse(input);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6" />
              <div>
                <p className="font-bold">DentalFlow AI</p>
                <p className="text-xs text-blue-100">Smart Support Agent</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg"><X /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400 italic px-2">Assistant is typing...</div>}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about DentalFlow..." 
              className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700">
              <ChevronRight />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl shadow-blue-400 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <MessageSquare />
        </button>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const features: Feature[] = [
    {
      id: 'local',
      title: 'Local-First Security',
      description: 'Your patient data stays on your machine. No cloud database means zero risk of wide-scale server breaches.',
      icon: <ShieldCheck />
    },
    {
      id: 'scheduling',
      title: 'Smart Scheduling',
      description: 'Auto-sync with Google Calendar and let our AI optimize your daily appointments for maximum efficiency.',
      icon: <Calendar />
    },
    {
      id: 'ai',
      title: 'Gemini AI Clinical Support',
      description: 'Built-in Gemini integration to help summarize medical histories and suggest precise billing codes.',
      icon: <Cpu />
    },
    {
      id: 'billing',
      title: 'Integrated Billing',
      description: 'Manage accounts, insurance claims, and automated invoicing without leaving the platform.',
      icon: <CreditCard />
    },
    {
      id: 'inventory',
      title: 'Live Inventory',
      description: 'Keep track of clinical supplies in real-time with automated low-stock notifications.',
      icon: <Database />
    },
    {
      id: 'messaging',
      title: 'Unified Messaging',
      description: 'Seamlessly message patients via SMS and Email directly through the DentalFlow interface.',
      icon: <MessageSquare />
    }
  ];

  const pricing: PricingPlan[] = [
    {
      name: 'Standard License',
      price: '₹19,999',
      description: 'Full licensing for your primary clinic workstation.',
      features: ['Local Data Storage', 'Google Calendar Sync', 'Standard Billing', 'Basic AI Support', 'Full Messaging Suite']
    },
    {
      name: 'Launch Promo',
      price: '₹14,999',
      recommended: true,
      description: 'Special introductory price for early adopters.',
      features: ['Full License Access', 'Advanced Inventory', 'AI Clinical Summaries', 'Priority Support', 'Full Messaging Suite']
    }
  ];

  const team: TeamMember[] = [
    {
      name: 'Dr. Sayali Jadhav',
      role: 'Chief Executive Officer',
      bio: 'Visionary leader driving the mission to modernize dental clinic operations with local-first security and efficiency.',
      /**
       * PHOTO INSTRUCTIONS:
       * 1. Place your photo file (e.g. sayali.jpg) in the project root.
       * 2. Change the string below to: image: './sayali.jpg'
       */
      image: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400&h=400'
    },
    {
      name: 'Dr. Prashant Hajare',
      role: 'Chief Marketing & Business Lead',
      bio: 'Expert in clinical business growth, ensuring DentalFlow meets the real-world needs of busy dental practitioners.',
      /**
       * PHOTO INSTRUCTIONS:
       * 1. Place your photo file (e.g. prashant.jpg) in the project root.
       * 2. Change the string below to: image: './prashant.jpg'
       */
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-4 md:pt-48 md:pb-32 bg-gradient-to-b from-blue-50/50 to-white text-center">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-8">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            Empowering Modern Dental Practices
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 font-heading tracking-tight leading-[1.1]">
            Seamless Clinic Management <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Built for Privacy.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            DentalFlow combines the power of Gemini AI with local-first security. Control your data, manage your clinic, and scale with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => scrollToSection('contact')}
              className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
            >
              Get 7-Day Free Trial
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="bg-white border border-slate-200 text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
            >
              Explore Features
            </button>
          </div>

          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full -z-10" />
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200&h=800" 
              alt="DentalFlow Dashboard Preview" 
              className="rounded-3xl shadow-2xl border-4 border-white ring-1 ring-slate-200"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading mb-4 text-slate-900">Why Switch to DentalFlow?</h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto">We've built the ultimate platform to handle every aspect of your clinical workflow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(f => <FeatureCard key={f.id} feature={f} />)}
          </div>
        </div>
      </section>

      {/* About / Team Section */}
      <section id="about" className="py-24 px-4 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold font-heading mb-6 text-slate-900 leading-tight">Founded by Clinicians, <br />Engineered for Safety.</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                DentalFlow was born out of the need for a management system that prioritizes data ownership. 
                Our founders, Dr. Jadhav and Dr. Hajare, understand the daily challenges of clinical management 
                and designed DentalFlow to eliminate those friction points through intelligent automation.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Total Data Privacy</h4>
                    <p className="text-slate-500 text-sm">Patient records stay local. You are in full control.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Modern Clinical UI</h4>
                    <p className="text-slate-500 text-sm">A clean, responsive interface that feels natural and fast.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              {team.map(m => <TeamCard key={m.name} member={m} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading mb-4 text-slate-900">Investment & Pricing</h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto">One-time licensing for permanent use with a low annual support fee.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
            {pricing.map(p => <PricingCard key={p.name} plan={p} />)}
          </div>
          <p className="text-center text-slate-400 mt-12 text-sm italic">
            * All prices include initial setup and basic training for your clinic staff.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 bg-slate-900 text-white rounded-t-[4rem] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-5xl font-bold font-heading mb-8 leading-tight">Ready to flow <br />differently?</h2>
              <p className="text-slate-400 text-xl mb-12">
                Join the growing network of clinics optimizing their operations with DentalFlow. Inquire today for a customized demo.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <Mail className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm uppercase tracking-wider font-bold">Email Support</p>
                    <p className="text-xl font-medium">hello@dentalflow.io</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <Briefcase className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm uppercase tracking-wider font-bold">Sales & Inquiry</p>
                    <p className="text-xl font-medium">sales@dentalflow.io</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 text-slate-900 shadow-2xl transition-all duration-500 overflow-hidden relative">
              {formSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 font-heading">Thank You!</h3>
                  <p className="text-slate-600 text-lg mb-8 max-w-sm">
                    Your inquiry has been received. Our team will reach out to you within 24 hours to schedule your demo.
                  </p>
                  <button 
                    onClick={() => setFormSubmitted(false)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-6 font-heading">Book a Demo</h3>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                        <input required type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                        <input required type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                      <input required type="email" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Clinic Location</label>
                      <input required type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                      <textarea required rows={4} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tell us about your clinic size..."></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl hover:bg-blue-700 transition-all text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                      <Send size={20} />
                      Submit Inquiry
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-heading text-white">DentalFlow</span>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
          <p className="text-sm">© 2024 DentalFlow Solutions. All rights reserved.</p>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
};

export default App;
