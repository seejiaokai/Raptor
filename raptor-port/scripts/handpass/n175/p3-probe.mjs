// p3-probe - finding controls only (not a case): the Tracker marking window's boxes, and the bell's lines for Saber.
import { mk, closeAll, signIn, go, wait, windowsNow, hit, vis } from './p3-lib.mjs'
const s = await mk('d')
try {
  await signIn(s, 'ad', 'a')
  await hit(s, '#notifyBell', 600)
  console.log('BELL', JSON.stringify(await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line, [data-testid="bell-list"] button')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)))))
  await s.page.keyboard.press('Escape'); await wait(s, 300)
  await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600)
  const id = await s.page.evaluate(() => { for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(); if (r.width < 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 10 || cy < 140 || cx > innerWidth - 10 || cy > innerHeight - 60) continue; const at = document.elementFromPoint(cx, cy); if (at && g.contains(at)) return g.dataset.id } return null })
  const b = await s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox()
  await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 800)
  console.log('WIN', JSON.stringify(await windowsNow(s)))
  console.log('BOXES', JSON.stringify(await s.page.evaluate(() => [...document.querySelectorAll('textarea, input:not([type=hidden]), [contenteditable=true]')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ tag: e.tagName, id: e.id, cls: e.className, ph: e.placeholder, type: e.type, in: e.closest('[role=dialog], .modal, .floatwin, #pop, .airpop')?.id || null })))))
  console.log('LOGOUT', JSON.stringify(await s.page.evaluate(() => { const e = document.querySelector('#logout'); const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t === e ? 'free' : (t.id || t.className) })))
  await s.page.screenshot({ path: 'raptor-port/.tmp/n175/p3/probe-trk.png' })
  void vis
} finally { await s.ctx.close(); await closeAll() }
