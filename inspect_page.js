import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4322/weiterbildungen');
  
  const content = await page.content();
  console.log('Page Title:', await page.title());
  
  const honeycomb = await page.$('.honeycomb');
  console.log('Honeycomb element exists:', !!honeycomb);
  
  if (honeycomb) {
    const isVisible = await honeycomb.isVisible();
    const opacity = await honeycomb.evaluate(el => window.getComputedStyle(el).opacity);
    console.log('Honeycomb visible:', isVisible);
    console.log('Honeycomb opacity:', opacity);
    
    const items = await page.$$('.hex-grid-item');
    console.log('Number of hex items:', items.length);
    if (items.length > 0) {
        const itemOpacity = await items[0].evaluate(el => window.getComputedStyle(el).opacity);
        const itemClassList = await items[0].evaluate(el => Array.from(el.classList));
        console.log('First item opacity:', itemOpacity);
        console.log('First item classes:', itemClassList);
    }
  }

  await browser.close();
})();
