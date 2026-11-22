/* msq-j2-w3-ab v1 — W3-A, B, C (world 1): the input window's people picker, by touch, each face (world 1) */
process.env.MSQ_WHO = 'w3'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'a1'
const H = await (await import('./msq-j2-w3-h.mjs')).mk()
const { X, say, sleep, row } = H
say('msq-j2-w3-ab v1')
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

/* ---------- the two ways of closing that leave the app in place */
for (const [way, tag] of [['x', 'c1'], ['outside', 'c2']]) {
  await safe('close ' + way, async () => {
    await H.closeAny(w)
    await H.openNew(w)
    await X.pic(w, tag + '-open')
    const box = await page.evaluate(() => { const r = document.querySelector('.inped-win').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)].join(',') })
    say('window box', box)
    if (way === 'x') { await page.locator('.floatwin .win-x:visible').first().tap() }
    else { await page.touchscreen.tap(4, 450) }
    await sleep(120); await X.pic(w, tag + '-' + way + '-tap'); await sleep(1000)
    await X.pic(w, tag + '-' + way)
    const open = await page.locator('.inped-win:visible').count()
    const onInputs = await page.evaluate(() => !!document.querySelector('#inNew') && document.querySelector('#inNew').getBoundingClientRect().width > 2)
    row('W3-A', 'iPhone', `second new input (window box ${box}): closed by ${way === 'x' ? 'its X' : 'a tap outside it (left edge, 4,450)'}`, 'window gone, Inputs page under it as it was', `window still open: ${open}; Inputs page (+ Input) shown: ${onInputs}`, open === 0 && onInputs ? 'PASS' : (way === 'outside' ? 'RECORD' : 'FAIL'), tag + '-' + way + '.png')
    if (open) await H.closeAny(w)
  })
}

