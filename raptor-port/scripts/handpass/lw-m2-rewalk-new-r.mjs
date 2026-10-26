// M2 re-walk, the "new this morning" looks (23 Oct 26): +LVE label, Settings window width, two-clash phone note, top row at 360/440/600/701,
// and a picture of the Legend's corner rows. Build served at :4265. Pictures: docs/img/handpass/2026-10-23-lw-m2-looks/new-r/
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
console.log('lw-m2-rewalk-new-r v1 :4265')
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-23-lw-m2-looks/new-r'); mkdirSync(OUT, { recursive: true })
const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CH) ? { executablePath: CH } : {})
const URL = 'http://localhost:4265/?fresh=1'
const T = id => `[data-testid="${id}"]`
const results = []; const allErrs = []
const rec = (id, size, verdict, said, pics = []) => { results.push({ id, size, verdict, said, pics }); console.log(`${verdict}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
const SZ = w => w <= 700 ? { viewport: { width: w, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent } : { viewport: { width: w, height: 864 }, deviceScaleFactor: 1 }
async function world(w, who = 'admin', today) {
  const ctx = await browser.newContext(SZ(w)); const page = await ctx.newPage(); const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url().slice(0, 100)) })
  await page.goto(URL); await page.waitForSelector('#luser')
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid^="row-"]'); await page.waitForTimeout(900)
  return { ctx, page, errs, w }
}
const done = async o => { o.errs.forEach(e => allErrs.push(`${o.w}: ${e}`)); await o.ctx.close() }
const shot = (o, name, opts = {}) => o.page.screenshot({ path: path.join(OUT, name + '.png'), ...opts })
const tap = async (o, sel) => { const l = o.page.locator(sel).first(); await l.scrollIntoViewIfNeeded().catch(() => {}); await l.click({ timeout: 4000 }); await o.page.waitForTimeout(350) }

// 1. "+LVE" heading
for (const w of [390, 1536]) {
  const o = await world(w)
  const m = await o.page.evaluate(() => {
    const th = document.querySelector('[data-testid="counter-head"]') || document.querySelector('th.bal'); const nm = th.querySelector('.cname'); const cp = th.querySelector('.cpick')
    const cs = e => { const c = getComputedStyle(e); return { text: e.textContent.trim(), border: c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderBottomWidth + ' ' + c.borderBottomStyle, bg: c.backgroundColor, boxShadow: c.boxShadow, deco: c.textDecorationLine + ' ' + c.textDecorationStyle, radius: c.borderRadius, cursor: c.cursor, after: getComputedStyle(e, '::after').content, before: getComputedStyle(e, '::before').content, bgimg: c.backgroundImage } }
    const r = th.getBoundingClientRect()
    return { th: cs(th), cpick: cs(cp), cname: cs(nm), rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], pointerKids: th.querySelectorAll('button,[role=button]').length }
  })
  const plain = [m.th, m.cpick, m.cname].every(x => /^0px none 0px none$|none/.test(x.border) && x.boxShadow === 'none' && !/underline/.test(x.deco) && (x.bgimg === 'none') && x.after !== '"•"' && x.after === 'none' || x.after === 'normal') && m.cname.text === '+LVE' && m.pointerKids === 0
  const clip = { x: Math.max(0, m.rect[0] - 40), y: Math.max(0, m.rect[1] - 6), width: Math.min(w - Math.max(0, m.rect[0] - 40), 260), height: 70 }
  await shot(o, `lve-head-${w}`, { clip }); await shot(o, `lve-head-page-${w}`)
  rec('+LVE heading', w, plain ? 'PASS' : 'CHECK', JSON.stringify(m), [`lve-head-${w}`, `lve-head-page-${w}`])
  await done(o)
}

// 2. Settings window cannot be dragged sideways
for (const w of [390, 1536]) {
  const o = await world(w)
  await tap(o, T('settings-open')); await o.page.waitForSelector(T('settings-sheet'))
  await o.page.waitForTimeout(500)
  const m = await o.page.evaluate(() => {
    const sh = document.querySelector('[data-testid="settings-sheet"]'); const r = sh.getBoundingClientRect()
    const over = []; for (const e of sh.querySelectorAll('*')) { const b = e.getBoundingClientRect(); if (b.width > 0 && (b.right > r.right + 1 || b.left < r.left - 1)) over.push(`${e.tagName}.${(e.className + '').slice(0, 30)} ${Math.round(b.left)}..${Math.round(b.right)}`) }
    const scrollers = [sh, ...sh.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(e).overflowX)).map(e => `${e.tagName}.${(e.className + '').slice(0, 30)} ${e.scrollWidth}>${e.clientWidth}`)
    const tried = []; for (const e of [sh, ...sh.querySelectorAll('*')]) { if (e.scrollWidth > e.clientWidth + 1) { const before = e.scrollLeft; e.scrollLeft = 50; if (e.scrollLeft !== before) tried.push(`${e.tagName}.${(e.className + '').slice(0, 30)} moved ${e.scrollLeft}`) } }
    return { sheet: [Math.round(r.left), Math.round(r.right), Math.round(r.width)], vw: innerWidth, docSW: document.documentElement.scrollWidth, over: over.slice(0, 8), scrollers, tried }
  })
  await shot(o, `settings-${w}`)
  rec('Settings window width', w, (m.over.length === 0 && m.scrollers.length === 0 && m.tried.length === 0 && m.docSW <= m.vw) ? 'PASS' : 'FAIL', JSON.stringify(m), [`settings-${w}`])
  await done(o)
}

// 3. two clashes on a phone
{
  const o = await world(390)
  await o.page.evaluate(() => { window.raptorRole('admin'); window.lwSetRole('admin') })
  await o.page.evaluate(d => {
    const W = window, di = 5
    W.DAYS[di].ground.push({ prog: 'Range brief', str: '09:00', end: '12:00', who: '', rmks: '' }); W.afterSchedMutate()
    W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, 'bane'); W.afterSchedMutate()
    const g = W.signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    W.setDayApproved(di, true); W.afterSchedMutate()
    if (W.clearToast) W.clearToast()
    W.lwSetCell('plasma', d, 'LL'); W.lwSetCell('bane', d, 'OL')
  }, '2026-07-18')
  await o.page.waitForSelector(T('sync-clashes'), { timeout: 5000 }).catch(() => {})
  await o.page.waitForTimeout(500)
  const read = () => o.page.evaluate(() => {
    const n = document.querySelector('[data-testid="sync-clashes"]'); if (!n) return null; const r = n.getBoundingClientRect(); const card = n.closest('.card-hd')?.parentElement; const c = card?.getBoundingClientRect()
    const line = n.querySelector('[data-testid="clash-line"]'); const lr = line?.getBoundingClientRect(); const bar = document.querySelector('#page-leavewar .filters')?.getBoundingClientRect()
    return { note: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], card: c ? [Math.round(c.left), Math.round(c.width)] : null, vw: innerWidth, lineH: lr ? Math.round(lr.height) : null, text: n.textContent.replace(/\s+/g, ' ').trim().slice(0, 80), barBottom: bar ? Math.round(bar.bottom) : null, sideways: document.documentElement.scrollWidth > innerWidth }
  })
  let m = await read()
  await o.page.evaluate(() => document.querySelector('[data-testid="sync-clashes"]')?.scrollIntoView({ block: 'center' })); await o.page.waitForTimeout(300)
  await shot(o, 'clash-note-closed-390')
  const fullW = m && m.card && m.note[2] >= m.card[1] - 2 && m.note[0] <= m.card[0] + 2
  rec('two clashes: note full-width own line', 390, m && fullW && m.lineH <= 34 && !m.sideways ? 'PASS' : 'FAIL', JSON.stringify(m), ['clash-note-closed-390'])
  await o.page.locator(T('clash-line')).first().tap().catch(() => {}); await o.page.waitForTimeout(500)
  const m2 = await read(); await shot(o, 'clash-note-open-390')
  rec('two clashes: opened list', 390, m2 && !m2.sideways ? 'PASS' : 'FAIL', JSON.stringify(m2), ['clash-note-open-390'])
  await done(o)
}

// 4. top row at 360, 440, 600, 701 (admin and member)
for (const who of ['admin', 'member']) for (const w of [360, 440, 600, 701]) {
  const o = await world(w, who, who === 'member' ? '2026-01-05' : undefined)
  await o.page.evaluate(() => window.scrollTo(0, 0)); await o.page.waitForTimeout(200)
  const m = await o.page.evaluate(() => {
    const ids = ['lw-tab-grid', 'oil-tracker', 'settings-open', 'war-picker', 'my-leave', 'counts-toggle', 'legend-open']
    const boxes = {}; for (const id of ids) { const e = document.querySelector(`[data-testid="${id}"]`); if (e) { const r = e.getBoundingClientRect(); if (r.width > 0) boxes[id] = [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] } }
    // the top row = tab row + view line + grid bar controls
    const off = Object.entries(boxes).filter(([k, b]) => b[0] < -1 || b[2] > innerWidth + 1).map(([k]) => k)
    const ks = Object.keys(boxes); const ov = []
    for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) { const a = boxes[ks[i]], b = boxes[ks[j]]; const ix = Math.min(a[2], b[2]) - Math.max(a[0], b[0]), iy = Math.min(a[3], b[3]) - Math.max(a[1], b[1]); if (ix > 1 && iy > 1) ov.push(`${ks[i]}~${ks[j]}`) }
    const chip = document.querySelector('[data-testid="open-chip"]') || null
    return { boxes, off, ov, sw: document.documentElement.scrollWidth, vw: innerWidth }
  })
  await shot(o, `toprow-${who}-${w}`, { clip: { x: 0, y: 0, width: w, height: 480 } })
  rec('top row', `${who} ${w}`, (m.off.length === 0 && m.ov.length === 0 && m.sw <= m.vw) ? 'PASS' : 'FAIL', JSON.stringify({ off: m.off, ov: m.ov, sw: m.sw, vw: m.vw, boxes: m.boxes }), [`toprow-${who}-${w}`])
  await done(o)
}

// 5. Legend corner rows picture
for (const w of [390, 1536]) {
  const o = await world(w)
  await tap(o, T('legend-open')); await o.page.waitForSelector(T('legend')); await o.page.waitForTimeout(400)
  const info = await o.page.evaluate(() => {
    const leg = document.querySelector('[data-testid="legend"]'); const sec = [...leg.querySelectorAll('.leg-sec')].find(e => /The corner/.test(e.textContent)); sec.scrollIntoView({ block: 'start' })
    const rows = []; let e = sec.nextElementSibling; while (e && !e.classList.contains('leg-sec')) { rows.push(e.textContent.replace(/\s+/g, ' ').trim().slice(0, 90)); e = e.nextElementSibling }
    return rows
  })
  await o.page.waitForTimeout(300); await shot(o, `legend-corner-${w}`)
  rec('Legend corner rows', w, 'LOOK', JSON.stringify(info), [`legend-corner-${w}`])
  await done(o)
}
writeFileSync(path.resolve(process.env.W2_SCRATCH || here, 'new-r.out.json'), JSON.stringify({ results, allErrs }, null, 1))
console.log('ERRORS', JSON.stringify(allErrs))
await browser.close()
