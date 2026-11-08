// W2 part B: S10 — the unreadable week's notice on every day, Edit Schedule + View-only, PC and phone; board openers; Help.
import * as L from './sm-lib.mjs'
import { readFileSync } from 'node:fs'
console.log('sm-w2-b v1')
const OUT = L.outDir('w2')
const ORIGIN = 'http://localhost:4393'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const state = JSON.parse(readFileSync(SCR + '/w2-state.json', 'utf8'))
const { key2 } = JSON.parse(readFileSync(SCR + '/w2-key.json', 'utf8'))
const WANT = 'This week’s saved copy could not be read, so it can’t be shown. The saved copy is kept as it was. Report it with “Report a problem” on the Help page.'
const step = async (k, fn) => { try { const r = await fn(); console.log(k, JSON.stringify(r)); return r } catch (e) { console.log(k, 'ERR', e.message.split('\n')[0]) } }

const readDays = (page, root) => page.evaluate(([root, WANT]) => {
  const days = [...document.querySelectorAll(root + ' section.day')]
  return days.map(d => {
    const els = [...d.querySelectorAll('*')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 0 && /saved copy/.test(e.textContent))
    const texts = els.map(e => e.textContent.replace(/\s+/g, ' ').trim())
    const parent = els[0] && els[0].parentElement
    const full = parent ? parent.textContent.replace(/\s+/g, ' ').trim() : null
    return { di: d.dataset.day, n: els.length, exact: texts.join(' ') === WANT || full === WANT, text: full || texts.join(' | '), rows: d.querySelectorAll('.pl-row').length }
  })
}, [root, WANT])

for (const size of ['pc', 'phone']) {
  const U = await L.launch(size, { origin: ORIGIN, state, init: L.damageInit(key2) })
  await L.signIn(U)
  await L.goEdit(U)
  const days = await step(`${size}.edit.days`, () => readDays(U.page, '#eWeek'))
  for (const di of [0, 2, 6]) {
    await L.center(U.page, `#eWeek section.day[data-day="${di}"]`); await L.sleep(400)
    await L.pic(U, OUT, `s10-${size}-edit-day${di}`, { sel: `#eWeek section.day[data-day="${di}"]` })
  }
  // board openers: any control that opens the board on U
  await step(`${size}.board.controls`, () => U.page.evaluate(() => [...document.querySelectorAll('#eWeek [data-sb],#eWeek [data-board],#eWeek [data-openboard],#eWeek [onclick*="openScheduler"],#eWeek .dsched,#eWeek button')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.dataset && Object.keys(b.dataset).join(',')) + ':' + b.textContent.trim().slice(0, 20)).slice(0, 40)))
  // View-only
  await U.page.evaluate(() => window.go('viewsched')); await L.sleep(1200)
  const vdays = await step(`${size}.view.days`, () => readDays(U.page, '#vWeek'))
  await L.center(U.page, '#vWeek section.day[data-day="2"]'); await L.sleep(400)
  await L.pic(U, OUT, `s10-${size}-view-day2`, { sel: '#vWeek section.day[data-day="2"]' })
  // member view
  await U.page.evaluate(() => window.raptorRole && window.raptorRole('member')).catch(() => {}); await L.sleep(800)
  const mdays = await step(`${size}.member.view.days`, () => readDays(U.page, '#vWeek'))
  await L.pic(U, OUT, `s10-${size}-member-view`, { clip: { x: 0, y: 0, width: U.page.viewportSize().width, height: Math.min(700, U.page.viewportSize().height) } })
  await step(`${size}.errs`, async () => U.errs)
  await L.closeAll(U)
}
console.log('DONE')
