// [RD-LEFT-1108] Walker A, part 1 — every screen the change touches, pictured on `main`'s build twice and on the
// branch's build, at his PC's 1536 (Chromium, 125%) and his iPhone's 402 (WebKit, 3x, by touch), the clock held at
// 2026-11-08 09:00 +08, then each picture compared (no pixel more than 24 colour levels off). The same build twice first.
// Each (build, size) is ONE world: Astra's people made through Admin → Users, a request made through the access screen,
// then every screen reached by pressing its controls. Method: scripts/handpass/rss1108-same.mjs.
// Usage, from raptor-port/:  node scripts/handpass/rdl1108-same.mjs <before dist> <after dist> <out folder> [only,size-names]
import { chromium, webkit, LAUNCH, world, fixtures, request, adminCat, tab, press, pressText, openRow, rowOf, phoneOf, V, firstLine, pressText as pt, signIn, QUIET } from './rdl1108-a-lib.mjs'
import { pictureDiff } from '../drawcheck/lib.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
console.log('[rdl1108-same v1]')
const [before, after, out, onlyArg = ''] = process.argv.slice(2)
const ONLY = onlyArg.split(',').filter(Boolean)
mkdirSync(out, { recursive: true })
const record = {}

async function pass(dist, origin, tag, br, size) {
  const phone = size === 'phone'
  const pics = {}
  const open = async (name, fn) => { /* a screen: reach it; a failure is recorded, the picture still taken */ }
  const w = await world(br, dist, origin, { phone })
  const p = w.p
  const snap = async (name, why = '') => {
    await p.clock.runFor(900)
    const f = path.join(out, `${tag}-${size}-${name}.png`)
    await p.screenshot({ path: f, fullPage: false })
    pics[`${size}-${name}`] = f
    const stands = await p.evaluate(() => ({ h: [...document.querySelectorAll('#page-admin h3, #page-admin .adm-sub, .acc-edit')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.className || e.tagName) + ':' + (e.textContent || '').slice(0, 24)).slice(0, 8), sy: scrollY }))
    ;(record[`${size}-${name}`] ||= {})[tag] = { why, stands }
  }
  const step = async (name, fn) => { if (ONLY.length && !ONLY.includes(name)) return; try { await fn(); await snap(name) } catch (e) { console.log(`  ${tag} ${size} ${name}: could not reach — ${firstLine(e)}`); await snap(name, 'NOT REACHED: ' + firstLine(e)) } }
  const fill = async (sel, v) => { const l = p.locator(V(sel)).first(); await l.scrollIntoViewIfNeeded(); await l.fill(v); await p.clock.runFor(300) }
  const top = async sel => { await p.locator(V(sel)).first().evaluate((e, c) => e.scrollIntoView({ block: c ? 'center' : 'start' }), !!process.env.CENTER); await p.clock.runFor(300) }
  const find = async v => { await p.evaluate(() => scrollTo(0, 0)); const b = p.locator(V('#accFind')).first(); await b.fill(v); await p.clock.runFor(400) }
  const cancel = async sel => { if (await p.locator(V(sel)).count()) await press(p, sel) }

  if (!process.env.SKIPFIX) { await fixtures(p); await request(p) }
  await adminCat(p, 'Users')
  await step('users-top', async () => {})
  await step('users-rd', async () => { await find('RD'); await top('#accList') })
  for (const cs of ['RDACTIVE', 'RDWSO', 'RDGROUND', 'RDNOSIGN', 'RDSUSP', 'RDADMIN2']) {
    await step(`ed-${cs}`, async () => { await find('RD'); await openRow(p, cs); await top(`.acc-row[data-person] .acc-edit`) })
    await cancel('#accEdCancel')
  }
  await step('ed-RDACTIVE-armed', async () => { await find('RD'); await openRow(p, 'RDACTIVE'); await press(p, '#accEdDel'); await top('.acc-edit') })
  await cancel('#accEdCancel')
  await step('ed-RDNOSIGN-typed', async () => { await find('RD'); await openRow(p, 'RDNOSIGN'); await fill('#accGiveName', 'typed@example.test'); await p.locator(V('#accGiveRole')).first().selectOption('admin'); await top('.acc-edit') })
  await cancel('#accEdCancel')
  await step('ed-RDACTIVE-cancelled', async () => { await find('RD'); await top('#accList') })
  await step('own-row', async () => { await find('Saber'); const r = rowOf(p, 'Saber'); await (phone ? r.locator('.acc-main').tap({ force: true }).catch(() => {}) : r.locator('.acc-main').click({ force: true, timeout: 2000 }).catch(() => {})); await p.clock.runFor(500) })
  await step('torch-row', async () => { await find('Torch') })
  await step('torch-open', async () => { await find('Torch'); await openRow(p, 'Torch'); await top('.acc-edit') })
  await cancel('#accEdCancel')
  for (const cs of ['RDARCH', 'RDARCHF', 'RDARCHN']) {
    await step(`arch-${cs}`, async () => { await find('RDARCH'); await openRow(p, cs, true); await top('.acc-edit') })
    await cancel('#accArCancel')
  }
  await step('arch-RDARCH-typed', async () => { await find('RDARCH'); await openRow(p, 'RDARCH', true); await fill('#accArCs', 'RDNEWNAME'); await top('.acc-edit') })
  await cancel('#accArCancel')
  await step('arch-RDARCHF-armed', async () => { await find('RDARCH'); await openRow(p, 'RDARCHF', true); await press(p, '#accArDel'); await top('.acc-edit') })
  await cancel('#accArCancel')
  await find('')
  await step('give-roster', async () => { await p.evaluate(() => scrollTo(0, 0)); await press(p, '[data-approve]'); await top('[data-approving]') })
  await step('give-new', async () => { await press(p, '#apvModeNew'); await top('[data-approving]') })
  await step('give-new-typed', async () => { await fill('#apvCs', 'RDLONGNAME1234'); await top('[data-approving]') })
  await cancel('#apvCancel')
  await step('add-person', async () => { await top('#accAddBlock') })
  await step('add-person-filled', async () => { await fill('#accAddCs', 'RDXYZ'); await fill('#accAddName', 'xyz@example.test'); await top('#accAddBlock') })
  await step('data-default', async () => { await adminCat(p, 'Data') })
  for (const m of ['on', 'range', 'before']) {
    await step(`wipe-${m}`, async () => { await p.locator(V('#admWipeMode')).first().selectOption(m); await p.clock.runFor(400); await top('#admWipeMode') })
  }
  for (const m of ['on', 'range']) {
    await step(`log-${m}`, async () => { await p.locator(V('#admLogMode')).first().selectOption(m); await p.clock.runFor(400); await top('#admLogMode') })
  }
  await step('data-both-range', async () => { await p.locator(V('#admWipeMode')).first().selectOption('range'); await p.locator(V('#admLogMode')).first().selectOption('range'); await p.clock.runFor(400); await p.evaluate(() => scrollTo(0, 0)) })
  await step('help-form', async () => { await tab(p, 'help') })
  await step('inputs-window', async () => {
    await tab(p, 'inputs')
    if (await p.locator(V('#inCalBtn')).count()) await press(p, '#inCalBtn')
    await p.locator('#inpCal [data-icday="2026-11-10"]').first().click({ position: { x: 8, y: 8 }, timeout: 6000 }); await p.clock.runFor(500)
    await press(p, '#icPopAdd')
  })
  record[`${size}-errs`] = { ...(record[`${size}-errs`] || {}), [tag]: { page: w.errs.slice(0, 6), http: w.bad.slice(0, 6) } }
  await w.ctx.close()

  /* the sign-in and access screens: a world with nobody signed in */
  const v = await world(br, dist, origin, { phone, noSign: true })
  const q = v.p
  const snap2 = async name => { await q.clock.runFor(900); const f = path.join(out, `${tag}-${size}-${name}.png`); await q.screenshot({ path: f }); pics[`${size}-${name}`] = f; ;(record[`${size}-${name}`] ||= {})[tag] = {} }
  try {
    await snap2('signin')
    await q.fill('#luser', 'newcomer@example.test'); await q.fill('#lpass', 'x'); await q.click('#loginForm button[type=submit]'); await q.clock.runFor(900)
    await snap2('access-form')
    const caret = await q.evaluate(() => ({ active: document.activeElement && (document.activeElement.id || document.activeElement.tagName) }))
    record[`${size}-access-form`][tag].active = caret.active
    await q.fill('#accCs', 'RDNEWCOMER'); await q.fill('#accIni', 'NC'); await q.selectOption('#accSeat', 'FCP'); await q.selectOption('#accCat', 'D')
    await snap2('access-filled')
    await q.fill('#accCs', 'ABCDEFGHIJKLMNO'); await snap2('access-long')
    await q.fill('#accCs', 'RDNEWCOMER')
    await press(q, '#accSend'); await q.clock.runFor(900)
    await snap2('access-sent')
  } catch (e) { console.log(`  ${tag} ${size} access: could not reach — ${firstLine(e)}`) }
  record[`${size}-errs`][`${tag}-access`] = { page: v.errs.slice(0, 6), http: v.bad.slice(0, 6) }
  await v.ctx.close()
  return pics
}

