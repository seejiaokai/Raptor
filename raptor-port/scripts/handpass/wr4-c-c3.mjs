// Walker c — C3, the Inputs page's look-ahead (copied from words-r4.mjs s1). Run: node scripts/handpass/wr4-c-c3.mjs
console.log('wr4-c-c3 v1')
const C = await (await import('./wr4-c-common.mjs')).setup('c3')
const { newPage, signIn, go, press, sleep, judge, save, note, noteGone, bundleOf, log, shot, finish } = C

async function openCfg(w) {
  await go(w.page, 'inputs')
  if (await w.page.locator('#inListBtn').count()) await press(w, '#inListBtn')
  if (!(await w.page.locator('#inRangePop:visible').count())) await press(w, '#inRangeBtn')
  await w.page.locator('#inRangePop').waitFor()
  await press(w, '#inRangeEdit')
  return { weeks: await w.page.inputValue('#inLookWeeks'), sun: await w.page.isChecked('#inLookSun') }
}
const setting = w => w.page.evaluate(() => { const b = document.querySelector('#inRangeDef'); return b ? b.textContent.replace(/\s+/g, ' ').trim() : null })

async function walk(size) {
  const c = 'C3', sz = size === 'desk' ? 'desk' : 'phone'
  const w = await newPage(size); await signIn(w, 'ad')
  log(c, 'bundle ' + size + ': ' + await bundleOf(w.page))
  const cases = [
    ['4sun', '4', true, 'Everyone now opens on the next 4 weeks, to Sunday'],
    ['1sun', '1', true, 'Everyone now opens on the next week, to Sunday'],
    ['1nosun', '1', false, 'Everyone now opens on the next week'],
    ['2nosun', '2', false, 'Everyone now opens on the next 2 weeks'],
  ]
  for (const [step, n, sun, exp] of cases) {
    const was = await openCfg(w)
    await w.page.fill('#inLookWeeks', n)
    if ((await w.page.isChecked('#inLookSun')) !== sun) await press(w, '#inLookSun')
    await noteGone(w)
    await press(w, '#inLookSave')
    const r = await note(w, c, `c3-${step}-${sz}`, /Everyone now opens|weeks between|could not/)
    judge(c, `${step} ${sz}`, r.text === exp ? 'PASS' : 'FAIL', r.text || r.now, exp, r.pic)
    log(c, `${step}: was ${JSON.stringify(was)}; quick button now ${JSON.stringify(await setting(w))}; note geo ${JSON.stringify(r.geo)}`)
  }
  for (const bad of ['0', '53', 'x']) {
    await openCfg(w)
    const before = await setting(w)
    await w.page.fill('#inLookWeeks', bad)
    await noteGone(w)
    await press(w, '#inLookSave')
    const r = await note(w, c, `c3-bad${bad}-${sz}`, /./)
    const box = await w.page.locator('#inLookWeeks').inputValue().catch(() => '(box gone)')
    const after = await setting(w)
    judge(c, `bad ${bad} ${sz}`, 'RECORD', { note: r.text || r.now, boxAfter: box, quickBefore: before, quickAfter: after }, 'nothing saved', r.pic)
    judge(c, `bad ${bad} nothing saved ${sz}`, before === after ? 'PASS' : 'FAIL', { before, after }, 'unchanged')
    if (await w.page.locator('#inLookCancel:visible').count()) await press(w, '#inLookCancel')
  }
  /* Cancel: change the figure and the tick, press Cancel — nothing changes */
  {
    await openCfg(w)
    const before = await setting(w)
    await w.page.fill('#inLookWeeks', '7'); await press(w, '#inLookSun')
    await noteGone(w)
    await press(w, '#inLookCancel')
    await sleep(400)
    const shown = await C.shownToast(w.page)
    const after = await setting(w)
    const re = await openCfg(w)
    await shot(w.page, c, `c3-cancel-${sz}`, await C.boxOf(w.page, ['#inRangePop'], 20), { before, after, reopened: re }, w.size)
    judge(c, `cancel ${sz}`, before === after && re.weeks === '2' && re.sun === false ? 'PASS' : 'FAIL', { before, after, reopened: re, note: shown }, 'unchanged (2 weeks, no Sunday)', `c3-cancel-${sz}.png`)
    await press(w, '#inLookCancel')
  }
  /* Ranger: no way to edit it; what his Inputs page opens on (saved world carried over — desktop only, Chromium) */
  const r = await C.handOver(w, size, 'us')
  await go(r.page, 'inputs')
  if (await r.page.locator('#inListBtn').count()) await press(r, '#inListBtn')
  const rangeBtn = await r.page.locator('#inRangeBtn').evaluate(e => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => '(no range button)')
  await shot(r.page, c, `c3-ranger-opens-${sz}`, { x: 0, y: 0, width: r.page.viewportSize().width, height: Math.min(500, r.page.viewportSize().height) }, rangeBtn, r.size)
  if (await r.page.locator('#inRangeBtn').count()) await press(r, '#inRangeBtn')
  const edit = await r.page.locator('#inRangeEdit').count(), cfg = await r.page.locator('#inRangeCfg').count()
  const def = await setting(r)
  await shot(r.page, c, `c3-ranger-pop-${sz}`, await C.boxOf(r.page, ['#inRangePop', '#inRangeBtn'], 20), { edit, cfg, def }, r.size)
  judge(c, `ranger no edit ${sz}`, edit === 0 && cfg === 0 ? 'PASS' : 'FAIL', { pencil: edit, cfgBlock: cfg }, 'no way to edit', `c3-ranger-pop-${sz}.png`)
  judge(c, `ranger opens on ${sz}`, 'RECORD', { rangeButton: rangeBtn, quickButton: def }, '', `c3-ranger-opens-${sz}.png`)
  await r.ctx.close()
}
try { await walk('desk') } catch (e) { console.log('ERR desk', e.message.split('\n')[0]); C.facts.errors.push('desk ' + e.stack) }
try { await walk('phone') } catch (e) { console.log('ERR phone', e.message.split('\n')[0]); C.facts.errors.push('phone ' + e.stack) }
save(); await finish()
console.log('errors:', C.facts.errors.length, C.facts.errors.slice(0, 5).map(s => s.slice(0, 150)))
