// [CAL-MONTH-YEAR-JUMP] (his D1560, 1 Nov 26): "can the inputs and sans calendar page have an option to click on for e.g
// July 2027 and this month and year box appears? For faster navigation." Drawn on the real Inputs calendar (and the SANS
// calendar's title), at his iPhone's 402 x 874 (WebKit, 3x) and a 1536 desktop (Chromium, 1x):
//   real   — Edit Schedule's "Jump to a date" window, its title tapped, the wheels turned to July 2027: the app's own
//            month-and-year wheels, whose markup is then copied (outerHTML, the wheels' scroll kept) into the drawings.
//   today  — the Inputs calendar on JUL 2027; a tap on the title is tried and the script reports what it did.
//   signal — the title gains the small cyan ▾ the app's calendar title wears ("July 2026 ▾" in Jump to a date).
//   A      — a tap opens the app's own floating calendar (the one over a date box) straight onto its wheels: in the
//            middle of the screen on a phone, under the title on a desktop (recommended).
//   B      — a tap swaps the month's days for the wheels in place, as Jump to a date's own title does.
// Everything new is a copy of a real part; nothing in the app changes. Run from raptor-port/:
//   node docs/img/mock/2026-11-02-year/cal-jump.mjs
import path from 'node:path'
import { open, clip, compose, neutral, sleep, OUT } from './lib.mjs'

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const shots = {}
const ARROW = (P) => P.evaluate(() => {
  /* the ▾ as the app's calendar title draws it (26-date-calendar.css .dcal-title i): cyan, 14px, its own 10px room */
  for (const t of document.querySelectorAll('#inpCal .ic-mon, [data-testid="sc-month"]')) {
    if (t.querySelector('.ymock-v')) continue
    const i = document.createElement('i'); i.className = 'ymock-v'; i.setAttribute('aria-hidden', 'true'); i.textContent = '▾'
    i.style.cssText = 'font-style:normal;font-size:14px;line-height:1;color:var(--accent);margin-left:4px;display:inline-block;width:10px;text-align:center'
    /* the words and their arrow in one piece (as the app's title holds them, .dcal-tw), so the desktop's reserved room
       (a grid holding every month's name) keeps them on one line */
    const txts = [...t.childNodes].filter(n => n.nodeType === 3)
    const w = document.createElement('span'); w.className = 'ymock-w'; w.style.cssText = 'white-space:nowrap'
    t.insertBefore(w, txts[0]); txts.forEach(n => w.appendChild(n)); w.appendChild(i)
    t.style.outline = '2px dashed #ffd400'; t.style.outlineOffset = '2px'
  }
  const t = document.querySelector('#inpCal .ic-mon') || document.querySelector('[data-testid="sc-month"]')
  const r = t.getBoundingClientRect(), a = t.querySelector('.ymock-v').getBoundingClientRect()
  return { titleW: Math.round(r.width), arrowRight: Math.round(a.right), titleRight: Math.round(r.right), clipped: t.scrollWidth > t.clientWidth + 0.5 || a.right > r.right + 0.5 }
})

