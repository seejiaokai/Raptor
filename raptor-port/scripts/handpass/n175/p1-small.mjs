// p1-small - P1 case 1: the four small pop-ups that leave the bar free (Traffic, Jump to a date, Day details ⓘ, the
// document viewer). Saber (master admin, home 142). Each pop-up is opened by its own control; what in it can be typed or
// chosen is listed; then ONE bar press: the squadron picker → 149 (a: the top-bar picker; m: on a phone ☰ → its squadron
// list), the member-view switch (v: the name badge / ☰ role line), or the bell (b). Each run in a fresh browser.
// Then 'docover': an Input window with words typed in Remarks, its paperclip pressed (the document viewer over it), then
// the pick of 149 (and, afresh, the view switch).
//   node raptor-port/scripts/handpass/n175/p1-small.mjs <d|p>      (ONLY=traffic,weekcal,dayinfo,doc,docover)
// No stand-ins. Deciding pictures: p1-small-<pop>-<size>-*.png
import { mk, closeAll, FACT, note, signIn, covered, boxOf, barSq, pageOn, go, windowsNow, roleNow, reachPick, reachView, wait, hit, vis, typeIn, valOf, decide, scratch, notesNow, askNow, normSz, lineSeen } from './p1-lib.mjs'
const SZ = normSz(process.argv[2] || 'd'), T = SZ
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const WORDS = 'P1 typed words'

async function inputsList(s) {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 600)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  const rangeWords = async () => ((await page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '').trim()
  if (!/All dates/.test(await rangeWords())) {
    if (!(await vis(s, '#inRangeAll').count())) await hit(s, '#inRangeBtn')
    if (await page.locator('#inRangeAll').count()) await hit(s, page.locator('#inRangeAll').first())
    if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn')
  }
}
/* an input that carries a document: its row on the list (the row whose paperclip is drawn; on a phone the card of a
   medical input, a phone's card drawing no paperclip) */
async function docRow(s) {
  await inputsList(s)
  const withClip = vis(s, '.page.on [data-iid]:has([data-doc])')
  if (await withClip.count()) return withClip.first()
  /* the same input the desktop finds first with a paperclip: Zenith's ATT B, 15–19 Jun */
  return vis(s, '.page.on [data-iid]').filter({ hasText: /Zenith/ }).filter({ hasText: /ATT B/ }).first()
}
const POP = {
  traffic: { what: "Traffic window (Edit Schedule → a wave's Traffic)", sel: '#airpop', open: async s => { await go(s, 'editsched'); await hit(s, vis(s, '.page.on .airbtn').filter({ hasText: /^Traffic$/ }).first(), 700) } },
  weekcal: { what: "Jump to a date (View-only Sched → the week bar's calendar)", sel: '#weekCal', open: async s => { await go(s, 'viewsched'); await hit(s, vis(s, '.page.on .wk-cal, .page.on .filt-cal').first(), 700) } },
  dayinfo: { what: 'Day details ⓘ (View-only Sched → a day\'s ⓘ)', sel: '#dayPop', open: async s => { await go(s, 'viewsched'); await hit(s, '.page.on .dinfobtn', 700) } },
  doc: { what: "the document viewer (Inputs → List → a medical input's paperclip)", sel: '#docViewPop', open: async s => {
    const row = await docRow(s)
    const clip = row.locator('[data-doc]')
    if (await clip.count()) { await hit(s, clip.first(), 800); return }
    /* a phone's list card draws no paperclip (D723): the viewer is opened from Inputs → Medical, a card with a document */
    FACT(`P1.small.${T}.doc.route`, 'no paperclip on the list at this size; opened from Inputs → Medical → a card')
    await hit(s, '#inMedBtn', 900)
    const cards = vis(s, '.page.on [data-medcard]')
    for (let i = 0; i < Math.min(await cards.count(), 8); i++) {
      await hit(s, cards.nth(i), 800)
      if (await s.page.evaluate(() => { const e = document.querySelector('#docViewPop'); return !!e && !e.hidden && e.getBoundingClientRect().width > 2 })) return
    }
    throw new Error('no Medical card opened the document viewer')
  } },
}
/* what in the pop-up can be typed or chosen */
const fieldsIn = (s, sel) => s.page.evaluate(sel => {
  const box = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 2 && !e.hidden)
  if (!box) return 'pop-up not found'
  const f = [...box.querySelectorAll('input, textarea, select, [contenteditable=true]')].filter(e => e.getBoundingClientRect().width > 0)
  return { boxes: f.map(e => `${e.tagName.toLowerCase()}${e.type ? '[' + e.type + ']' : ''}${e.disabled || e.readOnly ? ' (read-only)' : ''} "${(e.getAttribute('aria-label') || e.placeholder || e.name || e.id || '').slice(0, 40)}"`), buttons: [...box.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0).map(b => (b.textContent.trim() || b.getAttribute('aria-label') || '?').slice(0, 26)).slice(0, 16) }
}, sel)
const popUp = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].some(e => { const b = e.getBoundingClientRect(); return b.width > 2 && b.height > 2 && !e.hidden && getComputedStyle(e).display !== 'none' }), sel)
const bellOpen = s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"], .bellpanel, .belllist, #bellList')].some(e => e.getBoundingClientRect().width > 2))

