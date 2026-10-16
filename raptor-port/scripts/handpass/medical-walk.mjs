// THE WALK OF THE MEDICAL TAB'S CARDS AND "+ MEDICAL" (owner D961, D963, D964, D965 — 17 Oct 26), on the built app.
// One scripted pass (D17), the host's own (the sizing lines: docs/handpass/2026-10-17-medical-cards.md). Every record
// it makes is made through the app's own controls — "+ Medical", the input's window, its calendar, its document box,
// Save, Cancel, the top bar's Undo and Redo (the order's §7.7). Each step prints what it read; PASS means the right
// behaviour, so re-running this on a fixed build IS the re-walk (send it to its own folder: HP_SHOTS=<dir>).
//
//   node scripts/handpass/medical-walk.mjs                (LOOK_URL=http://localhost:4173/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.env.HP_SHOTS || join(HERE, '../../docs/img/handpass/2026-10-17-medical-walk')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
console.log('medical-walk v1 —', new Date().toISOString(), '→', OUT)
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const results = [], errs = []
let shotN = 0
const ok = (id, pass, note) => { results.push({ id, res: pass ? 'PASS' : 'FAIL', note }); console.log(`${pass ? 'PASS' : 'FAIL'} ${id} — ${note}`) }
const notWalked = (id, why) => { results.push({ id, res: 'NOT WALKED', note: why }); console.log(`NOT WALKED ${id} — ${why}`) }
const sleep = ms => new Promise(r => setTimeout(r, ms))

const shot = async (page, name, sels) => {
  const clip = sels ? await page.evaluate(sels => {
    let L = 1e9, T = 1e9, R = -1e9, B = -1e9
    for (const s of sels) for (const e of document.querySelectorAll(s)) {
      const r = e.getBoundingClientRect(); if (r.width <= 1 || r.height <= 1) continue
      L = Math.min(L, r.left + scrollX); T = Math.min(T, r.top + scrollY); R = Math.max(R, r.right + scrollX); B = Math.max(B, r.bottom + scrollY)
    }
    if (L > R) return null
    const x = Math.max(0, L - 10), y = Math.max(0, T - 10)
    return { x, y, width: Math.min(document.documentElement.scrollWidth, R + 10) - x, height: B + 10 - y }
  }, sels) : null
  const file = `${String(++shotN).padStart(2, '0')}-${name}.png`
  await page.screenshot({ path: join(OUT, file), ...(clip ? { clip, fullPage: true } : {}) })
  return file
}
const ids = page => page.evaluate(() => (window).INPUTS.map(r => String(r.iid)))
const card = (page, iid) => page.evaluate(iid => {
  const c = document.querySelector(`.medcard[data-medcard="${iid}"]`)
  if (!c) return null
  const r = c.getBoundingClientRect(), sec = c.closest('.medsec').className.replace('medsec ', '')
  const row2 = c.querySelector('.medcard-row2')
  /* the words a person sees: the parts with a width (walk-scripts.md §4) */
  const seen = row2 ? [...row2.children].filter(e => e.getBoundingClientRect().width > 1).map(e => e.tagName === 'svg' ? '[doc]' : e.textContent) : []
  const rm = c.querySelector('.medcard-r')
  return { sec, w: Math.round(r.width), h: Math.round(r.height), row2: seen, remark: rm ? rm.textContent : null, remarkW: rm ? Math.round(rm.getBoundingClientRect().width) : 0, title: c.title }
}, iid)
const rowsOf = (page, sec) => page.evaluate(sec => {
  const cs = [...document.querySelectorAll(`.medsec.${sec} .medcard`)]
  const tops = cs.map(c => Math.round(c.getBoundingClientRect().top))
  return { n: cs.length, perRow: [...new Set(tops)].map(t => tops.filter(x => x === t).length), widths: cs.map(c => Math.round(c.getBoundingClientRect().width)), words: cs.map(c => [...c.querySelectorAll('.medcard-row2 > *')].map(e => e.tagName === 'svg' ? '[doc]' : e.textContent).join(' ')) }
}, sec)
const headGeo = page => page.evaluate(() => {
  const head = document.querySelector('#medView .ic-head'), hr = head.getBoundingClientRect(), pad = parseFloat(getComputedStyle(head).paddingRight)
  const g = id => { const e = document.getElementById(id); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height), mid: Math.round(r.top + r.height / 2), oneLine: r.height < 40 } }
  return { cal: g('medCalBtn'), today: g('medToday'), btn: g('medNew'), rightGap: Math.round(hr.right - pad - document.getElementById('medNew').getBoundingClientRect().right), overflow: head.scrollWidth - head.clientWidth, docOverflow: document.documentElement.scrollWidth - innerWidth }
})
/* the window's calendar, turned by reading its own title until it says the wanted month (walk-scripts.md §4) */
const toMonth = async (page, want) => {
  for (let i = 0; i < 24; i++) {
    const t = (await page.locator('#inpEdCal .dcal-title').first().textContent() || '').trim()
    if (t.includes(want)) { console.log('  calendar on:', t); return true }
    const [mon, yr] = t.split(/\s+/), order = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const at = +yr * 12 + order.findIndex(m => mon && m.startsWith(mon.slice(0, 3))), goal = 2026 * 12 + 6
    await page.locator(`#inpEdCal button[aria-label="${at > goal ? 'Previous' : 'Next'} month"]`).click(); await sleep(150)
  }
  return false
}
const pdf = name => Buffer.from(`%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF ${name}`)

