const C = await import('./aa-C-lib.mjs')
const { world, fileInput, shot, sleep, go, pubSat, closeBoard, editWeek, face, fs, signDay, takeOff, lastIid, pidOf } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
async function run(label, iso, di, kind, person, oil, rmk) {
  const w = await world(); const { page } = w
  const p = person === 'RANGER' ? await pidOf(page, 'Ranger') : person
  await go(page, 'editsched'); await pubSat(page, di); await closeBoard(page)
  await editWeek(page); await signDay(page, di, 3)
  await fileInput(page, { iso, kind, person: p, s: '09:00', e: '12:00', rmk, oil })
  const iid = await lastIid(page, rmk)
  await takeOff(page, di, iid)
  await go(page, 'editsched'); await sleep(300)
  const f = fs(await face(page, di))
  await page.locator(`#eWeek [data-pendlist="${di}"]:visible`).first().click().catch(() => {})
  await sleep(700)
  const txt = await page.evaluate(() => { const els = [...document.querySelectorAll('[data-testid*="chg"], [class*="chgwin"], [class*="changes"], #pendList, .floatwin')].filter(e => e.offsetParent); return els.map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 400)).join(' || ') })
  console.log(label, '::', f, '\n   window:', txt)
  await shot(page, 'S14d-' + label.replace(/\W+/g, '-'))
  await w.browser.close()
}
await run('weekday named Training Wed', '2026-07-15', 2, 'Training', 'RANGER', null, 'S14 wk')
await run('weekend named Duty Sat', '2026-07-18', 5, 'Duty', 'RANGER', 'yes', 'S14 we')
