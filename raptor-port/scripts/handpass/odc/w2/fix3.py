p='scripts/handpass/odc/w2/probe4.mjs'
s=open(p,newline='').read()
s=s.replace("rows: document.querySelectorAll('tr[data-testid^=\"row-\"]').length,","rows: document.querySelectorAll('tr[data-testid^=\"row-\"]').length, groups: [...document.querySelectorAll('tr')].filter(r => /· ?\d+$/.test((r.innerText||'').trim()) && (r.innerText||'').length < 30).map(r => r.innerText.trim().replace(/\s+/g,' ')), cat: [...document.querySelectorAll('tr')].filter(r => /CAT [A-D]/.test(r.innerText||'') && (r.innerText||'').length < 12).length,")
open(p,'w',newline='').write(s)
