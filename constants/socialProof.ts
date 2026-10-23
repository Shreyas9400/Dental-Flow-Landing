// Social proof shown on the landing page.
//
// Only put real, verifiable data here. Each testimonial must come from an actual
// ClinicFloww user who agreed to be quoted, and stats must match real numbers.
// Invented reviews or user counts are treated as misleading advertising (ASCI code,
// Consumer Protection Act 2019, FTC fake-review rule).
//
// Sections render only when they have data, so empty lists hide them.

export interface Testimonial {
  quote: string;
  name: string;          // e.g. "Dr. A. Kulkarni"
  role: string;          // e.g. "Orthodontist"
  clinic?: string;       // e.g. "Smile Care Dental"
  city?: string;         // e.g. "Pune"
  photo?: string;        // path under /public, used only with consent
}

export interface Stat {
  value: number;
  suffix?: string;       // e.g. "+"
  label: string;         // e.g. "Doctors onboard"
}

export const TESTIMONIALS: Testimonial[] = [];

// Example: { value: 300, suffix: '+', label: 'Doctors onboard' }
export const STATS: Stat[] = [];
