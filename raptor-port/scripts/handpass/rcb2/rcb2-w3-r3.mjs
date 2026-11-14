/* rcb2-w3 R3 v1 — B: the Logic strip's note by what was changed. usage: [PHONE=1] node rcb2-w3-r3.mjs */
process.env.RCB2_DIST = 'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/6e376de7-ce28-4b0e-ad14-7848f71c5f9a/scratchpad/frozen-f01e1e416'
process.env.RCB2_BUNDLE = 'index-DDDelbBP.js'
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 'r3-' + (PHONE ? 'p' : 'd') + (process.env.TAG || '1')
const X = await import('./rcb2-w3-lib.mjs')
const { L, say, sleep, nrm } = X
say('rcb2-w3-r3 v1')
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
const strip = () => page.evaluate(() => {
  const e = document.querySelector('#lgOff'); if (!e) return null
  const r = e.getBoundingClientRect()
  return { shown: r.width > 0 && !e.hidden, text: (e.innerText || '').replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim(), w: Math.round(r.width), h: Math.round(r.height), sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight, vw: innerWidth, right: Math.round(r.right), left: Math.round(r.left) }
})
const whole = s => s && s.sh <= s.ch + 1 && s.sw <= s.cw + 1 && s.right <= s.vw && s.left >= 0
const CRIT = 'The schedule is checked against it now. A published day keeps the settings it was published under, and the OIL they gave it, until it is published again. If a change to Default rally, Debrief after landing or Full day of OIL would change that OIL, the day reads pending.'
const CUT = 'A changed late cut-off moves the LATE marks at once, on published days too.'
async function crop(name) { const l = page.locator('#lgOff').first(); if (await l.isVisible()) { await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); await l.screenshot({ path: `${X.W.SHOTS}/${name}.png` }) } }
async function logic() { await L.go(page, 'logic'); await sleep(500) }
async function edit() { if (!(await page.locator('#lgBody input[data-lgset]:visible').count())) { await X.press(w, '#lgEdit'); await sleep(400) } }
async function setCrew(val) {
  await edit()
  const key = await page.evaluate(() => { for (const i of document.querySelectorAll('#lgBody input[data-lgset]')) { const row = i.closest('.lgset, .lgrow, [data-lgname]') || i.parentElement.parentElement; if (/crew rest/i.test(row.innerText || '')) return i.dataset.lgset } return null })
  say('crew key', key)
  if (!key) return null
  const inp = page.locator(`#lgBody input[data-lgset="${key}"]`).first()
  const before = await inp.inputValue()
  await inp.scrollIntoViewIfNeeded(); await inp.fill(val); await inp.press('Tab'); await sleep(500)
  return { key, before, after: await inp.inputValue() }
}
async function openCutWin() {
  await edit().catch(() => {})
  const d = page.locator('[data-lgopen="inputs"]:visible').first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  if (PHONE) await d.tap(); else await d.click()
  await page.waitForSelector('[data-testid="win-inputsset"]:visible', { timeout: 5000 }); await sleep(500)
}
async function closeCutWin(how = 'x') {
  const open = () => page.locator('[data-testid="win-inputsset"]:visible').count()
  if (!(await open())) return 'not open'
  if (how === 'x') { const x = page.locator('[data-testid="win-inputsset-x"]:visible').first(); if (PHONE) await x.tap(); else await x.click() }
  else if (how === 'esc') await page.keyboard.press('Escape')
  await sleep(500)
  return (await open()) ? 'STILL OPEN' : 'closed'
}
async function setCut(val) {
  await openCutWin()
  const n = page.locator('[data-testid="win-inputsset"] .sset-num, [data-testid="win-inputsset"] input[type=text]').first()
  const before = await n.inputValue()
  await X.pic(w, `r3-cutwin-${val}-${P}`)
  await n.fill(String(val)); await n.press("Enter"); await sleep(700)
  const after = await page.evaluate(() => (document.querySelector("[data-lgopen=inputs]") || {}).ariaLabel || "")
  const how = await closeCutWin('x')
  return { before, after, closed: how }
}
const rowFor = (tag, did, exp, s, ok, extra = '') => X.row('R3 ' + tag, size, did, exp, JSON.stringify(s ? { shown: s.shown, text: s.text, w: s.w, h: s.h, scroll: s.sw + 'x' + s.sh, client: s.cw + 'x' + s.ch, right: s.right, vw: s.vw } : null) + extra, ok ? 'PASS' : 'FAIL', `r3-${tag}-${P}.png`)

