// RX3-8: the Unavailable list across a RELOAD (RW2-2's steps): LL Drifter, Hex, Hunter Wed 15 - Thu 16; Anvil onto Hex's row of Wed; History before and after a reload.
import * as L from './or-RX3-lib.mjs'
const { j } = L
const out = {}
const { ctx, page: p } = await L.open('ad', 'a')
const fil = await L.fileInput(p, { type: 'LL', people: ['Drifter', 'Hex', 'Hunter'], from: '2026-07-15', to: '2026-07-16' })
const iid = fil[0].iid
console.log('filed', j(fil))
await L.toWeek(p)
const unav = () => p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('.sec-unav .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) }, L.DI)
console.log('Wed unavailable before:', j(await unav()))
const hexPuck = L.day(p).locator('.sec-unav .pl-row').filter({ has: p.locator('.puck', { hasText: 'Hex' }) }).first().locator('.puck').first()
await hexPuck.evaluate(e => { const dd = e.closest('.day'); if (dd) dd.scrollIntoView({ inline: 'start', block: 'nearest' }); e.scrollIntoView({ block: 'center', inline: 'nearest' }) })
await p.waitForTimeout(300)
const m = await L.toastMark(p)
await L.drag(p, await L.rosterPuck(p, 'Anvil'), hexPuck)
out.dragToast = await L.toastsSince(p, m); console.log('drag toast:', out.dragToast)
out.unavBefore = await unav(); console.log('Wed unavailable after drag:', j(out.unavBefore))
out.inputBefore = (await L.allInputs(p)).filter(r => r.type === 'LL' && r.people.length); console.log('INPUTS LL:', j(out.inputBefore))
await L.shot(p, 'rx3-8-0-after-drag')

const dotsNow = () => p.evaluate(di => [...document.querySelectorAll('#eWeek [data-histdot]')].filter(e => e.getClientRects().length).map(e => ({ row: (e.closest('.pl-row')?.innerText || '').replace(/\s+/g, ' ').slice(0, 50), day: [...document.querySelectorAll('#eWeek .day:not(.peek)')].indexOf(e.closest('.day')) })), L.DI)
async function historyPass(tag) {
  const r = {}
  await L.toWeek(p); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
  await p.locator('#histBtn').click(); await p.waitForTimeout(1500)
  r.dots = await dotsNow(); console.log(tag, 'dots (history on):', j(r.dots))
  await L.shot(p, `rx3-8-${tag}-1-history-on`)
  await p.locator('.chgwin button', { hasText: /All changes/ }).first().click(); await p.waitForTimeout(800)
  await p.locator('.chgwin .cw-day', { hasText: 'Wed' }).click(); await p.waitForTimeout(500)
  const w = await L.winRead(p); r.win = w; console.log(tag, 'window:', j(w))
  await L.shot(p, `rx3-8-${tag}-2-all-changes`)
  r.taps = []
  const n = await p.locator('.chgwin .cw-l').count()
  for (let i = 0; i < n; i++) {
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1500)
    const l = p.locator('.chgwin .cw-l').nth(i)
    const txt = (await l.innerText()).replace(/\s+/g, ' ')
    const m2 = await L.toastMark(p)
    await l.click(); await p.waitForTimeout(300)
    const f = await p.evaluate(() => [...document.querySelectorAll('.chgflash, .lift-land')].filter(e => e.getClientRects().length).map(e => ({ cls: e.className.toString().slice(0, 30), text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 30), row: (e.closest('.pl-row')?.innerText || '').replace(/\s+/g, ' ').slice(0, 50), seat: e.dataset.inpseat || e.closest('[data-inpseat]')?.dataset.inpseat || null })))
    await p.waitForTimeout(300)
    const nm = await L.shot(p, `rx3-8-${tag}-3-tap-line${i}`)
    const t = await L.toastsSince(p, m2)
    console.log(`${tag} TAP line ${i} "${txt}" -> toast="${t}" flash=${j(f)}`)
    r.taps.push({ txt, toast: t, flash: f, pic: nm })
  }
  // the dots of the Wed unavailable rows
  const dl = L.day(p).locator('[data-histdot]')
  const dn = await dl.count(); console.log(tag, 'dots on Wed:', dn)
  r.dotTaps = []
  for (let i = 0; i < dn; i++) {
    const el = dl.nth(i)
    const info = await el.evaluate(e => ({ row: (e.closest('.pl-row')?.innerText || '').replace(/\s+/g, ' ').slice(0, 60), who: [...(e.closest('.pl-row')?.querySelectorAll('.ppl .puck .nm') || [])].map(x => x.textContent.trim()).join('+') }))
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(200)
    await el.click({ force: true }).catch(() => {}); await p.waitForTimeout(600)
    const bub = await p.evaluate(() => [...document.querySelectorAll('.histbub')].map(b => b.innerText.replace(/\s+/g, ' ').trim()))
    const nm = await L.shot(p, `rx3-8-${tag}-4-dot-${i}`)
    console.log(`${tag} DOT ${i} row="${info.row}" who=${info.who} bubble=${j(bub)}`)
    r.dotTaps.push({ info, bubble: bub, pic: nm })
    await p.keyboard.press('Escape'); await p.waitForTimeout(200)
  }
  return r
}
out.pre = await historyPass('pre')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
out.signedAgain = await L.reload(p); console.log('RELOADED; sign-in asked again:', out.signedAgain)
out.unavAfter = await (async () => { await L.toWeek(p); return unav() })(); console.log('Wed unavailable after reload:', j(out.unavAfter))
out.inputAfter = (await L.allInputs(p)).filter(r => r.type === 'LL' && r.people.length); console.log('INPUTS LL after reload:', j(out.inputAfter))
out.post = await historyPass('post')
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('8', out)
await ctx.close(); await L.browser.close()
