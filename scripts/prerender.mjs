// Runs after `vite build` and the SSR build: injects the rendered landing page into
// dist/index.html and adds FAQPage structured data generated from constants/faq.ts.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ssrEntry = path.join(root, 'dist-ssr', 'entry-server.js');
const indexPath = path.join(root, 'dist', 'index.html');

const { render, FAQ } = await import(pathToFileURL(ssrEntry).href);
const appHtml = render();

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};
// Escape "<" so the JSON can never close the script tag.
const faqTag = `<script type="application/ld+json">${JSON.stringify(faqSchema).replace(/</g, '\\u003c')}</script>`;

let html = await readFile(indexPath, 'utf8');
if (!html.includes('<div id="root"></div>')) throw new Error('prerender: empty #root not found in dist/index.html');
html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`).replace('</head>', `    ${faqTag}\n  </head>`);
await writeFile(indexPath, html);
await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`prerender: wrote ${Math.round(appHtml.length / 1024)} KB of HTML and ${FAQ.length} FAQ entries`);
