/* Scenario 13 — View-only Sched's "Working draft" never changes which copy Insights counts. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '13'
async function setVer(p, val) {
  await A.toPage(p, 'viewsched'); await W.showDay(p, TUE, '#vWeek')
  const s = p.locator(`#vWeek .day[data-day="${TUE}"] select.dver`).first()
  if (!(await s.count())) return 'no version select'
  await s.selectOption(val); await L.sleep(600)
  return s.evaluate(e => e.options[e.selectedIndex].text)
}
const vday = p => p.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="1"]'); const has = id => [...d.querySelectorAll(`.puck[data-person="${id}"]`)].some(e => e.offsetParent !== null)
  return { anvil: has('shaft'), rebel: has('romeo'), cls: d.className, txt: d.innerText.includes('16:40'), tag: (d.querySelector('.verchip') || {}).innerText || '', marks: [...d.querySelectorAll('.nysmark, .dpend, .wdraft, [class*=draft]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 4) } })
for (const who of ['a', 'm']) {
  await A.run(S + who, async p => {
    const tag = who === 'a' ? 'admin' : 'member'
    /* the fixture is always made by the admin; the member then signs in on the same storage */
    await A.toEdit(p)
    const pub = await A.pubOrig(p, TUE)
    await W.boardOn(p, TUE)
    const put = await A.seatPut(p, '1.1.1.0.p', 'shaft')
    await A.boxText(p, 'ff:1.1.1.to', '16:40'); await A.boxText(p, 'ff:1.1.1.ld', '18:05')
    await W.boardOff(p)
    const f = await A.face(p, TUE)
    if (who === 'm') await A.reloadAs(p, 'm')
    await A.toPage(p, 'viewsched')
    const d0 = await vday(p)
    const i0 = await A.insPic(p, `s13-${tag}-a-issued`, 'both')
    judge(`${S}.${tag}.a`, `admin: Tuesday ${pub.r.label}; board: Anvil on Rebel's seat (${put.took}), RU T/O 14:40→16:40; ✓ Done (${f.pending})${who === 'm' ? '; reload, signed in as the member (Ranger)' : ''}; View-only Sched at "Original — as issued"; Insights`, [
      ['the page shows the issued day (Rebel, no Anvil, no 16:40)', d0.rebel && !d0.anvil && !d0.txt, d0],
      ['the window counts the issued day (Anvil idle, Rebel not)', A.idleHas(i0, 'Anvil') && !A.idleHas(i0, 'Rebel')],
    ], i0.shots)
    const sw = await setVer(p, 'working')
    const d1 = await vday(p)
    const shot1 = await pic(p, `s13-${tag}-b-working-draft-day`)
    const i1 = await A.insPic(p, `s13-${tag}-b-working-draft-insights`, 'both')
    judge(`${S}.${tag}.b`, `View-only Sched: Tuesday's version select → "${sw}"; Insights beside it`, [
      ['the day visibly shows the working draft (Anvil on the seat, 16:40)', d1.anvil && !d1.rebel && d1.txt, d1],
      ['the window is on top at its centre', i1.top === true],
      ['the window is word for word what it was — still the Original', A.same(i0, i1), A.diffText(i0, i1)],
      ['Anvil still idle in the window, Rebel still flying', A.idleHas(i1, 'Anvil') && !A.idleHas(i1, 'Rebel')],
      ['Rebel\'s Work hours unchanged', A.hoursOf(i0, 'Rebel') === A.hoursOf(i1, 'Rebel'), A.hoursOf(i1, 'Rebel')],
    ], [shot1, ...i1.shots])
    const bk = await setVer(p, 'issued')
    const i2 = await A.insNow(p)
    judge(`${S}.${tag}.c`, `the select back to "${bk}"; Insights`, [
      ['no Insights text changed', A.same(i0, i2), A.diffText(i0, i2)],
    ])
  }, { who: 'a' })
}