for (const dev of ['phone', 'desk']) {
  const { b, P } = await open(dev)
  // 1. THE REAL WHEELS — Edit Schedule's Jump to a date, title tapped, turned to July 2027
  await P.evaluate(() => { const bs = [...document.querySelectorAll('[aria-label="Jump to a date"]')].filter(e => e.tagName === 'BUTTON' && e.getBoundingClientRect().width > 0); bs[0].click() })
  await P.waitForSelector('#weekCal [data-testid="wcal-title"]')
  await P.click('[data-testid="wcal-title"]'); await P.waitForSelector('[data-testid="wcal-lists"]'); await sleep(400)
  await P.click('#wcal-years-o2027'); await sleep(900)
  await P.evaluate(() => {
    const at = document.querySelector('[data-testid="wcal-months"] [aria-selected="true"]')
    const n = +at.id.replace(/^.*-o/, '')
    const cands = [...document.querySelectorAll('[data-testid="wcal-months"] .dcal-opt')].filter(o => o.textContent === 'July')
    cands.sort((x, y) => Math.abs(+x.id.replace(/^.*-o/, '') - n) - Math.abs(+y.id.replace(/^.*-o/, '') - n))
    cands[0].click()
  })
  await sleep(1300)
  const real = await P.evaluate(() => {
    const d = document.querySelector('#weekCal .dcal')
    return { html: d.outerHTML, tops: [...d.querySelectorAll('.dcal-col')].map(c => c.scrollTop), title: d.querySelector('.dcal-title').textContent.trim(), at: [...d.querySelectorAll('.dcal-opt.is-at')].map(o => o.textContent).join(' ') }
  })
  console.log(dev, 'real wheels:', real.title, '| chosen rows:', real.at)
  await neutral(P)
  const box = await P.evaluate(() => { const r = document.querySelector('#weekCal .airpop-box').getBoundingClientRect(); return { x: r.left - 1, y: r.top - 1, w: r.width + 2, h: r.height + 2 } })
  shots[`${dev}-real`] = await clip(P, `${dev}-real-jump.png`, box)
  await P.click('#weekCal .x'); await sleep(300)

  // 2. THE INPUTS CALENDAR ON JUL 2027
  await P.evaluate(() => window.go('inputs')); await P.waitForSelector('#icNext'); await sleep(500)
  if (!(await P.$('#inpCal .ib-grid'))) { await P.click('#inCalBtn'); await sleep(500) }
  const at = async () => { const [m, y] = (await P.getAttribute('#inpCal .ic-mon', 'aria-label')).toUpperCase().split(/\s+/); return +y * 12 + MON.findIndex(x => m.startsWith(x)) }
  for (let d = 2027 * 12 + 6 - await at(); d > 0; d--) { await P.click('#icNext'); await sleep(120) }
  for (let d = 2027 * 12 + 6 - await at(); d < 0; d++) { await P.click('#icPrev'); await sleep(120) }
  await sleep(500)
  // the premise: a tap on the title today
  const before = await P.evaluate(() => ({ title: document.querySelector('#inpCal .ic-mon').textContent, tag: document.querySelector('#inpCal .ic-mon').tagName, dialogs: document.querySelectorAll('[role="dialog"]').length }))
  await P.click('#inpCal .ic-mon'); await sleep(500)
  const after = await P.evaluate(() => ({ title: document.querySelector('#inpCal .ic-mon').textContent, dialogs: document.querySelectorAll('[role="dialog"]').length }))
  console.log(dev, 'today, a tap on the title:', JSON.stringify(before), '->', JSON.stringify(after))
  await P.evaluate(() => window.scrollTo(0, 0)); await neutral(P); await sleep(200)
  const frame = await P.evaluate((dev) => {
    const top = document.querySelector('#inMemberMode').getBoundingClientRect().top - 8
    return dev === 'phone' ? { x: 0, y: top, w: 402, h: 560 } : { x: 0, y: top, w: 1300, h: 520 }
  }, dev)
  shots[`${dev}-today`] = await clip(P, `${dev}-inputs-today.png`, frame)
  // 3. THE SIGNAL: ▾ after the title
  const fit = await ARROW(P)
  console.log(dev, 'title with ▾:', JSON.stringify(fit))
  await neutral(P)
  shots[`${dev}-signal`] = await clip(P, `${dev}-inputs-signal.png`, frame)
  // the title's open look while the wheels are out (26-date-calendar.css .dcal-title.is-open: the words cyan)
  await P.evaluate(() => { const t = document.querySelector('#inpCal .ic-mon'); t.style.color = 'var(--accent)' })

  // 4. A — THE APP'S FLOATING CALENDAR, OPENED ON ITS WHEELS
  await P.evaluate(({ html, tops, phone }) => {
    const layer = document.createElement('div'); layer.className = 'dcal-layer' + (phone ? ' is-phone' : ''); layer.id = 'ymockA'
    layer.innerHTML = '<div class="dcal-scrim"></div><div class="dcal-card" role="dialog">' + html + '</div>'
    document.body.appendChild(layer)
    const card = layer.querySelector('.dcal-card')
    if (!phone) { const t = document.querySelector('#inpCal .ic-mon').getBoundingClientRect(); const nav = document.querySelector('#inpCal .ic-nav').getBoundingClientRect(); card.style.left = (nav.left) + 'px'; card.style.top = (nav.bottom + 6) + 'px' }
    card.style.outline = '2px dashed #ffd400'; card.style.outlineOffset = '3px'
    layer.querySelectorAll('.dcal-col').forEach((c, i) => { c.scrollTop = tops[i] })
  }, { html: real.html, tops: real.tops, phone: dev === 'phone' })
  await sleep(300)
  await P.evaluate((tops) => document.querySelectorAll('#ymockA .dcal-col').forEach((c, i) => { c.scrollTop = tops[i] }), real.tops)
  const aCheck = await P.evaluate(() => [...document.querySelectorAll('#ymockA .dcal-opt.is-at')].map(o => o.textContent).join(' ') + ' | band rows: ' + [...document.querySelectorAll('#ymockA .dcal-col')].map(c => { const band = document.querySelector('#ymockA .dcal-band').getBoundingClientRect(); const mid = (band.top + band.bottom) / 2; const o = [...c.querySelectorAll('.dcal-opt')].find(o => { const r = o.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid }); return o?.textContent }).join(' '))
  console.log(dev, 'A shows:', aCheck)
  shots[`${dev}-A`] = await clip(P, `${dev}-inputs-A.png`, dev === 'phone' ? { x: 0, y: frame.y, w: 402, h: 874 - frame.y } : frame)
  await P.evaluate(() => document.getElementById('ymockA').remove())

  // 5. B — THE WHEELS IN PLACE OF THE MONTH'S DAYS
  await P.evaluate(({ html, tops }) => {
    const cal = document.getElementById('inpCal')
    const hide = [...cal.children].filter(c => !c.classList.contains('ib-top'))
    hide.forEach(c => { c.dataset.ymock = '1'; c.style.display = 'none' })
    const wrap = document.createElement('div'); wrap.id = 'ymockB'; wrap.innerHTML = html
    const d = wrap.firstElementChild
    d.querySelector('.dcal-hd').remove()  // the page's own title is the title here
    wrap.style.cssText = 'max-width:350px;padding:8px 8px 0;outline:2px dashed #ffd400;outline-offset:2px;margin:6px 0 0 6px'
    cal.appendChild(wrap)
    wrap.querySelectorAll('.dcal-col').forEach((c, i) => { c.scrollTop = tops[i] })
  }, { html: real.html, tops: real.tops })
  await sleep(300)
  await P.evaluate((tops) => document.querySelectorAll('#ymockB .dcal-col').forEach((c, i) => { c.scrollTop = tops[i] }), real.tops)
  shots[`${dev}-B`] = await clip(P, `${dev}-inputs-B.png`, frame)
  await P.evaluate(() => { document.getElementById('ymockB').remove(); document.querySelectorAll('[data-ymock]').forEach(c => { c.style.display = ''; delete c.dataset.ymock }) })

  // 6. THE SANS CALENDAR'S TITLE — the same signal
  if (dev === 'phone') {
    await P.click('#inSansMode'); await P.waitForSelector('[data-testid="sanscal"]'); await sleep(400)
    const sat = async () => { const [m, y] = (await P.getAttribute('[data-testid="sc-month"]', 'aria-label')).toUpperCase().split(/\s+/); return +y * 12 + MON.findIndex(x => m.startsWith(x)) }
    for (let d = 2027 * 12 + 6 - await sat(); d > 0; d--) { await P.click('[data-testid="sc-next"]'); await sleep(120) }
    for (let d = 2027 * 12 + 6 - await sat(); d < 0; d++) { await P.click('[data-testid="sc-prev"]'); await sleep(120) }
    await sleep(400); await P.evaluate(() => window.scrollTo(0, 0)); await neutral(P)
    const sf = await P.evaluate(() => { const top = document.querySelector('#inMemberMode').getBoundingClientRect().top - 8; return { x: 0, y: top, w: 402, h: 170 } })
    shots['phone-sans-today'] = await clip(P, 'phone-sans-today.png', sf)
    console.log('sans title with ▾:', JSON.stringify(await ARROW(P)))
    await neutral(P)
    shots['phone-sans-signal'] = await clip(P, 'phone-sans-signal.png', sf)
  }
  await b.close()
}

