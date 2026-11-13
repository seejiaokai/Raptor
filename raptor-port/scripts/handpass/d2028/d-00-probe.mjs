/* d-00-probe v1 — walker's route probe for D2028: bundle, roster specials, add controls on Friday's board. */
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/probe'
console.log('d-00-probe v1', process.env.HP_SHOTS)
const R = await import('../rcsb/rcsb-lib.mjs')
const { X, L, sleep } = R
const w = await R.world('pc')
const { page } = w
console.log('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(',')))
console.log('specials', await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k, p]) => p.special).map(([k, p]) => k + '=' + p.cs).join(', ')))
console.log('ranger', w.ID('Ranger'), 'saber', w.ID('Saber'))
const FRI = 4
await L.board(page, FRI)
console.log('adds', await page.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => b.offsetWidth && /add|sbadd/i.test(b.className + Object.keys(b.dataset).join(' '))).map(b => Object.keys(b.dataset).join('|') + '=' + Object.values(b.dataset).join('|') + ' "' + b.innerText.trim() + '"')))
console.log('allhands', await page.evaluate(() => JSON.stringify(window.DAYS[4].allhands.map(a => [a.prog, a.str, a.end, a.who]))))
console.log('ground', await page.evaluate(() => JSON.stringify(window.DAYS[4].ground.map(a => [a.prog, a.str, a.end, a.who]))))
console.log('oilcounts', await page.evaluate(() => document.querySelectorAll('.oilcount').length))
await R.shot(page, 'p1-board-fri')
console.log('roster', await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck')].filter(e => e.offsetWidth).slice(0, 6).map(e => e.dataset.person + ':' + e.innerText.trim()).join(' ')))
R.finish(w, 'probe')
await w.browser.close()
