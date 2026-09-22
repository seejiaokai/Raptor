/* BLOCK A — the "eyes" work, on the everything-Saturday.
   Loads the world build.mjs saved, so it starts in seconds. */
import { open, board, tap, shot, readDay, publish, signState, warnings, oilMode, STATE, SHOTS } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

const R = {}

/* what the day looks like BEFORE it is published */
R.beforePublish = await readDay(page, di)
R.warnPanel = await warnings(page)
await shot(page, 'A-01-sat-draft')

/* the mode's own chrome, before anything is tapped */
R.modeOn = await oilMode(page, true)
R.modeChrome = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const bar = b.querySelector('[data-oilday], .oilbar-day, .sb-oilbar') ||
    [...b.querySelectorAll('*')].find(e => /OIL EARN/.test(e.innerText || '') && (e.innerText || '').length < 300)
  return {
    on: !!b.querySelector('[data-oilmode].on, .oilmode, [data-oilday]'),
    barText: bar ? (bar.innerText || '').replace(/\n+/g, ' | ').slice(0, 300) : null,
    counts: {
      items: b.querySelectorAll('[data-oilitem]').length,
      people: b.querySelectorAll('[data-oilp]').length,
      rows: b.querySelectorAll('[data-oilrow]').length,
      sentinels: b.querySelectorAll('[data-oilsent]').length,
      blanket: b.querySelectorAll('[data-oilblank]').length,
      picks: b.querySelectorAll('[data-oilpick]').length,
    },
  }
})
R.modeItems = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem]')]
  .map(e => ({ key: e.dataset.oilitem, text: (e.innerText || '').trim().slice(0, 28), title: (e.getAttribute('title') || '').slice(0, 120) })))
R.modePeople = await page.evaluate(() => {
  const P = window.PEOPLE
  return [...document.querySelectorAll('#schedBoard [data-oilp]')].map(e => {
    const pk = e.querySelector('[data-person]') || e
    const id = pk.dataset ? pk.dataset.person : ''
    return { key: e.dataset.oilp, who: (P[id] && P[id].cs) || id, cls: e.className.slice(0, 60), title: (e.getAttribute('title') || '').slice(0, 130) }
  })
})
await shot(page, 'A-02-mode-on-draft')
await oilMode(page, false)

/* publish it */
R.signBefore = await signState(page, di)
R.publish = await publish(page, di)
await page.waitForTimeout(600)
R.afterPublish = await readDay(page, di)
await shot(page, 'A-03-sat-published')

R.errors = errors.slice(0, 8)
const { writeFileSync } = await import('node:fs')
writeFileSync(SHOTS + '/../walk-a.json', JSON.stringify(R, null, 1))
const row = p => `${p.who.padEnd(12)} ${(p.bar || '-').padEnd(5)} ${p.title.replace(/^[^·]+·\s*/, '').slice(0, 62)}`
console.log('== WARNINGS (draft) ==')
console.log(' head: ' + R.warnPanel.head)
R.warnPanel.lines.forEach(l => console.log('  - ' + l))
console.log('== MODE ==', JSON.stringify(R.modeOn))
console.log('== MODE ITEMS ==')
R.modeItems.forEach(i => console.log('  ' + i.key.padEnd(14) + (i.text || '(no name)').padEnd(16) + i.title))
console.log('== MODE PEOPLE ==')
R.modePeople.forEach(i => console.log('  ' + (i.who || '?').padEnd(12) + i.cls.padEnd(34) + i.title))
console.log('== SIGN ==', JSON.stringify(R.signBefore))
console.log('== PUBLISH ==', JSON.stringify(R.publish))
console.log('== BARS before publish ==')
R.beforePublish.pucks.forEach(p => console.log('  ' + row(p)))
console.log('== BARS after publish ==')
R.afterPublish.pucks.forEach(p => console.log('  ' + row(p)))
console.log('== WARN after publish ==', JSON.stringify(R.afterPublish.warn))
console.log('errors:', R.errors)
console.log('shots in ' + SHOTS)
await browser.close()
