/* [DB-READINESS] group A FULL walk — W1 part D: the phone (390×844, touch). One board edit, then a reload.
   Usage (from raptor-port/scripts/handpass): node dbrA-W1-d.mjs */
import * as W from './dbrA-W1-lib.mjs'
const L = await W.boot('d')
const { WK, day, ELOG } = W
const browser = await L.launch()
const errors = []
const ctx = await L.context(browser, { phone: true })
const p = await L.page(ctx, errors, 'W1d-phone')
const { T, S, pic, note } = W.table(L, '390')
await L.signIn(p, 'a')
await W.toEdit(L, p)
await W.toastSpy(p)

/* the board, opened through the day's own board button on the edit week */
{
  const b = p.locator('#eWeek [data-sbday="0"]:visible').first()
  if (await b.count()) { await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.tap().catch(() => b.click()); await p.waitForSelector('#schedBoard', { timeout: 8000 }); await p.waitForTimeout(700) }
  else await W.boardOn(p, 0)
}
await pic(p, 'W1.12-0-phone-board')
await S(p, 'W1.12a', 'phone, the board (Mon): the first Overall Note typed',
  () => W.boardText(p, 'dn:0.0', 'W1 PHONE NOTE'),
  { expect: { put: [new RegExp('^' + W.esc(WK) + '$'), day(WK, 0), ELOG], also: [/^weeks\/13-07-2026#\d$/], only: true },
    onScreen: async () => { await W.boardOn(p, 0); await W.focus(p, '#schedBoard [data-bfld="dn:0.0"], #schedBoard [data-txt="dn:0.0"]') },
    show: async () => `the board's first note reads "${await p.evaluate(() => window.txtGet('dn:0.0'))}"` })
/* a second board gesture on the phone: an empty sim seat armed by a tap, a name tapped in the crew list */
{
  await W.boardOn(p, 0)
  const empty = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot^="s:0."]')].filter(e => e.offsetParent && !e.querySelector('[data-person]')).map(e => e.dataset.slot)[0] || null)
  await S(p, 'W1.12b', `phone, the board (Mon): an empty crew seat (${empty}) tapped, then a name tapped in the crew list`,
    async () => {
      const s = p.locator(`#schedBoard [data-slot="${empty}"]:visible`).first()
      await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await s.tap(); await p.waitForTimeout(500)
      const armed = await p.evaluate(() => window.ARM && window.ARM.key)
      /* on a phone an armed seat opens the crew list; the first free name in it */
      const free = await p.evaluate(() => { const j = JSON.stringify(window.DAYS[0]); return [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].filter(e => e.offsetParent).map(e => e.dataset.person).filter(k => k !== 'all' && k !== 'allavail' && !j.includes('"' + k + '"')) })
      if (!free.length) return { armed, picked: null }
      const pk = p.locator(`#sbRoster .rpuck[data-person="${free[0]}"]:visible`).first()
      await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await pk.tap(); await p.waitForTimeout(600)
      return { armed, picked: free[0] }
    },
    { expect: { put: [day(WK, 0), ELOG], only: true },
      onScreen: async () => { await W.boardOn(p, 0); await W.focus(p, `#schedBoard [data-slot="${empty}"]`) },
      after: async (a) => note(`W1.12b ${JSON.stringify(a.ret)}`),
      show: async () => `the seat ${empty} holds ${await p.evaluate(k => { const e = document.querySelector('#schedBoard [data-slot="' + k + '"] [data-person]'); return e ? e.dataset.person : 'NOBODY' }, empty)}` })
}

const fails = L.save({ table: T, errors })
console.log('errors:', JSON.stringify(errors, null, 1))
await browser.close()
process.exitCode = fails ? 1 : 0
