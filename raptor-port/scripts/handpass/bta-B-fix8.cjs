const fs = require('fs')
const f = 'C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/scripts/handpass/bta-B-s25c.mjs'
let s = fs.readFileSync(f, 'utf8')
const a = s.indexOf("      const txt = await p.evaluate(() => { const e = [...document.querySelectorAll('[role=dialog]")
const b = s.indexOf('\n', a)
const neu = "      const txt = await p.evaluate(() => { const e = document.querySelector('.bidsheet'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 420) : 'no sheet' })"
s = s.slice(0, a) + neu + s.slice(b)
// close the sheet helper, used before leaving it
s = s.replace("    const cellText = () =>", "    const closeSheet = async () => { if (await p.locator('.bidsheet:visible').count()) { await p.keyboard.press('Escape'); await sleep(500) } if (await p.locator('.sheetscrim:visible').count()) { const x = p.locator('.bidsheet-hd button:visible').first(); if (await x.count()) { await x.click(); await sleep(500) } } if (await p.locator('.sheetscrim:visible').count()) { await p.mouse.click(5, 450); await sleep(500) } }\n    const cellText = () =>")
s = s.replace("    const am = await pressSheet('AM')\n", "    const am = await pressSheet('AM')\n    const afterAm = await p.evaluate(() => { const e = document.querySelector('.bidsheet'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 300) : '(sheet closed)' })\n    await pic(p, 's25c-lw-after-AM')\n    await closeSheet()\n")
s = s.replace("then AM pressed (${am});", "then AM pressed (${am}; the sheet then read: ${afterAm});")
s = s.replace("    const dl = await pressSheet('Delete')\n", "    const dl = await pressSheet('Delete')\n    await pic(p, 's25c-lw-after-Delete')\n")
fs.writeFileSync(f, s)
console.log('ok')