/* FILE a medical input through "+ Medical": the window opens on screen, its kind is a medical one, dates picked on its
   calendar, a document attached through its own box, an optional remark, an optional person; Save */
async function fileThroughButton(page, tag, { person, remark, from = '2026-07-12', to = '2026-07-15', press = 'tap' }) {
  const before = new Set(await ids(page))
  if (press === 'tap') await page.locator('#medNew').tap(); else await page.locator('#medNew').click()
  const win = page.locator('[data-testid="win-inputedit"]')
  await win.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {})
  /* on a phone, what a press opens is proved ON SCREEN before anything in it is pressed (the order's §7.2) */
  const onScreen = await page.evaluate(() => {
    const w = document.querySelector('[data-testid="win-inputedit"]'); if (!w) return null
    const r = w.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + Math.min(40, r.height / 2), hit = document.elementFromPoint(x, y)
    return { inside: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.top < innerHeight, hit: !!hit && w.contains(hit), scrolled: scrollY }
  })
  ok(`${tag}.open`, !!onScreen && onScreen.inside && onScreen.hit, `the window opened on screen: ${JSON.stringify(onScreen)}`)
  if (!onScreen) return null
  const kind = await page.locator('#inpEditType').inputValue().catch(() => '(no kind box)')
  const who = await page.evaluate(() => { const s = document.getElementById('inpEditPerson'); const f = document.getElementById('inpEditPersonFixed'); return s ? 'select:' + s.selectedOptions[0].textContent : f ? 'fixed:' + f.textContent : '(none)' })
  ok(`${tag}.kind`, kind === 'HL', `the kind box reads "${kind}" (the first medical kind of the list); the person: ${who}`)
  await shot(page, `${tag}-window-opened`, ['[data-testid="win-inputedit"]'])
  if (person) {
    const opt = await page.evaluate(cs => { const s = document.getElementById('inpEditPerson'); const o = s && [...s.options].find(o => o.textContent.trim() === cs); return o ? o.value : null }, person)
    if (!opt) { notWalked(`${tag}.person`, `no "${person}" in the person box`); return null }
    await page.locator('#inpEditPerson').selectOption(opt)
  }
  if (!(await toMonth(page, 'Jul'))) { notWalked(`${tag}.dates`, 'the window calendar never reached July 2026'); return null }
  await page.locator(`#inpEdCal [data-iso="${from}"]`).click(); await sleep(120)
  await page.locator(`#inpEdCal [data-iso="${to}"]`).click(); await sleep(120)
  if (remark) await page.locator('#inpEditRmk').fill(remark)
  await win.locator('.docfield input[type=file]').first().setInputFiles([{ name: `${tag}-cert.pdf`, mimeType: 'application/pdf', buffer: pdf(tag) }])
  await sleep(200)
  await page.locator('#inpEditSave').click()
  await win.waitFor({ state: 'detached', timeout: 4000 }).catch(() => {})
  const left = await win.count()
  const made = (await ids(page)).filter(i => !before.has(i))
  ok(`${tag}.saved`, left === 0 && made.length === 1, `the window ${left ? 'is still up' : 'closed'}; new inputs: ${made.length}`)
  ok(`${tag}.tab`, await page.locator('#medView').isVisible(), `after the save the Medical tab is ${await page.locator('#medView').isVisible() ? 'still in front' : 'GONE'}`)
  return made[0] || null
}

