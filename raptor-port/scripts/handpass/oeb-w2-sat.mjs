// W2.3, W2.5, W2.6, W2.7 + A2, A3, A8, A9, A10, A17, A18, A19, A21, A23 on the saved Saturday. SIZE=phone|pc, ONLY=a,b,...
import { newWorld, openBoard, oilOn, sleep, close, shot, setField, fieldVal, tapSpec, tag, wrapCls, selCount, toast, press, standAt, tapAndRead, VERSION } from './oeb-w2-lib.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
const size = process.env.SIZE || 'pc'
const ALL = 's3,s5,s6,s7,s8,s9,s10,s17,s18,s19,s21a,s21b,s21c,s23a,s23b'
const only = (process.env.ONLY || ALL).split(',')
console.log(VERSION, 'sat', size)
const OUT = 'C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/e324d8f6-0c85-4339-be37-1d188075a056/scratchpad/res'
mkdirSync(OUT, { recursive: true })
const res = {}
const slim = r => r && r.missing ? { MISSING: r.n, tag: r.tag } : r && { note: r.note, op: r.noteOp, sel: r.sel, selAfter: r.selAfter, fpSame: r.fpSame, hit: r.hit, wrap: r.tag && r.tag.wrap, title: r.tag && r.tag.title }
async function scen(id, fn) {
  if (!only.includes(id)) return
  const w = await newWorld(size, 'sat')
  try {
    await openBoard(w)
    const n = await w.page.evaluate(() => document.querySelectorAll('#schedBoard .puck').length)
    if (n < 100) throw new Error('saved Saturday not loaded: pucks ' + n)
    res[id] = await fn(w)
    res[id].errors = w.errors.filter(e => !/storage may be full/.test(e))
  } catch (e) { res[id] = { error: e.message.slice(0, 300) } }
  console.log(id, JSON.stringify(res[id]))
  await close(w)
}
const T = async (w, spec, name) => { const r = await tapSpec(w, spec, `${name}-${size}`); await sleep(2300); return slim(r) }
const daySwitch = async (w) => { await press(w, '#schedBoard .daybar label.lgmix'); await sleep(600); return w.page.evaluate(() => !!document.querySelector('#schedBoard .daybar input[data-oilblank]')?.checked) }
const item = (w, text) => w.page.locator('#schedBoard .oilitem', { hasText: text }).filter({ visible: true }).first()
const pressItem = async (w, text) => { const l = item(w, text); await l.scrollIntoViewIfNeeded(); await sleep(250); const before = await selCount(w.page); await w.page.evaluate(() => { const t = document.querySelector('#toastEl'); if (t) t.textContent = '' }); if (w.phone) await l.tap(); else await l.click(); await sleep(250); const t = await toast(w.page); await shot(w, `item-${text.replace(/\W/g, '')}-${size}-${Date.now() % 100000}`); await sleep(2300); return { note: t && t.text, sel: await selCount(w.page), selBefore: before } }
const winOpen = async (w, nth = 0) => {
  const c = w.page.locator('#schedBoard .oilcount').filter({ visible: true }).nth(nth)
  await c.scrollIntoViewIfNeeded(); await sleep(250)
  if (w.phone) await c.tap(); else await c.click()
  await sleep(700)
  return w.page.evaluate(() => !!document.querySelector('.availwin'))
}
const winState = w => w.page.evaluate(() => {
  const x = document.querySelector('.availwin'); if (!x) return null
  const seats = [...x.querySelectorAll('.seat.oilpk')].map(s => [s.dataset.oilp || '', ['on', 'off', 'inert'].find(k => s.classList.contains(k)) || '?'])
  return { tabs: [...x.querySelectorAll('.win-tab')].map(t => t.textContent.replace(/\s+/g, ' ').trim()), nSeats: seats.length, inert: seats.filter(s => s[1] === 'inert').map(s => s[0]), on: seats.filter(s => s[1] === 'on').length, off: seats.filter(s => s[1] === 'off').length, tail: x.innerText.replace(/\s+/g, ' ').slice(-260) }
})
const winClose = async w => { const x = w.page.locator('.availwin .win-x').first(); if (await x.count()) { if (w.phone) await x.tap(); else await x.click(); await sleep(400) } }
const winTab = async (w, i) => { const t = w.page.locator('.availwin .win-tab').nth(i); if (await t.count()) { if (w.phone) await t.tap(); else await t.click(); await sleep(400) } }
const winSeat = async (w, which, name) => {
  const sel = `.availwin .seat.oilpk${which ? '.' + which : ''}`
  const s = w.page.locator(sel).filter({ visible: true }).first()
  if (!(await s.count())) return { none: true }
  await s.scrollIntoViewIfNeeded(); await sleep(200)
  const pid = await s.getAttribute('data-oilp'); const title = await s.getAttribute('title')
  const before = await w.page.evaluate(() => document.querySelector('.availwin').innerText.replace(/\s+/g, ' ').slice(-200))
  await w.page.evaluate(() => { const t = document.querySelector('#toastEl'); if (t) t.textContent = '' }); 
  if (w.phone) await s.tap(); else await s.click()
  await sleep(w.phone ? 100 : 200); if (w.phone) await shot(w, `${name}-${size}-phone-right-after-tap`)
  await sleep(200)
  const t = await toast(w.page)
  await shot(w, `${name}-${size}-after`)
  const after = await w.page.evaluate(() => document.querySelector('.availwin').innerText.replace(/\s+/g, ' ').slice(-200))
  await sleep(1000)
  return { pid, title, note: t && t.text, sel: await selCount(w.page), footerBefore: before, footerAfter: after }
}