async function one(key, action) {
  const r = POP[key], k = `P1.small.${T}.${key}.${action}`, P = `p1-small-${key}-${T}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    try { await r.open(s) } catch (e) { FACT(`${k}.opened`, 'could not open by presses: ' + String(e).split('\n')[0].slice(0, 140)); return }
    FACT(`${k}.opened`, { popUp: await popUp(s, r.sel), page: await pageOn(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 90)) })
    if (action === 'pick') FACT(`${k}.inIt`, await fieldsIn(s, r.sel))
    const ctl = {}
    for (const sel of ['#sqnMenuBtn', '#burger', '#roleBadge', '#notifyBell']) ctl[sel] = (await boxOf(s, sel)) ? await covered(s, sel) : 'not drawn'
    FACT(`${k}.controlsWithPopUpOpen`, ctl)
    if (action === 'pick') await decide(s, `${P}-1-open`, r.sel + ' .airpop-box', null)
    const sq0 = await barSq(s), role0 = await roleNow(s)
    let did
    if (action === 'pick') did = await reachPick(s, 149, 'bar')
    else if (action === 'pickmenu') did = await reachPick(s, 149, 'menu')
    else if (action === 'view') did = await reachView(s)
    else {
      did = { control: 'the bell', covered: await covered(s, '#notifyBell') }
      if (did.covered === 'free') { const b = await boxOf(s, '#notifyBell'); if (s.desk) await s.page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); else await s.page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); did.pressed = true; await wait(s, 700) }
    }
    FACT(`${k}.press`, did)
    if (!did.pressed) return
    await wait(s, 600)
    const role1 = await roleNow(s)
    FACT(`${k}.after`, { squadron: { before: sq0, after: await barSq(s) }, role: { before: role0.badge || role0.menuLine, after: role1.badge || role1.menuLine }, popUpStillOpen: await popUp(s, r.sel), page: await pageOn(s), bellListOpen: await bellOpen(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 90)), notes: await notesNow(s), question: await askNow(s) })
    if (action === 'pick' && did.listOpen === false) FACT(`${k}.after.secondPressNeeded`, 'the picker press opened no list')
    if (action === 'pick') await decide(s, `${P}-2-after-pick`, ['#sqnMenuBtn', '.topbar .mark'], null)
    else await scratch(s, `${P}-${action}-after`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 180)) } finally { await s.ctx.close().catch(() => {}) }
}

/* the document viewer over an Input window holding typed words */
async function docover(action) {
  const k = `P1.small.${T}.docover.${action}`, P = `p1-small-docover-${T}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    const row = await docRow(s)
    const o = row.locator('[data-testid="in-open"]')
    await hit(s, (await o.count()) ? o.first() : row, 900)
    const typed = await typeIn(s, '#inpEditRmk', WORDS)
    FACT(`${k}.inputWindow`, { typedInRemarks: typed, windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 90)) })
    const clip = vis(s, '[data-testid="inped-docview"]')
    FACT(`${k}.paperclipInWindow`, (await clip.count()) ? await covered(s, '[data-testid="inped-docview"]') : 'not drawn')
    if (!(await clip.count())) return
    await hit(s, clip.first(), 900)
    const ctl = {}
    for (const sel of ['#sqnMenuBtn', '#burger', '#roleBadge', '#notifyBell']) ctl[sel] = (await boxOf(s, sel)) ? await covered(s, sel) : 'not drawn'
    FACT(`${k}.opened`, { viewer: await popUp(s, '#docViewPop'), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 90)), controls: ctl })
    if (action === 'pick') await decide(s, `${P}-1-viewer-over-window`, '#docViewPop .airpop-box', null)
    const sq0 = await barSq(s)
    const did = action === 'pick' ? await reachPick(s, 149, 'bar') : action === 'pickmenu' ? await reachPick(s, 149, 'menu') : await reachView(s)
    FACT(`${k}.press`, did)
    if (!did.pressed) { if (action === 'pick') await decide(s, `${P}-2-bar-covered`, '#sqnMenuBtn, #burger', null); return }
    await wait(s, 800)
    FACT(`${k}.after`, { squadron: { before: sq0, after: await barSq(s) }, viewerStillOpen: await popUp(s, '#docViewPop'), windows: (await windowsNow(s)).map(w => ({ what: w.what, words: w.words.slice(0, 140), buttons: w.buttons })), typedWords: await valOf(s, '#inpEditRmk'), notes: await notesNow(s), question: await askNow(s) })
    const band = await lineSeen(s, "^This is 142's")
    FACT(`${k}.after.band`, band)
    if (action === 'pick') await decide(s, `${P}-2-after-pick`, band.seen ? '[data-p1line]' : '.floatwin.inpedwin', '.floatwin.inpedwin')
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 180)) } finally { await s.ctx.close().catch(() => {}) }
}

