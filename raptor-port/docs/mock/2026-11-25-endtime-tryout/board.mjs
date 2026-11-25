/* The end-time rule drawn on the REAL Scheduler Board (26 Nov 26): Thursday 16 Jul staged as on the try-out page (VL's
   take-off empty, the SXO desk with Anvil and no times, the OFT EP-4 with no START, SQN PT with ALL AVAIL and no end),
   then three frames at his iPhone's width (402, WebKit, 3x) and a desktop's (1536, Chromium, 2x):
     a  drafting — a thin grey line inside each empty time box, the try-out's own outline (inset, 1px, --ink-3)
     b  after a refused sign-off or Publish — the same boxes in the warning red (--hard, #F0555F)
     c  the day published, then the SXO END emptied — the red outline AND the app's own waiting mark on that box
   Staged through the app (its "+ Item" button, its own text and seat writes, its sign-off boxes and Publish day, typing in
   the board's box); the store is staged on the desktop and handed to the phone (a phone zooms to a box it types in).
   PROPOSED, added by this script and nothing else: the class `et-miss` (+ `et-red`) on the empty boxes, and in the
   board's sign-off status line the words "N items missing a time · " before the app's own words (that line allowed to
   wrap, class `et-has`).
   Run from raptor-port/ against a preview of the build:  npx vite preview --port 4796 --strictPort
     GW_URL=http://localhost:4796/ node docs/mock/2026-11-25-endtime-tryout/board.mjs
   Pictures: img/board-*.png beside this file. */
import { join } from 'node:path'
const K = await import('../2026-11-25-guardrail-wording/kit.mjs')
const IMG = join(K.HERE, '../2026-11-25-endtime-tryout/img')
const DI = 3
const errors = []

/* the boxes the rule reads on this day, and how the try-out draws its outline — on the board's own boxes */
const PROPOSED_CSS = `
#schedBoard input.et-miss{box-shadow:inset 0 0 0 1px var(--ink-3) !important}
#schedBoard input.et-miss.et-red{box-shadow:inset 0 0 0 1px var(--hard) !important}
#sbSignBar .et-n{color:var(--hard)}
/* the app's status line never wraps (it fitted one line); with the count in front it wraps on a phone, as the try-out's does */
#sbSignBar .so-state.et-has{white-space:normal}`

async function stageDraft(p) {
  /* SQN PT: a new Common Programme item by the board's own "+ Item", named, 15:00, ALL AVAIL on it, no end */
  const n0 = await p.evaluate(di => window.DAYS[di].allhands.length, DI)
  await p.locator('#schedBoard .sb-sec').filter({ hasText: 'COMMON PROGRAMME' }).getByRole('button', { name: /Item/ }).first().click()
  await K.wait(p, 400)
  const ri = await p.evaluate(di => window.DAYS[di].allhands.length - 1, DI)
  if (ri !== n0) throw new Error('+ Item made no row')
  await p.evaluate(([di, ri]) => {
    const t = window.txtSet
    t(`ap:${di}.${ri}.prog`, 'SQN PT'); t(`ap:${di}.${ri}.str`, '1500'); t(`ap:${di}.${ri}.end`, '')
    window.fillSlot(`a:${di}.${ri}.0`, 'allavail')
    /* VL: crew on, take-off empty (landing 14:10 stays) · SXO: Anvil on it, no times · the OFT EP-4 with no START */
    t(`ff:${di}.0.0.to`, '')
    t(`dr:${di}.0.1.str`, ''); t(`dr:${di}.0.1.end`, '')
    t(`sr:${di}.oft.0.label`, 'EP-4'); t(`sr:${di}.oft.0.str`, '')
    window.afterSchedMutate()
  }, [DI, ri])
  /* the new item's just-added ring lasts about six seconds (D876): let it fade before any picture */
  await K.wait(p, 7000)
  return ri
}
const missKeys = ri => [`ff:${DI}.0.0.to`, `dr:${DI}.0.1.str`, `dr:${DI}.0.1.end`, `sr:${DI}.oft.0.str`, `ap:${DI}.${ri}.end`]

