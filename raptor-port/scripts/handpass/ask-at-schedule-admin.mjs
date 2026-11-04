// [ASK-AT-THE-CONTROL] (D1626) — the schedule's, Quals' and Admin's questions (roll-call #22–#40), each drawn as it is
// TODAY and as a CARD hanging from the control pressed, at a desktop's and his iPhone's size, on the frozen build.
//   WALK_DIR=<frozen dist> ISR_OUT=docs/img/handpass/2026-11-04-ask-at-the-control/schedule-admin LOOK_URL=http://localhost:4397/
//   node scripts/handpass/ask-at-schedule-admin.mjs [desktop|phone] [nn,nn…]
// Staging goes through the app's own controls, except two writes the earlier amendment walks also made through the page's
// own bridge: a man put on Saturday's duty desk (setSlotVal) so the day has something to publish and earn OIL, and a
// second man put there after publishing so the day has an edit waiting. The control under each question is always
// PRESSED for real. A "press again" arm is drawn card-first (the card hangs from the unpressed button), then pressed for
// today's armed look.
import * as L from './isr-A-lib.mjs'
import { CARD_CSS, hangInPage, rehomeInPage } from './ask-at-lib.mjs'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const { tid, press } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const OUT = L.OUT
const RAW = process.env.AQ_RAW || join(OUT, '..', 'raw-tmp')
mkdirSync(OUT, { recursive: true }); mkdirSync(RAW, { recursive: true })
const SIZES = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']
const ONLY = process.argv[3] ? process.argv[3].split(',') : null
const want = n => !ONLY || ONLY.includes(String(n))
const MAN = join(OUT, '..', 'manifest.json')
const manifest = existsSync(MAN) ? JSON.parse(readFileSync(MAN, 'utf8')) : []
const entry = (n, base) => { let e = manifest.find(x => x.n === n); if (!e) { e = { n, area: 'schedule-admin', pics: { today: {}, card: {} }, measures: {}, newWords: [], notes: [] }; manifest.push(e) } Object.assign(e, base); return e }
const saveMan = () => { for (const e of manifest) e.notes = [...new Set(e.notes)]; manifest.sort((a, b) => a.n - b.n); writeFileSync(MAN, JSON.stringify(manifest, null, 1)) }

/* ---- pictures ------------------------------------------------------------------------------------------------- */
/* the union box of the first VISIBLE element of each selector, in CSS pixels */
const boxOf = (page, sels) => page.evaluate(sels => {
  let l = 1e9, t = 1e9, r = -1e9, b = -1e9, any = false
  for (const s of sels) {
    const e = [...document.querySelectorAll(s)].find(x => { const q = x.getBoundingClientRect(); return q.width > 0 && q.height > 0 && getComputedStyle(x).visibility !== 'hidden' })
    if (!e) continue
    const q = e.getBoundingClientRect(); any = true
    l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom)
  }
  return any ? { l, t, r, b } : null
}, sels)
const pending = {}   // n -> { today: rawfile, card: rawfile, boxes: [] } (desktop: cropped to one shared clip at the end)
async function shoot(page, size, n, kind, sels) {
  const nn = String(n).padStart(2, '0')
  if (size === 'phone') { if (kind === 'card') await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.setProperty('visibility', 'hidden', 'important') }); await page.screenshot({ path: join(OUT, `${nn}-phone-${kind}.png`) }); return `A/${nn}-phone-${kind}.png` }
  const raw = join(RAW, `${nn}-${kind}.png`)
  if (kind === 'card') await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.setProperty('visibility', 'hidden', 'important') })
  await page.screenshot({ path: raw })
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.removeProperty('visibility') })
  const bx = await boxOf(page, sels)
  const p = pending[n] = pending[n] || { boxes: [] }
  p[kind] = raw; if (bx) p.boxes.push(bx)
  return `A/${nn}-desktop-${kind}.png`
}
/* crop each desktop pair to ONE clip: the union of what both pictures are about, padded 40px, inside the screen */
async function cropAll() {
  const W = 1440, H = 900, PAD = 40
  const ctx = await L.browser.newContext({ viewport: { width: 400, height: 300 }, deviceScaleFactor: 2 })
  const pg = await ctx.newPage()
  for (const [n, p] of Object.entries(pending)) {
    if (!p.boxes.length) continue
    const l = Math.max(0, Math.floor(Math.min(...p.boxes.map(b => b.l)) - PAD)), t = Math.max(0, Math.floor(Math.min(...p.boxes.map(b => b.t)) - PAD))
    const r = Math.min(W, Math.ceil(Math.max(...p.boxes.map(b => b.r)) + PAD)), b = Math.min(H, Math.ceil(Math.max(...p.boxes.map(b => b.b)) + PAD))
    await pg.setViewportSize({ width: r - l, height: b - t })
    for (const kind of ['today', 'card']) {
      if (!p[kind]) continue
      /* a page opened from a file may show a picture file; a blank page may not (it came out white) */
      const html = join(RAW, `crop-${n}-${kind}.html`)
      writeFileSync(html, `<body style="margin:0;overflow:hidden"><img src="${pathToFileURL(p[kind]).href}" style="position:absolute;left:${-l}px;top:${-t}px;width:${W}px"></body>`)
      await pg.goto(pathToFileURL(html).href)
      await pg.waitForFunction(() => document.images[0] && document.images[0].complete && document.images[0].naturalWidth > 0)
      await pg.screenshot({ path: join(OUT, `${String(n).padStart(2, '0')}-desktop-${kind}.png`) })
    }
  }
  await ctx.close()
}

