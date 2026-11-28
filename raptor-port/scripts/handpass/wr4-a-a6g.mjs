// Walker a — A6 (g): the schedule's cancel of an input, a save of its own (the window has none). Board, Wed 15 Jul.
// Run: node scripts/handpass/wr4-a-a6g.mjs [run]
import { setup } from './wr4-a-common.mjs'
console.log('wr4-a-a6g v3 (the Board opened from Edit Schedule)')
const RUN = process.argv[2] || 'a6g-r1'
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, recOf, bundleOf, log, press, sleep, shot, boxOf, shownToast, RANGER, HEX } = L
const c = 'A6g'
try {
  let w = await newPage('desk'); await signIn(w, 'ad')
  log(c, 'bundle ' + await bundleOf(w.page))
  const iid = await fileInput(w, c, '2026-07-15', { type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title: 'Cancel me' })
  await L.go(w.page, 'editsched'); await w.page.evaluate(() => window.openScheduler(2)); await sleep(900)
  const cx = await w.page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-grcx]')].filter(b => b.getBoundingClientRect().width > 0).map(b => { let r = b; for (let i = 0; i < 6 && r && !/Cancel me/.test(r.textContent || ''); i++) r = r.parentElement; return { k: b.getAttribute('data-grcx'), mine: !!r && /Cancel me/.test(r.textContent || '') && (r.textContent || '').length < 400 } }))
  log(c, 'cx buttons: ' + JSON.stringify(cx))
  log(c, 'anything cx-like on the page: ' + JSON.stringify(await w.page.evaluate(() => [...document.querySelectorAll('*')].flatMap(e => [...e.attributes].filter(a => /cx/i.test(a.name) || (/^(title|aria-label)$/.test(a.name) && /cancel/i.test(a.value))).map(a => `${e.tagName}.${a.name}=${a.value.slice(0, 40)} w${Math.round(e.getBoundingClientRect().width)} in#${e.closest('[id]')?.id}`)).slice(0, 30))))
  const hit = cx.find(x => x.mine)
  if (!hit) A.judge(c, '(g) the schedule\'s cancel — NOT WALKED', null, 'no CX button on the input\'s row of the Board')
  else {
    await press(w, `#schedBoard [data-grcx="${hit.k}"]`)
    if (!(await w.page.locator('#cxPop:not([hidden])').count())) A.judge(c, '(g) NOT WALKED', null, 'the cancel box did not open')
    else {
      await w.page.fill('#cxReason', 'Weather')
      await shot(w.page, c, 'A6g-cxpop-desk', await boxOf(w.page, ['#cxPop .airpop-head', '#cxReason', '#cxSave'], 20), 'the cancel box', 'desk')
      await press(w, '#cxSave'); await sleep(600)
      log(c, 'note ' + JSON.stringify(await shownToast(w.page)) + ' · saved ' + JSON.stringify(await recOf(w.page, iid)))
    }
  }
  for (const [size, who] of [['phone', 'us'], ['phone', 'hex']]) {
    w = await handOver(w, size, who)
    const r = await A.bell(w, c, `${who === 'us' ? 'ranger' : 'hex'}-bell`)
    A.judge(c, `${size} ${who}: the cancel's line (RECORD)`, null, r.filter(l => l.day === 'Wed 15 Jul').map(l => `${l.name} ${l.day} / ${l.what}`))
  }
  await w.ctx.close()
} catch (e) { L.facts.errors.push('A6g: ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
await A.done(RUN)
