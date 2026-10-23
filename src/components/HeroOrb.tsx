import React from 'react';

// Static stand-in for the WebGL globe on phones and tablets: gradients and a dotted mask,
// drawn once by the browser with no per-frame work.
const HeroOrb: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${className} flex items-center justify-center`} aria-hidden="true">
    <div className="relative w-[78vw] max-w-[420px] aspect-square">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.28), rgba(99,102,241,0.12) 60%, transparent)' }}
      />
      <div
        className="absolute inset-[12%] rounded-full"
        style={{
          backgroundImage: 'radial-gradient(rgba(103,232,249,0.9) 1.1px, transparent 1.6px)',
          backgroundSize: '11px 11px',
          WebkitMaskImage: 'radial-gradient(circle at 38% 35%, black 0%, rgba(0,0,0,0.65) 45%, transparent 71%)',
          maskImage: 'radial-gradient(circle at 38% 35%, black 0%, rgba(0,0,0,0.65) 45%, transparent 71%)',
        }}
      />
      <div className="absolute inset-[28%] rounded-full border border-sky-400/25" />
      <div className="absolute inset-[2%] rounded-full border border-cyan-300/20" style={{ transform: 'rotateX(72deg) rotateZ(18deg)' }} />
      <div className="absolute -inset-[6%] rounded-full border border-indigo-300/15" style={{ transform: 'rotateX(76deg) rotateZ(-24deg)' }} />
    </div>
  </div>
);

export default HeroOrb;
