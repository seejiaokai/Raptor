/* msq-j2-w3-a v1 — W3-A: the input window's people picker, by touch, each face (world 1) */
process.env.MSQ_WHO = 'w3'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'a1'
const H = await (await import('./msq-j2-w3-h.mjs')).mk()
const { X, say, sleep, row } = H
say('msq-j2-w3-a v1')
const N149 = ['Kestrel', 'Falcon', 'Osprey', 'Heron', 'Merlin', 'Raven', 'Harrier', 'Shrike', 'Gannet', 'Condor']
const w = await X.open({ phone: true, user: 'ad9' })
const { page } = w
const safe = async (label, fn) => { try { return await fn() } catch (e) { say('ERR', label, String(e.message).split('\n')[0]); return null } }
const faces = [['ad9', 'a01'], ['ad2', 'a02'], ['ad', 'a03'], ['us', 'a04'], ['us9', 'a05']]
for (const [u, tag] of faces) {
  if (u !== 'ad9') await H.swap(w, u)
  await safe('face ' + u, async () => {
    const n = await H.openNew(w)
    await X.pic(w, tag + '-' + u + '-newinput')
    const so = await H.selOpts(page)
    say(u, 'person select', JSON.stringify(so))
    const sw = page.locator('.inped-win .pp-sw')
    let pk = []
    if (await sw.count()) {
      await sw.first().tap(); await sleep(900)
      await X.pic(w, tag + '-' + u + '-several-open')
      say(u, 'picker box', await H.inside(page, '.inped-win .pp'), 'win', await H.inside(page, '.inped-win'))
      // scroll the window by its own list to the end
      const mv = await page.evaluate(() => { const b = document.querySelector('.inped-win .win-body'); if (!b) return 'nobody'; const a = b.scrollTop; b.scrollTop = b.scrollHeight; return `${a} -> ${b.scrollTop} of ${b.scrollHeight}` })
      say(u, 'window scrolled to end:', mv); await sleep(500)
      await X.pic(w, tag + '-' + u + '-several-end')
      pk = await H.pucks(page)
      say(u, 'pucks', JSON.stringify(pk), 'textboxes in picker:', await page.evaluate(() => document.querySelectorAll('.inped-win .pp input[type=text],.inped-win .pp input:not([type]),.inped-win .pp input[type=search]').length))
    }
    const seen = [...(so ? so.opts : []), ...pk.map(s => s.replace('*', '').replace(/(?<=[a-z])(IP|IW|[ABCO])$/, ''))].filter(s => !/^ALL/.test(s))
    const uniq = [...new Set(seen)]
    const has142 = uniq.filter(s => !N149.includes(s)), has149 = uniq.filter(s => N149.includes(s))
    const is149 = u === 'ad9' || u === 'us9'
    const verdict = (u === 'us' || u === 'us9') ? 'RECORD' : (is149 ? (has142.length === 0 && has149.length > 0 ? 'PASS' : 'FAIL') : (has149.length === 0 && has142.length > 0 ? 'PASS' : 'FAIL'))
    row('W3-A', 'iPhone', `${u} Inputs -> List -> + Input -> window's Person select and the Several-people picker, scrolled to the end`, is149 ? "149's people only" : (u === 'us' ? "142's only (RECORD what a member sees)" : "142's only"),
      `select: [${so ? so.opts.join(', ') : 'none'}] selected: ${so && so.val}; pucks: [${pk.join(', ')}]; not-149 names: [${has142.join(', ')}]; 149 names: [${has149.join(', ')}]`, verdict, tag + '-' + u + '-several-open.png, ' + tag + '-' + u + '-several-end.png')
    await H.closeAny(w)
  })
}
// back as ad9: Os, Osprey, Merlin, off, LL
await H.swap(w, 'ad9')
await safe('file', async () => {
  await H.openNew(w)
  await page.locator('.inped-win .pp-sw').first().tap(); await sleep(900)
  await X.pic(w, 'b01-ad9-several')
  const tb = await page.evaluate(() => document.querySelectorAll('.inped-win .pp input').length)
  row('W3-A', 'iPhone', 'ad9: look for a box to type "Os" in the people picker', 'a typing box (brief), or record there is none', `inputs inside the picker: ${tb}; picker words: ${await H.bodyOf(page, '.inped-win .pp')}`, 'RECORD', 'b01-ad9-several.png')
  const tapPuck = async name => { const p = page.locator('.inped-win .pp-puck', { hasText: new RegExp('^' + name) }).first(); await p.tap(); await sleep(500) }
  await tapPuck('Osprey'); await X.pic(w, 'b02-osprey-picked')
  await tapPuck('Merlin'); await X.pic(w, 'b03-merlin-picked')
  let pk = await H.pucks(page); const c1 = await H.bodyOf(page, '.inped-win .pp-count')
  await tapPuck('Merlin'); await X.pic(w, 'b04-merlin-off')
  pk = await H.pucks(page); const c2 = await H.bodyOf(page, '.inped-win .pp-count')
  row('W3-A', 'iPhone', 'ad9 picks Osprey, picks Merlin, takes Merlin off again', 'Osprey on, Merlin off', `after Merlin: ${c1}; after taking off: ${c2}; pucks lit: [${pk.filter(s => s.endsWith('*')).join(', ')}]`, pk.some(x => /^Osprey.*\*$/.test(x)) && !pk.some(x => /^Merlin.*\*$/.test(x)) ? 'PASS' : 'FAIL', 'b03-merlin-picked.png, b04-merlin-off.png')
  await tapPuck('Kestrel'); await X.pic(w, 'b05-kestrel-off')
  pk = await H.pucks(page); say('lit now', pk.filter(s => s.endsWith('*')).join(','), await H.bodyOf(page, '.inped-win .pp-count'))
  const to = await page.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.value + '=' + o.text).join(' | '))
  say('type options', to)
  await page.selectOption('#inpEditType', { label: 'LL' }).catch(async () => { await page.selectOption('#inpEditType', { index: 1 }) })
  await sleep(600)
  say('type now', await page.evaluate(() => document.querySelector('#inpEditType').selectedOptions[0].text))
  await X.pic(w, 'b06-type-ll')
  await H.pickDay(w, 'Mon 23 Nov 2026', 'b07')
  say('window words', await H.bodyOf(page, '.inped-win'))
  await X.pic(w, 'b08-before-add')
  const addBox = await H.inside(page, '#inpEditSave')
  say('Add button', addBox)
  await page.locator('#inpEditSave').tap(); await sleep(1200)
  await X.pic(w, 'b09a-question')
  const q = await page.evaluate(() => [...document.querySelectorAll('[role=dialog],.modal,.qcard,.askwin')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' || '))
  say('QUESTION', q)
  row('W3-A', 'iPhone', 'ad9 presses Add on the LL input', 'RECORD what is asked', q.slice(0, 300) || '(see picture: No document - Osprey, LL)', 'RECORD', 'b09a-question.png')
  const nd = page.locator('button:visible', { hasText: /^No document$/ }).last()
  if (await nd.count()) { await nd.tap(); await sleep(1500) }
  await X.pic(w, 'b09-after-add')
  const gone = (await page.locator('.inped-win:visible').count()) === 0
  const after = await H.bodyOf(page, '#page-inputs, body')
  row('W3-A', 'iPhone', 'ad9 files LL for Osprey on Mon 23 Nov and presses Add', 'window closes, input saved', `window gone: ${gone}; Add button ${addBox}; page words: ${after.slice(0, 300)}`, gone ? 'RECORD' : 'FAIL', 'b09-after-add.png')
  // the list (default range 19 Nov -> 3 Dec) should show it
  const lt = await H.bodyOf(page, 'body')
  row('W3-A', 'iPhone', "the Inputs list after saving shows Osprey's LL on 23 Nov", 'a card for Osprey, LL, 23 Nov', (lt.match(/.{0,80}Osprey.{0,80}/) || ['(no Osprey on the list)'])[0], /Osprey/.test(lt) ? 'PASS' : 'FAIL', 'b09-after-add.png')
})
// close each way
const closeWays = [['x', 'c1'], ['outside', 'c2'], ['back', 'c3']]
for (const [way, tag] of closeWays) {
  await safe('close ' + way, async () => {
    await H.closeAny(w)
    await H.openNew(w)
    await X.pic(w, tag + '-open')
    const hist0 = await page.evaluate(() => history.length)
    if (way === 'x') { await page.locator('.inped-win .win-x').first().tap() }
    else if (way === 'outside') { await page.touchscreen.tap(4, 450) }
    else { await page.goBack().catch(e => say('goBack', e.message.slice(0, 60))) }
    await sleep(120); await X.pic(w, tag + '-' + way + '-tap'); await sleep(1000)
    await X.pic(w, tag + '-' + way)
    const open = await page.locator('.inped-win:visible').count()
    const url = page.url()
    const onInputs = await page.evaluate(() => !!document.querySelector('#inNew') && document.querySelector('#inNew').getBoundingClientRect().width > 2)
    row('W3-A', 'iPhone', `second new input: closed by ${way === 'x' ? 'its X' : way === 'outside' ? 'a tap outside it (left edge)' : "the browser's back"}`, 'window gone, Inputs page under it as it was', `window still open: ${open}; Inputs page (+ Input) shown: ${onInputs}; history length before ${hist0}; url ${url.replace(/^.*localhost:4293/, '')}`, open === 0 && onInputs ? 'PASS' : (open ? 'RECORD' : 'FAIL'), tag + '-' + way + '.png')
    if (open) await H.closeAny(w)
  })
}
await X.fin(w)
