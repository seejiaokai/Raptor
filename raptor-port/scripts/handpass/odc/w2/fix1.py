p='s12.mjs'
s=open(p,newline='').read()
a=s.index("const pid = await page.evaluate")
b=s.index("\n",a)
s=s[:a]+"const pid = await page.evaluate(c => { const e = [...document.querySelectorAll('span.cs')].find(x => x.textContent.trim().toLowerCase() === c); const r = e && e.closest('tr'); const m = r && /^row-(.+)$/.exec(r.getAttribute('data-testid') || ''); return m ? m[1] : null }, lc)"+s[b:]
open(p,'w',newline='').write(s)