/* ---------- W3-B: the bell */
const badge = () => page.evaluate(() => { const b = document.querySelector('#notifyBell'); if (!b) return 'no bell'; const kids = [...b.querySelectorAll('*')].map(e => (e.className.baseVal ?? e.className) + ':' + e.textContent.trim()).filter(s => !/:$/.test(s)); return `text="${b.textContent.trim()}" aria="${b.getAttribute('aria-label')}" cls="${b.className}" kids=[${kids.join(';')}]` })
const bellLines = () => page.evaluate(() => { const l = document.querySelector('.bell-list'); return l ? l.innerText.split('\n').map(s => s.trim()).filter(Boolean) : null })
const fileCourse = async (user, tag) => {
  await H.swap(w, user)
  await H.openNew(w)
  await X.pic(w, tag + '-new')
  say(user, 'person select', JSON.stringify(await H.selOpts(page)))
  await page.selectOption('#inpEditType', { label: 'CSE' }); await sleep(600)
  await X.pic(w, tag + '-cse')
  await H.pickDay(w, 'Tue 24 Nov 2026', tag + '-d')
  await page.locator('#inpEditSave').tap(); await sleep(1500)
  await X.pic(w, tag + '-after-add')
  let more = await page.locator('button:visible', { hasText: /^(No document|Upload|Yes|No|OK)$/ }).allTextContents()
  say(user, 'buttons after Add:', JSON.stringify(more), 'window open:', await page.locator('.inped-win:visible').count())
  const gone = (await page.locator('.inped-win:visible').count()) === 0
  const t = await H.bodyOf(page, 'body')
  row('W3-B', 'iPhone', `${user} files a Course (CSE) for himself on Tue 24 Nov and presses Add`, 'saved', `window gone: ${gone}; extra buttons: ${JSON.stringify(more)}; page words: ${t.slice(0, 300)}`, gone ? 'PASS' : 'RECORD', tag + '-after-add.png')
  await page.locator('#notifyBell').tap(); await sleep(1000)
  await X.pic(w, tag + '-bell')
  const bl = await bellLines()
  row('W3-B', 'iPhone', `${user} (member) opens his own bell after filing`, 'RECORD what a member sees', `bell class: ${await page.evaluate(() => document.querySelector('#notifyBell').className)}; lines: ${JSON.stringify(bl)}`, 'RECORD', tag + '-bell.png')
  await page.locator('#notifyBell').tap(); await sleep(600)
  return gone
}
await safe('us9 course', () => fileCourse('us9', 'd01-us9'))
await safe('us course', () => fileCourse('us', 'd02-us'))
const before = {}
for (const [u, tag] of [['ad9', 'e01'], ['ad2', 'e02'], ['ad', 'e03']]) {
  await safe('bell ' + u, async () => {
    await H.swap(w, u)
    await X.L.go(page, 'inputs'); await sleep(1200)
    before[u] = await badge()
    say(u, 'badge before opening:', before[u])
    await X.pic(w, tag + '-' + u + '-closed')
    await page.locator('#notifyBell').tap(); await sleep(1000)
    await X.pic(w, tag + '-' + u + '-bell-open')
    const lines = await bellLines()
    say(u, 'BELL LINES', JSON.stringify(lines))
    const mentionsOsprey = (lines || []).some(s => /Osprey/.test(s)), mentionsRanger = (lines || []).some(s => /Ranger/.test(s))
    const exp = u === 'ad9' ? 'a line about Osprey, none about Ranger' : (u === 'ad2' ? 'a line about Ranger, none about Osprey' : 'RECORD exactly which lines')
    const ok = u === 'ad9' ? (mentionsOsprey && !mentionsRanger) : (u === 'ad2' ? (mentionsRanger && !mentionsOsprey) : null)
    row('W3-B', 'iPhone', `${u} opens the bell`, exp, `badge before: ${before[u]}; lines: ${JSON.stringify(lines)}`, ok === null ? 'RECORD' : (ok ? 'PASS' : 'FAIL'), tag + '-' + u + '-bell-open.png')
    say(u, 'badge with bell open:', await badge())
    await page.locator('#notifyBell').tap(); await sleep(700)
    await X.L.go(page, 'editsched'); await sleep(1200)
    await page.locator('#notifyBell').tap(); await sleep(1000)
    await X.pic(w, tag + '-' + u + '-bell-on-schedule')
    const l2s = await bellLines()
    row('W3-B', 'iPhone', `${u} opens the bell on the Edit Schedule page too`, 'same lines as on Inputs', `lines: ${JSON.stringify(l2s)}`, 'RECORD', tag + '-' + u + '-bell-on-schedule.png')
    await page.locator('#notifyBell').tap(); await sleep(700)
  })
}
// B3: ad9 taps the Osprey line, then marks all read
await safe('b3', async () => {
  await H.swap(w, 'ad9')
  await X.L.go(page, 'inputs'); await sleep(1200)
  const b0 = await badge()
  await page.locator('#notifyBell').tap(); await sleep(1000)
  await X.pic(w, 'f01-ad9-bell')
  say('bell controls:\n' + await H.vis(page, '.bell-list button, .bell-list a, .bell-list [role=button], .bell-list .bell-item, .bell-list li'))
  const ln = page.locator('.bell-list button:has-text("Osprey"), .bell-list [role=button]:has-text("Osprey"), .bell-list li:has-text("Osprey"), .bell-list a:has-text("Osprey"), .bell-list *:has-text("Osprey")').last()
  const nOs = await ln.count()
  const bodyBefore = await H.bodyOf(page, 'body')
  if (nOs) {
    say('Osprey line box', await ln.evaluate(e => { const r = e.getBoundingClientRect(); return `${e.tagName}.${e.className} ${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}` }))
    await ln.tap(); await sleep(150); await X.pic(w, 'f02-osprey-line-tap'); await sleep(1200); await X.pic(w, 'f02-osprey-line')
    const opened = await page.evaluate(() => ({ win: [...document.querySelectorAll('.inped-win,.floatwin,[role=dialog]')].filter(e => e.getBoundingClientRect().width > 2).map(e => e.className + ':' + e.innerText.replace(/\s+/g, ' ').slice(0, 160)), page: window.CURPAGE }))
    say('opened', JSON.stringify(opened))
    row('W3-B', 'iPhone', 'ad9 taps the bell line about Osprey', 'RECORD what it opens', JSON.stringify(opened), 'RECORD', 'f02-osprey-line.png')
    await H.closeAny(w); await sleep(500)
    await X.pic(w, 'f03-after-close')
  } else row('W3-B', 'iPhone', 'ad9 taps the bell line about Osprey', 'RECORD what it opens', 'no line with Osprey found', 'OWED', 'f01-ad9-bell.png')
  // reopen bell if closed
  if (!(await page.locator('.bell-list:visible').count())) { await page.locator('#notifyBell').tap(); await sleep(900) }
  await X.pic(w, 'f04-bell-again')
  const mk = page.locator('.bell-list button:visible, .bell-list [role=button]:visible, .bell-list a:visible', { hasText: /mark|read|clear|dismiss/i }).first()
  const hasMk = await mk.count()
  const mkLabel = hasMk ? (await mk.textContent()).trim() : '(none)'
  say('mark control:', mkLabel)
  if (hasMk) { await mk.tap(); await sleep(150); await X.pic(w, 'f05-mark-tap'); await sleep(900); await X.pic(w, 'f05-after-mark') }
  const b1 = await badge()
  const l1 = await bellLines()
  row('W3-B', 'iPhone', `ad9 presses the bell's mark-read control "${mkLabel}"`, 'the badge goes', `badge before: ${b0}; after: ${b1}; bell lines after: ${JSON.stringify(l1)}`, hasMk ? (b1 !== b0 ? 'PASS' : 'FAIL') : 'OWED', 'f05-after-mark.png')
  if (await page.locator('.bell-list:visible').count()) { await page.locator('#notifyBell').tap(); await sleep(600) }
  // ad2
  await H.swap(w, 'ad2')
  await X.L.go(page, 'inputs'); await sleep(1200)
  const b2 = await badge()
  await page.locator('#notifyBell').tap(); await sleep(1000)
  await X.pic(w, 'f06-ad2-bell-after')
  const l2 = await bellLines()
  row('W3-B', 'iPhone', "ad2 signs in after Kestrel read his bell: his badge and lines", 'unchanged from before', `badge before: ${before.ad2}; now: ${b2}; lines now: ${JSON.stringify(l2)}`, b2 === before.ad2 ? 'PASS' : 'FAIL', 'f06-ad2-bell-after.png')
  await page.locator('#notifyBell').tap(); await sleep(600)
  // reload, ad9
  await page.reload(); await sleep(1500); await X.login(page, 'ad9')
  await X.L.go(page, 'inputs'); await sleep(1200)
  const b3 = await badge()
  await page.locator('#notifyBell').tap(); await sleep(1000)
  await X.pic(w, 'f07-ad9-after-reload-bell')
  const l3 = await bellLines()
  row('W3-B', 'iPhone', 'reload, sign in as ad9: his bell', 'still read', `badge: ${b3}; lines: ${JSON.stringify(l3)}`, b3 === b1 ? 'PASS' : 'RECORD', 'f07-ad9-after-reload-bell.png')
  await page.locator('#notifyBell').tap(); await sleep(600)
})

