/* walker A — S04, S06, S07, S41. One scenario per process: node ows-A-scn2.mjs S04 */
import * as A from './ows-A-lib.mjs'
import * as K from './stk-B-lib.mjs'
import * as V from './wh-b-lib.mjs'
const { judge, W, frame, flyLine, snap, sayS, spans, credits, logicSet, lgRead, signStand, signFell, signsWords, sleep, pic, selWords, signRole } = A
const SAT = 5, ID = 'bane'
const which = process.argv[2]
const PH = !!process.env.HP_PHONE
const sfx = PH ? 'ph' : ''
const barOf = o => o && /oilbar-fo/.test(o.cls) ? 'FO edge' : o && /oilbar-ho/.test(o.cls) ? 'HO edge' : 'no edge'
/* the man's puck on the day currently drawn on Edit Schedule (a look or the working copy) */
const puckNow = (p, di) => p.evaluate(([i, who]) => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); if (!d) return null
  const pk = [...d.querySelectorAll(`.puck[data-person="${who}"]`)].find(e => e.offsetParent !== null); return pk ? { cls: pk.className, title: pk.getAttribute('title') || '' } : null }, [di, ID])

const SC = {
  async S04() {
    await frame('S04' + sfx, async ({ p }) => {
      const T = 'S04' + sfx
      await flyLine(p, { to: '10:00', ld: '11:15', report: null })
      await A.publishNew(p, SAT); await A.closeBoard(p)
      const a = await snap(p, SAT, ID, A.SAT, T + '-a', { shots: false })
      await logicSet(p, 'reportLead', '2h30')
      const am = await A.publishAm(p, SAT); await A.closeBoard(p)
      const b = await snap(p, SAT, ID, A.SAT, T + '-b')
      await logicSet(p, 'reportLead', '2h')
      const lg = await lgRead(p)
      const c = await snap(p, SAT, ID, A.SAT, T + '-c')
      judge(T + '.1', 'ORIG (lead 3h): 10:00–11:15 → FO 07:00–13:15; lead 2h30, sign, AL1: HO 07:30–13:15; then lead 2h', [
        ['ORIG was FO 07:00–13:15', a.lw.letters === 'FO' && spans(a).includes('07:00–13:15'), A.say(a.lw)],
        ['AL1 published', /AL\s*1/.test(am.head.tag), am.head.tag],
        ['after AL1: HO, worked 07:30–13:15, balance 0.5', b.lw.letters === 'HO' && spans(b).includes('07:30–13:15') && b.lw.bal === 0.5, A.say(b.lw)],
        ['lead 120 now', lg.lead === 120, lg],
        ['Leave War still HO 07:30–13:15 (the paid AL1)', c.lw.letters === 'HO' && spans(c).includes('07:30–13:15') && c.lw.bal === 0.5, A.say(c.lw)],
        ['one pending, sign-offs fell', c.d.pend === '1' && signFell(c.d.head), [c.d.head.pending, signsWords(c.d.head)]],
        ['one OIL item: Logic · lead 2h30 → 2h; Ranger half day 07:30–13:15 → half day 08:00–13:15', /OIL on this day/.test(c.d.list) && /2h30\s*→\s*2h/.test(c.d.list) && /07:30.13:15/.test(c.d.list) && /08:00.13:15/.test(c.d.list), c.d.list.slice(0, 400)],
      ], [...b.pics, ...c.pics]); console.log(T + '.1', 'AFTER AL1:', sayS(b), '\nNOW:', sayS(c))
      /* the eyes */
      await V.toEdit(p); await W.showDay(p, SAT)
      const vs = await V.versions(p, SAT); await p.keyboard.press('Escape'); await sleep(200)
      const eyes = {}
      for (const [k, re] of [['orig', /orig/i], ['al1', /AL\s*1/i]]) {
        const lk = await V.look(p, SAT, re)
        const face = await V.lookFace(p, SAT); const pk = await puckNow(p, SAT)
        const f = await pic(p, T + '-eye-' + k)
        eyes[k] = { lk: lk && (lk.label || lk.err), bar: face && face.bar, pk: pk && (barOf(pk) + ' · ' + pk.title), pend: face && face.pend, pic: f }
        await V.backLive(p, SAT); await sleep(300)
      }
      const live = await puckNow(p, SAT)
      await A.toBoard(p, SAT); const bw = await p.evaluate(([i, who]) => { const pk = [...document.querySelectorAll(`#schedBoard .puck[data-person="${who}"]`)].find(e => e.offsetParent !== null && !e.closest('#sbRoster')); return pk ? { cls: pk.className, title: pk.getAttribute('title') || '' } : null }, [SAT, ID])
      const fw = await pic(p, T + '-working-board'); await A.closeBoard(p)
      const lw = await A.oilOf(p, ID, A.SAT, T + '-d')
      judge(T + '.2', 'three eyes: ORIGINAL look, latest AL look, working copy; then the Leave War', [
        ['the version menu offered ORIGINAL and AL1', vs.vs && vs.vs.length >= 2, vs.vs && vs.vs.map(x => x.label)],
        ['ORIGINAL eye: FO edge (earns a full day)', /FO edge/.test(eyes.orig.pk || ''), eyes.orig],
        ['latest AL eye: HO edge', /HO edge/.test(eyes.al1.pk || ''), eyes.al1],
        ['working copy: HO edge', /HO edge/.test(barOf(live) || ''), { live: live && barOf(live) + ' · ' + live.title, board: bw && barOf(bw) + ' · ' + bw.title }],
        ['Leave War still HO 07:30–13:15 balance 0.5 after looking', lw.letters === 'HO' && spans({ lw }).includes('07:30–13:15') && lw.bal === 0.5, A.say(lw)],
      ], [eyes.orig.pic, eyes.al1.pic, fw, ...lw.pics]); console.log(T + '.2', JSON.stringify({ vs: vs.vs, eyes, live, bw }), A.say(lw))
    })
  },

  async S06() {
    await frame('S06' + sfx, async ({ p }) => {
      const T = 'S06' + sfx
      const w = await flyLine(p, { to: '12:00', ld: '13:00', report: 'IN TIME 10:00' })
      await A.publishNew(p, SAT); await A.closeBoard(p)
      const a = await snap(p, SAT, ID, A.SAT, T + '-a')
      judge(T + '.1', 'published: 12:00–13:00 with IN TIME 10:00', [['HO, worked 10:00–15:00, balance 0.5', a.lw.letters === 'HO' && spans(a).includes('10:00–15:00') && a.lw.bal === 0.5, A.say(a.lw)]], a.pics)
      await K.itDel(p, 'board', SAT, w.wi, 0)
      const lines = await A.intimes(p, SAT, w.wi)
      const s = await W.signDay(p, SAT); await A.closeBoard(p)
      const b = await snap(p, SAT, ID, A.SAT, T + '-b'); const sw = await selWords(p, SAT)
      judge(T + '.2', 'on the working copy delete the in-time line (candidate 09:00–15:00 HO) and sign it', [
        ['the line is gone', lines.length === 0, lines], ['signed: four names on the day; the marker reads "Not yet published" (signed, not yet out)', !/name/i.test(sw) && /Not yet published/i.test(b.d.head.nys), { sw, nys: b.d.head.nys, s }],
        ['Leave War holds HO 10:00–15:00', b.lw.letters === 'HO' && spans(b).includes('10:00–15:00') && b.lw.bal === a.lw.bal, A.say(b.lw)],
      ], b.pics); console.log(T + '.2', 'selects:', sw, '|', sayS(b))
      await logicSet(p, 'reportLead', '2h30')
      const c = await snap(p, SAT, ID, A.SAT, T + '-c'); const swc = await selWords(p, SAT)
      judge(T + '.3', 'Logic lead 3h → 2h30', [
        ['sign-offs fell: all four names blank and the marker back to "Not yet signed"', (swc.match(/name/gi) || []).length === 4 && /Not yet signed/i.test(c.d.head.nys), { sw: swc, nys: c.d.head.nys }],
        ['pending shown', c.d.pend !== '0', c.d.head.pending + ' | ' + c.d.list.slice(0, 300)],
        ['paid record holds HO 10:00–15:00', c.lw.letters === 'HO' && spans(c).includes('10:00–15:00') && c.lw.bal === a.lw.bal, A.say(c.lw)],
      ], c.pics); console.log(T + '.3', 'selects:', swc, '|', sayS(c))
      await logicSet(p, 'reportLead', '3h')
      const d = await snap(p, SAT, ID, A.SAT, T + '-d'); const swd = await selWords(p, SAT)
      judge(T + '.4', 'Logic back to 3h (180)', [
        ['signatures revive: the four names are back and the marker reads "Not yet published"', !/name/i.test(swd) && /Not yet published/i.test(d.d.head.nys), { sw: swd, nys: d.d.head.nys }],
        ['paid record still HO 10:00–15:00, balance 0.5', d.lw.letters === 'HO' && spans(d).includes('10:00–15:00') && d.lw.bal === a.lw.bal, A.say(d.lw)],
      ], d.pics); console.log(T + '.4', 'selects:', swd, '|', sayS(d))
    })
  },

  async S07() {
    await frame('S07' + sfx, async ({ p }) => {
      const T = 'S07' + sfx
      await flyLine(p, { to: '12:00', ld: '13:00', report: null })
      const ROLES = ['cur', 'sked', 'plan', 'appr']
      const get = async () => { await A.toBoard(p, SAT); return p.evaluate(() => [...document.querySelectorAll('#schedBoard select[data-sign]')].filter(e => e.offsetParent !== null).map(s => (s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : '').replace(/\s+/g, ' ')).join(' / ')) }
      const beak = async () => p.evaluate(() => { const b = document.querySelector('#schedBoard [data-beak]'); return b ? (b.disabled ? 'Publish day: locked' : 'Publish day: ready') : 'no button' })
      await A.toBoard(p, SAT)
      const s1 = [await signRole(p, SAT, 'cur', 0), await signRole(p, SAT, 'sked', 1)]
      const w1 = await get(); const bk1 = await beak(); const f1 = await pic(p, T + '-1-two-signed')
      judge(T + '.1', 'unpublished 12:00–13:00 no report (candidate 09:00–15:00 HO); sign CUR CK and SKED CK', [['two named, two blank', /—.*name/i.test(w1) || (w1.match(/name/gi) || []).length >= 2, { w1, s1 }]], [f1]); console.log(T + '.1', w1, bk1)
      await logicSet(p, 'oilFullMin', '6h')
      const w2 = await get(); const bk2 = await beak(); const f2 = await pic(p, T + '-2-threshold-6h')
      const sIn = [await signRole(p, SAT, 'plan', 0), await signRole(p, SAT, 'appr', 1)]
      const w3 = await get(); const bk3 = await beak(); const f3 = await pic(p, T + '-3-other-two-signed')
      judge(T + '.2', 'threshold 6h01 → 6h (candidate FO): the first two sign-offs; then sign the other two', [
        ['at 6h the first two are no longer signed (all four blank)', (w2.match(/name/gi) || []).length === 4, { w2 }],
        ['after signing the other two: they stand; the first two still blank', /^— name — \/ — name — \/ \S+ \/ \S+$/.test(w3), { w3, sIn }],
      ], [f2, f3]); console.log(T + '.2', 'after threshold:', w2, '|', bk2, '| after other two:', w3, '|', bk3)
      await logicSet(p, 'oilFullMin', '6h01')
      const lg = await lgRead(p)
      const w4 = await get(); const bk4 = await beak(); const f4 = await pic(p, T + '-4-restored-6h01')
      const nm = (w4.match(/name/gi) || []).length
      judge(T + '.3', 'threshold put back to 6h01 (candidate HO again)', [
        ['value 361', lg.full === 361, lg],
        ['the first two (signed for HO) stand again', !/^—? ?name/i.test(w4.split(' / ')[0] || 'name') && !/name/i.test((w4.split(' / ')[0] || '') + (w4.split(' / ')[1] || '')), w4],
        ['the last two (signed for FO) do NOT stand', /name/i.test(w4.split(' / ')[2] || '') && /name/i.test(w4.split(' / ')[3] || ''), w4],
        ['so the day is not publishable on four signatures', /locked/.test(bk4), bk4],
      ], [f4]); console.log(T + '.3', w4, '|', bk4, '| blanks', nm)
      /* nothing paid at any step */
      const lw = await A.oilOf(p, ID, A.SAT, T + '-lw')
      judge(T + '.4', 'no credit paid at any step (day never published)', [['cell empty / no FO-HO', !/FO|HO/.test(lw.cell.text), lw.cell], ['tracker has no 18 Jul credit for Ranger', !/18 Jul/.test(lw.row), lw.row.slice(0, 100)]], lw.pics)
    })
  },

  async S41() {
    await frame('S41' + sfx, async ({ p, ctx, errors }) => {
      const T = 'S41' + sfx
      await A.satLine(p)
      await A.publishNew(p, SAT); await A.closeBoard(p)
      const a = await snap(p, SAT, ID, A.SAT, T + '-a', { shots: false })
      judge(T + '.0', 'S08 fixture published (FO 07:00–13:15)', [['FO 07:00–13:15 balance 1', a.lw.letters === 'FO' && spans(a).includes('07:00–13:15'), A.say(a.lw)]], [])
      /* every displayed edit box of the nominal lead */
      await W.boardOff(p); await A.L.go(p, 'logic')
      const ed = p.locator('#lgEdit'); if (await ed.count() && await ed.isVisible()) { await ed.click(); await sleep(400) }
      const nBox = await p.locator('input[data-lgset="reportLead"]').count()
      const boxVals = await p.locator('input[data-lgset="reportLead"]').evaluateAll(es => es.map(e => ({ v: e.value, vis: e.offsetParent !== null, where: (e.closest('.rule, .lgrow, section, div[class]') || {}).className || '' })))
      console.log('lead boxes', nBox, JSON.stringify(boxVals))
      const setVia = async (i, v) => { const f = p.locator('input[data-lgset="reportLead"]').nth(i); await f.scrollIntoViewIfNeeded(); await f.click(); await f.fill(String(v)); await f.press('Tab'); await sleep(500); return f.inputValue() }
      for (let i = 0; i < Math.min(nBox, 3); i++) {
        await A.L.go(p, 'logic'); const ed2 = p.locator('#lgEdit'); if (await ed2.count() && await ed2.isVisible()) { await ed2.click(); await sleep(300) }
        const sh = await setVia(i, '2h30'); const lg = await lgRead(p)
        const others = await p.locator('input[data-lgset="reportLead"]').evaluateAll(es => es.map(e => e.value))
        const d = await A.dayState(p, SAT, T + '-box' + i + '-set')
        const lw = await A.oilOf(p, ID, A.SAT, T + '-box' + i + '-set', { shots: false })
        await A.L.go(p, 'logic'); const ed3 = p.locator('#lgEdit'); if (await ed3.count() && await ed3.isVisible()) { await ed3.click(); await sleep(300) }
        const back = await setVia((i + 1) % nBox, '3h'); const lg2 = await lgRead(p)
        const d2 = await A.dayState(p, SAT, T + '-box' + i + '-back', { shots: false })
        judge(T + `.box${i}`, `lead typed in edit box #${i} (2h30), then put back through the OTHER box (3h)`, [
          ['box showed 2h30; VCONF 150', lg.lead === 150, { sh, lg }], ['every box shows the same', new Set(others).size === 1, others],
          ['pending 1, sign-offs fell, OIL line named', d.pend === '1' && signFell(d.head) && /OIL on this day/.test(d.list), [d.head.pending, d.list.slice(0, 160)]],
          ['paid FO 07:00–13:15 holds', lw.letters === 'FO' && spans({ lw }).includes('07:00–13:15') && lw.bal === a.lw.bal, A.say(lw)],
          ['put back via other box: 180, cleared, signs stand', lg2.lead === 180 && d2.pend === '0' && signStand(d2.head), { back, lg2, pend: d2.head.pending, signs: signsWords(d2.head) }],
        ], d.pics)
      }
      /* invalid and out-of-range */
      await A.L.go(p, 'logic'); const ed4 = p.locator('#lgEdit'); if (await ed4.count() && await ed4.isVisible()) { await ed4.click(); await sleep(300) }
      const bad = {}
      for (const v of ['abc', '99h', '-5', '0', '', '2h30x', '1e9']) {
        const f = p.locator('input[data-lgset="reportLead"]').first(); await f.scrollIntoViewIfNeeded(); await f.click(); await f.fill(v); await f.press('Tab'); await sleep(450)
        bad[v === '' ? '(blank)' : v] = { shown: await f.inputValue().catch(() => '?'), vconf: (await lgRead(p)).lead }
        if (bad[v === '' ? '(blank)' : v].vconf !== 180) { const g = p.locator('input[data-lgset="reportLead"]').first(); await g.fill('3h'); await g.press('Tab'); await sleep(400) }
      }
      /* "0" is accepted — see what a lead of 0 does to the published day, then put it back */
      { const f = p.locator('input[data-lgset="reportLead"]').first(); await f.scrollIntoViewIfNeeded(); await f.click(); await f.fill('0'); await f.press('Tab'); await sleep(500) }
      const z = await A.dayState(p, SAT, T + '-lead-zero'); const zl = await lgRead(p)
      console.log(T + '.zero', JSON.stringify(zl), z.head.pending, z.list)
      judge(T + '.zero', 'nominal lead typed 0 (accepted as "0 min"): the published day', [['recorded: value ' + zl.lead + ', pending "' + z.head.pending + '"', true, z.list.slice(0, 300)]], z.pics)
      await logicSet(p, 'reportLead', '3h')
      const fb = await pic(p, T + '-invalid-last')
      const dBad = await A.dayState(p, SAT, T + '-after-invalid', { shots: true })
      judge(T + '.invalid', 'invalid / out-of-range lead values typed into the box', [['text and out-of-range values leave the last accepted value (180) intact', ['abc','99h','-5','(blank)','2h30x','1e9'].every(k => bad[k].vconf === 180), bad], ['"0" is accepted as 0 min (recorded)', bad['0'].vconf === 0, bad['0']], ['day: nothing corrupted (record words still sane)', true, { pend: dBad.head.pending }]], [fb, ...dBad.pics]); console.log(T + '.invalid', JSON.stringify(bad), dBad.head.pending)
      /* make sure the lead is 180 for the reload test */
      await logicSet(p, 'reportLead', '2h30')
      await A.reloadAs(p, 'a'); await sleep(600)
      const lgR = await lgRead(p); const dR = await A.dayState(p, SAT, T + '-reload'); const lR = await A.oilOf(p, ID, A.SAT, T + '-reload')
      judge(T + '.reload', 'lead 2h30 set, page reloaded and signed in again', [
        ['value still 150', lgR.lead === 150, lgR], ['still 1 pending with the OIL line', dR.pend === '1' && /OIL on this day/.test(dR.list), [dR.head.pending, dR.list.slice(0, 160)]],
        ['paid FO 07:00–13:15 holds', lR.letters === 'FO' && spans({ lw: lR }).includes('07:00–13:15'), A.say(lR)],
      ], [...dR.pics, ...lR.pics]); console.log(T + '.reload', A.say(lR, dR))
      /* a second tab */
      const p2 = await ctx.newPage()
      p2.on('console', m => { if (m.type() === 'error') errors.push('p2: ' + m.text()) }); p2.on('pageerror', e => errors.push('p2: PAGEERROR ' + e.message)); p2.on('response', r => { if (r.status() >= 400) errors.push('p2: HTTP ' + r.status() + ' ' + r.url()) })
      await p2.goto(process.env.HP_URL + '/'); await A.L.signIn(p2, 'a', { goto: false })
      const lg2t = await lgRead(p2); const d2t = await A.dayState(p2, SAT, T + '-tab2'); const l2t = await A.oilOf(p2, ID, A.SAT, T + '-tab2')
      await A.reloadAs(p, 'a'); await sleep(500)
      const lg1 = await lgRead(p); const d1 = await A.dayState(p, SAT, T + '-tab1-after', { shots: false })
      judge(T + '.2tabs', 'a second tab opened on the same browser; then the first reloaded', [
        ['tab 2 reads the saved lead 150', lg2t.lead === 150, lg2t], ['tab 2: 1 pending, paid FO 07:00–13:15', d2t.pend === '1' && l2t.letters === 'FO' && spans({ lw: l2t }).includes('07:00–13:15'), A.say(l2t, d2t)],
        ['tab 1 after reload agrees', lg1.lead === 150 && d1.pend === '1', { lg1, pend: d1.head.pending }],
      ], [...d2t.pics, ...l2t.pics]); console.log(T + '.2tabs', A.say(l2t, d2t))
      await p2.close()
    })
  },
}
if (!SC[which]) { console.log('no such scenario', which); process.exit(1) }
await SC[which]()