/* ---- page helpers ----------------------------------------------------------------------------------------------- */
const ring = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (e) e.classList.add('aq-ring'); return !!e }, sel)
const unring = page => page.evaluate(() => document.querySelectorAll('.aq-ring').forEach(e => e.classList.remove('aq-ring')))
const dropCards = page => page.evaluate(() => document.querySelectorAll('.aq-card:not(.aq-frame)').forEach(e => e.remove()))
const settle = async (page, tap) => { await page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement.blur()); await page.mouse.move(tap ? 1 : 2, tap ? 873 : 2); await sleep(200) }   // on a phone too: the last tap's spot keeps its hover (a card's button lit as if pressed)
const centre = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }); return !!e }, sel)
const txt = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null }, sel)
const lastNote = async page => { const n = await L.notes(page); return n[n.length - 1] || '' }
/* a value set through the box's own input event — never typed: an emulated phone zooms to a focused box */
const setVal = (page, sel, v) => page.evaluate(([sel, v]) => { const e = document.querySelector(sel); const proto = e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }, [sel, v])
async function hang(page, ctl, spec) { await page.addStyleTag({ content: CARD_CSS }).catch(() => {}); const m = await page.evaluate(hangInPage, [ctl, spec]); await sleep(150); return m }
const keepIn = (page, within) => page.evaluate(within => {
  const card = document.querySelector('.aq-card:not(.aq-frame)'), ctl = document.querySelector('.aq-ring'); if (!card || !ctl) return null
  const box = ctl.closest(within); if (!box) return null
  const b = box.getBoundingClientRect(), c = card.getBoundingClientRect(), r = ctl.getBoundingClientRect()
  let d = 0; if (c.right > b.right - 4) d = (b.right - 4) - c.right; if (c.left + d < b.left + 4) d = (b.left + 4) - c.left
  card.style.left = (parseFloat(card.style.left) + d) + 'px'
  card.style.setProperty('--aq-px', Math.max(14, Math.min(c.width - 14, r.left + r.width / 2 - (c.left + d))) + 'px')
  return d
}, within)
/* a sheet moved whole keeps its own inside: the kit's card padding and gap doubled its frame and its overflow cut the pointer */
const FRAME_FIX = '.aq-card.aq-frame{padding:0 !important;gap:0 !important;display:block !important}.aq-card.aq-frame:not([style*="max-height"]){overflow:visible !important}'
async function rehome(page, ctl, box, back, w) { await page.addStyleTag({ content: FRAME_FIX }); const m = await page.evaluate(rehomeInPage, [ctl, box, back, w]); await sleep(150); return m }
async function open(size) { const s = await L.session(size, 'ad'); await s.page.addStyleTag({ content: CARD_CSS }); return s }
async function step(n, fn) { if (!want(n)) return; try { await fn() } catch (e) { const m = String(e && e.message || e).split('\n')[0].slice(0, 300); console.log(`ERROR #${n}: ${m}`); entry(n, {}).notes.push('ERROR ' + m) } }

/* Saturday (day 5) published at its Original with Outlaw on the duty desk — Outlaw's OIL is already below zero
   (the Leave War's DECAL starts at −4.5), so withdrawing the day's credit lowers him and Unpublish asks first */