async function shoot(dist, origin, tag) {
  const all = {}
  for (const [size, engine] of [['desk', 'chromium'], ['phone', 'webkit']]) {
    const br = engine === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
    try { Object.assign(all, await pass(dist, origin, tag, br, size)) } catch (e) { console.log(`  ${tag} ${size}: PASS FAILED — ${firstLine(e)}`) }
    await br.close()
  }
  return all
}
const A = await shoot(before, 'http://localhost:4401', 'before'), A2 = await shoot(before, 'http://localhost:4401', 'before-again'), B = await shoot(after, 'http://localhost:4402', 'after')
const cmp = await chromium.launch(LAUNCH)
let same = 0, diff = 0, noise = 0
for (const k of Object.keys(A)) {
  if (!A2[k] || !B[k]) { console.log(`MISS  ${k}: before-again ${!!A2[k]} after ${!!B[k]}`); diff++; continue }
  const self = await pictureDiff(cmp, A[k], A2[k]), d = await pictureDiff(cmp, A[k], B[k])
  const ok = d.same !== false && !(d.share > 0)
  const isNoise = !ok && self.same === false && d.pixels <= self.pixels * 1.5
  ok ? same++ : isNoise ? noise++ : diff++
  const verdict = ok ? 'SAME' : isNoise ? 'NOISE' : 'DIFF'
  record[k].self = self; record[k].diff = d; record[k].verdict = verdict
  console.log(`${verdict.padEnd(5)} ${k}  self: ${self.same === false ? self.pixels + 'px' : 'same'}  vs after: ${d.same === false ? JSON.stringify({ px: d.pixels, where: d.where, why: d.why }) : 'same'}`)
}
await cmp.close()
writeFileSync(path.join(out, 'record.json'), JSON.stringify(record, null, 1))
console.log(`${same} the same, ${noise} differ only as the same build differs from itself, ${diff} differ; ${Object.keys(A).length} screens`)