await scen('s3', async w => {
  await setField(w, 'ff:5.0.0.to', ''); await setField(w, 'ff:5.0.0.ld', '')
  const v = [await fieldVal(w.page, 'ff:5.0.0.to'), await fieldVal(w.page, 'ff:5.0.0.ld')]
  await oilOn(w, true)
  return { toLd: v, ranger: await T(w, { cs: 'Ranger', key: 'ff:5.0.0' }, 's3-fcp-ranger'), echo: await T(w, { cs: 'Echo', key: 'ff:5.0.0' }, 's3-rcp-echo') }
})
await scen('s5', async w => {
  await oilOn(w, true)
  const before = await tag(w.page, { cs: 'Saber', key: 'ap:5.1' })
  const off = await pressItem(w, 'MASS BRIEF')
  const after = await tag(w.page, { cs: 'Saber', key: 'ap:5.1' })
  return { before, itemOff: off, saberAfterOff: after, saber: await T(w, { cs: 'Saber', key: 'ap:5.1' }, 's5-saber-eventoff'), torch: await T(w, { cs: 'Torch', key: 'ap:5.1' }, 's5-torch-eventoff') }
})
await scen('s6', async w => {
  await oilOn(w, true)
  const r = {}
  r.body = await T(w, { cs: 'ALL AVAIL', key: 'ap:5.0', exact: true }, 's6-allavail-body')
  await shot(w, `s6-${size}-before-count`)
  r.countOpens = await winOpen(w); await shot(w, `s6-${size}-count-window-open`); r.win = await winState(w); await winClose(w)
  r.daySwitch = await daySwitch(w)
  r.bodyUnderSwitch = await T(w, { cs: 'ALL AVAIL', key: 'ap:5.0', exact: true }, 's6-allavail-body-switchon')
  r.countOpensUnderSwitch = await winOpen(w); await shot(w, `s6-${size}-count-window-switchon`); await winClose(w)
  return r
})
await scen('s7', async w => {
  await setField(w, 'dr:5.0.0.end', '')
  await oilOn(w, true)
  const r = { opens: await winOpen(w) }
  await winTab(w, 1)
  r.state = await winState(w); await shot(w, `s7-${size}-window-oil-tab`)
  r.inertSeat = await winSeat(w, 'inert', 's7-inert-seat')
  r.onSeat = await winSeat(w, 'on', 's7-on-seat')
  r.stateAfter = await winState(w)
  // day switch on, then a man in the window
  r.daySwitch = await daySwitch(w)
  r.seatUnderSwitch = await winSeat(w, '', 's7-seat-switchon')
  r.winStill = !!(await winState(w))
  return r
})
await scen('s8', async w => {
  await oilOn(w, true)
  const r = { who: 'Sidewinder (Duty), Talisman (Training) under Personal Inputs' }
  r.off = await T(w, { cs: 'Sidewinder', key: 'dn:5.0' }, 's8-sidewinder-off'); r.afterOff = (await tag(w.page, { cs: 'Sidewinder', key: 'dn:5.0' })).wrap
  r.on = await T(w, { cs: 'Sidewinder', key: 'dn:5.0' }, 's8-sidewinder-on'); r.afterOn = (await tag(w.page, { cs: 'Sidewinder', key: 'dn:5.0' })).wrap
  // off again, then Undo, Redo
  await T(w, { cs: 'Sidewinder', key: 'dn:5.0' }, 's8-sidewinder-off2')
  const modeOn = () => w.page.evaluate(() => !!document.querySelector('#schedBoard .daybar.oilon'))
  const wr = async () => (await tag(w.page, { cs: 'Sidewinder', key: 'dn:5.0' })).wrap
  r.beforeUndo = await wr()
  await press(w, '#sbUndo'); await sleep(700); r.afterUndo1 = { mode: await modeOn(), wrap: await wr() }; await shot(w, `s8-${size}-after-undo1`)
  if (!r.afterUndo1.mode) { await oilOn(w, true) }
  if (/ on/.test(' ' + (await wr()))) { r.undoEffect = 'puck back on' } else { await press(w, '#sbUndo'); await sleep(700); r.afterUndo2 = { mode: await modeOn(), wrap: await wr() } }
  await press(w, '#sbRedo'); await sleep(700); r.afterRedo = { mode: await modeOn(), wrap: await wr() }; await shot(w, `s8-${size}-after-redo`)
  if (!(await modeOn())) await oilOn(w, true)
  r.talisman = await T(w, { cs: 'Talisman', key: 'dn:5.0' }, 's8-talisman-off')
  r.talismanBack = await T(w, { cs: 'Talisman', key: 'dn:5.0' }, 's8-talisman-on')
  r.daySwitch = await daySwitch(w)
  r.sidewinderUnderSwitch = await T(w, { cs: 'Sidewinder', key: 'dn:5.0' }, 's8-sidewinder-switchon')
  return r
})
await scen('s9', async w => {
  await oilOn(w, true)
  const r = { daySwitch: await daySwitch(w) }
  r.namedCp = await T(w, { cs: 'Saber', key: 'ap:5.1' }, 's9-saber-cp')
  r.eventMark = await pressItem(w, 'MASS BRIEF')
  r.itemClassAfter = await item(w, 'MASS BRIEF').getAttribute('class')
  r.windowOpens = await winOpen(w); await winTab(w, 1)
  r.windowSeat = await winSeat(w, '', 's9-window-seat')
  return r
})
await scen('s10', async w => {
  await oilOn(w, true)
  const r = {}
  const cl = async cs => (await tag(w.page, { cs, key: 'ap:5.1' })).wrap
  r.start = { saber: await cl('Saber'), torch: await cl('Torch') }
  r.torchOff = await T(w, { cs: 'Torch', key: 'ap:5.1' }, 's10-torch-off'); r.afterTorchOff = await cl('Torch')
  r.daySwitch = await daySwitch(w)
  r.torchUnderSwitch = await T(w, { cs: 'Torch', key: 'ap:5.1' }, 's10-torch-switchon')
  r.daySwitchOff = !(await daySwitch(w))
  r.afterSwitchOff = { saber: await cl('Saber'), torch: await cl('Torch') }
  await shot(w, `s10-${size}-after-switch-off`)
  r.eventOff = await pressItem(w, 'MASS BRIEF')
  r.saberEventOff = await T(w, { cs: 'Saber', key: 'ap:5.1' }, 's10-saber-eventoff')
  r.torchEventOff = await T(w, { cs: 'Torch', key: 'ap:5.1' }, 's10-torch-eventoff')
  r.eventOn = await pressItem(w, 'MASS BRIEF')
  r.afterEventBack = { saber: await cl('Saber'), torch: await cl('Torch') }
  await shot(w, `s10-${size}-after-event-back`)
  return r
})
await scen('s17', async w => {
  await oilOn(w, true)
  const r = {}
  r.outlaw = await T(w, { cs: 'Outlaw', key: 'dr:5.0.2' }, 's17-outlaw-0700-0700')
  r.warden = await T(w, { cs: 'Warden', key: 'dr:5.0.1' }, 's17-warden-notimes')
  await oilOn(w, false)
  await setField(w, 'dr:5.0.0.str', '08:00'); await setField(w, 'dr:5.0.0.end', '08:00')
  r.deskTimes = [await fieldVal(w.page, 'dr:5.0.0.str'), await fieldVal(w.page, 'dr:5.0.0.end')]
  await oilOn(w, true)
  r.fable0800 = await T(w, { cs: 'Fable', key: 'dr:5.0.0' }, 's17-fable-0800-0800')
  r.extrasPucks = await w.page.evaluate(() => [...document.querySelectorAll('#sbBoard [class*="more"] .puck, #sbBoard .xtra .puck, #sbBoard [data-more] .puck')].length)
  return r
})
await scen('s18', async w => {
  await setField(w, 'sr:5.amt.1.end', ''); await setField(w, 'sr:5.oft.0.end', '')
  const r = { ends: [await fieldVal(w.page, 'sr:5.amt.1.end'), await fieldVal(w.page, 'sr:5.oft.0.end')] }
  r.roles = await w.page.evaluate(() => [...document.querySelectorAll('#sbBoard .puck')].filter(p => { let e = p, k = ''; for (let i = 0; i < 8 && e; i++, e = e.parentElement) { const f = e.querySelector('[data-bfld]'); if (f) { k = f.dataset.bfld; break } } return /^sr:5/.test(k) && p.getBoundingClientRect().width > 2 }).map(p => p.textContent.trim().slice(0, 10) + ' in ' + String(p.parentElement.className).slice(0, 30)))
  await oilOn(w, true)
  r.cinch = await T(w, { cs: 'Cinch', key: 'sr:5.amt' }, 's18-box-cinch')
  r.cinder = await T(w, { cs: 'Cinder', key: 'sr:5.amt' }, 's18-box-cinder')
  r.reaper = await T(w, { cs: 'Reaper', key: 'sr:5.oft' }, 's18-ep6-reaper')
  r.basher = await T(w, { cs: 'Basher', key: 'sr:5.oft' }, 's18-ep6-basher')
  return r
})
await scen('s19', async w => {
  await setField(w, 'ap:5.1.str', ''); await setField(w, 'ap:5.1.end', '')
  await setField(w, 'gr:5.0.str', ''); await setField(w, 'gr:5.0.end', '')
  await setField(w, 'gr:5.2.str', ''); await setField(w, 'gr:5.2.end', '')
  const r = { times: ['ap:5.1.str', 'ap:5.1.end', 'gr:5.0.str', 'gr:5.0.end', 'gr:5.2.str', 'gr:5.2.end'].map(k => k + '=' + 'x') }
  r.times = []; for (const k of ['ap:5.1.str', 'ap:5.1.end', 'gr:5.0.str', 'gr:5.0.end', 'gr:5.2.str', 'gr:5.2.end']) r.times.push(k + '=' + (await fieldVal(w.page, k)))
  await oilOn(w, true)
  r.cpSaber = await T(w, { cs: 'Saber', key: 'ap:5.1' }, 's19-cp-saber')
  r.cpTorch = await T(w, { cs: 'Torch', key: 'ap:5.1' }, 's19-cp-torch')
  r.grSaber = await T(w, { cs: 'Saber', key: 'gr:5.0' }, 's19-ground-saber')
  r.grTalisman = await T(w, { cs: 'Talisman', key: 'gr:5.2' }, 's19-ground-talisman')
  return r
})
const cxinfo = async (w, sel) => { const b = w.page.locator(sel).filter({ visible: true }).first(); await b.scrollIntoViewIfNeeded(); await sleep(250); if (w.phone) await b.tap(); else await b.click(); await sleep(600); const cl = w.page.getByRole('button', { name: 'Cancel line' }); if (await cl.count()) { if (w.phone) await cl.tap(); else await cl.click(); await sleep(700) } return b.getAttribute('class') }
await scen('s21a', async w => {
  const r = {}
  r.cxGround = await cxinfo(w, '[data-grcx="5.0"]')
  await oilOn(w, true)
  r.groundCxSaber = await T(w, { cs: 'Saber', key: 'gr:5.0' }, 's21-ground-cx-saber')
  return r
})
await scen('s21c', async w => {
  const r = {}
  r.cxCp = await cxinfo(w, '[data-pcx="5.1"]')
  await oilOn(w, true)
  r.cpCxSaber = await T(w, { cs: 'Saber', key: 'ap:5.1' }, 's21-cp-cx-saber')
  r.cpCxTorch = await T(w, { cs: 'Torch', key: 'ap:5.1' }, 's21-cp-cx-torch')
  return r
})
await scen('s21b', async w => {
  const r = {}
  r.infoCp = await cxinfo(w, '[data-pinfo="5.1"]')
  r.infoGround = await cxinfo(w, '[data-grinfo="5.0"]')
  await oilOn(w, true)
  r.cpInfoSaber = await T(w, { cs: 'Saber', key: 'ap:5.1' }, 's21-cp-info-saber')
  r.cpInfoTorch = await T(w, { cs: 'Torch', key: 'ap:5.1' }, 's21-cp-info-torch')
  r.groundInfoSaber = await T(w, { cs: 'Saber', key: 'gr:5.0' }, 's21-ground-info-saber')
  return r
})
await scen('s23a', async w => {
  await oilOn(w, true)
  const r = {}
  const t = await tag(w.page, { cs: 'Warden', key: 'dr:5.0.1' }); r.tag = t
  const box = await w.page.locator('[data-w2="1"]').boundingBox(); r.box = box
  r.letters = slim(await tapSpec(w, { cs: 'Warden', key: 'dr:5.0.1' }, `s23-warden-letters-${size}`, 420, { x: Math.round(box.width) - 4, y: Math.round(box.height / 2) })); await sleep(2300)
  r.edge = slim(await tapSpec(w, { cs: 'Warden', key: 'dr:5.0.1' }, `s23-warden-edge-${size}`, 420, { x: 1, y: 1 })); await sleep(2300)
  r.body = slim(await tapSpec(w, { cs: 'Warden', key: 'dr:5.0.1' }, `s23-warden-body-${size}`, 420, { x: Math.round(box.width / 3), y: Math.round(box.height / 2) })); await sleep(2300)
  r.warnMarks = await w.page.evaluate(() => [...document.querySelectorAll('#sbBoard .puck.oilpk, #sbBoard .oilpk.inert .puck')].filter(p => p.querySelector('.warn,.wflag,.flag') || p.classList.contains('warn')).length)
  return r
})
await scen('s23b', async w => {
  const r = {}
  // outside the mode first: pick a man
  r.pick = slim(await tapSpec(w, { cs: 'Saber', key: 'gr:5.0' }, `s23-pick-saber-outside-${size}`)); await sleep(500)
  r.selBeforeMode = await selCount(w.page)
  await oilOn(w, true)
  r.selAfterEnterMode = await selCount(w.page)
  r.lit = await w.page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck.sel')].map(p => p.textContent.trim()))
  r.wardenTap = slim(await tapSpec(w, { cs: 'Warden', key: 'dr:5.0.1' }, `s23-warden-after-pick-${size}`))
  r.litAfter = await w.page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck.sel')].map(p => p.textContent.trim()))
  return r
})
writeFileSync(`${OUT}/sat-${size}-${Date.now() % 100000}.json`, JSON.stringify(res, null, 1))