const SAT = 5
async function publishSat(page) {
  await L.go(page, 'editsched')
  await page.evaluate(() => { window.setSlotVal('d:5.0.0', 'casper'); window.afterSchedMutate() }); await sleep(500)
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`#eWeek select[data-sign="${role}"][data-signday="${SAT}"]`).first()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[0]); await sleep(200)
  }
  const pb = page.locator(`#eWeek [data-beak="${SAT}"]`).first()
  await pb.evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() }); await sleep(800)
}
async function boardOn(page, di) {
  await L.go(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await page.waitForSelector('#schedBoard'); await sleep(600)
}

for (const size of SIZES) {
  /* ===== #24 Unpublish ===== */
  await step(24, async () => {
    const { page, tap } = await open(size)
    await publishSat(page)
    const U = `#eWeek .day[data-day="${SAT}"] [data-unpub="${SAT}"]`
    await centre(page, U); await settle(page, tap)
    const label0 = await txt(page, U)
    const say = `Some of Saturday’s OIL credits are already spent on the Leave War. Unpublishing withdraws them until you republish.`
    const m = await hang(page, U, { q: { text: say }, btns: [{ t: 'Withdraw', cls: 'abtn danger' }, { t: 'Keep', cls: 'abtn primary' }] })
    const card = await shoot(page, size, 24, 'card', [U, '.aq-card', `#eWeek .day[data-day="${SAT}"] .day-head`])
    await dropCards(page); await unring(page)
    await press(page, tap, U); await sleep(200)
    const armed = await txt(page, U), note = await lastNote(page)
    await ring(page, U); await settle(page, tap)
    const today = await shoot(page, size, 24, 'today', [U, '#toastEl', `#eWeek .day[data-day="${SAT}"] .day-head`])
    const e = entry(24, { screen: 'Edit Schedule — a published day\'s head', control: `"${label0}" in the day head`, question: note, answers: [armed + ' (the same button, pressed again)'], today: `the button changes to "${armed}" in place; a passing note at the foot of the screen says why: "${note}"`, proposal: 'card' })
    e.pics.today[size] = today; e.pics.card[size] = card; e.measures[size] = m
    e.newWords = ['Withdraw (the armed button\'s verb, as an answer)', 'Keep']
    await page.context().close()
  })

  /* ===== #22 Load onto working copy (the week) and #23 (the Scheduler Board) ===== */
  for (const LN of [22, 23]) await step(LN, async () => {
    const { page, tap } = await open(size)
    await publishSat(page)
    await page.evaluate(() => { window.setSlotVal('d:5.0.0', 'bane'); window.afterSchedMutate() }); await sleep(500)
    const day = `#eWeek .day[data-day="${SAT}"]`
    const look = async root => {
      const mb = page.locator(`${root} [data-planmenu="${SAT}"]`).first()
      await mb.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
      await (tap ? mb.tap() : mb.click()); await sleep(500)
      const it = page.locator('.wavemenu .wm[data-planpv]:visible').filter({ hasText: /Original/ }).first()
      await (tap ? it.tap() : it.click()); await sleep(700)
    }
    for (const [n, root] of [[22, day], [23, '#schedBoard']]) {
      if (n !== LN) continue
      if (n === 23) { await boardOn(page, SAT); if (!(await page.locator(`#schedBoard [data-restore="${SAT}"]`).count())) await look('#schedBoard') }
      else await look(day)
      const LD = `${root} [data-restore="${SAT}"]`
      if (!(await centre(page, LD))) throw new Error(`#${n}: no Load button`)
      const label0 = await txt(page, LD)
      await press(page, tap, LD); await sleep(200)
      const armed = await txt(page, LD), keep = await txt(page, `${root} [data-restcancel="${SAT}"]`)
      await ring(page, LD); await settle(page, tap)
      const bar = `${root} .dprev-bar`
      const today = await shoot(page, size, n, 'today', [bar, LD])
      await unring(page)
      await press(page, tap, `${root} [data-restcancel="${SAT}"]`); await sleep(300)
      const back = await txt(page, LD)
      if (back !== label0) entry(n, {}).notes.push(`after Keep editing the button read "${back}", not "${label0}"`)
      await centre(page, LD); await settle(page, tap)
      const q = armed.replace(/\s*—\s*confirm\s*$/i, '') + '?'
      const m = await hang(page, LD, { q: { text: q }, btns: [{ t: 'Discard & load', cls: 'abtn danger' }, { t: keep || 'Keep editing', cls: 'abtn primary' }] })
      if (n === 22) m.shiftedIntoDay = await keepIn(page, '.day')
      const card = await shoot(page, size, n, 'card', [bar, LD, '.aq-card'])
      await dropCards(page); await unring(page)
      const e = entry(n, { screen: n === 22 ? 'Edit Schedule — a published day, looking at its Original' : 'The Scheduler Board — a published day, looking at its Original', control: `"${label0}" in the preview bar`, question: armed, answers: [armed, keep], today: `the button turns into "${armed}" and "${keep}" appears beside it, in place`, proposal: 'card' })
      e.pics.today[size] = today; e.pics.card[size] = card; e.measures[size] = m
      e.newWords = [`"${q}" (the armed label as a question)`, '"Discard & load"']
    }
    await page.context().close()
  })

  /* ===== #25 Sort all, #26 Reset to standard (the Scheduler Board, Monday) ===== */
  await step(25, async () => {
    const { page, tap } = await open(size)
    await boardOn(page, 0)
    let ctl = '#sbSortAll'
    if (!(await page.locator('#sbSortAll:visible').count())) { await press(page, tap, '#sbMore'); ctl = '#sbMore'; await press(page, tap, '#sbMoreSort') }
    else await press(page, tap, '#sbSortAll')
    await page.locator('#sortAllPop:not([hidden])').waitFor()
    await ring(page, ctl); await settle(page, tap)
    const q = await txt(page, '#sortAllTitle'), body = await txt(page, '#sortAllPop .airpop-body')
    const today = await shoot(page, size, 25, 'today', ['#sortAllPop .airpop-box', ctl])
    await unring(page)
    const m = await hang(page, ctl, { q: '#sortAllTitle', sub: ['#sortAllPop .airpop-body'], btns: ['#sortAllCancel', '#sortAllConfirm'], hide: '#sortAllPop' })
    const card = await shoot(page, size, 25, 'card', ['.aq-card', ctl])
    const e = entry(25, { screen: 'The Scheduler Board', control: ctl === '#sbMore' ? '⋯ in the board\'s bar, then "Sort all" in its menu (the menu closes as the question opens, so the card hangs from ⋯)' : '"⇅ Sort all" in the board\'s bar', question: `${q} — ${body}`, answers: ['Cancel', 'Sort all'], today: 'a centred box over the whole board, the board dimmed behind it', proposal: 'card' })
    e.pics.today[size] = today; e.pics.card[size] = card; e.measures[size] = m
    e.notes.push('Sort all is not destructive (one Undo reverses it), so its own blue "Sort all" and the plain "Cancel" keep today\'s looks; no answer was recoloured')
    await page.context().close()
  })
  await step(26, async () => {
    const { page, tap } = await open(size)
    await boardOn(page, 0)
    const cx = page.locator('#schedBoard button.mbtn:visible').filter({ hasText: /^CX$/ }).first()
    await cx.evaluate(e => e.scrollIntoView({ block: 'center' })); await (tap ? cx.tap() : cx.click()); await sleep(400)
    await page.locator('#cxPop:not([hidden])').waitFor()
    await press(page, tap, '[data-cxedit]'); await sleep(250)
    await press(page, tap, '#cxEdit [data-cxdel]'); await sleep(250)
    const R = '[data-cxreset]'
    await centre(page, R); await settle(page, tap)
    const label0 = await txt(page, R)
    const m = await hang(page, R, { q: { text: 'Reset the cancel reasons to the standard set?' }, btns: [{ t: 'Reset', cls: 'abtn danger' }, { t: 'Keep', cls: 'abtn primary' }] })
    const card = await shoot(page, size, 26, 'card', ['#cxPop .airpop-box', '.aq-card'])
    await dropCards(page); await unring(page)
    await press(page, tap, R); await sleep(200)
    const armed = await txt(page, R)
    await ring(page, R); await settle(page, tap)
    const today = await shoot(page, size, 26, 'today', ['#cxPop .airpop-box', R])
    const e = entry(26, { screen: 'The Scheduler Board — a line\'s cancel box, its quick reasons being edited', control: `"${label0}" at the foot of the reasons list`, question: armed, answers: [armed + ' (the same button, pressed again)'], today: `the button turns red and reads "${armed}", in place`, proposal: 'card' })
    e.pics.today[size] = today; e.pics.card[size] = card; e.measures[size] = m
    e.newWords = ['"Reset the cancel reasons to the standard set?"', '"Reset"', '"Keep" (not "Cancel": in this box "Cancel" means cancelling the line)']
    await page.context().close()
  })

  /* ===== #30 Accept, #31 Un-cancel — an input on a day made a holiday, its OIL not answered ===== */
  for (const QN of [31, 30]) await step(QN, async () => {
    const { page, tap } = await open(size)
    const FRI = '2026-07-17', FDI = 4
    const iA = QN === 30 ? await L.fileOn(page, tap, FRI, { type: 'Meeting', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' }) : null
    const iB = QN === 31 ? await L.fileOn(page, tap, FRI, { type: 'Meeting', people: ['stiff'], from: '13:00', to: '15:00', title: 'Sim review' }) : null
    if (!(iA || iB)) throw new Error('staging: the input was not filed')
    await L.go(page, 'inputs')
    await press(page, tap, '#inGear'); await press(page, tap, '[data-testid="iset-days"]')
    if (await tid(page, 'days-tab-holidays').count()) await press(page, tap, '[data-testid="days-tab-holidays"]')
    await press(page, tap, '[data-testid="hol-add"]'); await press(page, tap, '[data-testid="hol-kind-ph"]')
    await setVal(page, '[data-testid="hol-name"]', 'National Day')
    for (let i = 0; i < 14 && !(await tid(page, `holcal-day-${FRI}`).count()); i++) await press(page, tap, '[data-testid="holcal-prev"]')
    for (let i = 0; i < 40 && !(await tid(page, `holcal-day-${FRI}`).count()); i++) await press(page, tap, '[data-testid="holcal-next"]')
    await press(page, tap, `[data-testid="holcal-day-${FRI}"]`); await press(page, tap, '[data-testid="hol-save"]'); await sleep(400)
    await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {})
    await page.locator('[data-testid="odl-later"]').evaluate(e => e.click()).catch(() => {})
    await page.locator('[data-testid="win-days"] .win-x').evaluate(e => e.click()).catch(() => {})
    await sleep(300)
    await boardOn(page, FDI)
    const riOf = iid => page.evaluate(([di, i]) => (window.DAYS[di].ground || []).findIndex(r => r && r.src === i), [FDI, iid])
    const ask = '[data-testid="oilconf"] .airpop-box'
    /* #31 — CX on B's row, cancel it, then take the cancel off */
    if (QN === 31) {
      const rib = await riOf(iB); if (rib < 0) throw new Error('staging: Sim review is not on the programme')
      const CXB = `#sbBoard [data-grcx="${FDI}.${rib}"]`
      await centre(page, CXB); await press(page, tap, CXB); await sleep(300)
      if (await page.locator('#cxPop:not([hidden])').count()) { await press(page, tap, '#cxSave'); await sleep(400) }
      await centre(page, CXB); await press(page, tap, CXB); await sleep(300)
      let pressed = CXB, viaDialog = false
      if (await page.locator('#cxPop:not([hidden]) #cxUn:visible').count()) { viaDialog = true; await press(page, tap, '#cxUn'); await sleep(400) }
      await page.locator('[data-testid="oilconf"]').waitFor({ timeout: 4000 })
      const lead = await txt(page, '[data-testid="oilconf-lead"]')
      const no = await txt(page, '[data-testid="oilconf-cancel"]'), yes = await txt(page, '[data-testid="oilconf-save"]')
      const dialogStill = await page.locator('#cxPop:not([hidden])').count()
      await centre(page, CXB); await ring(page, CXB); await settle(page, tap)
      const today = await shoot(page, size, 31, 'today', [ask, CXB])
      await unring(page)
      const m = await rehome(page, CXB, ask, '[data-testid="oilconf"]', 360)
      const card = await shoot(page, size, 31, 'card', [ask, CXB])
      const e = entry(31, { screen: 'The Scheduler Board — Friday made a public holiday; an input\'s row on the Ground Programme, cancelled', control: viaDialog ? 'the row\'s CX, then "Un-cancel" in the cancel box (the box closes as the question opens, so the card hangs from the row\'s CX — the button the app already flashes when the question is left unanswered)' : 'the row\'s CX', question: lead, answers: [no, yes], today: `the OIL question as a centred box over the board${dialogStill ? ', the cancel box still up behind it' : ''}`, proposal: 'sheet' })
      e.pics.today[size] = today; e.pics.card[size] = card; e.measures[size] = m
      await press(page, tap, '[data-testid="oilconf-cancel"]').catch(() => {}); await sleep(300)
      await page.locator('[data-testid="oilbar"] button').last().evaluate(b => b.click()).catch(() => {})



    }
    /* #30 — take A off the programme (its row's ✕), then "Accept" on its card in Personal Inputs */
    if (QN === 30) {
      const ria = await riOf(iA); if (ria < 0) throw new Error('staging: Range brief is not on the programme')
      const del = `#sbBoard [data-grdel="${FDI}.${ria}"]`
      await centre(page, del); await press(page, tap, del); await sleep(400)
      const ACC = `#schedBoard [data-acc="g"][data-acck="${iA}"]`
      if (!(await page.locator(`${ACC}:visible`).count())) await page.locator(`#schedBoard [data-pitog="${FDI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
      await sleep(300); await centre(page, ACC)
      const label0 = await txt(page, ACC)
      await press(page, tap, ACC); await page.locator('[data-testid="oilconf"]').waitFor({ timeout: 4000 })
      const lead = await txt(page, '[data-testid="oilconf-lead"]')
      const no = await txt(page, '[data-testid="oilconf-cancel"]'), yes = await txt(page, '[data-testid="oilconf-save"]')
      await centre(page, ACC); await ring(page, ACC); await settle(page, tap)
      const today = await shoot(page, size, 30, 'today', [ask, ACC])
      await unring(page)
      const m = await rehome(page, ACC, ask, '[data-testid="oilconf"]', 360)
      const card = await shoot(page, size, 30, 'card', [ask, ACC])
      const e = entry(30, { screen: 'The Scheduler Board — Friday made a public holiday; an input taken off the programme, its card under Personal Inputs', control: `"${label0}" on the input's card`, question: lead, answers: [no, yes], today: 'the OIL question as a centred box over the board', proposal: 'sheet' })
      e.pics.today[size] = today; e.pics.card[size] = card; e.measures[size] = m
    }
    await page.context().close()
  })

  /* ===== #34 Quals — remove a column other screens read ===== */
  await step(34, async () => {
    const { page, tap } = await open(size)
    await L.go(page, 'quals')
    const X = '#qtbl .qdel[data-del="sched"]'
    if (await page.locator('#qEdit:visible').count()) { await press(page, tap, '#qEdit'); await sleep(300) }
    if (!(await page.locator(`${X}:visible`).count()) && await page.locator('#qEditQuals:visible').count()) { await press(page, tap, '#qEditQuals'); await sleep(300) }
    if (!(await page.locator(X).count())) throw new Error('no ✕ on the SCHED column')
    await centre(page, X); await settle(page, tap)
    const h = await page.evaluate(() => { const th = document.querySelector('#qtbl .qdel[data-del="sched"]').closest('th'); return th.querySelector('.qlbl').textContent.trim() })
    const why = 'the sign-off drop-downs — SKED CK, PLANNED BY and APPROVED BY'
    const m = await hang(page, X, { q: { text: `Remove ${h}?` }, sub: [{ text: `${h} is read by ${why}. Who already holds it is kept.` }], btns: [{ t: 'Remove', cls: 'abtn danger' }, { t: 'Keep', cls: 'abtn primary' }] })
    const card = await shoot(page, size, 34, 'card', [X, '.aq-card'])
    await dropCards(page); await unring(page)
    await press(page, tap, X); await sleep(200)
    const armed = await txt(page, X), note = await lastNote(page)
    await centre(page, X); await ring(page, X); await settle(page, tap)
    const today = await shoot(page, size, 34, 'today', [X, '#toastEl'])
    const e = entry(34, { screen: 'Quals — editing the columns', control: `the ✕ on the ${h} column's heading`, question: note, answers: [`"${armed}" (the ✕ itself, pressed again)`], today: `the ✕ turns into "${armed}" in place; a passing note at the foot of the screen says why: "${note}"`, proposal: 'card' })
    e.pics.today[size] = today; e.pics.card[size] = card; e.measures[size] = m
    e.newWords = [`"Remove ${h}?"`, '"Remove"', '"Keep"', '(the note\'s sentence kept, its "Press REMOVE? to take it off the LoX" replaced by the answers)']
    await page.context().close()
  })

  /* ===== #37 Delete a person, #38 delete an archived person, #35 "is back", #36 "Welcome back" ===== */
  const usersOpen = async (page, tap) => { await L.go(page, 'admin'); await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test(b.textContent.trim())); if (b) b.click() }); await sleep(350) }
  await step(37, async () => {
    const { page, tap } = await open(size)
    await usersOpen(page, tap)
    const pid = await page.evaluate(() => { const r = [...document.querySelectorAll('#admUsers .acc-row[data-person]:not([data-archived]) .acc-tap')].find(b => !b.disabled && b.getBoundingClientRect().width > 0); return r ? r.closest('[data-person]').getAttribute('data-person') : null })
    const cs = await page.evaluate(id => window.PEOPLE[id].cs, pid)
    await press(page, tap, `#admUsers [data-person="${pid}"] .acc-tap`); await sleep(300)
    const D = '#accEdDel'
    await centre(page, D); await settle(page, tap)
    const goes = 'Goes: his account, his Quals row, every day still to come. Days he flew keep his puck. Can’t be undone.'
    const m = await hang(page, D, { q: { text: `Delete ${cs}?` }, sub: [{ text: goes }], btns: [{ t: 'Delete', cls: 'abtn danger' }, { t: 'Keep', cls: 'abtn primary' }] })
    const card = await shoot(page, size, 37, 'card', [`#admUsers [data-person="${pid}"]`, '.aq-card'])
    await dropCards(page); await unring(page)
    await press(page, tap, D); await sleep(200)
    const armed = await txt(page, D), note = await txt(page, '#accEdDelNote')
    await ring(page, D); await settle(page, tap)
    const today = await shoot(page, size, 37, 'today', [`#admUsers [data-person="${pid}"]`, '#accEdDelNote'])
    const e = entry(37, { screen: 'Admin → Users — a person\'s row, opened', control: '"Delete" in the row\'s buttons', question: note, answers: [`"${armed}" (the same button, pressed again)`, 'Cancel (beside it)'], today: `the button turns into "${armed}" and a line under the buttons says what goes`, proposal: 'card' })
    e.pics.today[size] = today; e.pics.card[size] = card; e.measures[size] = m
    e.newWords = [`"Delete ${cs}?"`, '"Keep" (the app’s own Delete / Keep pair; the row’s own Cancel closes the row)']
    await page.context().close()
  })
  await step(38, async () => {
    const { page, tap } = await open(size)
    await usersOpen(page, tap)
    /* archive a man through his row's own Archive, then open the folded Archived list */
    const pid = await page.evaluate(() => { const r = [...document.querySelectorAll('#admUsers .acc-row[data-person]:not([data-archived]) .acc-tap')].filter(b => !b.disabled && b.getBoundingClientRect().width > 0); const b = r[3] || r[0]; return b ? b.closest('[data-person]').getAttribute('data-person') : null })
    const cs = await page.evaluate(id => window.PEOPLE[id].cs, pid)
    await press(page, tap, `#admUsers [data-person="${pid}"] .acc-tap`); await sleep(300)
    await press(page, tap, '#accEdArchive'); await sleep(400)
    if ((await page.locator('#accArchToggle').getAttribute('aria-expanded')) !== 'true') await press(page, tap, '#accArchToggle')
    await press(page, tap, `#accArchList [data-person="${pid}"] .acc-tap`); await sleep(300)
    const D = '#accArDel'
    await centre(page, D); await settle(page, tap)
    const goes = 'Goes: his account, his Quals row, every day still to come. Days he flew keep his puck. Can’t be undone.'
    const m = await hang(page, D, { q: { text: `Delete ${cs}?` }, sub: [{ text: goes }], btns: [{ t: 'Delete', cls: 'abtn danger' }, { t: 'Keep', cls: 'abtn primary' }] })
    const card = await shoot(page, size, 38, 'card', [`#accArchList [data-person="${pid}"]`, '.aq-card'])
    await dropCards(page); await unring(page)
    await press(page, tap, D); await sleep(200)
    const armed = await txt(page, D), note = await txt(page, '#accArDelNote')
    await ring(page, D); await settle(page, tap)
    const today = await shoot(page, size, 38, 'today', [`#accArchList [data-person="${pid}"]`, '#accArDelNote'])
    const e = entry(38, { screen: 'Admin → Users → ▸ Archived — an archived man\'s row, opened', control: '"Delete" in the row\'s buttons', question: note, answers: [`"${armed}" (the same button, pressed again)`, 'Cancel (beside it)'], today: `the button turns into "${armed}" and a line under the buttons says what goes`, proposal: 'card' })
    e.pics.today[size] = today; e.pics.card[size] = card; e.measures[size] = m
    e.newWords = [`"Delete ${cs}?"`, '"Keep" (the app’s own Delete / Keep pair; the row’s own Cancel closes the row)']
    /* #35 — restore him; Quals then asks to check his quals (a banner on another page: not a confirmation at a control) */
    if (want(35)) {
      await dropCards(page); await unring(page)
      await press(page, tap, '#accArCancel').catch(() => {}); await sleep(200)
      if (!(await page.locator('#accArRestore:visible').count())) await press(page, tap, `#accArchList [data-person="${pid}"] .acc-tap`)
      await press(page, tap, '#accArRestore'); await sleep(400)
      await L.go(page, 'quals'); await sleep(300)
      const B = `[data-testid="back-${pid}"]`
      if (await page.locator(B).count()) {
        await centre(page, B); await ring(page, B); await settle(page, tap)
        const t35 = await shoot(page, size, 35, 'today', [B])
        const e35 = entry(35, { screen: 'Quals, after a man is restored on Admin → Users', control: '"Restore" on Admin → Users (another page)', question: await txt(page, B), answers: ['Check his quals', 'Later'], today: 'a banner over the Quals table, on the page the Restore leads to', proposal: 'none — not a press' })
        e35.pics.today[size] = t35; e35.notes.push('not a confirmation of the press: a reminder shown on another page afterwards — outside D1626')
      } else entry(35, {}).notes.push(`${size}: no banner after the restore`)
    }
    await page.context().close()
  })
  await step(36, async () => {
    /* Ranger ("us") archived, restored, then signs in */
    const { page, tap } = await open(size)
    await usersOpen(page, tap)
    const pid = await page.evaluate(() => { const r = document.querySelector('#admUsers .acc-row[data-acct="us"], #admUsers .acc-row[data-acct]'); const a = [...document.querySelectorAll('#admUsers .acc-row[data-acct]')].find(x => /Ranger/.test(x.textContent)); return (a || r) ? (a || r).getAttribute('data-person') : null })
    await press(page, tap, `#admUsers [data-person="${pid}"] .acc-tap`); await sleep(300)
    await press(page, tap, '#accEdArchive'); await sleep(400)
    if ((await page.locator('#accArchToggle').getAttribute('aria-expanded')) !== 'true') await press(page, tap, '#accArchToggle')
    await press(page, tap, `#accArchList [data-person="${pid}"] .acc-tap`); await sleep(300)
    await press(page, tap, '#accArRestore'); await sleep(400)
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /^Logout$/.test(b.textContent.trim()) && b.getBoundingClientRect().width > 0); if (b) b.click() }); await sleep(600)
    if (await page.locator('#luser').count()) { await page.fill('#luser', 'us'); await page.fill('#lpass', 'us'); await page.click('#loginForm button[type=submit]') }
    await sleep(1000)
    const wb = await page.evaluate(() => { const e = [...document.querySelectorAll('div,section')].find(x => /^Welcome back/.test((x.textContent || '').trim()) && x.getBoundingClientRect().height > 0 && x.getBoundingClientRect().height < 400 && !x.querySelector("[data-aq-wb]")); if (e) e.setAttribute('data-aq-wb', '1'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null })
    if (!wb) { entry(36, {}).notes.push(`${size}: no Welcome back banner after signing in`); await page.context().close(); return }
    await page.addStyleTag({ content: CARD_CSS })
    await ring(page, '[data-aq-wb]'); await settle(page, tap)
    const t = await shoot(page, size, 36, 'today', ['[data-aq-wb]'])
    const e = entry(36, { screen: 'The first screen a restored man sees after signing in', control: 'signing in (no control)', question: wb, answers: ['Check my quals', 'Later'], today: 'a banner at the top of his first screen', proposal: 'none — not a press' })
    e.pics.today[size] = t; e.notes.push('raised by signing in, not by a control — outside D1626')
    await page.context().close()
  })

  /* ===== #39 Clear old clutter, #40 Clear edit history (Admin → Data) ===== */
  for (const [n, idp, label] of [[39, 'admWipe', 'Old clutter'], [40, 'admLog', 'Edit history']]) await step(n, async () => {
    const { page, tap } = await open(size)
    if (n === 39) {
      /* a day title on a June day of the Inputs calendar, typed through its own box's input event and committed by leaving it */
      await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 6); await L.openDay(page, '2026-06-10')
      await page.evaluate(() => document.getElementById('icRmkEdit').focus()); await setVal(page, '#icRmkEdit', 'Range day'); await page.evaluate(() => document.getElementById('icRmkEdit').blur()); await sleep(300)
      if (await tid(page, 'win-inputsday-x').count()) await press(page, tap, '[data-testid="win-inputsday-x"]')
      await page.evaluate(() => { const v = document.querySelector('meta[name=viewport]'); return v && v.content })
    }
    if (n === 40) { await L.go(page, 'editsched'); await page.evaluate(() => { window.setSlotVal('d:5.0.0', 'casper'); window.afterSchedMutate() }); await sleep(400) }
    await L.go(page, 'admin'); await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Data/.test(b.textContent.trim())); if (b) b.click() }); await sleep(350)
    const BTN = `#${idp}`
    let armed = null
    for (const ahead of [2, 6, 14]) {
      await centre(page, `#${idp}Date`); await press(page, tap, `#${idp}Date`); await sleep(300)
      for (let i = 0; i < ahead; i++) await press(page, tap, '[data-testid="dcal-next"]')
      const cm = await page.getAttribute('[data-testid="dcal"]', 'data-month')
      await press(page, tap, `[data-testid="dcal-day-${cm}-28"]`); await sleep(250)
      await centre(page, BTN); await press(page, tap, BTN); await sleep(250)
      const t = await txt(page, BTN)
      if (/tap again/i.test(t)) { armed = t; break }
    }
    if (!armed) { const e = entry(n, { screen: `Admin → Data — ${label}`, control: `"${await txt(page, BTN)}"`, proposal: 'card' }); e.notes.push(`${size}: nothing in any period tried — the button never armed ("${await lastNote(page)}"); not pictured`); await page.context().close(); return }
    const N = +(armed.match(/(\d+)/) || [0, 0])[1], unit = armed.replace(/^.*\d+\s*/, '')
    const note = await page.evaluate(id => { const b = document.getElementById(id); const p = b && b.parentElement.querySelector('.adm-note'); return p ? p.textContent.trim() : '' }, idp)
    await ring(page, BTN); await settle(page, tap)
    const today = await shoot(page, size, n, 'today', [`#${idp}Mode`, BTN, `#${idp}Date`])
    await unring(page)
    /* disarm the way the app does: a change of period — then back, the date kept */
    await page.selectOption(`#${idp}Mode`, 'on'); await sleep(150); await page.selectOption(`#${idp}Mode`, 'before'); await sleep(200)
    const label0 = await txt(page, BTN)
    await centre(page, BTN); await settle(page, tap)
    const verb = n === 39 ? 'Clear' : 'Clear'
    const m = await hang(page, BTN, { q: { text: `Clear ${N} ${unit}?` }, sub: [{ text: note }], btns: [{ t: verb, cls: 'abtn danger' }, { t: 'Keep', cls: 'abtn primary' }] })
    const card = await shoot(page, size, n, 'card', [`#${idp}Mode`, BTN, '.aq-card'])
    const e = entry(n, { screen: `Admin → Data — ${label}`, control: `"${label0}"`, question: armed, answers: [`"${armed}" (the same button, pressed again)`], today: `the full-width button turns red and reads "${armed}", in place; the note under it is the standing explanation`, proposal: 'card' })
    e.pics.today[size] = today; e.pics.card[size] = card; e.measures[size] = m
    e.newWords = [`"Clear ${N} ${unit}?"`, '"Clear"', '"Keep"', '(the note under the button moves into the card)']
    await page.context().close()
  })
  saveMan()
}

