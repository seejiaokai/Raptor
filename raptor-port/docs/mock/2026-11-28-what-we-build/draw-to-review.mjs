// Chat 196, 28 Nov 26 — the schedule's "To review" in place of Personal Inputs (his D2883, F3: it holds only what is not
// placed — inputs a scheduler rejected, each able to be accepted again; an input already placed carries its own Reject
// on its own row). Drawn on the REAL app (the main folder's build on 127.0.0.1:4181), the Scheduler Board on the demo
// Monday; the page's own parts moved and its own classes used; nothing under raptor-port/src changes.
//   t1  nothing to review: the section is its heading alone; each Ground Programme row that came from an input carries
//       Reject (cloned from today's Personal Inputs button, the same look and words); the line "To take an input off,
//       press Reject on it in Personal Inputs below." goes, its section being gone (D947, D957's words — D2883).
//   t2  one rejected: the Meeting rejected for real by today's Reject; "To review" holds it, open, with today's Accept
//       buttons and today's note on a rejected input; its row has left the Ground Programme.
// Run from raptor-port/ (the main folder's, for playwright): node <this file> --size d|p [--url http://127.0.0.1:4181/]
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const VERSION = 'draw-to-review v1.0 (28 Nov 26, chat 196)'
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d }
const SIZE = arg('size', 'd'), URL = arg('url', 'http://127.0.0.1:4181/'), PHONE = SIZE === 'p'
const HERE = path.dirname(fileURLToPath(import.meta.url)), IMG = path.join(HERE, 'img')
mkdirSync(IMG, { recursive: true })
const PW = createRequire(process.cwd() + '/package.json')('playwright')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const CSS = `.rd-new{outline:2px dashed #FFD23F !important;outline-offset:2px}
.rd-tag{position:fixed;z-index:2147483647;background:#FFD23F;color:#15171c;font:800 11px/17px system-ui,sans-serif;padding:0 6px;border-radius:9px;pointer-events:none;box-shadow:0 0 0 1px #15171c;white-space:nowrap}
.rv-none{color:var(--ink-3,#8b95a7);font-weight:500;letter-spacing:0;text-transform:none;margin-left:8px}`

/* in the page: the board's Personal Inputs becomes "To review" (rejected rows only), and Reject joins each placed row */
function transform(mode) {
  const vis = e => e && e.getBoundingClientRect().width > 0
  const panels = [...document.querySelectorAll('#sbBoard .sb-panel')]
  const gp = panels.find(p => p.classList.contains('grnd')), pi = panels.find(p => p.classList.contains('pinp'))
  if (!gp || !pi) return { err: 'no panels' }
  gp.id = 'rvGround'; pi.id = 'rvReview'
  /* Ground Programme: the pointer line to Personal Inputs goes */
  gp.querySelectorAll('.sb-pinote').forEach(n => n.remove())
  /* each Ground row that came from an input: today's Reject, cloned, before its CX */
  const proto = pi.querySelector('.accb.undo')
  const kinds = [...pi.querySelectorAll('.inprow')].filter(r => r.querySelector('.accb.undo')).map(r => ({ kind: (r.querySelector('.inpedit, .sbi-ty')?.textContent || '').trim().toLowerCase(), who: (r.querySelector('.puck')?.textContent || '').replace(/\s+/g, '') }))
  let added = 0
  for (const row of gp.querySelectorAll('.sb-arow, .sb-grow, .c6r')) {
    const name = (row.querySelector('input, textarea, .ain')?.value || row.querySelector('.ain')?.textContent || '').trim().toLowerCase()
    const who = (row.querySelector('.puck')?.textContent || '').replace(/\s+/g, '')
    if (!kinds.some(k => k.kind === name && who.includes(k.who.replace(/[A-Z]$/, '').slice(0, 4)))) continue
    /* today's Reject button, cloned, on the row's puck line — where a phone already puts an accepted input's Reject
       (D944, D947: "accup") and where the desktop's people column has room — so the row grows no taller; its ✕ stays
       as built (today it already takes an input's row off as a Reject: board.ts, the grdel route, D1388) */
    const ppl = row.querySelector('.ppl'); if (!ppl || !proto) continue
    const b = proto.cloneNode(true); b.removeAttribute('data-acck'); b.classList.add('rv-rej')
    Object.assign(b.style, { marginLeft: '10px', alignSelf: 'center', flex: 'none' })
    ppl.style.display = 'flex'; ppl.style.alignItems = 'center'; ppl.style.flexWrap = 'nowrap'
    ppl.appendChild(b); added++
  }
  /* Personal Inputs → "To review": its heading renamed; only what is not placed stays */
  const ph = pi.querySelector('.sb-ph'); const grip = ph.querySelector('.sb-grip, .grip')
  const rows = [...pi.querySelectorAll('.inprow')]
  const waiting = rows.filter(r => !r.querySelector('.accb.undo'))
  rows.filter(r => r.querySelector('.accb.undo')).forEach(r => r.remove())
  for (const n of ph.childNodes) if (n.nodeType === 3 && /Personal Inputs/.test(n.textContent)) n.textContent = n.textContent.replace('Personal Inputs', 'To review')
  /* nothing waiting: the heading alone, folded as Personal Inputs folds today, its small words saying so */
  if (!waiting.length) {
    pi.querySelector('.sb-pb')?.remove()
    const sub = ph.querySelector('.sub'); if (sub) sub.textContent = 'none'
    ph.classList.remove('pl-fold'); ph.removeAttribute('data-pitog')
  }
  /* a waiting row's Accept buttons wrap inside their cell rather than run past the panel's edge */
  pi.querySelectorAll('.inprow .lctl, .inprow .accs').forEach(c => { c.style.flexWrap = 'wrap'; c.style.rowGap = '4px'; c.style.justifyContent = 'flex-end' })
  return { added, waiting: waiting.length, kinds }
}
async function mark(p, list) {
  await p.evaluate(list => {
    document.querySelectorAll('.rd-tag').forEach(t => t.remove()); document.querySelectorAll('.rd-new').forEach(e => e.classList.remove('rd-new'))
    for (const [sel, text] of list) {
      const es = [...document.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().width > 0)
      es.forEach((e, i) => {
        e.classList.add('rd-new'); if (i) return
        const r = e.getBoundingClientRect(), t = document.createElement('span'); t.className = 'rd-tag'; t.textContent = text; document.body.appendChild(t)
        t.style.left = Math.max(2, r.left - t.getBoundingClientRect().width - 6) + 'px'; t.style.top = Math.max(2, r.top + r.height / 2 - 9) + 'px'
      })
    }
  }, list)
}
async function shot(p, name, sels, maxH) {
  await sleep(300)
  await p.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'start' }), sels[0]); await sleep(300)
  const box = await p.evaluate(([sels, maxH]) => {
    const rs = sels.map(s => document.querySelector(s)).filter(Boolean).map(e => e.getBoundingClientRect())
    const pad = 8, x = Math.max(0, Math.min(...rs.map(r => r.left)) - pad), y = Math.max(0, Math.min(...rs.map(r => r.top)) - pad)
    const bottom = Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + pad, maxH ? y + maxH : 1e9)
    return { x, y, width: Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + pad) - x, height: bottom - y }
  }, [sels, maxH])
  const file = `${name}-${PHONE ? 'phone' : 'desktop'}.png`
  await p.screenshot({ path: path.join(IMG, file), clip: box })
  console.log('  picture', file, Math.round(box.width) + 'x' + Math.round(box.height))
}

