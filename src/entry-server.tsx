// Server entry used only at build time: renders the landing page to static HTML so search
// engines and link previews get the full content without running JavaScript.
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../App';

export { FAQ } from '../constants/faq';

export const render = () => renderToString(<React.StrictMode><App /></React.StrictMode>);
