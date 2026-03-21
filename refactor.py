import re

with open('App.tsx', 'r') as f:
    content = f.read()

# 1. Update Hero Section to be centered and remove the right column image.
old_hero = """          {/* Hero */}
          <section id="hero" className="pt-40 md:pt-48 pb-32 px-4 relative overflow-hidden">
            <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-400/5 blur-[120px] rounded-full -z-10" />

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">

              {/* Left Column: Text & USP */}
              <ScrollReveal className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start pt-10" animationClass="-translate-y-4" delay={100}>
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-100 px-6 py-3 rounded-full shadow-lg mb-8">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Built By Practicing Clinicians</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 font-heading tracking-tighter leading-[1.1]">
                  The World's First<br />
                  <span className="text-blue-600">Local-First AI driven Clinic Management App.</span>
                </h1>

                <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium max-w-2xl px-4 lg:px-0">
                  Run your practice with 40% less admin. Appointments, billing, inventory, and AI insights—secure, offline-capable, and designed by doctors, not software vendors.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md lg:max-w-none justify-center lg:justify-start px-4 lg:px-0">
                  <button
                    onClick={() => safeScroll('contact')}
                    className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-black shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    Download your free trial
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => safeScroll('demo-video')}
                    className="glass border border-slate-200 px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-white transition-all text-slate-700 flex items-center justify-center gap-2"
                  >
                    Watch Demo
                  </button>
                </div>
              </ScrollReveal>

              {/* Right Column: Dashboard Pic */}
              <ScrollReveal className="flex-1 w-full max-w-2xl mx-auto lg:max-w-none mt-12 lg:mt-0 relative" animationClass="translate-x-16" delay={300}>
                <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20 rounded-full"></div>
                <div className="relative glass border border-white/40 shadow-2xl rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-blue-500/30 hover:scale-[1.01]">
                  <div className="bg-slate-900/5 backdrop-blur-sm border-b border-slate-900/5 p-4 flex items-center gap-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                  </div>
                  <img src={ASSETS.IMAGES.DASHBOARD_PREVIEW} alt="ClinicFloww Dashboard" className="w-full h-auto object-cover" />
                </div>
              </ScrollReveal>

            </div>
          </section>"""

new_hero = """          {/* Hero */}
          <section id="hero" className="pt-40 md:pt-48 pb-16 px-4 relative overflow-hidden">
            <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-400/5 blur-[120px] rounded-full -z-10" />

            <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
              <ScrollReveal className="flex flex-col items-center pt-10" animationClass="-translate-y-8" delay={100}>
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-100 px-6 py-3 rounded-full shadow-lg mb-8">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Built By Practicing Clinicians</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 font-heading tracking-tighter leading-[1.1]">
                  The World's First<br />
                  <span className="text-blue-600">Local-First AI driven Clinic Management App.</span>
                </h1>

                <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium max-w-2xl px-4 lg:px-0">
                  Run your practice with 40% less admin. Appointments, billing, inventory, and AI insights—secure, offline-capable, and designed by doctors, not software vendors.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md lg:max-w-none justify-center px-4 lg:px-0">
                  <button
                    onClick={() => safeScroll('contact')}
                    className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-black shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    Download your free trial
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => safeScroll('interactive-dashboard-snapshot')}
                    className="glass border border-slate-200 px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-white transition-all text-slate-700 flex items-center justify-center gap-2"
                  >
                    See Live Demo ↓
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </section>"""

old_dash_section = """          {/* Interactive Dashboard Snapshot */}
          <section className="py-32 px-4 relative overflow-hidden bg-slate-100/50">
            <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-indigo-400/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-6 py-3 rounded-full mb-6">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Live Component Experience</span>
                </div>
                <h2 className="text-5xl font-black font-heading mb-6 text-slate-900 tracking-tighter">Experience The App Feel.</h2>
                <p className="text-slate-500 max-w-2xl mx-auto font-medium">Explore the actual intelligence dashboard component designed for optimal clinical engagement.</p>
              </div>
              
              <div className="mx-auto rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/50 bg-slate-50 relative group">
                <div className="bg-slate-200/50 backdrop-blur-sm p-4 flex items-center justify-between border-b border-slate-200/50">
                   <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                     <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                     <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                   </div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-4 py-1.5 rounded-full">
                     Preview Mode
                   </div>
                   <div className="w-12"></div>
                </div>
                <div className="h-[800px] overflow-y-auto custom-scrollbar p-4 md:p-8 bg-slate-50/50">
                  <div className="scale-100 origin-top">
                    <DashboardSnapshot 
                        patients={patients}
                        appointments={appointments}
                        inventory={inventory}
                        expenses={[]}
                        assistants={[]}
                        currentTheme="light"
                        setView={() => {}}
                        persistedInsights=""
                        onUpdateInsights={() => {}}
                        isActivated={true}
                        licenseType="pro"
                        onRequestActivation={() => {}}
                        onSendWhatsApp={() => {}}
                        whatsappStatus="active"
                        isGoogleConnected={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>"""

