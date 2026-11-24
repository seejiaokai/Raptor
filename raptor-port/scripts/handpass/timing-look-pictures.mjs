/* The ?timing readout — the pictures for his look (chat 167, 24 Nov 26), sharp (2×), each cut to what it is about.
   The Copy-all-refused mock-up (D1625) is the app's own window with only the button's words or one added line changed
   in the page (D1496: a mock-up uses the app's own parts) — A today, B the button "Not copied", C a line under the
   title, B and C together; the words are a fresh Fable's (D2441). From raptor-port/, on a build already made. */
import fs from 'node:fs'
import path from 'node:path'
import { serve, browserOf, fresh, signIn, outsideTime, openBy, openWindow, readout, sleep, ROOT } from './timing-walk-lib.mjs'

const OUT = path.join(ROOT, 'docs/img/handpass/2026-11-24-timing-readout/look')
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true })
const srv = await serve(); const cr = await browserOf()
const DESK2 = { viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 }
const winBox = async (page, pad = 0) => { const w = (await readout(page)).win; return { x: w.x - pad, y: w.y - pad, width: w.w + 2 * pad, height: w.h + 2 * pad } }
const shot = (page, name, clip) => page.screenshot({ path: path.join(OUT, name + '.png'), clip })

/* 1. Copy all refused — four looks of the window's head */
{
  const { ctx, page } = await fresh(cr, DESK2)
  await page.goto(srv.base + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await openBy(page, 'inputs'); await outsideTime(page, 'inputs'); await sleep(800); await openWindow(page)
  const b = await winBox(page)
  const head = { x: b.x, y: b.y, width: b.width, height: 150 }
  await shot(page, 'copy-A-today', head)
  await page.evaluate(() => { const btn = [...document.querySelectorAll('#timingRoot .timingwin button')].find(x => /Copy all/.test(x.textContent)); btn.textContent = 'Not copied'; btn.style.color = 'var(--amber, #e8b04a)'; btn.style.borderColor = 'var(--amber, #e8b04a)' })
  await shot(page, 'copy-B-button', head)
  await page.evaluate(() => { const btn = [...document.querySelectorAll('#timingRoot .timingwin button')].find(x => /Not copied/.test(x.textContent)); btn.textContent = 'Copy all'; btn.style.color = ''; btn.style.borderColor = '' })
  const addLine = () => page.evaluate(() => {
    const ttl = document.querySelector('#timingRoot .timingwin .win-ttl')
    const line = document.createElement('small'); line.id = 'mockLine'
    line.textContent = 'Not copied. Press again, or select the rows and copy them by hand.'
    line.style.cssText = 'display:block;color:var(--amber, #e8b04a);font-weight:600;margin-top:3px'
    ttl.appendChild(line)
  })
  await addLine()
  const b2 = await winBox(page); const head2 = { x: b2.x, y: b2.y, width: b2.width, height: 170 }
  await shot(page, 'copy-C-line', head2)
  await page.evaluate(() => { const btn = [...document.querySelectorAll('#timingRoot .timingwin button')].find(x => /Copy all/.test(x.textContent)); btn.textContent = 'Not copied'; btn.style.color = 'var(--amber, #e8b04a)'; btn.style.borderColor = 'var(--amber, #e8b04a)' })
  await shot(page, 'copy-BC-both', head2)
  await ctx.close()
}

/* 2. W10 — the Leave War built in the background before it was opened: "first time: 0.2 s", no download */
{
  const { ctx, page } = await fresh(cr, DESK2)
  await page.goto(srv.base + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await page.waitForFunction(() => performance.getEntriesByType('resource').some(e => /LeaveWarPage-/.test(e.name)), null, { timeout: 30000 }); await sleep(1500)
  await openBy(page, 'leavewar'); await outsideTime(page, 'leavewar'); await sleep(800); await openWindow(page)
  const r = await readout(page); console.log('W10 rows:', r.rows.map(x => x.label + ' ' + x.tag + ' ' + x.value).join(' | '))
  const b = await winBox(page)
  await shot(page, 'w10-leavewar-first-time', { x: b.x, y: b.y + 90, width: b.width, height: 150 })
  await ctx.close()
}

/* 3. W32 — open at the start, the window over Edit Schedule's Traffic and "+ In-time" (marked) */
{
  const { ctx, page } = await fresh(cr, DESK2)
  await page.goto(srv.base + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await openBy(page, 'editsched'); await outsideTime(page, 'editsched'); await sleep(800); await openWindow(page)
  /* the open window first, unmarked; then folded, the two buttons it stood over marked */
  const wb = (await readout(page)).win
  await shot(page, 'w32-editsched-foot-covered', { x: 766, y: 368, width: 600, height: 400 })
  await page.click('#timingRoot .timingwin .win-x'); await sleep(400)
  const marks = await page.evaluate(w => {
    const out = []
    for (const el of document.querySelectorAll('#page-editsched button, #page-editsched .abtn')) {
      const t = (el.textContent || '').trim()
      if (!/^Traffic$|^\+ In-time$/.test(t)) continue
      const r = el.getBoundingClientRect(); if (!r.width) continue
      if (r.right < w.x || r.left > w.x + w.w || r.bottom < w.y || r.top > w.y + w.h) continue
      out.push(t)
      const m = document.createElement('div')
      m.style.cssText = `position:fixed;left:${r.left - 4}px;top:${r.top - 4}px;width:${r.width + 8}px;height:${r.height + 8}px;border:2px dashed #ff5a5a;border-radius:6px;z-index:2147483647;pointer-events:none`
      document.body.appendChild(m)
    }
    return out
  }, wb)
  console.log('W32 marked (under the open window):', marks.join(', '))
  await shot(page, 'w32-editsched-foot-folded', { x: 766, y: 368, width: 600, height: 400 })
  await ctx.close()
}

await cr.close(); await srv.close()
console.log('pictures in', OUT)
