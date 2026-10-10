import { launch, open, openDay, file, shot, cardFacts, toList, overflow, press, judge, saveRows, DAYWIN, WIN, rec, errs } from './icard-A-lib.mjs'
const browser = await launch()
const TITLE = 'Squadron family day and open house visit' // 39
const LONGTITLE = 'ABCDEFGHIJ KLMNOPQRST UVWXYZ0123 456 END' // 40
let REMARK = ('Bring boots, water, the signed forms and the spare keys for the hangar, then check in with the duty desk and wait for the briefing officer to arrive with the list. ').repeat(2)
REMARK = REMARK.slice(0, 200 - 'END OF REMARK'.length - 1) + ' END OF REMARK'
console.log('title len', LONGTITLE.length, 'remark len', REMARK.length)

/* geometry of one card: do the words collide with the hours/by/late? */
const geom = (p, sel) => p.locator(sel).first().evaluate(c => {
  const q = s => c.querySelector(s)
  const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) } }
  const hit = (a, b) => !!a && !!b && a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5
  const parts = {}
  for (const k of ['who', 'kind', 'when', 'late', 'title', 'rmk', 'by']) parts[k] = r(c.querySelector(`[data-testid$="-${k}"]`))
  const card = r(c)
  const clipped = [...c.querySelectorAll('[data-testid$="-title"], [data-testid$="-rmk"], .icard-words')].map(e => ({ cls: e.className, ov: getComputedStyle(e).overflow, to: getComputedStyle(e).textOverflow, ws: getComputedStyle(e).whiteSpace, sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight }))
  const ov = []
  for (const w of ['title', 'rmk']) for (const o of ['when', 'late', 'by', 'kind', 'who']) if (hit(parts[w], parts[o])) ov.push(w + '/' + o)
  const inside = Object.entries(parts).filter(([k, v]) => v && (v.r > card.r + 0.5 || v.l < card.l - 0.5 || v.b > card.b + 0.5)).map(([k]) => k)
  return { parts, card, ov, inside, clipped, html: c.outerHTML.slice(0, 1800) }
})
const judgeCard = (g, f, name) => {
  const probs = []
  if (f.title !== LONGTITLE) probs.push(`title is "${f.title}"`)
  if ((f.rmk || '').replace(/^[\s·—-]+/, '') !== REMARK) probs.push(`remark text differs: "${(f.rmk || '').slice(-40)}"`)
  if (g.ov.length) probs.push('overlaps: ' + g.ov.join(','))
  if (g.inside.length) probs.push('outside the card: ' + g.inside.join(','))
  const cut = g.clipped.filter(c => c.to === 'ellipsis' || (c.ov !== 'visible' && (c.sh > c.ch + 1 || c.sw > c.cw + 1)))
  if (cut.length) probs.push('clipped: ' + JSON.stringify(cut))
  return probs
}

async function world(vp, touch, tag) {
  const { ctx, page } = await open(browser, vp, 'ad', 'a', touch)
  await openDay(page, '2026-07-18', touch)
  await file(page, touch, '2026-07-18', { type: 'Event', who: 'Saber', start: '06:00', end: '18:00', title: LONGTITLE, rmk: REMARK })
  const r = await rec(page, { type: 'Event', title: LONGTITLE })
  return { ctx, page, r }
}
async function checkDay(page, touch, label, vpTag) {
  await openDay(page, '2026-07-18', touch); await page.waitForTimeout(500)
  const sel = `${DAYWIN} [data-testid^="idy-row-"]`
  const card = page.locator(sel).filter({ hasText: 'END OF REMARK' }).first()
  await card.scrollIntoViewIfNeeded()
  const g = await geom(page, `${sel}:has-text("END OF REMARK")`)
  const facts = (await cardFacts(page, DAYWIN, 'idy')).find(c => c.rmk && c.rmk.includes('END OF REMARK'))
  const pic = await shot(page, `4-${label}-day`)
  const ov = await overflow(page)
  const probs = judgeCard(g, facts, label)
  if (ov.wide) probs.push('page wider than screen ' + ov.sw + '>' + ov.iw)
  console.log('GEOM', label, 'day', JSON.stringify({ card: g.card, parts: g.parts, clipped: g.clipped }))
  return { probs, pic, h: facts.h, g }
}
async function checkList(page, touch, label) {
  await toList(page, touch)
  const sel = '#inList [data-testid^="inl-row-"]'
  const card = page.locator(sel).filter({ hasText: 'END OF REMARK' }).first()
  await card.scrollIntoViewIfNeeded()
  const g = await geom(page, `${sel}:has-text("END OF REMARK")`)
  const facts = (await cardFacts(page, '#inList', 'inl')).find(c => c.rmk && c.rmk.includes('END OF REMARK'))
  const pic = await shot(page, `4-${label}-list`)
  const ov = await overflow(page)
  const probs = judgeCard(g, facts, label)
  if (ov.wide) probs.push('page wider than screen ' + ov.sw + '>' + ov.iw)
  console.log('GEOM', label, 'list', JSON.stringify({ card: g.card, parts: g.parts, clipped: g.clipped }))
  return { probs, pic, g }
}

/* PHONE 390 by touch */
{
  const { ctx, page, r } = await world({ width: 390, height: 844 }, true)
  const d = await checkDay(page, true, '390', '390')
  console.log('HTML', d.g.html)
  const l = await checkList(page, true, '390')
  // undo / redo after the main save
  await page.locator('#undoBtn').tap(); await page.waitForTimeout(400)
  const afterUndo = await rec(page, { type: 'Event', title: LONGTITLE })
  await page.locator('#redoBtn').tap(); await page.waitForTimeout(400)
  const afterRedo = await rec(page, { type: 'Event', title: LONGTITLE })
  const probs = [...d.probs.map(x => 'day: ' + x), ...l.probs.map(x => 'list: ' + x)]
  if (afterUndo) probs.push('Undo did not remove the input'); if (!afterRedo) probs.push('Redo did not bring it back')
  judge(4, 'phone 390', 'admin', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || `day card ${d.g.card.b - d.g.card.t}px high, list ok; Undo removed it, Redo restored it`, [d.pic, l.pic])
  // 320 wide
  await page.setViewportSize({ width: 320, height: 640 }); await page.waitForTimeout(400)
  const l2 = await checkList(page, true, '320')
  const d2 = await checkDay(page, true, '320', '320')
  const p2 = [...d2.probs.map(x => 'day: ' + x), ...l2.probs.map(x => 'list: ' + x)]
  judge(4, 'phone 320', 'admin', p2.length ? 'FAIL' : 'PASS', p2.join(' | ') || `list and day cards intact at 320`, [l2.pic, d2.pic])
  await ctx.close()
}
/* DESKTOP */
{
  const { ctx, page, r } = await world({ width: 1440, height: 900 }, false)
  const d = await checkDay(page, false, 'desk', 'desk')
  await page.locator('#undoBtn').click(); await page.waitForTimeout(400)
  const afterUndo = await rec(page, { type: 'Event', title: LONGTITLE })
  await page.locator('#redoBtn').click(); await page.waitForTimeout(400)
  const afterRedo = await rec(page, { type: 'Event', title: LONGTITLE })
  const probs = d.probs.map(x => 'day: ' + x)
  if (afterUndo) probs.push('Undo did not remove the input'); if (!afterRedo) probs.push('Redo did not bring it back')
  judge(4, 'desktop 1440', 'admin', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || `day card ${d.g.card.b - d.g.card.t}px high; Undo/Redo fine`, [d.pic])
  await ctx.close()
}
await browser.close()
saveRows('s4')
console.log('ERRS', JSON.stringify(errs))
