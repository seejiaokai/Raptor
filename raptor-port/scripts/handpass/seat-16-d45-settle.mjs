/* SETTLING F4 — two walks disagreed about D45, so reproduce both on one day.
   D45: a change in AVAILABILITY never invalidates a signature. A separate rule
   (15 Sep 26) says a change to the day's CONTENT does.
   Filing leave for a man does BOTH when he is NAMED on the day, and only the
   first when he is merely one of the men behind a placeholder. If that is the
   difference, both walks were right and D45 holds. */
import { open, board, tap, shot, publish, STATE } from './lib.mjs'
import { allChips, seatHolds } from './seat-lib.mjs'

const di = 5
async function run(label, who, whoCs, expectNamed) {
  const { browser, page, errors } = await open({ state: STATE })
  await board(page, di)
  /* a crowd on an empty desk, so there is a placeholder in play either way */
  await tap(page, `[data-fill="d:${di}.2.1.+"]`)
  await page.waitForTimeout(250)
  await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click()
  await page.waitForTimeout(600)

  const named = await page.evaluate(([i, id]) => {
    const d = window.DAYS[i]
    const hit = []
    for (const w of d.waves || []) for (const f of w.formations || []) for (const a of f.aircraft || [])
      if (a.p === id || a.w === id) hit.push('flying ' + f.cs)
    for (const b of d.dutywaves || []) for (const r of b.rows || []) if (r.id === id) hit.push('duty ' + r.role)
    for (const g of d.ground || []) if (g.who === id) hit.push('ground ' + g.prog)
    for (const s of (d.sims && d.sims.oft) || []) if (s.p === id || s.w === id) hit.push('sim ' + s.label)
    for (const s of (d.sims && d.sims.amt) || []) if ((s.pax || []).includes(id)) hit.push('sim pax ' + s.label)
    for (const a of d.allhands || []) { const w = Array.isArray(a.who) ? a.who : [a.who]; if (w.includes(id)) hit.push('programme ' + a.prog) }
    return hit
  }, [di, who])
  console.log(`\n=== ${label}: ${whoCs} is ${named.length ? 'NAMED on ' + named.join(', ') : 'NOT named on any row'} ===`)
  if (!!named.length !== expectNamed) console.log(`   (note: expected named=${expectNamed}, got ${!!named.length})`)

  console.log('   publish ->', JSON.stringify(await publish(page, di)))
  const sels = page.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible')
  for (let i = 0; i < await sels.count(); i++) {
    const o = await sels.nth(i).locator('option').evaluateAll(os => os.map(x => x.value).filter(v => v && v !== '—'))
    if (o.length) await sels.nth(i).selectOption(o[Math.min(i, o.length - 1)])
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(500)
  const sign = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard select')]
    .filter(s => s.closest('.sb-sign,.signrow,[class*=sign]')).map(s => s.value).filter(Boolean).length)
  const pend = () => page.evaluate(() => ((document.querySelector('#schedBoard').innerText || '').match(/(\d+)\s+pending/) || [])[1] || '0')
  console.log('   signed again after publishing:', await sign(), '| pending:', await pend())

  await tap(page, `[data-inpadd="${di}.u"]`)
  await page.waitForTimeout(900)
  const pop = page.locator('#inpEditPop')
  await pop.locator('#inpEditPerson').selectOption(who)
  await pop.locator('#inpEditType').selectOption('LL')
  await page.waitForTimeout(300)
  await page.locator('#inpEditSave').click()
  await page.waitForTimeout(1000)
  const conf = page.locator('[data-testid="oilconf"]')
  if (await conf.count() && await conf.isVisible()) {
    await conf.locator('button').filter({ hasText: /^No OIL/ }).first().click()
    await page.waitForTimeout(300)
    await conf.getByRole('button', { name: 'Save', exact: true }).click()
    await page.waitForTimeout(900)
  }
  await page.waitForTimeout(700)
  console.log(`   AFTER filing leave for ${whoCs}: signatures = ${await sign()} | pending = ${await pend()}`)
  console.log('   counts:', (await allChips(page)).map(c => c.txt).join(' · '))
  await shot(page, `D45-${label}`)
  console.log('   errors:', errors.slice(0, 3))
  await browser.close()
}

/* Ace (dj) is in the crowd only. Fable (plasma) holds the SDO duty desk by name. */
await run('A-crowd-only', 'dj', 'Ace', false)
await run('B-named-on-a-row', 'plasma', 'Fable', true)
