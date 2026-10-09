// S20 follow-up: what is the "1 pending" on the issued July Saturday after Ranger is archived?
const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go, fileInput, pubSat, closeBoard, editWeek, face, fs, pidOf, archivePerson } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
for (const kind of ['placeholder', 'none']) {
  const w = await world(); const { page } = w
  const ranger = await pidOf(page, 'Ranger')
  if (kind === 'placeholder') await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S20 july', oil: 'yes' })
  await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
  say(kind + ' before archive', fs(await face(page, 5)))
  await archivePerson(page, ranger)
  await go(page, 'editsched'); await sleep(500)
  say(kind + ' after archive', fs(await face(page, 5)))
  await editWeek(page)
  const b = page.locator('#eWeek [data-pendlist="5"]:visible').first()
  if (await b.count()) { await b.click(); await sleep(800); await shot(page, 'S20-05-pending-' + kind)
    say(kind + ' window', await page.evaluate(() => [...document.querySelectorAll('.floatwin, [data-testid*="win-chg"]')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 400)).join(' || '))) }
  await w.browser.close()
}
