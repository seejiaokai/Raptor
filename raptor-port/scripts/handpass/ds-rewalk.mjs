/* Re-walk of D1786 after the code readers' fixes: an unfinished sortie counts nowhere in the work span.
   Run from raptor-port/:  HP_URL=http://localhost:4296 node scripts/handpass/ds-rewalk.mjs
   Adds r1-*, r2-*, r3-* pictures to the first walk's folder; it never empties it. */
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../../docs/img/handpass/2026-11-08-day-start')
mkdirSync(OUT, { recursive: true })
process.env.HP_SHOTS ||= OUT
const { open, board, shot, put, type } = await import('./lib.mjs')
console.log('ds-rewalk v1')
const REL = 'docs/img/handpass/2026-11-08-day-start/'
const results = [], allErrors = []
const mins = t => { const m = /(\d+)h(\d*)/.exec(t || ''); return m ? (+m[1]) * 60 + (+(m[2] || 0)) : NaN }

async function fresh(fn) {
  const { browser, page, errors } = await open({ width: 1536, height: 864 })
  const pic = async n => { await page.waitForTimeout(350); await shot(page, n); return REL + n + '.png' }
  const hours = async () => {
    await page.locator('#sbInsights:visible').first().click(); await page.waitForSelector('#insightModal', { state: 'visible' }); await page.waitForTimeout(600)
    const t = await page.evaluate(() => document.querySelector('#insightModal').innerText); const s = t.slice(t.indexOf('WORK HOURS'))
    const g = n => (s.match(new RegExp('\\n' + n + '\\n(\\d+h\\d*)')) || [])[1] || null
    return { saint: g('Saint'), echo: g('Echo') }
  }
  const insPic = async n => {
    await page.evaluate(() => { const rows = [...document.querySelectorAll('#insightModal .ibar')].filter(r => /^(Saint|Echo)$/.test(r.querySelector('.nm')?.textContent || '')); rows.forEach(r => { r.style.outline = '2px solid #d33' }); rows[0]?.scrollIntoView({ block: 'center' }) })
    await page.waitForTimeout(300); return pic(n)
  }
  const closeIns = async () => { await page.click('#insightClose'); await page.waitForTimeout(300) }
  const notes = async () => (await page.evaluate(() => document.querySelector('#sbSide')?.innerText || '')).split(/\n/).map(s => s.trim()).filter(s => /long work day/i.test(s))
  const linePic = async n => { await page.evaluate(() => document.querySelector('#schedBoard [data-bfld="ff:4.0.0.cs"]').scrollIntoView({ block: 'center' })); return pic(n) }
  try { await board(page, 4); await fn({ page, pic, hours, insPic, closeIns, notes, linePic }) } finally { allErrors.push(...errors); await browser.close() }
}
async function addLine(page, vals) {
  await page.click('#schedBoard [data-wvadd="4"]'); await page.waitForTimeout(400)
  await page.click('[data-wmkind=""]:visible'); await page.waitForTimeout(600)
  await type(page, '[data-bfld="ff:4.0.0.cs"]', 'VL')
  for (const [k, v] of Object.entries(vals)) await type(page, `[data-bfld="ff:4.0.0.${k}"]`, v)
  const a = await put(page, '[data-slot="4.0.0.0.p"]', ['salsa']), b = await put(page, '[data-slot="4.0.0.0.w"]', ['freak'])
  console.log('seats', a, b)
}
const rec = (id, pass, did, expected, saw, pics) => { results.push({ id, pass: !!pass, did, expected, saw, pics }); console.log(pass ? 'PASS' : 'FAIL', id, '|', saw) }

let base
await fresh(async c => { base = await c.hours(); await c.closeIns(); console.log('baseline', JSON.stringify(base)) })

await fresh(async c => {
  await addLine(c.page, { to: '05:00' })
  const l = await c.linePic('r1-line-on-board'); const h = await c.hours(); const i = await c.insPic('r1-insights-rows'); await c.closeIns(); const n = await c.notes()
  rec('R1', h.saint === base.saint && h.echo === base.echo && n.length === 0, 'VL, TO 05:00, LD blank, Saint front, Echo back', 'hours equal baseline; no long-day note', `Saint ${h.saint}, Echo ${h.echo} (baseline ${base.saint} / ${base.echo}); long-day notes ${JSON.stringify(n)}`, [l, i])
})

let h2
await fresh(async c => {
  await addLine(c.page, { ld: '13:00', rl: '08:00' })
  const l = await c.linePic('r2-line-on-board'); h2 = await c.hours(); const i = await c.insPic('r2-insights-rows'); await c.closeIns(); const n = await c.notes()
  rec('R2', h2.saint === base.saint && h2.echo === base.echo && n.length === 0, 'VL, TO blank, LD 13:00, R 08:00 typed', 'hours equal baseline; no long-day note', `Saint ${h2.saint}, Echo ${h2.echo}; long-day notes ${JSON.stringify(n)}`, [l, i])
  await type(c.page, '[data-bfld="ff:4.0.0.to"]', '12:00')
  const l3 = await c.linePic('r3-line-on-board'); const h3 = await c.hours(); const i3 = await c.insPic('r3-insights-rows'); await c.closeIns(); const n3 = await c.notes()
  rec('R3', mins(h3.saint) === mins(base.saint) + 420 && mins(h3.echo) === mins(base.echo) + 420, 'then typed TO 12:00 on the R2 line', `hours +7h over baseline (Saint ${base.saint} to ${Math.floor((mins(base.saint) + 420) / 60)}h${String((mins(base.saint) + 420) % 60).padStart(2, '0')})`, `Saint ${h3.saint}, Echo ${h3.echo}; long-day notes ${JSON.stringify(n3)}`, [l3, i3])
})

console.log('ERRORS', JSON.stringify(allErrors))
writeFileSync(resolve(OUT, '_rewalk-results.json'), JSON.stringify({ base, results, errors: allErrors }, null, 1))