async function signIn(page, who) {
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', who === 'admin' ? 'ad' : 'us'); await page.fill('#lpass', who === 'admin' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => (window).go('inputs')); await page.waitForFunction(() => (window).CURPAGE === 'inputs'); await sleep(400)
}
const openTab = async (page, how) => {
  if (how === 'tap') await page.locator('#inMedBtn').tap(); else await page.locator('#inMedBtn').click()
  await page.waitForSelector('#medView .medsec'); await sleep(300)
  await page.evaluate(() => scrollTo(0, 0))
}
const ctxFor = (w, h, touch, dsf) => browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
const watch = (page, tag) => {
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} ${r.status()} ${r.url()}`) })
}

/* ---- A. HIS IPHONE'S WIDTH (390), A MEMBER (Ranger): the tab, "+ Medical", his own HL filed, three a row, Undo, Redo, Cancel */
{
  const ctx = await ctxFor(390, 844, true, 3), page = await ctx.newPage(); watch(page, 'A')
  await signIn(page, 'member'); await openTab(page, 'tap')
  await shot(page, 'A-phone390-member-tab-before', ['#inMedBtn', '#medView .ic-head', '.medsec'])
  const g = await headGeo(page)
  ok('A.row', g.btn && g.btn.h === 36 && Math.abs(g.btn.mid - g.cal.mid) <= 1 && g.rightGap <= 1 && g.overflow <= 0 && g.docOverflow <= 0,
    `"+ Medical" ${g.btn && g.btn.h} tall, mid ${g.btn && g.btn.mid} beside "as of" ${g.cal.mid}, ${g.rightGap}px from the row's right end, row overflow ${g.overflow}, page overflow ${g.docOverflow}`)
  const r0 = await rowsOf(page, 'med-down')
  console.log('  Medically Down before:', JSON.stringify(r0))
  /* Cancel files nothing */
  const n0 = (await ids(page)).length
  await page.locator('#medNew').tap(); await page.locator('[data-testid="win-inputedit"]').waitFor({ state: 'visible' })
  await page.locator('#inpEditCancel').tap(); await page.locator('[data-testid="win-inputedit"]').waitFor({ state: 'detached' }).catch(() => {})
  ok('A.cancel', (await ids(page)).length === n0 && await page.locator('[data-testid="win-inputedit"]').count() === 0, `Cancel: the window closed; inputs ${n0} → ${(await ids(page)).length}`)
  const iid = await fileThroughButton(page, 'A', { remark: 'knee injury, physio twice a week until the review board' })
  if (iid) {
    const c = await card(page, iid)
    ok('A.card', !!c && c.sec === 'med-down' && c.row2.join(' ') === 'HL 12–15 Jul', `his card: ${JSON.stringify(c)}`)
    ok('A.remark', !!c && c.remark && c.w <= 104 && c.remarkW <= c.w, `the typed remark shows (${c && c.remark}) and wraps inside the card: card ${c && c.w} wide, remark ${c && c.remarkW}`)
    const r1 = await rowsOf(page, 'med-down')
    ok('A.three', r1.n === 3 && r1.perRow.length === 1, `Medically Down: ${r1.n} cards, per row ${JSON.stringify(r1.perRow)}, widths ${JSON.stringify(r1.widths)}, words ${JSON.stringify(r1.words)}`)
    await page.evaluate(() => scrollTo(0, 0))
    await shot(page, 'A-phone390-member-filed-three-a-row', ['#medView .ic-head', '.medsec'])
    /* Undo takes it back; Redo returns it — the top bar's own buttons */
    await page.locator('#undoBtn').tap(); await sleep(400)
    const afterUndo = await card(page, iid), inUndo = (await ids(page)).includes(iid)
    ok('A.undo', !afterUndo && !inUndo, `after Undo the card is ${afterUndo ? 'STILL there' : 'gone'} and the input ${inUndo ? 'STILL stored' : 'gone'}`)
    await shot(page, 'A-phone390-after-undo', ['#medView .ic-head', '.medsec.med-down'])
    await page.locator('#redoBtn').tap(); await sleep(400)
    const afterRedo = await card(page, iid)
    ok('A.redo', !!afterRedo && afterRedo.row2.join(' ') === 'HL 12–15 Jul', `after Redo: ${JSON.stringify(afterRedo)}`)
  }
  /* Pending Upchit and Upchit Complete, as drawn: "OML 6–9 Jul", and "20 Jun" with one page per document */
  const pend = await rowsOf(page, 'med-pend'), done = await rowsOf(page, 'med-done')
  ok('A.pending', pend.words.some(w => /^[A-Z][A-Z ]* \d+–\d+ [A-Z][a-z]{2}$/.test(w)) && !(await page.locator('.medsec.med-pend').textContent()).includes('was down'), `Pending Upchit reads ${JSON.stringify(pend.words)}`)
  ok('A.done', done.words.some(w => /\[doc\] \[doc\]$/.test(w)) && !/upchitted/.test(await page.locator('.medsec.med-done').textContent()), `Upchit Complete reads ${JSON.stringify(done.words)}`)
  await page.locator('.medsec.med-pend').scrollIntoViewIfNeeded()
  await shot(page, 'A-phone390-pending-and-complete', ['.medsec.med-pend', '.medsec.med-done'])
  /* the upchit card still opens its documents, paging both */
  await page.locator('.medsec.med-done .medcard').first().tap()
  await page.locator('#docViewPop:not([hidden])').waitFor({ timeout: 3000 }).catch(() => {})
  const count = await page.locator('#docViewPop .docview-count').textContent().catch(() => null)
  ok('A.viewer', !!count && /of 2/.test(count), `the upchit card opened the viewer: "${count}"`)
  await shot(page, 'A-phone390-upchit-viewer', ['#docViewPop .docviewbox'])
  await page.locator('#docViewDone').tap().catch(() => {})
  await ctx.close()
}

