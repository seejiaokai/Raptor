p='scripts/handpass/odc/w2/probe4.mjs'
s=open(p,newline='').read()
s=s.replace("await look()\nawait w.browser.close()","await look()\nawait page.waitForTimeout(2500)\nconsole.log('later', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('span.cs')].filter(x => /prob/i.test(x.textContent)).map(x => x.textContent))))\nawait t.press('[data-testid=\"month-NOV\"]'); await page.waitForTimeout(1500)\nconsole.log('nov', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('span.cs')].filter(x => /prob/i.test(x.textContent)).map(x => x.textContent))))\nawait page.screenshot({ path: 'docs/img/handpass/2026-10-13-one-date-calendar/w2/probe4.png' })\nawait w.browser.close()")
open(p,'w',newline='').write(s)