await logic()
let s = await strip()
X.row('R3 0 standard', size, 'Logic page at standard settings', 'strip hidden', JSON.stringify(s), s && !s.shown ? 'PASS' : 'FAIL', '')
// case 1: Crew rest only
const c1 = await setCrew('13h'); say('setCrew', JSON.stringify(c1))
s = await strip(); say('S1', JSON.stringify(s)); await X.pic(w, `r3-1-crew-${P}`); await crop(`r3-1b-crew-strip-${P}`)
const exp1 = '1 setting changed from the squadron standard. ' + CRIT
rowFor('1-crew', 'Crew rest 12h -> 13h; strip read', exp1 + ' (and not the late cut-off sentence)', s, s && s.shown && s.text === exp1 && !s.text.includes(CUT))
rowFor('1b-crew-whole', 'strip measured: nothing cut', 'no overflow, inside the screen', s, whole(s))
// reset
await X.press(w, '#lgReset'); await sleep(500)
s = await strip(); await X.pic(w, `r3-2-reset-${P}`)
X.row('R3 2 reset', size, 'Reset to standard', 'strip hidden', JSON.stringify(s), s && !s.shown ? 'PASS' : 'FAIL', `r3-2-reset-${P}.png`)
// case 2: late cut-off only
await X.press(w, '#lgDone').catch(() => {}); await sleep(300)
const c2 = await setCut(10); say('setCut', JSON.stringify(c2))
await sleep(400)
s = await strip(); say('S2', JSON.stringify(s)); await X.pic(w, `r3-3-cutonly-${P}`); await crop(`r3-3b-cutonly-strip-${P}`)
rowFor('3-cutonly', 'late cut-off only (Inputs days before 14 -> 10); strip read ' + JSON.stringify(c2), 'strip shown; has the late cut-off sentence; does NOT say "keeps the settings"', s, s && s.shown && s.text.includes(CUT) && !/keeps the settings/.test(s.text))
rowFor('3b-cutonly-whole', 'strip measured', 'nothing cut', s, whole(s))
// case 3: both
const c3 = await setCrew('13h'); say('setCrew both', JSON.stringify(c3))
s = await strip(); say('S3', JSON.stringify(s)); await X.pic(w, `r3-4-both-${P}`); await crop(`r3-4b-both-strip-${P}`)
rowFor('4-both', 'late cut-off and crew rest both changed', 'both sentences: "keeps the settings…" and the late cut-off sentence', s, s && s.shown && /keeps the settings/.test(s.text) && s.text.includes(CUT))
rowFor('4b-both-whole', 'strip measured', 'nothing cut', s, whole(s))
// Ranger
await X.press(w, '#lgDone').catch(() => {})
const W1 = await (await import('./rcb2-w3-lib.mjs')).L
async function relogin(who) {
  const lo = page.locator('#logout:visible').first()
  if (await lo.count()) await lo.click()
  else {
    const menu = page.locator('.hamb:visible, #hamb:visible, button[aria-label*="menu" i]:visible').first()
    if (await menu.count()) { if (PHONE) await menu.tap(); else await menu.click(); await sleep(400) }
    const lo2 = page.getByRole('button', { name: /Log ?out/i }).first(); if (PHONE) await lo2.tap(); else await lo2.click()
  }
  await sleep(700); await L.login(page, who)
}
await relogin('us'); await logic()
s = await strip(); say('S5 Ranger', JSON.stringify(s)); await X.pic(w, `r3-5-ranger-${P}`); await crop(`r3-5b-ranger-strip-${P}`)
const edits = await page.evaluate(() => [...document.querySelectorAll('#lgEdit,#lgDone,#lgReset, #lgBody input[data-lgset]')].filter(e => e.getBoundingClientRect().width > 0).length)
rowFor('5-ranger', 'as Ranger (crew rest + late cut-off still changed); edit controls visible: ' + edits, 'both sentences, then "Only an admin can change them." at the end; no edit controls', s, s && s.shown && s.text.includes(CUT) && /keeps the settings/.test(s.text) && /Only an admin can change them\.$/.test(s.text) && edits === 0)
rowFor('5b-ranger-whole', 'strip measured as Ranger', 'nothing cut', s, whole(s))
await relogin('a'); await logic()
// shown / hidden / shown again, with the page measured each time
await X.press(w, '#lgReset'); await sleep(500)
s = await strip(); const pg0 = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: innerWidth }))
await X.pic(w, `r3-6-reset-again-${P}`)
X.row('R3 6 reset again', size, 'Reset to standard (both set back)', 'strip hidden; page not wider than the screen', JSON.stringify({ s, pg0 }), s && !s.shown && pg0.sw <= pg0.vw ? 'PASS' : 'FAIL', `r3-6-reset-again-${P}.png`)
await setCrew('13h'); s = await strip(); const pg1 = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: innerWidth }))
await X.pic(w, `r3-7-shown-again-${P}`)
X.row('R3 7 shown again', size, 'a setting changed again', 'strip shown again, whole, page not wider', JSON.stringify({ shown: s && s.shown, text: s && s.text.slice(0, 50), pg1 }), s && s.shown && whole(s) && pg1.sw <= pg1.vw ? 'PASS' : 'FAIL', `r3-7-shown-again-${P}.png`)
// the cut-off window's other closing ways
await openCutWin(); await X.pic(w, `r3-8-cutwin-open-${P}`)
const esc = await closeCutWin('esc')
X.row('R3 window ways', size, 'Inputs calendar settings window: x (earlier) and Escape', 'RECORD', 'x: ' + (c2 && c2.closed) + '; Escape: ' + esc, 'RECORDED', `r3-8-cutwin-open-${P}.png`)
if (esc === 'STILL OPEN') await closeCutWin('x')
await X.press(w, '#lgReset').catch(() => {})
await X.fin(w)