/* the proposal on the board as it stands: outline the empty boxes, put the count before the status words */
async function propose(p, ri, red, signedLeft) {
  await p.evaluate(([css, keys, red]) => {
    if (!document.getElementById('et-css')) { const s = document.createElement('style'); s.id = 'et-css'; s.textContent = css; document.head.appendChild(s) }
    document.querySelectorAll('#schedBoard .et-miss').forEach(e => e.classList.remove('et-miss', 'et-red'))
    let items = 0
    for (const k of keys) {
      const els = [...document.querySelectorAll(`#schedBoard input[data-bfld="${k}"]`)].filter(e => e.value.trim() === '')
      if (els.length) items++
      els.forEach(e => { e.classList.add('et-miss'); if (red) e.classList.add('et-red') })
    }
    /* the count: one per item; SXO's two boxes are one item */
    window.__etItems = items
  }, [PROPOSED_CSS, missKeys(ri), red])
  const n = await p.evaluate(di => {
    const seen = new Set(); document.querySelectorAll('#schedBoard input.et-miss').forEach(e => seen.add(e.getAttribute('data-bfld').replace(/\.(str|end|to|ld)$/, '')))
    return seen.size
  }, DI)
  const st = await p.evaluate(n => {
    const s = document.querySelector('#sbSignBar .so-state'); if (!s) return null
    if (!s.dataset.etOrig) s.dataset.etOrig = s.innerHTML
    s.innerHTML = (n ? `<span class="et-n">${n} ${n === 1 ? 'item' : 'items'} missing a time</span> · ` : '') + s.dataset.etOrig
    s.classList.toggle('et-has', !!n)
    return s.textContent
  }, n)
  return { n, st }
}

/* a picture of the board row holding a box: the nearest box around it as wide as most of its section */
async function rowShot(p, sz, file, key, pad = 6) {
  const r = await p.evaluate(k => {
    const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 }
    const el = [...document.querySelectorAll(`#schedBoard input[data-bfld="${k}"]`)].filter(vis)[0]; if (!el) return null
    el.scrollIntoView({ block: 'center', inline: 'nearest' })
    const sec = el.closest('.sb-sec') || document.getElementById('schedBoard'); const sw = sec.getBoundingClientRect().width
    let row = el; while (row.parentElement && row.getBoundingClientRect().width < sw * 0.8) row = row.parentElement
    const b = row.getBoundingClientRect(), s = sec.getBoundingClientRect()
    return { x: s.left, w: s.width, y: b.top, h: b.height }
  }, key)
  if (!r) throw new Error(file + ': no visible box ' + key)
  await K.wait(p, 250)
  const again = await p.evaluate(k => { const el = [...document.querySelectorAll(`#schedBoard input[data-bfld="${k}"]`)].filter(e => e.getBoundingClientRect().width > 0)[0]
    const sec = el.closest('.sb-sec') || document.getElementById('schedBoard'); const sw = sec.getBoundingClientRect().width
    let row = el; while (row.parentElement && row.getBoundingClientRect().width < sw * 0.8) row = row.parentElement
    const b = row.getBoundingClientRect(), s = sec.getBoundingClientRect(); return { x: s.left, w: s.width, y: b.top, h: b.height } }, key)
  const vw = sz.opts.viewport.width, vh = sz.opts.viewport.height
  const x = Math.max(0, again.x), y = Math.max(0, again.y - pad)
  await p.screenshot({ path: join(IMG, `${file}-${sz.name}.png`), clip: { x, y, width: Math.min(vw - x, again.w), height: Math.min(vh - y, again.h + pad * 2) } })
  K.log('  picture', `${file}-${sz.name}.png`)
}
async function wideShot(p, sz, file, sel) {
  await p.evaluate(s => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'start' }); const sb = document.getElementById('schedBoard'); if (sb) { } }, sel)
  await K.wait(p, 300)
  await p.screenshot({ path: join(IMG, `${file}-${sz.name}.png`) })
  K.log('  picture', `${file}-${sz.name}.png`)
}
async function frames(p, sz, ri, which) {
  await K.neutral(p)
  if (which === 'ab') {
    let r = await propose(p, ri, false); K.fact('a', sz.name, 'count / status', r)
    await wideShot(p, sz, 'board-a-wide', '#sbSignBar')
    for (const [f, k] of [['board-a-flying', `ff:${DI}.0.0.to`], ['board-a-duty', `dr:${DI}.0.1.str`], ['board-a-sims', `sr:${DI}.oft.0.str`], ['board-a-prog', `ap:${DI}.${ri}.end`]]) await rowShot(p, sz, f, k)
    r = await propose(p, ri, true); K.fact('b', sz.name, 'count / status', r)
    await wideShot(p, sz, 'board-b-wide', '#sbSignBar')
    for (const [f, k] of [['board-b-flying', `ff:${DI}.0.0.to`], ['board-b-duty', `dr:${DI}.0.1.str`], ['board-b-sims', `sr:${DI}.oft.0.str`], ['board-b-prog', `ap:${DI}.${ri}.end`]]) await rowShot(p, sz, f, k)
  } else {
    const r = await propose(p, ri, true); K.fact('c', sz.name, 'count / status', r)
    const m = await p.evaluate(k => { const e = [...document.querySelectorAll(`#schedBoard input[data-bfld="${k}"]`)].filter(x => x.getBoundingClientRect().width > 0)[0]; const cs = getComputedStyle(e)
      return { value: e.value, aln: e.getAttribute('data-aln'), title: e.title, outline: cs.outlineStyle + ' ' + cs.outlineColor + ' ' + cs.outlineOffset, shadow: cs.boxShadow, cls: e.className } }, `dr:${DI}.0.1.end`)
    K.fact('c', sz.name, 'the emptied SXO END', m)
    await K.hideNote(p)   // Publish day's passing note, which would cover the board
    await wideShot(p, sz, 'board-c-wide', '#sbSignBar')
    /* and the duties around the emptied box, for context */
    await p.evaluate(k => { const e = [...document.querySelectorAll(`#schedBoard input[data-bfld="${k}"]`)].filter(x => x.getBoundingClientRect().width > 0)[0]; e.scrollIntoView({ block: 'center' }) }, `dr:${DI}.0.1.end`)
    await K.wait(p, 300); await p.screenshot({ path: join(IMG, `board-c-wide-duties-${sz.name}.png`) }); K.log('  picture', `board-c-wide-duties-${sz.name}.png`)
    await rowShot(p, sz, 'board-c-duty', `dr:${DI}.0.1.end`)
  }
}

