const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) console.log('HTTP ERROR:', response.url(), response.status());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  const rootHTML = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log('ROOT HTML LENGTH:', rootHTML.length);
  if (rootHTML.length < 100) {
      console.log('ROOT HTML CONTENT:', rootHTML);
  }
  await browser.close();
})();
