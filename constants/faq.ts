// Questions shown in the FAQ section. The same list is emitted as FAQPage structured data
// at build time (scripts/prerender.mjs), so the visible answers and the schema never drift.
// Keep answers factual: they are what search engines quote.

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: FaqItem[] = [
  {
    q: 'What is ClinicFloww?',
    a: 'ClinicFloww is clinic management software for doctors and dental clinics. It handles appointments, patient records, billing and invoices, inventory, expenses, WhatsApp reminders and AI insights in one app.',
  },
  {
    q: 'Is ClinicFloww cloud-based?',
    a: 'No. ClinicFloww is local-first: your patient records are stored on the PC in your clinic, not on our servers or in a cloud database. With ClinicFloww Connect you can still open your clinic from anywhere.',
  },
  {
    q: 'Can I use ClinicFloww on my phone, tablet or TV?',
    a: 'Yes. ClinicFloww runs in the browser, so it works on phones, tablets, laptops, desktops and smart TVs. On clinic Wi-Fi, devices join by scanning a QR code.',
  },
  {
    q: 'Does ClinicFloww work without internet?',
    a: 'Yes. Because your data lives on your clinic PC, day-to-day work such as appointments, records and billing keeps running when the internet is down.',
  },
  {
    q: 'Is ClinicFloww good for dental clinics?',
    a: 'Yes. It was built by a practicing dentist and includes dental features such as odontogram charting, treatment photos, lab work tracking, printable case papers and signed consent forms.',
  },
  {
    q: 'Can ClinicFloww send WhatsApp appointment reminders?',
    a: 'Yes. ClinicFloww sends WhatsApp appointment and follow-up reminders, supports two-way WhatsApp chat with patients, and can draft WhatsApp campaigns with AI.',
  },
  {
    q: 'How do I try ClinicFloww?',
    a: 'Fill in the form on this page to get the download links and a free-tier key straight away.',
  },
];
