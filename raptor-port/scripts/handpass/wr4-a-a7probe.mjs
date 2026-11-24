// Walker a — A7 probe: where each door to an input lives on these screens (reads only; one filed input to look for).
// Run: node scripts/handpass/wr4-a-a7probe.mjs [run]
import { setup } from './wr4-a-common.mjs'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
console.log('wr4-a-a7probe v1')
const RUN = process.argv[2] || 'a7probe-r1'
const { L, A } = await setup(RUN)
const { TMP } = await import('./wr4-a-common.mjs')
const { newPage, signIn, fileInput, log, go, sleep, press, shot, boxOf, RANGER, HEX } = L
const c = 'A7probe'
const out = {}
try {
  const w = await newPage('desk'); await signIn(w, 'ad')
  const iid = await fileInput(w, c, '2026-07-15', { type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title: 'Doorcheck' })
  out.iid = iid
  // (i) the Inputs list
  await go(w.page, 'inputs')
  if (await w.page.locator('#inCalBtn').getAttribute('aria-pressed') === 'true') { const lb = w.page.locator('#inListBtn'); if (await lb.count()) await press(w, lb); else await press(w, '#inCalBtn') }
  await sleep(500)
  out.list = await w.page.evaluate(iid => {
    const hits = [...document.querySelectorAll('*')].filter(e => [...e.attributes].some(a => a.value === iid))
    return { toggles: [...document.querySelectorAll('[id^="in"][aria-pressed]')].map(b => b.id + '=' + b.getAttribute('aria-pressed')), hits: hits.slice(0, 8).map(e => ({ tag: e.tagName, attrs: [...e.attributes].map(a => a.name + '=' + a.value.slice(0, 40)), text: (e.textContent || '').replace(/\s+/g, ' ').slice(0, 80), w: Math.round(e.getBoundingClientRect().width) })) }
  }, iid)
  await shot(w.page, c, 'A7probe-list-desk', { x: 0, y: 0, width: 1440, height: 900 }, 'the Inputs list', 'desk')
  // (iii) Edit Schedule
  await go(w.page, 'editsched'); await w.page.evaluate(() => scrollTo(0, 0))
  await w.page.evaluate(() => document.querySelector('#eWeek [data-pitog="2"]')?.click()); await sleep(500)
  out.edit = await w.page.evaluate(() => [...document.querySelectorAll('#eWeek [data-inp], #eWeek [data-ifld], #eWeek [data-iid], #eWeek [data-inpopen], #eWeek [data-ipen]')].filter(e => e.getBoundingClientRect().width > 2).slice(0, 40).map(e => ({ tag: e.tagName, attrs: [...e.attributes].filter(a => a.name.startsWith('data-') || a.name === 'class').map(a => a.name + '=' + a.value.slice(0, 40)), text: (e.textContent || e.value || '').replace(/\s+/g, ' ').slice(0, 50) })))
  out.editRows = await w.page.evaluate(() => [...document.querySelectorAll('#eWeek *')].filter(e => e.children.length < 40 && /Doorcheck/.test(e.textContent || '') && e.getBoundingClientRect().width > 2).slice(-6).map(e => ({ tag: e.tagName, attrs: [...e.attributes].map(a => a.name + '=' + a.value.slice(0, 40)), text: (e.textContent || '').replace(/\s+/g, ' ').slice(0, 100) })))
  await shot(w.page, c, 'A7probe-edit-desk', { x: 0, y: 0, width: 1440, height: 900 }, 'Edit Schedule', 'desk')
  // (iv) the Scheduler Board, Wed
  await w.page.evaluate(() => window.openScheduler(2)); await sleep(900)
  out.board = await w.page.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => /Doorcheck/.test(e.textContent || '') && e.children.length < 30 && e.getBoundingClientRect().width > 2).slice(-5).map(e => ({ tag: e.tagName, attrs: [...e.attributes].map(a => a.name + '=' + a.value.slice(0, 40)), text: (e.textContent || '').replace(/\s+/g, ' ').slice(0, 120), kids: [...e.querySelectorAll('[data-grcx],[data-grinfo],[data-inp],[data-ifld],[data-txt],[data-iid],button')].slice(0, 25).map(k => k.tagName + ' ' + [...k.attributes].filter(a => a.name.startsWith('data-') || a.name === 'aria-label' || a.name === 'title').map(a => a.name + '=' + a.value.slice(0, 30)).join(' ')) })))
  await shot(w.page, c, 'A7probe-board-desk', { x: 0, y: 0, width: 1440, height: 900 }, 'the Scheduler Board', 'desk')
  await w.ctx.close()
} catch (e) { L.facts.errors.push('probe: ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
writeFileSync(join(TMP, `${RUN}.probe.json`), JSON.stringify(out, null, 1))
await A.done(RUN)
