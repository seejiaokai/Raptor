/* The night of 26–27 Oct 26, job 2 — [TRK-PINCH-MORE-EDGES] (1) with real fingers on a phone (CDP touch): two fingers
   pinch the chart out, a third lands, the first lifts, and the pair left moves a tenth wider — the zoom carries on from
   what the pinch reached (about a tenth more), never jumping to the bottom. A PASS means correct. VERSION 1
     HP_URL  the preview serving THIS checkout's dist (required) */
import { open, PHONE } from './trk-lib.mjs'
import { touchCdp } from './trk-pinch.mjs'
console.log('trk-pinch-1027-walk v1 -', process.env.HP_URL)
const { browser, page, errors } = await open({ size: PHONE, touch: true })
const shot = async n => { const f = `${process.env.HP_SHOTS}/${n}.png`; await page.screenshot({ path: f }); return n + '.png' }
const pct = () => page.evaluate(() => +((document.getElementById('fzPct')?.textContent || '').replace('%', '')))
const res = []
try {
  await page.waitForSelector('#board .flowwrap', { timeout: 15000 })
  const r = await page.evaluate(() => { const b = document.getElementById('board').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })
  const cdp = await touchCdp(page)
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(p => ({ x: p.x, y: p.y, id: p.id })) })
  const before = await pct()
  const p1 = { x: r.x - 50, y: r.y, id: 1 }, p2 = { x: r.x + 50, y: r.y, id: 2 }
  await T('touchStart', [p1, p2]); await page.waitForTimeout(40)
  for (let i = 1; i <= 10; i++) { p1.x = r.x - 50 - 5 * i; p2.x = r.x + 50 + 5 * i; await T('touchMove', [p1, p2]); await page.waitForTimeout(16) }  /* 100 → 200 apart */
  const p3 = { x: p2.x + 20, y: r.y, id: 3 }
  await T('touchStart', [p1, p2, p3]); await page.waitForTimeout(60)          /* a third finger lands, 20 beside the second */
  const s1 = await shot('n27-trk-three-fingers')
  await T('touchEnd', [p2, p3]); await page.waitForTimeout(60)                 /* the first lifts: the pair is 2 and 3 */
  for (let i = 1; i <= 4; i++) { p3.x += 0.5; await T('touchMove', [p2, p3]); await page.waitForTimeout(16) }   /* 20 → 22 apart: a tenth wider */
  await T('touchEnd', []); await page.waitForTimeout(500)
  const after = await pct()
  const s2 = await shot('n27-trk-after')
  const reachedGuess = before * 2
  const ok = after >= Math.min(300, reachedGuess) * 0.95 && after <= Math.min(300, reachedGuess * 1.1) * 1.05 + 1
  res.push({ ok, line: `zoom ${before}% → two fingers twice as far apart → a third finger, the first lifts, the pair a tenth wider → ${after}% (expected about ${Math.min(300, Math.round(reachedGuess * 1.1))}%, never a jump down)  [${s1}, ${s2}]` })
} catch (e) { res.push({ ok: false, line: 'threw: ' + String(e.message).split('\n')[0] }) }
for (const r of res) console.log(`${r.ok ? 'PASS' : 'FAIL'}  P9  ${r.line}`)
if (errors.length) console.log('FAIL  errors', JSON.stringify(errors.slice(0, 3)))
console.log(`trk-pinch-1027-walk: ${res.filter(r => r.ok).length} PASS, ${res.filter(r => !r.ok).length + (errors.length ? 1 : 0)} FAIL`)
await browser.close()
process.exit(res.every(r => r.ok) && !errors.length ? 0 : 1)