/* ---- the desktop: stage, picture, then publish and empty the SXO END, picture, and save each store for the phone ---- */
const d = await K.world('d')
await K.signIn(d.p)
await K.board(d.p, d.sz, DI)
const ri = await stageDraft(d.p)
K.fact('stage', 'desktop', 'boxes on the board', await d.p.evaluate(keys => keys.map(k => k + '=' + [...document.querySelectorAll(`#schedBoard input[data-bfld="${k}"]`)].map(e => JSON.stringify(e.value)).join('/')), missKeys(ri)))
K.fact('stage', 'desktop', 'sign-off bar', K.clean(await d.p.locator('#sbSignBar').innerText()).slice(0, 200))
const ab = await K.saveState(d.ctx, 'endtime-board-ab')
await frames(d.p, d.sz, ri, 'ab')

/* fill the five, sign the four, Publish day, then empty the SXO END in the board's own box */
await d.p.evaluate(([di, ri]) => { const t = window.txtSet
  t(`ff:${di}.0.0.to`, '1245'); t(`dr:${di}.0.1.str`, '0800'); t(`dr:${di}.0.1.end`, '1400'); t(`sr:${di}.oft.0.str`, '0930'); t(`ap:${di}.${ri}.end`, '1600')
  window.afterSchedMutate() }, [DI, ri])
await K.wait(d.p, 600)
for (const k of ['cur', 'sked', 'plan', 'appr']) {
  const sel = d.p.locator(`#sbSignBar select[data-sign="${k}"]`)
  await sel.selectOption(await sel.evaluate(s => s.options[1].value)); await K.wait(d.p, 250)
}
await d.p.locator(`#sbSignBar [data-beak="${DI}"]`).evaluate(b => b.click()); await K.wait(d.p, 900)
K.fact('c', 'desktop', 'after Publish day', K.clean(await d.p.locator('#sbSignBar').innerText()).slice(0, 200))
const end = d.p.locator(`#schedBoard input[data-bfld="dr:${DI}.0.1.end"]`).filter({ visible: true }).first()
await end.evaluate(e => e.scrollIntoView({ block: 'center' })); await end.click(); await d.p.keyboard.press('Control+A'); await d.p.keyboard.press('Backspace'); await d.p.keyboard.press('Enter')
await K.wait(d.p, 600); await K.neutral(d.p); await K.wait(d.p, 300)
K.fact('c', 'desktop', 'after emptying the SXO END', K.clean(await d.p.locator('#sbSignBar').innerText()).slice(0, 200))
const c = await K.saveState(d.ctx, 'endtime-board-c')
await frames(d.p, d.sz, ri, 'c')
errors.push(...d.p.errs); await d.b.close()

/* ---- the phone, on each staged store ---- */
for (const [state, which] of [[ab, 'ab'], [c, 'c']]) {
  const ph = await K.world('p', state)
  await K.signIn(ph.p)
  await K.board(ph.p, ph.sz, DI)
  await frames(ph.p, ph.sz, ri, which)
  errors.push(...ph.p.errs); await ph.b.close()
}
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console or page errors')