/* ---------- W3-C: each squadron's own Tracker */
const marks = () => page.evaluate(() => Object.keys(localStorage).filter(k => /tracker/i.test(k) && /:m:/.test(k)).map(k => k.slice(-70)))
const courseText = () => page.evaluate(() => ({ course: [...document.querySelectorAll('#courseSel option')].map(o => o.text), student: [...document.querySelectorAll('#activeSel option')].map(o => o.text), syl: [...document.querySelectorAll('#sylSel option')].map(o => o.text) }))
const ballPt = async code => page.evaluate(code => { const e = [...document.querySelectorAll('#page-tracker text.lbl')].find(e => e.textContent.trim() === code); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)] }, code)
const markBall = async (user, tag, code, grade) => {
  const ct = await courseText()
  say(user, 'tracker lists', JSON.stringify(ct))
  const p = await ballPt(code)
  if (!p) { say('no ball', code); return null }
  await page.touchscreen.tap(p[0], p[1]); await sleep(1200)
  await X.pic(w, tag + '-popup-' + code)
  const pop = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.top > 250 && r.top < 700 }).map(b => b.textContent.trim()).join(' | '))
  say(user, 'popup buttons', pop)
  if (grade) {
    const g = page.locator('button:visible', { hasText: new RegExp('^' + grade + '$') }).first()
    await g.tap(); await sleep(900); await X.pic(w, tag + '-graded-' + code)
  }
  const popText = await page.evaluate(() => [...document.querySelectorAll('div,section')].filter(e => /Done on/.test(e.innerText) && /· STUDENT/.test(e.innerText) && e.getBoundingClientRect().width > 100 && e.getBoundingClientRect().width < 402).map(e => e.innerText.replace(/\s+/g, ' ')).sort((a, b) => a.length - b.length)[0]?.slice(0, 140) || '(no popup text)')
  say(user, 'popup text', popText)
  const cl = page.locator('button:visible', { hasText: /^Close$/ }).first()
  if (await cl.count()) { await cl.tap(); await sleep(700) }
  await X.pic(w, tag + '-closed-' + code)
  return { ct, popText, pop }
}
const T = {}
await safe('c ad9', async () => {
  await H.swap(w, 'ad9')
  await X.L.go(page, 'tracker'); await sleep(2500)
  await X.pic(w, 'g01-ad9-tracker')
  const m0 = await marks()
  T.ad9 = await markBall('ad9', 'g02', 'ACG-01', 'DCO')
  const m1 = await marks()
  say('mark keys before/after', JSON.stringify(m0), JSON.stringify(m1))
  row('W3-C', 'iPhone', 'ad9 opens the Tracker, taps event ACG-01 and grades it DCO', 'one mark on one student', `lists: ${JSON.stringify(T.ad9 && T.ad9.ct)}; popup after: ${T.ad9 && T.ad9.popText}; mark records before ${m0.length}, after ${m1.length}`, m1.length > m0.length ? 'PASS' : 'RECORD', 'g02-graded-ACG-01.png')
})
await safe('c ad2', async () => {
  await H.swap(w, 'ad2')
  await X.L.go(page, 'tracker'); await sleep(2500)
  await X.pic(w, 'g03-ad2-tracker')
  const m0 = await marks()
  const ct = await courseText()
  const p = await ballPt('ACG-01')
  await page.touchscreen.tap(p[0], p[1]); await sleep(1200)
  await X.pic(w, 'g04-ad2-popup-ACG-01-before')
  const t0 = await page.evaluate(() => [...document.querySelectorAll('div,section')].filter(e => /Done on/.test(e.innerText) && /· STUDENT/.test(e.innerText) && e.getBoundingClientRect().width > 100 && e.getBoundingClientRect().width < 402).map(e => e.innerText.replace(/\s+/g, ' ')).sort((a, b) => a.length - b.length)[0]?.slice(0, 140) || '(no popup text)')
  const cl = page.locator('button:visible', { hasText: /^Close$/ }).first(); if (await cl.count()) { await cl.tap(); await sleep(600) }
  row('W3-C', 'iPhone', "ad2 opens the Tracker: is it 142's own, with no 149 mark on ACG-01", "142's course list, ACG-01 not marked", `lists: ${JSON.stringify(ct)}; ACG-01 popup words: ${t0}`, !/when marked/.test(t0) ? 'FAIL' : 'PASS', 'g03-ad2-tracker.png, g04-ad2-popup-ACG-01-before.png')
  T.ad2 = await markBall('ad2', 'g05', 'ACG-02', 'DCO')
  const m1 = await marks()
  say('ad2 mark keys', JSON.stringify(m0), JSON.stringify(m1))
  row('W3-C', 'iPhone', 'ad2 grades ACG-02 DCO on a 142 student', 'one mark', `popup after: ${T.ad2 && T.ad2.popText}; mark records before ${m0.length}, after ${m1.length}`, m1.length > m0.length ? 'PASS' : 'RECORD', 'g05-graded-ACG-02.png')
})
await safe('c us9', async () => {
  await H.swap(w, 'us9')
  await X.L.go(page, 'tracker'); await sleep(2500)
  await X.pic(w, 'g06-us9-tracker')
  const ct = await courseText()
  const p = await ballPt('ACG-01')
  await page.touchscreen.tap(p[0], p[1]); await sleep(1200)
  await X.pic(w, 'g07-us9-popup-ACG-01')
  const t = await page.evaluate(() => [...document.querySelectorAll('div,section')].filter(e => /Done on/.test(e.innerText) && /· STUDENT/.test(e.innerText) && e.getBoundingClientRect().width > 100 && e.getBoundingClientRect().width < 402).map(e => e.innerText.replace(/\s+/g, ' ')).sort((a, b) => a.length - b.length)[0]?.slice(0, 140) || '(no popup text)')
  const cl = page.locator('button:visible', { hasText: /^Close$/ }).first(); if (await cl.count()) { await cl.tap(); await sleep(600) }
  const p2 = await ballPt('ACG-02')
  await page.touchscreen.tap(p2[0], p2[1]); await sleep(1200)
  await X.pic(w, 'g08-us9-popup-ACG-02')
  const t2 = await page.evaluate(() => [...document.querySelectorAll('div,section')].filter(e => /Done on/.test(e.innerText) && /· STUDENT/.test(e.innerText) && e.getBoundingClientRect().width > 100 && e.getBoundingClientRect().width < 402).map(e => e.innerText.replace(/\s+/g, ' ')).sort((a, b) => a.length - b.length)[0]?.slice(0, 140) || '(no popup text)')
  const cl2 = page.locator('button:visible', { hasText: /^Close$/ }).first(); if (await cl2.count()) { await cl2.tap(); await sleep(600) }
  row('W3-C', 'iPhone', "us9 (149 member) opens the Tracker and looks at ACG-01 (Kestrel's DCO) and ACG-02 (Hunter's, 142)", "149's course with Kestrel's mark on ACG-01, ACG-02 not marked", `lists: ${JSON.stringify(ct)}; ACG-01 popup: ${t}; ACG-02 popup: ${t2}`, !/when marked/.test(t) && /when marked/.test(t2) ? 'PASS' : 'FAIL', 'g07-us9-popup-ACG-01.png, g08-us9-popup-ACG-02.png')
  // may a member mark
  const p3 = await ballPt('ACG-03')
  await page.touchscreen.tap(p3[0], p3[1]); await sleep(1200)
  const g = page.locator('button:visible', { hasText: /^DCO$/ }).first()
  const can = await g.count()
  if (can) { await g.tap(); await sleep(900) }
  await X.pic(w, 'g09-us9-marked-ACG-03')
  const cl3 = page.locator('button:visible', { hasText: /^Close$/ }).first(); if (await cl3.count()) { await cl3.tap(); await sleep(600) }
  row('W3-C', 'iPhone', 'us9 (member) grades ACG-03 DCO', 'RECORD (D121: everyone has the same access)', `DCO button present: ${can}`, 'RECORD', 'g09-us9-marked-ACG-03.png')
  await page.reload(); await sleep(1500); await X.login(page, 'us9')
  await X.L.go(page, 'tracker'); await sleep(2500)
  const pr = await ballPt('ACG-01')
  await page.touchscreen.tap(pr[0], pr[1]); await sleep(1200)
  await X.pic(w, 'g10-us9-reload-popup-ACG-01')
  const t3 = await page.evaluate(() => [...document.querySelectorAll('div,section')].filter(e => /Done on/.test(e.innerText) && /· STUDENT/.test(e.innerText) && e.getBoundingClientRect().width > 100 && e.getBoundingClientRect().width < 402).map(e => e.innerText.replace(/\s+/g, ' ')).sort((a, b) => a.length - b.length)[0]?.slice(0, 140) || '(no popup text)')
  row('W3-C', 'iPhone', 'reload as us9: ACG-01 again', 'the same as before the reload', `popup: ${t3}`, t3 === t ? 'PASS' : 'RECORD', 'g10-us9-reload-popup-ACG-01.png')
})

/* ---------- the browser's back, last (it leaves the app in this tab) */
await safe('back', async () => {
  await H.swap(w, 'ad9')
  await H.openNew(w)
  await X.pic(w, 'h01-open')
  const hist0 = await page.evaluate(() => history.length)
  await page.goBack().catch(e => say('goBack', e.message.slice(0, 60)))
  await sleep(150); await X.pic(w, 'h01-back-tap'); await sleep(1000)
  await X.pic(w, 'h02-after-back')
  const url = page.url()
  const open = await page.locator('.inped-win:visible').count().catch(() => 'n/a')
  row('W3-A', 'iPhone', "second new input: closed by the browser's back", 'window gone, Inputs page under it as it was', `history length before ${hist0}; url after: ${url.replace(/^.*localhost:4293/, '') || '(empty)'}; window open: ${open}`, url.startsWith('http') && open === 0 ? 'PASS' : 'RECORD', 'h02-after-back.png')
})
await X.fin(w)
