import { open, browser, errs, csId, sleep, shot, toWeek } from './or-G-lib.mjs'
const { ctx, page } = await open()
await toWeek(page)
console.log(await page.evaluate(() => {
  const d = window.DAYS[2]; const cs = id => window.PEOPLE[id]?.cs || id
  return JSON.stringify(d.waves.map((w, wi) => ({ wi, label: w.label, kind: w.kind, f: w.formations.map((f, fi) => ({ fi, cs: f.cs, to: f.to, ld: f.ld, ac: f.aircraft.map((a, ai) => `${ai}:${cs(a.p)}/${cs(a.w)}`) })) })))
}))
const seats = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek)')][2].querySelectorAll('[data-slot]').length)
console.log('slots', seats)
console.log(await page.evaluate(() => [...[...document.querySelectorAll('#eWeek .day:not(.peek)')][2].querySelectorAll('[data-slot]')].slice(0, 40).map(e => e.dataset.slot + ':' + (e.querySelector('.nm')?.textContent || '-')).join(' ')))
await ctx.close(); await browser.close()