const PW = 402
await compose(path.join(OUT, 'cal-1-phone.png'), {
  title: 'Inputs calendar on the iPhone — a tap on "JUL 2027" opens the month and year wheels',
  sub: 'Today the title is plain words: a tap on it does nothing. The ▾ (dashed yellow) is the small arrow the app\'s calendar title already wears in Jump to a date. The wheels in A and B are a copy of Jump to a date\'s own, turned to July 2027.',
  items: [
    { tag: 'Today', src: shots['phone-today'], w: PW },
    { tag: 'The title says it opens', cap: 'JUL 2027 ▾', src: shots['phone-signal'], w: PW },
    { tag: 'A (recommended)', cap: 'the app\'s floating calendar, on its wheels', src: shots['phone-A'], w: PW },
    { tag: 'B', cap: 'the wheels in place of the days', src: shots['phone-B'], w: PW },
  ], dpr: 3, colW: PW,
})
await compose(path.join(OUT, 'cal-2-desktop.png'), {
  title: 'Inputs calendar on a desktop (1536 wide)',
  items: [
    { tag: 'Today', src: shots['desk-today'], w: 1100 },
    { tag: 'A (recommended)', cap: 'the floating calendar under the title, on its wheels', src: shots['desk-A'], w: 1100 },
    { tag: 'B', cap: 'the wheels in place of the days', src: shots['desk-B'], w: 1100 },
  ], dpr: 1, stack: true,
})
await compose(path.join(OUT, 'cal-3-real-and-sans.png'), {
  title: 'The part reused, and the SANS calendar',
  sub: 'Left: Edit Schedule\'s Jump to a date today, its title tapped — the real wheels the drawings copy. Right: the SANS calendar\'s title, today and with the same ▾.',
  items: [
    { tag: 'Jump to a date (real)', src: shots['phone-real'], w: PW },
    { tag: 'SANS today', src: shots['phone-sans-today'], w: PW },
    { tag: 'SANS with ▾', src: shots['phone-sans-signal'], w: PW },
  ], dpr: 3, colW: PW,
})
