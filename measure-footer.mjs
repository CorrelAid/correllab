import { chromium } from '@playwright/test';
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });

for (const [label, url] of [['WEBSITE', 'https://correlaid.org/'], ['CORRELLAB', 'http://localhost:4326/kurse/abo/']]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const footer = page.locator('footer').first();
  await footer.scrollIntoViewIfNeeded();
  const data = await page.evaluate(() => {
    const f = document.querySelector('footer');
    const logo = f.querySelector('a svg, #FooterLogo svg, a[aria-label*="CorrelAid"] svg');
    const nav = f.querySelector('nav');
    const linksSection = f.querySelector('.links-section');
    const h5 = linksSection?.querySelector('h5');
    const li = linksSection?.querySelector('li, dt');
    const a = li?.querySelector('a') || linksSection?.querySelector('a');
    const socialIcon = f.querySelector('.social-icons svg');
    const footerInner = f.querySelector('.footer-inner');
    const footerInnerRect = footerInner.getBoundingClientRect();
    return {
      logo: logo ? { w: logo.getBoundingClientRect().width, h: logo.getBoundingClientRect().height } : null,
      socialIcon: socialIcon ? { w: socialIcon.getBoundingClientRect().width, h: socialIcon.getBoundingClientRect().height } : null,
      footerInnerH: footerInnerRect.height,
      linksSection: linksSection ? getComputedStyle(linksSection).gap : 'none',
      linksSectionFontSize: linksSection ? getComputedStyle(linksSection).fontSize : 'none',
      h5FontSize: h5 ? getComputedStyle(h5).fontSize : 'none',
      aFontSize: a ? getComputedStyle(a).fontSize : 'none',
      liLineHeight: li ? getComputedStyle(li).lineHeight : 'none',
      navMarginTop: nav ? getComputedStyle(nav).marginTop : 'none',
      navGap: nav ? getComputedStyle(nav).gap : 'none',
      navButtonHeight: nav?.querySelector('a') ? nav.querySelector('a').getBoundingClientRect().height : null,
    };
  });
  console.log(`=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
  await page.close();
}
await browser.close();
