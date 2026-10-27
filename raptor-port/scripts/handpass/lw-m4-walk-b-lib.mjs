// M4 walk, walker B (phone) — helpers on top of the host's lib: sized phone contexts, an engine choice (Chromium / WebKit),
// a finger that works in both, the scroll-and-measure helpers. Never edits the host's lib.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
import { webkit, devices } from '@playwright/test'
const L = await import('./lw-m4-lib.mjs')
export { L }
export const { T, OUT, PLAIN, shot, rec, results, writeResults, txt, vis, cellId, apprLines, bellLines } = L
let wk = null
export async function newPhone(width = 402, height = 874, engine = 'chromium') {
  const errs = []
  let ctx, page, cdp = null
  if (engine === 'webkit') {
    wk ||= await webkit.launch()
    ctx = await wk.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent })
    page = await ctx.newPage()
  } else {
    const b = await L.getBrowser()
    ctx = await b.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent })
    page = await ctx.newPage()
    cdp = await ctx.newCDPSession(page)
  }
  const tag = `${engine} ${width}x${height}`
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 220)) })
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} http ${r.status()}: ` + r.url().slice(0, 120)) })
  return { ctx, page, cdp, errs, phone: true, size: 'phone', engine, width, height }
}
export async function closeAll() { await L.closeBrowser(); if (wk) { await wk.close(); wk = null } }
/* a tap at x,y with the quick picture ~100 ms after the lift */
export async function tapAt(w, x, y, quickName = null) {
  if (w.cdp) {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await w.page.waitForTimeout(60)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await w.page.touchscreen.tap(x, y)
  }
  if (quickName) { await w.page.waitForTimeout(90); await shot(w, quickName) }
}
export async function centre(page, sel, scroll = true) {
  const l = page.locator(sel).first()
  if (scroll) await l.scrollIntoViewIfNeeded()
  const b = await l.boundingBox()
  if (!b) throw new Error('no box for ' + sel)
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}
export async function press(w, sel, quickName = null, scroll = true) {
  const c = await centre(w.page, sel, scroll)
  const ok = await w.page.locator(sel).first().evaluate((e, { x, y }) => { const h = document.elementFromPoint(x, y); return !!h && (e === h || e.contains(h)) }, { x: c.x, y: c.y })
  if (!ok) console.log(`   !! the point of ${sel} is covered by something else`)
  await tapAt(w, c.x, c.y, quickName)
  return { ...c, ok }
}
export async function step(w, label, sel, scroll = true) {
  const c = await press(w, sel, label + '-q', scroll)
  await w.page.waitForTimeout(450)
  await shot(w, label)
  return c
}
/* sign in (the lib's signIn works on any page) */
export const signIn = (w, who) => L.signIn(w, who)
export const switchTo = (w, who) => L.switchTo(w, who)
export async function openApprovals(w, pic = null) {
  await press(w, T('lw-tab-approvals'), pic ? pic + '-q' : null)
  await w.page.waitForSelector(T('approvals-page'), { state: 'visible' })
  await w.page.waitForTimeout(500)
  if (pic) await shot(w, pic)
}
export async function openGrid(w) { await press(w, T('lw-tab-grid')); await w.page.waitForTimeout(500) }
export const scrollY = page => page.evaluate(() => Math.round(window.scrollY))
export const tabCount = page => txt(page, T('lw-approvals-count'))
/* the filter rows as drawn: every chip's box, grouped by its top */
export async function filterGeometry(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="approvals-page"]')
    const ids = ['appr-new', 'appr-all', 'appr-pick', 'appr-approve-all']
    const sel = ids.map(i => `[data-testid="${i}"]`).concat(['[data-testid^="appr-m-"]'])
    const els = [...root.querySelectorAll(sel.join(','))].filter(e => e.getBoundingClientRect().height > 0)
    const rows = {}
    const info = els.map(e => {
      const r = e.getBoundingClientRect()
      const sw = e.scrollWidth, cw = e.clientWidth
      const kids = [...e.querySelectorAll('*')].map(k => k.getBoundingClientRect()).filter(k => k.width > 1)
      const maxRight = Math.max(r.left, ...kids.map(k => k.right))
      const texts = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim())
      let tr = null
      if (texts.length) { const rg = document.createRange(); rg.selectNodeContents(e); const rr = rg.getBoundingClientRect(); tr = { l: Math.round(rr.left), r: Math.round(rr.right), h: Math.round(rr.height) } }
      return { id: e.dataset.testid, text: e.innerText.replace(/\s+/g, ' ').trim(), x: Math.round(r.left), r: Math.round(r.right), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), overflowX: sw > cw, contentRight: Math.round(maxRight), textRange: tr, lines: tr && tr.h > 0 ? Math.round(tr.h / (parseFloat(getComputedStyle(e).lineHeight) || 16)) : null }
    })
    for (const i of info) (rows[Math.round(i.y / 8)] ||= []).push(i)
    return { rows: Object.values(rows).map(r => r.sort((a, b) => a.x - b.x)), vw: window.innerWidth }
  })
}
export const sleep = (w, ms) => w.page.waitForTimeout(ms)
