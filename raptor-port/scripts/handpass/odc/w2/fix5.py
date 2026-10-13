p='scripts/handpass/odc/w2/probe9.mjs'
s=open(p,newline='').read()
s=s.replace("const loc = page.locator('#vWeek').getByText('BFM-3').first()","""const all = await page.locator('#vWeek').getByText('BFM-3').all()
let loc = null
for (const a of all) { if (await a.isVisible()) { loc = a; break } }
console.log('matches', all.length, 'visible one', !!loc)""")
open(p,'w',newline='').write(s)
