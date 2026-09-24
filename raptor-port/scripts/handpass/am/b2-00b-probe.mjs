process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b2'
const L = await import('./b2-lib.mjs')
const { openHi, editWeek, board, STATE, dragOnto, appendTo, who, screen } = L
const { browser, page, errors } = await openHi({ width: 1440, height: 900, state: STATE, dpr: 1 })
await editWeek(page)
await board(page, 0)
console.log('before', await who(page, '0.0.0.1.w'))
console.log('drag Tally ->', await dragOnto(page, '0.0.0.1.w', 'Tally'))
console.log('append d:0.0.0.+ Reaper ->', await appendTo(page, 'd:0.0.0.+', 'Reaper'))
console.log(await page.evaluate(() => JSON.stringify(window.DAYS[0].dutywaves[0].rows[0])))
console.log(await page.evaluate(() => [...document.querySelectorAll('#schedBoard .dpend, #schedBoard [data-pendlist]')].map(e => e.innerText).join('|')))
await screen(page, 'probe-board')
console.log('errors', JSON.stringify(errors))
await browser.close()
