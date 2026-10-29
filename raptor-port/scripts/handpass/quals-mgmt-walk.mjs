// WALK of D1510 (29 Oct 26 — "only an admin ticks Management on Quals") on the served build, pressed on screen at his
// iPhone's 402 (touch) and his PC's 1536 at 125% (mouse). Written as the RIGHT behaviour (a PASS means correct):
//  1. a member (Ranger) turns on editing: his own Management cell reads only, says whose it is, and a press is refused
//     with its reason, nothing ticked; the cells beside it (SXO, a qualification) still tick and untick;
//     another man's Management cell reads as text as the rest of that row does;
//  2. Save, reload: his Management still as it was;
//  3. the admin ticks Ranger's Management — it lands, survives a reload;
//  4. Ranger again: his ✓ shows, read only, and his press cannot take it off.
// Run from raptor-port:  node scripts/handpass/quals-mgmt-walk.mjs <dist> <out-dir>
import { chromium, serveDist } from '../drawcheck/lib.mjs'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const [, , DIST = 'dist', OUT = 'docs/img/handpass/2026-10-29-quals-mgmt'] = process.argv
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ORIGIN = 'http://localhost:4198'
const res = []
const C = (id, ok, note = '') => { res.push({ id, ok: !!ok, note }); console.log((ok ? 'PASS ' : 'FAIL ') + id + (note ? ' — ' + note : '')) }
const MSG = 'Only an admin can tick Management'
for (const kind of ['P', 'D']) {
  const phone = kind === 'P'
  const ctx = await b.newContext(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, timezoneId: 'Asia/Singapore' }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  const press = async sel => { const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded(); if (phone) await l.tap(); else await l.click(); await p.waitForTimeout(350) }
  const shot = async (n, sel) => {
    const path = join(OUT, `${kind}-${n}.png`)
    /* the cell in question outlined ON the element (an outline takes no room), centred in its sideways-scrolling table,
       and the whole screen pictured — a crop from the left edge missed it on a phone */
    if (sel) await p.locator(sel).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.style.outline = '2px dashed #ff4fd8'; e.style.outlineOffset = '-3px' })
    await p.waitForTimeout(150)
    await p.screenshot({ path })
    if (sel) await p.locator(sel).first().evaluate(e => { e.style.outline = ''; e.style.outlineOffset = '' })
  }
  const signIn = async (u, pw) => {
    await p.waitForSelector('#luser', { timeout: 20000 })
    await p.fill('#luser', u); await p.fill('#lpass', pw); await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.waitForTimeout(300)
  }
  const toQuals = async () => {
    if (phone) { await p.tap('#burger'); await p.waitForTimeout(300); await p.getByText('Quals', { exact: true }).locator('visible=true').first().tap() }
    else await p.click('.nav a[data-page="quals"]')
    await p.waitForFunction(() => window.CURPAGE === 'quals'); await p.waitForSelector('#qtbl td.qname'); await p.waitForTimeout(250)
  }
  // signing out is not under test: its button is pressed by the page's own handler wherever the shell keeps it
  const signOut = async () => { await p.evaluate(() => document.querySelector('#logout')?.click()); await p.waitForTimeout(500) }
  const cell = k => `#qtbl td[data-q="bane|${k}"]`
  const ticked = k => p.locator(cell(k)).evaluate(e => !!e.querySelector('.qchk'))
  const toastSays = () => p.evaluate(() => (document.getElementById('toastEl')?.textContent || '').trim())

  // a fresh browser context holds no storage, so the first load is the demo world; never ?fresh=1, which saves nothing
  // and would make every reload below start over
  await p.goto(ORIGIN + '/')
  // 1. the member
  await signIn('us', 'us'); await toQuals()
  await press('#qEdit')
  const ro = await p.locator(cell('mgmt')).evaluate(e => ({ ro: e.classList.contains('qro'), title: e.getAttribute('title'), cursor: getComputedStyle(e).cursor }))
  C(kind + '-1 his own Management cell reads only', ro.ro && ro.cursor === 'default', JSON.stringify(ro))
  C(kind + '-1 and says whose it is', ro.title === MSG, ro.title)
  const had = await ticked('mgmt')
  await press(cell('mgmt'))
  C(kind + '-1 a press ticks nothing', (await ticked('mgmt')) === had)
  const said = await toastSays()
  C(kind + '-1 and says why', said.includes(MSG), said)
  await shot('1-member-mgmt-refused', cell('mgmt'))
  const sxo0 = await ticked('sxo')
  await press(cell('sxo')); C(kind + '-1 SXO beside it still ticks', (await ticked('sxo')) !== sxo0)
  await press(cell('sxo')); C(kind + '-1 and unticks', (await ticked('sxo')) === sxo0)
  const tf0 = await ticked('tf')
  await press(cell('tf')); C(kind + '-1 a qualification (TF) still ticks', (await ticked('tf')) !== tf0)
  await shot('1-member-tf-ticked', cell('tf'))
  await press(cell('tf'))
  const other = await p.evaluate(() => [...document.querySelectorAll('#qtbl td[data-q$="|mgmt"]')].map(x => x.dataset.q.split('|')[0]).find(id => id !== 'bane'))
  const orow = await p.locator(`#qtbl td[data-q="${other}|mgmt"]`).evaluate(e => e.closest('tr').classList.contains('qro'))
  C(kind + '-1 another man\'s Management reads as text, as his whole row does', orow, other)
  await press('#qSave')
  // 2. a reload keeps it
  await p.reload(); await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }).catch(() => {})
  if (await p.locator('#luser').count()) await signIn('us', 'us')
  await toQuals()
  C(kind + '-2 after a reload his Management is as it was', (await ticked('mgmt')) === had)
  // 3. the admin ticks it
  await signOut(); await signIn('ad', 'a'); await toQuals()
  await press('#qEdit')
  const aro = await p.locator(cell('mgmt')).evaluate(e => e.classList.contains('qro') || e.closest('tr').classList.contains('qro'))
  C(kind + '-3 the admin\'s Ranger Management cell is live', !aro)
  await press(cell('mgmt'))
  C(kind + '-3 his press ticks it', (await ticked('mgmt')) === !had)
  await shot('3-admin-ticked', cell('mgmt'))
  await press('#qSave')
  await p.reload(); await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }).catch(() => {})
  if (await p.locator('#luser').count()) await signIn('ad', 'a')
  await toQuals()
  C(kind + '-3 the tick survives a reload', (await ticked('mgmt')) === !had)
  // 4. Ranger cannot take it off
  await signOut(); await signIn('us', 'us'); await toQuals()
  await press('#qEdit')
  C(kind + '-4 Ranger sees the admin\'s ✓', (await ticked('mgmt')) === !had)
  await press(cell('mgmt'))
  C(kind + '-4 his press cannot take it off', (await ticked('mgmt')) === !had, await toastSays())
  await shot('4-member-cannot-untick', cell('mgmt'))
  await press('#qSave')
  C(kind + ' no page errors', errs.length === 0, errs.slice(0, 3).join(' | '))
  await ctx.close()
}
await b.close()
writeFileSync(join(OUT, 'results.json'), JSON.stringify(res, null, 1))
const f = res.filter(r => !r.ok).length
console.log(`${res.length - f}/${res.length} PASS`)
process.exit(f ? 1 : 0)
