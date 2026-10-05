import * as K from './stk2-S-lib.mjs'
const { L, W, H } = K
/* where the keyboard is, and whether it is inside the open dialog (the last visible .airpop / [role=dialog]) */
const focusD = p => p.evaluate(() => {
  const vis = e => e.getBoundingClientRect().width > 0
  const dlgs = [...document.querySelectorAll('.airpop, [role="dialog"], [data-testid$="pop"], [data-testid="sortall"]')].filter(vis)
  const dlg = dlgs[dlgs.length - 1] || null
  const a = document.activeElement
  if (!a || a === document.body) return { txt: 'BODY (nothing focused)', inside: false, dlg: !!dlg }
  const inside = !!dlg && dlg.contains(a)
  return { txt: `${a.tagName.toLowerCase()} ${a.dataset.txt || a.dataset.bfld || a.id || ''}${a.dataset.lcx ? ' lcx=' + a.dataset.lcx : ''} "${(a.innerText || a.value || '').toString().replace(/\s+/g, ' ').trim().slice(0, 28)}"`, inside, dlg: !!dlg }
})
const dlgInfo = p => p.evaluate(() => {
  const vis = e => e.getBoundingClientRect().width > 0
  const dlgs = [...document.querySelectorAll('.airpop, [role="dialog"]')].filter(vis)
  const d = dlgs[dlgs.length - 1]
  return d ? { cls: d.className, tid: d.dataset.testid || '', text: d.innerText.replace(/\s+/g, ' ').slice(0, 260), btns: [...d.querySelectorAll('button')].map(b => b.innerText.trim() || b.getAttribute('aria-label') || '?') } : null
})
const snap = p => p.evaluate(() => ({ d: JSON.stringify(window.DAYS), elog: window.ELOG.rows.length, cmds: window.commandStreamLen ? window.commandStreamLen() : null }))
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await W.boardOn(p, 0)
await K.sleep(500)

async function walkDialog(label, opener) {
  const s0 = await snap(p)
  await opener()
  await K.sleep(600)
  const info = await dlgInfo(p)
  const pc1 = await K.pic(p, label + '-open')
  const trail = []
  const f0 = await focusD(p)
  for (let i = 1; i <= 6; i++) { await p.keyboard.press('Tab'); await K.sleep(180); trail.push({ k: 'Tab #' + i, ...(await focusD(p)) }) }
  const pc2 = await K.pic(p, label + '-after-tabs')
  for (let i = 1; i <= 6; i++) { await p.keyboard.press('Shift+Tab'); await K.sleep(180); trail.push({ k: 'Shift+Tab #' + i, ...(await focusD(p)) }) }
  const pc3 = await K.pic(p, label + '-after-shifttabs')
  const s1 = await snap(p)
  return { s0, s1, info, f0, trail, pics: [pc1, pc2, pc3] }
}
async function closeDialog() {
  // close it with its own Cancel / ✕ (never the Confirm)
  const d = await p.evaluate(() => {
    const vis = e => e.getBoundingClientRect().width > 0
    const dlgs = [...document.querySelectorAll('.airpop, [role="dialog"]')].filter(vis)
    const dd = dlgs[dlgs.length - 1]; if (!dd) return null
    const bs = [...dd.querySelectorAll('button')]
    const c = bs.find(b => /^cancel$/i.test(b.innerText.trim())) || bs.find(b => /^✕|×|close/i.test(b.innerText.trim()) || /close/i.test(b.getAttribute('aria-label') || ''))
    if (!c) return null
    const r = c.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, c.innerText.trim()]
  })
  if (!d) return 'no Cancel/✕ found'
  await p.mouse.click(d[0], d[1]); await K.sleep(500)
  return 'pressed ' + d[2]
}
async function tabCheck(label) {
  // click into a flying line's Callsign box and press Tab once
  const el = p.locator('#schedBoard [data-bfld="ff:0.0.0.cs"]:visible, #schedBoard [data-txt="ff:0.0.0.cs"]:visible').first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await K.sleep(250)
  const b = await el.boundingBox()
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await K.sleep(250)
  const before = await p.evaluate(() => { const a = document.activeElement; return a ? (a.dataset.txt || a.dataset.bfld || a.id || a.tagName) : null })
  await p.keyboard.press('Tab'); await K.sleep(350)
  const after = await p.evaluate(() => { const a = document.activeElement; if (!a) return null; const r = a.getBoundingClientRect(); return { k: a.dataset.txt || a.dataset.bfld || a.id || a.tagName, tag: a.tagName, txt: (a.innerText || a.value || '').toString().slice(0, 20), box: [Math.round(r.left), Math.round(r.top)] } })
  const pc = await K.pic(p, label + '-tab-check')
  return { before, after, pc }
}
const fmt = r => `dialog: ${JSON.stringify(r.info)}; focus when opened: ${r.f0.txt} (${r.f0.inside ? 'inside' : 'OUTSIDE'}); ${r.trail.map(t => t.k.replace(' #', '') + ':' + (t.inside ? 'in ' : 'OUT ') + t.txt.slice(0, 26)).join(' | ')}; schedule days changed behind: ${r.s0.d !== r.s1.d}; edit-history rows ${r.s0.elog}->${r.s1.elog}`