const browser = await PW.chromium.launch()
const ctx = await browser.newContext(PHONE ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1536, height: 1100 }, deviceScaleFactor: 2 })
const errs = []
const p = await ctx.newPage(); p.setDefaultTimeout(15000)
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)) })
async function board() {
  await p.goto(URL); await p.waitForSelector('#luser')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day'); await sleep(800)
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await p.evaluate(() => window.go('editsched')); await sleep(1500)
  await p.evaluate(() => document.querySelector('#eWeek .day[data-day="0"] [data-sbday="0"]')?.click()); await sleep(1500)
  await p.addStyleTag({ content: CSS })
  const head = p.locator('#sbBoard .sb-panel.pinp [data-pitog]').first()
}
async function openPI() {
  const head = p.locator('#sbBoard .sb-panel.pinp [data-pitog]').first()
  if (await head.count() && !(await p.locator('#sbBoard .sb-panel.pinp .inprow').count())) { await head.click(); await sleep(500) }
}
try {
  console.log(VERSION, PHONE ? 'phone' : 'desktop')
  /* t1 — nothing to review */
  await board(); await openPI()
  let r = await p.evaluate(transform, 't1'); console.log('t1', JSON.stringify(r))
  /* on a phone the two parts are two pictures, each marked with its own number only */
  if (PHONE) {
    await mark(p, [['.rv-rej', '2']]); await shot(p, 't1-ground', ['#rvGround'], 560)
    await mark(p, [['#rvReview .sb-ph', '1']]); await shot(p, 't1-review', ['#rvReview'])
  } else { await mark(p, [['#rvReview .sb-ph', '1'], ['.rv-rej', '2']]); await shot(p, 't1-none', ['#rvGround', '#rvReview']) }
  await mark(p, [])
  if (PHONE) { await shot(p, 't1-ground-clean', ['#rvGround'], 560); await shot(p, 't1-review-clean', ['#rvReview']) } else await shot(p, 't1-none-clean', ['#rvGround', '#rvReview'])
  /* t2 — the Meeting rejected, for real, by today's Reject under Personal Inputs */
  await board(); await openPI()
  const rej = p.locator('#sbBoard .sb-panel.pinp .inprow').filter({ hasText: 'Meeting' }).locator('.accb.undo').first()
  await rej.scrollIntoViewIfNeeded(); if (PHONE) await rej.tap(); else await rej.click(); await sleep(900)
  if (!(await p.locator('#sbBoard .sb-panel.pinp .inprow').count())) { const head = p.locator('#sbBoard .sb-panel.pinp [data-pitog]').first(); await head.click(); await sleep(500) }
  r = await p.evaluate(transform, 't2'); console.log('t2', JSON.stringify(r))
  await mark(p, [['#rvReview', '1']])
  if (PHONE) { await shot(p, 't2-review', ['#rvReview']) } else await shot(p, 't2-one', ['#rvGround', '#rvReview'])
  await mark(p, [])
  if (PHONE) { await shot(p, 't2-review-clean', ['#rvReview']) } else await shot(p, 't2-one-clean', ['#rvGround', '#rvReview'])
  console.log('DONE', VERSION)
} catch (e) { console.log('FAILED', e.message.split('\n')[0]) }
finally { console.log('errors:', errs.length, errs.slice(0, 5)); await browser.close() }