/* ---- B. A NARROWER PHONE (375), AN ADMIN: Today, "as of" and "+ Medical" on one row; a man filed by the admin; three a row */
{
  const ctx = await ctxFor(375, 812, true, 3), page = await ctx.newPage(); watch(page, 'B')
  await signIn(page, 'admin'); await openTab(page, 'tap')
  await page.locator('#medCalBtn').tap(); await page.locator('[data-medday="2026-07-03"]').tap(); await sleep(300)
  const g = await headGeo(page)
  ok('B.row-with-today', g.today && g.btn && [g.today.mid, g.btn.mid].every(m => Math.abs(m - g.cal.mid) <= 1) && g.btn.h === 36 && g.today.h === 36 && g.overflow <= 0 && g.docOverflow <= 0 && g.today.r <= g.btn.l,
    `as of ${JSON.stringify(g.cal)}, Today ${JSON.stringify(g.today)}, + Medical ${JSON.stringify(g.btn)}; row overflow ${g.overflow}, page ${g.docOverflow}`)
  await shot(page, 'B-phone375-admin-row-with-today', ['#inMedBtn', '#medView .ic-head'])
  await page.locator('#medToday').tap(); await sleep(300)
  const free = await page.evaluate(() => {
    const w = window, taken = new Set(w.INPUTS.filter(r => /^(ATT [BC]|OML|HL|Upchit)$/i.test(String(r.type))).flatMap(r => [String(r.person), ...(r.people || []).map(String)]))
    const k = Object.keys(w.PEOPLE).find(k => w.PEOPLE[k].cs && !taken.has(k) && !w.PEOPLE[k].archived && !w.PEOPLE[k].special && k !== w.ME)
    return k ? w.PEOPLE[k].cs : null
  })
  if (!free) notWalked('B.file', 'no man free of medical inputs to file for')
  else {
    const iid = await fileThroughButton(page, 'B', { person: free })
    if (iid) {
      const c = await card(page, iid)
      ok('B.card', !!c && c.sec === 'med-down' && c.row2.join(' ') === 'HL 12–15 Jul', `${free}'s card: ${JSON.stringify(c)}`)
      const r = await rowsOf(page, 'med-down')
      ok('B.three', r.n === 3 && r.perRow.length === 1, `Medically Down at 375: ${r.n} cards, per row ${JSON.stringify(r.perRow)}, widths ${JSON.stringify(r.widths)}`)
      await page.evaluate(() => scrollTo(0, 0))
      await shot(page, 'B-phone375-admin-filed-three-a-row', ['#medView .ic-head', '.medsec'])
    }
  }
  await ctx.close()
}