/* Traffic with words typed in its airspace line (the box not left), then the pick of 149; then back to 142 and Traffic
   opened again on the same wave: are the words there? */
async function traffictyped() {
  const k = `P1.small.${T}.traffictyped.pick`, P = `p1-small-traffictyped-${T}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    await POP.traffic.open(s)
    const box = vis(s, '#airpop input').first()
    const before = await box.inputValue().catch(() => null)
    const typed = await typeIn(s, box, 'P1 AIRSPACE')
    FACT(`${k}.typed`, { before, typedTaken: typed, now: await box.inputValue().catch(() => null), focused: await s.page.evaluate(() => document.activeElement?.closest('#airpop') ? 'in the Traffic window' : document.activeElement?.tagName) })
    await decide(s, `${P}-1-typed`, '#airpop input', '#airpop .airpop-box')
    const did = await reachPick(s, 149, SZ === 'd' ? 'bar' : 'bar')
    FACT(`${k}.press`, did)
    if (!did.pressed) return
    await wait(s, 600)
    FACT(`${k}.after`, { squadron: await barSq(s), trafficOpen: await popUp(s, '#airpop .airpop-box'), notes: await notesNow(s), question: await askNow(s) })
    const on149 = await (async () => { await POP.traffic.open(s); const v = await vis(s, '#airpop input').first().inputValue().catch(() => null); await s.page.keyboard.press('Escape'); await wait(s, 300); return v })()
    FACT(`${k}.on149.firstWaveAirspaceLine1`, on149)
    await reachPick(s, 142, 'bar'); await wait(s, 600)
    await POP.traffic.open(s)
    FACT(`${k}.back142.airspaceLine1`, { squadron: await barSq(s), value: await vis(s, '#airpop input').first().inputValue().catch(() => null) })
    await decide(s, `${P}-2-back-on-142`, '#airpop input', '#airpop .airpop-box')
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 180)) } finally { await s.ctx.close().catch(() => {}) }
}

try {
  console.log('p1-small v1', SZ)
  if (!ONLY.length || ONLY.includes('traffictyped')) await traffictyped()
  if (ONLY.length === 1 && ONLY[0] === 'traffictyped') ONLY.length = 0, ONLY.push('__none')
  const keys = (ONLY.length ? ONLY : [...Object.keys(POP), 'docover']).filter(x => x in POP || x === 'docover')
  const actions = SZ === 'd' ? ['pick', 'view', 'bell'] : ['pick', 'pickmenu', 'view', 'bell']
  for (const key of keys) {
    note(`== ${key}`)
    if (key === 'docover') { for (const a of (SZ === 'd' ? ['pick', 'view'] : ['pick', 'pickmenu', 'view'])) await docover(a); continue }
    FACT(`P1.small.${T}.${key}.window`, POP[key].what)
    for (const a of actions) await one(key, a)
  }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
