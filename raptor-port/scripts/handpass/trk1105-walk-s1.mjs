/* S1 — an ordinary Tracker session saves under raptor:tracker/ and nowhere under ocu: (D admin; P member WebKit)
     HP_URL=http://127.0.0.1:4180 node scripts/handpass/trk1105-walk-s1.mjs */
import { open, toTracker, back, keys, diffKeys, classify, ocuAny, words, pair, grade, mark, openBall, click, shot, pickDay, addFirst, tap2, mk, sleep, D, P } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s1 v1')
const L = mk('S1')
for (const [tag, engine, size, touch, who] of [['D', 'chromium', D, false, 'a'], ['P', 'webkit', P, true, 'u']]) {
  const role = who === 'a' ? 'admin' : 'member'
  const { browser, page, errors } = await open({ engine, size, touch, who, tracker: false })
  let prev = await keys(page)
  L.ok('baseline after sign-in: no ocu: key', tag, role, ocuAny(prev).length === 0, 'keys ' + Object.keys(prev).length)
  await toTracker(page, touch)
  let cur = await keys(page)
  let cl = classify(diffKeys(prev, cur)); prev = cur
  L.ok('first Tracker visit: no ocu: key', tag, role, cl.ocu.length === 0 && ocuAny(cur).length === 0, JSON.stringify(cl))
  await shot(page, `S1-${tag}-opened`)
  const step = async (name, fn, needTracker = true) => {
    await fn(); await sleep(1300)
    cur = await keys(page); const ch = diffKeys(prev, cur); cl = classify(ch); prev = cur
    const w = await words(page)
    const pic = await shot(page, `S1-${tag}-${name.replace(/\W+/g, '_')}`)
    L.ok(`${name}: changed keys only raptor:tracker/ (+ocuLocal:); no ocu:`, tag, role, cl.ocu.length === 0 && ocuAny(cur).length === 0 && cl.other.length === 0 && (needTracker ? cl.tracker.length > 0 : true), `tracker ${cl.tracker.length} ocuLocal ${cl.ocuLocal.length} other ${JSON.stringify(cl.other)} ocu ${cl.ocu.length}; corner "${w.corner}"`, pic)
    return w
  }
  await step('mark ST-02 DCO', () => mark(page, 'ST-02', 'dco', touch))
  const markStu = await page.locator('#activeSel').inputValue()
  let failDate = ''
  await step('failure on ST-01 with Failed-on date', async () => {
    await openBall(page, 'ST-01', touch)
    await click(page, '#popFailDate', touch); await pickDay(page, 3, touch)
    await click(page, '#popFailPlus', touch)
    failDate = (await page.locator('#popFailDate').innerText()).trim()
    await click(page, '#pop button:has-text("Close")', touch)
  })
  L.note('Failed-on date set', failDate)
  let curr = ''
  await step('Last flown currency day in Info', async () => {
    if (touch) { await click(page, '#page-tracker button[data-view="info"]', touch) }
    await click(page, '#lastCurr', touch); await pickDay(page, 2, touch)
    curr = (await page.locator('#lastCurr').innerText()).trim()
  })
  L.note('Last flown currency set', curr)
  let added = ''
  await step('+ Add a student from the roster', async () => { added = await addFirst(page, touch) })
  L.note('student added', added)
  if (touch) await click(page, '#page-tracker button[data-view="flow"]', touch)
  const sel = await page.locator('#activeSel option').allInnerTexts()
  const csel = await page.locator('#courseSel option').allInnerTexts()
  L.note('student options / course options', JSON.stringify({ sel, csel }))
  const first = await page.locator('#activeSel').inputValue()
  const other = await page.locator('#activeSel option').evaluateAll(o => o.map(x => x.value))
  const second = other.find(v => v !== first)
  await step('move the student pick away and back', async () => {
    await page.selectOption('#activeSel', second); await sleep(700)
    await page.selectOption('#activeSel', markStu); await sleep(500)
  }, false)
  const before = { g: await grade(page, 'ST-02'), student: await page.locator('#activeSel').inputValue() }
  await page.reload(); await back(page, who, touch)
  const after = { g: await grade(page, 'ST-02'), student: await page.locator('#activeSel').inputValue() }
  await openBall(page, 'ST-01', touch)
  const popTxt = await page.locator('#pop').innerText()
  const fd = popTxt.includes('03/11/26') ? failDate : 'other: ' + popTxt.slice(-90)
  await shot(page, `S1-${tag}-after-reload-pop`)
  await click(page, '#pop button:has-text("Close")', touch)
  if (touch) await click(page, '#page-tracker button[data-view="info"]', touch)
  const cv = (await page.locator('#lastCurr').innerText()).trim()
  await shot(page, `S1-${tag}-after-reload-info`)
  const k2 = await keys(page)
  L.ok('reload: DCO mark, failure date, currency day, same student all back', tag, role, before.g === 'dco' && after.g === 'dco' && fd === failDate && cv === curr && after.student === before.student, JSON.stringify({ before, after, fd, failDate, cv, curr }))
  L.ok('after reload still no ocu: key', tag, role, ocuAny(k2).length === 0, '')
  L.note('errors', errors.join(' | ') || 'none')
  await browser.close()
}
L.save('S1')