// (a) Sort all
const A = await walkDialog('S2a-sortall', async () => { await p.locator('#sbSortAll:visible').first().click() })
const closeA = await closeDialog()
const stillA = await p.evaluate(() => [...document.querySelectorAll('.airpop')].filter(e => e.getBoundingClientRect().width > 0).length)
const TA = await tabCheck('S2c-after-sortall')
const outA = A.trail.filter(t => !t.inside)
// (b) the CX button of a flying line
const B = await walkDialog('S2b-cx', async () => {
  const b = p.locator('#schedBoard [data-lcx="0.0.0.0"]:visible').first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await K.sleep(200)
  await b.click()
})
const closeB = await closeDialog()
const stillB = await p.evaluate(() => [...document.querySelectorAll('.airpop')].filter(e => e.getBoundingClientRect().width > 0).length)
const lineStill = await p.evaluate(() => JSON.stringify(window.DAYS[0].waves ? 'waves' : Object.keys(window.DAYS[0]).slice(0, 5)))
const TB = await tabCheck('S2c-after-cx')
const outB = B.trail.filter(t => !t.inside)
const mission = r => !!r.after && /ms|mission|:0\.0\.0\./.test(r.after.k) && !/\.cs$/.test(r.after.k)
K.note('S-2', 'a', `Scheduler Board Monday: pressed Sort all; 6× Tab, 6× Shift+Tab; closed with its own button (${closeA})`, `${fmt(A)}; presses outside: ${outA.length ? outA.map(t => t.k + '->' + t.txt).join('; ') : 'none (12 of 12 inside)'}; dialogs still open after close: ${stillA}`, A.info && outA.length === 0 && A.s0.d === A.s1.d && stillA === 0 ? 'PASS' : (A.info ? 'FAIL' : 'NOT WALKED (dialog did not open)'), A.pics)
K.note('S-2', 'b', `Scheduler Board Monday: pressed CX of flying line 0.0.0.0; 6× Tab, 6× Shift+Tab; closed with its own button (${closeB})`, `${fmt(B)}; presses outside: ${outB.length ? outB.map(t => t.k + '->' + t.txt).join('; ') : 'none (12 of 12 inside)'}; dialogs still open after close: ${stillB}`, B.info && outB.length === 0 && B.s0.d === B.s1.d && stillB === 0 ? 'PASS' : (B.info ? 'FAIL' : 'NOT WALKED (dialog did not open)'), B.pics)
K.note('S-2', 'c', 'after each dialog closed: clicked into the first flying line\'s Callsign box, pressed Tab once', `after Sort all closed: caret in ${TA.before}, Tab -> ${JSON.stringify(TA.after)}; after CX dialog closed: caret in ${TB.before}, Tab -> ${JSON.stringify(TB.after)}`, mission(TA) && mission(TB) ? 'PASS' : 'FAIL', [TA.pc, TB.pc])
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