new_dash_section = """          {/* Interactive Dashboard Snapshot */}
          <section id="interactive-dashboard-snapshot" className="pb-32 px-4 relative overflow-hidden">
            <ScrollReveal className="max-w-7xl mx-auto" animationClass="translate-y-16" delay={200}>
              <div className="mx-auto rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/50 bg-slate-50 relative group">
                <div className="bg-slate-200/50 backdrop-blur-sm p-4 flex items-center justify-between border-b border-slate-200/50">
                   <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                     <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                     <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                   </div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-4 py-1.5 rounded-full">
                     Live Preview Mode
                   </div>
                   <div className="w-12"></div>
                </div>
                <div className="h-[800px] overflow-y-auto custom-scrollbar p-0 md:p-4 bg-slate-50/50">
                  <div className="scale-100 origin-top">
                    <DashboardSnapshot 
                        patients={patients}
                        appointments={appointments}
                        inventory={inventory}
                        expenses={[]}
                        assistants={[]}
                        currentTheme="light"
                        setView={() => {}}
                        persistedInsights=""
                        onUpdateInsights={() => {}}
                        isActivated={true}
                        licenseType="pro"
                        onRequestActivation={() => {}}
                        onSendWhatsApp={() => {}}
                        whatsappStatus="active"
                        isGoogleConnected={true}
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>"""

if old_hero in content:
    content = content.replace(old_hero, new_hero + "\\n\\n" + new_dash_section)
    print("Hero updated successfully!")
else:
    print("Could not find old hero block.")

if old_dash_section in content:
    content = content.replace(old_dash_section, "")
    print("Old dashboard section removed!")
else:
    print("Could not find old dashboard section.")

# Wrap other sections in ScrollReveal
import hashlib

def wrap_with_scroll(match, anim="translate-y-12"):
    return match.group(1) + match.group(2) + f"\\n            <ScrollReveal animationClass=\\"{anim}\\">" + match.group(3) + "\\n            </ScrollReveal>\\n          </section>"

# Features section
content = re.sub(r'(<section id="features" className="[^"]+">)(\s*)(<div className="max-w-7xl mx-auto">.*?)\s*</section>', lambda m: wrap_with_scroll(m), content, flags=re.DOTALL)
# Trust section
content = re.sub(r'(<section id="about" className="[^"]+">)(\s*<div className="absolute top-0 left-0[^>]+></div>\s*)(<div className="max-w-7xl mx-auto relative z-10">.*?)\s*</section>', lambda m: wrap_with_scroll(m, "translate-y-16"), content, flags=re.DOTALL)
# Privacy Comparison
content = re.sub(r'(<section className="py-24 px-4 bg-white border-y border-slate-100">)(\s*)(<div className="max-w-5xl mx-auto">.*?)\s*</section>', lambda m: wrap_with_scroll(m, "translate-y-12"), content, flags=re.DOTALL)
# AI section (Custom wrapper because it's slightly complex)
content = re.sub(r'(<section className="py-32 px-4">)(\s*)(<div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">.*?)\s*</section>', lambda m: wrap_with_scroll(m, "translate-y-16"), content, flags=re.DOTALL)
# Key Features Summary
content = re.sub(r'(<section id="key-features-summary" className="[^"]+">)(\s*)(<div className="max-w-7xl mx-auto">.*?)\s*</section>', lambda m: wrap_with_scroll(m, "translate-y-12"), content, flags=re.DOTALL)
# Contact Section
content = re.sub(r'(<section id="contact" className="[^"]+">)(\s*)(<div className="max-w-4xl mx-auto text-center">.*?)\s*</section>', lambda m: wrap_with_scroll(m, "translate-x-8"), content, flags=re.DOTALL)
# Demo video
content = re.sub(r'(<section id="demo-video" className="[^"]+">)(\s*)(<div className="max-w-5xl mx-auto text-center">.*?)\s*</section>', lambda m: wrap_with_scroll(m, "scale-95 opacity-0"), content, flags=re.DOTALL)


with open('App.tsx', 'w') as f:
    f.write(content)
print("Transforms complete.")