/* the ones outside the ruling, or not drawn here, with why */
for (const [n, screen, why] of [
  [27, 'The Scheduler Board / Edit Schedule — a puck dropped on an input\'s row', 'raised by a drop, not a press (D1626 covers presses); its sheet is the same OIL question as #30 and #31, drawn there'],
  [28, 'The Scheduler Board / Edit Schedule — a puck moved between rows', 'raised by a drop, not a press; the same OIL sheet as #30'],
  [29, 'The Scheduler Board / Edit Schedule — a puck dropped on a medical\'s Unavailable row', 'raised by a drop, not a press; the same OIL sheet as #30'],
  [32, 'Edit Schedule / the Scheduler Board — "Blue or Red?" under a formation', 'raised by leaving a mission or remarks box that mentions DS or RED (Logic\'s switch on), not by a press; it already stands under the formation it is about'],
  [33, 'Edit Schedule / the Scheduler Board — "Use this section order as the default…?"', 'raised by dragging a section\'s grip, not by a press'],
]) { const e = entry(n, { screen, proposal: n === 32 ? 'none — not a press' : 'none — not a press' }); if (!e.notes.includes('not pictured: ' + why)) e.notes.push('not pictured: ' + why) }
saveMan()
await cropAll()
await L.finish('ask-at-schedule-admin')