/* ---- C. A DESKTOP AT HIS PC'S 125%, AN ADMIN: the row, the cards, the keyboard's way (Tab, Enter, Escape, back on the button) */
{
  const ctx = await ctxFor(1440, 900, false, 1.25), page = await ctx.newPage(); watch(page, 'C')
  await signIn(page, 'admin'); await openTab(page, 'click')
  const g = await headGeo(page)
  ok('C.row', g.btn.h === 36 && Math.abs(g.btn.mid - g.cal.mid) <= 1 && g.rightGap <= 1, `"+ Medical" ${g.btn.h} tall at the row's right end (gap ${g.rightGap}), mid ${g.btn.mid} vs "as of" ${g.cal.mid}`)
  await shot(page, 'C-desk-admin-tab', ['#inMedBtn', '#medView .ic-head', '.medsec'])
  await page.locator('#medCalBtn').focus(); await page.keyboard.press('Tab')
  const on = await page.evaluate(() => document.activeElement && document.activeElement.id)
  const ring = await page.evaluate(() => { const b = document.getElementById('medNew'), s = getComputedStyle(b); return { outline: s.outlineStyle + ' ' + s.outlineWidth, shadow: s.boxShadow !== 'none' } })
  ok('C.tab', on === 'medNew' && (ring.outline !== 'none 0px' || ring.shadow), `Tab from "as of" lands on: ${on}; its ring: ${JSON.stringify(ring)}`)
  await shot(page, 'C-desk-keyboard-on-button', ['#medView .ic-head'])
  await page.keyboard.press('Enter')
  await page.locator('[data-testid="win-inputedit"]').waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
  const kind = await page.locator('#inpEditType').inputValue().catch(() => null)
  ok('C.enter', kind === 'HL', `Enter opened the window, its kind "${kind}"`)
  await shot(page, 'C-desk-window-by-keyboard')
  await page.keyboard.press('Escape'); await sleep(300)
  const back = await page.evaluate(() => document.activeElement && document.activeElement.id)
  ok('C.escape', await page.locator('[data-testid="win-inputedit"]').count() === 0 && back === 'medNew', `Escape closed the window (${await page.locator('[data-testid="win-inputedit"]').count() ? 'NOT' : 'yes'}); the keyboard is back on: ${back}`)
  const iid = await fileThroughButton(page, 'C', { press: 'click', from: '2026-07-13', to: '2026-07-13' })
  if (iid) {
    const c = await card(page, iid)
    ok('C.card', !!c && c.row2.join(' ') === 'HL 13 Jul', `a one-day card: ${JSON.stringify(c)}`)
    await page.evaluate(() => scrollTo(0, 0))
    await shot(page, 'C-desk-admin-filed', ['#medView .ic-head', '.medsec'])
  }
  await ctx.close()
}

/* ---- D. A DESKTOP, A MEMBER: the button is his too, the window his own (the person fixed) */
{
  const ctx = await ctxFor(1440, 900, false, 1), page = await ctx.newPage(); watch(page, 'D')
  await signIn(page, 'member'); await openTab(page, 'click')
  await page.locator('#medNew').click(); await page.locator('[data-testid="win-inputedit"]').waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
  const kind = await page.locator('#inpEditType').inputValue().catch(() => null)
  const fixed = await page.locator('#inpEditPersonFixed').textContent().catch(() => null)
  ok('D.member', kind === 'HL' && fixed === 'Ranger', `a member's window: kind "${kind}", person fixed "${fixed}"`)
  await shot(page, 'D-desk-member-window')
  await ctx.close()
}

writeFileSync(join(OUT, 'results.json'), JSON.stringify({ results, errors: errs }, null, 1))
const tally = results.reduce((t, r) => (t[r.res] = (t[r.res] || 0) + 1, t), {})
console.log('\nresults:', JSON.stringify(tally), '· pictures:', shotN, '· errors:', errs.length); for (const e of errs) console.log('  ' + e)
await browser.close()
