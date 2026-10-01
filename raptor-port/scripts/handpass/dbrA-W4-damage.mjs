/* [DB-READINESS] group A — the FULL walk, walker W4: A SCHEMA BUMP and HAND-DAMAGED ROWS (30 Sep 26), on THIS branch's
   frozen build (raptor-port/dist-walk) at http://localhost:4204. Each part is a fresh browser (a fresh demo world).

     node dbrA-W4-damage.mjs bump      the stamp written as a LATER format (8): "RAPTOR has been updated", nothing written;
                                       as an EARLIER one (4): the wipe — the demo back, the stamp current (and what it keeps)
     node dbrA-W4-damage.mjs day       one DAY row damaged: the whole week read-only; another week and a request edited —
                                       every byte of the damaged week's rows unchanged
     node dbrA-W4-damage.mjs weekrow   a saved week's WEEK row removed (its day rows kept): editable, its row ids intact
     node dbrA-W4-damage.mjs rows      one request row, one war record row, one history line, one account row, one Tracker
                                       enrolment row, each damaged in turn: the app loads, the row stays byte for byte after an
                                       edit elsewhere, and what the screen shows
   The damage is written by hand into storage (that is the test); every EDIT goes through the app's own controls. */
const ROOT = 'C:/Users/User/projects/Raptor/raptor-port'
const part = process.argv[2]
process.env.HP_URL ||= 'http://localhost:4204'
process.env.HP_SHOTS ||= `${ROOT}/docs/img/handpass/2026-09-30-dbrA/W4`
process.env.HP_OUT ||= `${ROOT}/docs/handpass/parts/dbrA-W4-damage-${part}.json`
const W = await import('./dbrA-W4-lib.mjs')
const { L, A, sleep } = W
const WK = '13-07-2026'
const BAD = '{"this row was damaged by hand'   // invalid JSON

const setRaw = (p, k, v) => p.evaluate(([k, v]) => { if (v == null) localStorage.removeItem('raptor:' + k); else localStorage.setItem('raptor:' + k, v) }, [k, v])
const getRaw = (p, k) => p.evaluate(k => localStorage.getItem('raptor:' + k), k)
/* the rows whose key matches, as stored */
const pick = (rows, re) => Object.fromEntries(Object.entries(rows).filter(([k]) => re.test(k)))
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
async function toWeek(p, label, wk) {
  await A.editWeek(p)
  const b = p.locator('button:visible', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first()
  await b.click()
  await p.waitForFunction(w => window.CURWEEK === w, wk, { timeout: 8000 })
  await sleep(700)
}
const weekRO = p => p.evaluate(() => ({ notes: [...document.querySelectorAll('#eWeek .day .dprev-bar')].map(e => (e.innerText || '').trim()).slice(0, 2), days: document.querySelectorAll('#eWeek .day').length }))
async function reloadIn(p, who = 'a') { await p.reload(); await L.signIn(p, who, { goto: false }); await L.settle(p, 900) }

const browser = await L.launch()
const errors = []
const expectedErrors = []
try {
  /* ============================================================ the schema bump */
  if (part === 'bump') {
    {
      const ctx = await L.context(browser)
      const p = await L.page(ctx, errors, 'bump8')
      await L.signIn(p, 'a'); await L.settle(p, 1200)
      const boot = await L.rows(p)
      const bootBatches = Object.keys(boot).filter(k => k.startsWith('changes/')).map(k => JSON.parse(boot[k]))
      L.check('BUMP-0: a fresh world\'s first boot wrote ONE change-log batch, of type boot', bootBatches.length === 1 && bootBatches[0].type === 'boot', bootBatches.map(b => `${b.type}/${(b.items || []).length}`))
      L.check('BUMP-0: the first boot\'s rows by collection', true, W.byColl(boot))
      const stamp = JSON.parse(boot['settings/schema'])
      L.check('BUMP-0: the stamp is format 6, started', stamp.dataFormatVersion === 6 && stamp.initialized === true, stamp)
      const later = JSON.stringify({ ...stamp, dataFormatVersion: 8, minClient: 8 })
      await setRaw(p, 'settings/schema', later)
      const before = await L.rows(p)
      const nErr = errors.length
      await p.reload()
      const shown = await p.waitForSelector('.bootfail, #luser', { timeout: 15000 }).then(e => e.evaluate(x => x.className === 'bootfail' ? (x.innerText || '').replace(/\s+/g, ' ').trim() : 'SIGN-IN CARD')).catch(() => 'NOTHING')
      await sleep(1500)
      await L.shot(p, 'bump-8-updated')
      const after = await L.rows(p)
      const d = L.diff(before, after)
      L.check('BUMP-8: a store stamped a LATER format (8) → "RAPTOR has been updated — reload"', /RAPTOR has been updated/.test(shown) && /Reload/.test(shown), shown)
      L.check('BUMP-8: …and NOTHING was written (every row as it was, the stamp still 8)', !d.put.length && !d.del.length && !d.newBatches.length && (await getRaw(p, 'settings/schema')) === later, d)
      expectedErrors.push(...errors.splice(nErr))
      await ctx.close()
    }
    {
      const ctx = await L.context(browser)
      const p = await L.page(ctx, errors, 'bump4')
      await L.signIn(p, 'a'); await L.settle(p, 1200)
      /* the world changed first, through the app: a demo request deleted, a request filed, a person added, a chart of his own */
      const demo = await W.inputsList(p)
      const victim = demo[0].split(' | ')[0]
      await A.deleteInputRow(p, victim)
      const filed = await W.fileReq(p, { person: 'stiff', type: 'LL', from: '2026-10-05' })
      await W.usersPane(p)
      await p.fill('#accAddCs', 'Bumper'); await p.fill('#accAddIni', 'BMP'); await p.selectOption('#accAddSeat', 'FCP'); await p.selectOption('#accAddCat', 'C')
      await p.click('#accAdd'); await sleep(700)
      await W.toTracker(p)
      await W.menuItem(p, 'syl', 'dupSyl'); await W.answer(p, 'BUMP CHART'); await sleep(900)
      await W.dayNote(p, 'dn:0.0', 'BEFORE THE WIPE')
      await L.settle(p, 1200)
      const pre = await L.rows(p)
      const stamp = JSON.parse(pre['settings/schema'])
      await setRaw(p, 'settings/schema', JSON.stringify({ ...stamp, dataFormatVersion: 4, minClient: 4 }))
      await reloadIn(p)
      await L.settle(p, 1500)
      const post = await L.rows(p)
      const st = JSON.parse(post['settings/schema'])
      L.check('BUMP-4: a store stamped an EARLIER format (4) → the wipe ran; the stamp is current again (6, started)', st.dataFormatVersion === 6 && st.initialized === true, st)
      const list = await W.inputsList(p)
      /* a re-seed mints the demo requests' ids afresh, so they are compared by what the page shows */
      const txt = l => l.map(r => r.split(' | ')[1]).sort()
      L.check('BUMP-4: the demo is back — the Inputs page lists exactly the demo\'s requests again (the deleted one back, the filed one gone)', JSON.stringify(txt(list)) === JSON.stringify(txt(demo)), { before: demo.length, after: list.length, missing: txt(demo).filter(x => !txt(list).includes(x)).slice(0, 4), extra: txt(list).filter(x => !txt(demo).includes(x)).slice(0, 4) })
      const week = await p.evaluate(() => (window.DAYS[0].notes || []).map(n => n.t || n))
      L.check('BUMP-4: the week is the demo week again (the note typed before the wipe is gone)', !week.includes('BEFORE THE WIPE'), week)
      await L.shot(p, 'bump-4-demo-back')
      /* what the wipe KEPT (not in its list: people, settings, plan, the Tracker) — said as it is */
      const kept = { bumper: await p.evaluate(() => Object.values(window.PEOPLE).some(x => x.cs === 'Bumper')), tracker: Object.keys(post).filter(k => k.startsWith('tracker/v3:master:chart:')).length, trackerBefore: Object.keys(pre).filter(k => k.startsWith('tracker/v3:master:chart:')).length }
      await W.toTracker(p)
      const pic = await W.trkPicture(p)
      kept.chart = pic.dropdown.some(n => /^BUMP CHART/.test(n))
      L.check('BUMP-4: his Tracker charts survive the wipe (the Tracker is not in the wipe\'s list — D464)', kept.chart && kept.tracker === kept.trackerBefore, kept)
      L.check('BUMP-4: a person added before the wipe is kept (people are not in the wipe\'s list) — noted', true, kept)
      await L.shot(p, 'bump-4-tracker-kept')
      const d2 = L.diff(post, await (async () => { await reloadIn(p); return L.rows(p) })())
      L.check('BUMP-4: the next reload writes nothing (no second wipe)', !d2.put.length && !d2.del.length, d2)
      await ctx.close()
    }
  }

  /* ============================================================ one DAY row damaged */
  if (part === 'day') {
    const ctx = await L.context(browser)
    const p = await L.page(ctx, errors, 'day')
    await L.signIn(p, 'a'); await L.settle(p, 1200)
    await L.step(p, 'DAY-0 a Monday note (the week\'s first save)', () => W.dayNote(p, 'dn:0.0', 'SAVED WEEK'), { put: [new RegExp(`^weeks/${WK}$`), new RegExp(`^weeks/${WK}#0$`)], also: [/^weeks\//, /^settings\/elog:/] })
    const r0 = await L.rows(p)
    L.check('DAY-0: the week is stored as a week row and seven day rows', Object.keys(pick(r0, new RegExp(`^weeks/${WK}(#\\d)?$`))).length === 8, Object.keys(pick(r0, /^weeks\//)))
    await setRaw(p, `weeks/${WK}#2`, BAD)
    const damaged = pick(await L.rows(p), new RegExp(`^weeks/${WK}`))
    await reloadIn(p)
    await A.editWeek(p)
    const ro = await weekRO(p)
    await L.shot(p, 'day-1-week-readonly')
    L.check('DAY-1: after the reload the WHOLE week reads read-only (every day shows the notice)', ro.notes.length > 0, ro)
    const edMon = await p.evaluate(() => !!document.querySelector('#eWeek [data-txt="dn:0.0"]'))
    L.check('DAY-1: …no editable day note on it', !edMon, { editableNote: edMon })
    L.check('DAY-1: the reload wrote nothing to the damaged week', same(pick(await L.rows(p), new RegExp(`^weeks/${WK}`)), damaged))
    /* a DIFFERENT week edited, and a request */
    await toWeek(p, 'Jul 20', '20/07/2026')
    await L.step(p, 'DAY-2 a note on the NEXT week (20 Jul)', () => W.dayNote(p, 'dn:1.0', 'OTHER WEEK'), { put: [/^weeks\/20-07-2026/], only: true, also: [/^settings\/elog:/] })
    await L.shot(p, 'day-2-other-week')
    await L.reloadCompare(p, 'DAY-2')
    await L.step(p, 'DAY-3 a request filed', () => W.fileReq(p, { person: 'stiff', type: 'LL', from: '2026-10-05' }), { put: [/^inputs\//], only: true, also: [/^settings\/elog:/] })
    await L.reloadCompare(p, 'DAY-3')
    const r3 = await L.rows(p)
    L.check('DAY-3: every byte of the damaged week\'s rows is unchanged after both edits', same(pick(r3, new RegExp(`^weeks/${WK}`)), damaged), L.diff(damaged, pick(r3, new RegExp(`^weeks/${WK}`))))
    await reloadIn(p)
    await toWeek(p, 'Jul 20', '20/07/2026')
    const other = await p.evaluate(() => (window.DAYS[1].notes || []).map(n => n.t || n))
    L.check('DAY-4: after a reload the other week keeps its edit', other.includes('OTHER WEEK'), other)
    L.check('DAY-4: …and the damaged week\'s rows are still byte for byte', same(pick(await L.rows(p), new RegExp(`^weeks/${WK}`)), damaged))
    await toWeek(p, 'Jul 13', '13/07/2026')
    await L.shot(p, 'day-4-still-readonly')
    L.check('DAY-4: …and still reads read-only', (await weekRO(p)).notes.length > 0, await weekRO(p))
    await ctx.close()
  }

  /* ============================================================ a WEEK row removed */
  if (part === 'weekrow') {
    const ctx = await L.context(browser)
    const p = await L.page(ctx, errors, 'weekrow')
    await L.signIn(p, 'a'); await L.settle(p, 1200)
    await L.step(p, 'WROW-0 a Monday note (the week\'s first save)', () => W.dayNote(p, 'dn:0.0', 'SAVED WEEK'))
    const ids = () => p.evaluate(() => JSON.stringify(window.DAYS.map(d => { const o = []; const walk = x => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') { if (x.rid) o.push(x.rid); Object.values(x).forEach(walk) } }; walk(d); return o })))
    const ids0 = await ids()
    const days0 = pick(await L.rows(p), new RegExp(`^weeks/${WK}#`))
    await setRaw(p, `weeks/${WK}`, null)
    const allBefore = await L.rows(p)
    await reloadIn(p)
    {
      const allAfter = await L.rows(p)
      const a = L.audit(allBefore, allAfter)
      L.check('WROW-1: what the reload with the week row missing wrote (every row named by a change-log batch)', !a.bare.length && !a.wrongOp.length && !a.phantom.length,
        { put: a.put, del: a.del, batches: a.batches, bare: a.bare, weekRow: allAfter[`weeks/${WK}`] || null })
    }
    await A.editWeek(p)
    const ro = await weekRO(p)
    const ids1 = await ids()
    await L.shot(p, 'weekrow-1-editable')
    L.check('WROW-1: with its week row gone the week still opens EDITABLE (no read-only notice)', ro.notes.length === 0 && (await p.evaluate(() => !!document.querySelector('#eWeek [data-txt="dn:0.0"]'))), ro)
    L.check('WROW-1: …its row ids are intact (every row of every day keeps its id)', ids1 === ids0, { before: ids0.slice(0, 120), after: ids1.slice(0, 120) })
    const note = await p.evaluate(() => (window.DAYS[0].notes || []).map(n => n.t || n))
    L.check('WROW-1: …and it holds what was saved (the Monday note)', note.includes('SAVED WEEK'), note)
    L.check('WROW-1: the reload wrote nothing (the day rows as they were, no week row made up)', same(pick(await L.rows(p), new RegExp(`^weeks/${WK}`)), days0))
    await L.step(p, 'WROW-2 an edit on Wednesday', () => W.dayNote(p, 'dn:2.0', 'AFTER THE WEEK ROW WENT'), { put: [new RegExp(`^weeks/${WK}#2$`)], also: [new RegExp(`^weeks/${WK}$`), /^settings\/elog:/], only: true })
    await L.reloadCompare(p, 'WROW-2')
    await L.shot(p, 'weekrow-2-after-edit')
    await ctx.close()
  }

  /* ============================================================ one row of each kind damaged, in turn */
  if (part === 'rows') {
    const ctx = await L.context(browser)
    const p = await L.page(ctx, errors, 'rows')
    await L.signIn(p, 'a'); await L.settle(p, 1200)
    /* make the rows exist: an account write (every account is then stored), a history line, the Tracker's rows */
    await W.usersPane(p)
    await L.step(p, 'ROWS-0a a person added with his account (every account is then stored)', async () => {
      await p.fill('#accAddCs', 'Damager'); await p.fill('#accAddIni', 'DMG'); await p.selectOption('#accAddSeat', 'FCP'); await p.selectOption('#accAddCat', 'C')
      await p.fill('#accAddName', 'damager@unit.example'); await p.click('#accAdd'); await sleep(700)
    })
    await L.step(p, 'ROWS-0b a Monday note (a history line)', () => W.dayNote(p, 'dn:0.0', 'A LINE'))
    await W.toTracker(p)
    await L.step(p, 'ROWS-0c a Tracker student', () => W.addStudent(p, 'DMG STUDENT'))
    const r0 = await L.rows(p)
    const keyOf = re => Object.keys(r0).filter(k => re.test(k)).sort()
    /* Ranger's account (`us`, a member) — a non-admin account */
    const acct = keyOf(/^settings\/account:/).find(k => { try { return JSON.parse(r0[k]).name === 'us' } catch { return false } })
    const targets = [
      { tag: 'REQ', key: keyOf(/^inputs\//)[3], what: 'a request row' },
      { tag: 'WAR', key: keyOf(/^leavewar\/rec:/)[0], what: 'a war record row' },
      { tag: 'LINE', key: keyOf(/^settings\/elog:/)[0], what: 'a history line' },
      { tag: 'ACCT', key: acct, what: 'a non-admin account row (Ranger\'s)' },
      { tag: 'ENR', key: keyOf(/^tracker\/v3:[^:]+:[^:]+:enr:/)[0], what: 'a Tracker enrolment row' },
    ]
    L.check('ROWS-0: a row of each kind exists to damage', targets.every(t => !!t.key), targets.map(t => `${t.tag}=${t.key}`))
    for (const t of targets) {
      if (!t.key) continue
      const was = r0[t.key]
      await setRaw(p, t.key, BAD)
      await reloadIn(p)
      const up = await p.evaluate(() => !!document.querySelector('#vWeek .day'))
      L.check(`${t.tag}-1: ${t.what} damaged (${t.key}) → the app loads and signs in`, up)
      /* what the screen shows about it */
      let shows = ''
      if (t.tag === 'REQ') { const id = t.key.slice(7); const l = await W.inputsList(p); shows = l.some(r => r.startsWith(id)) ? 'the request is STILL LISTED' : `the request is not listed (${l.length} others are)`; await L.shot(p, 'rows-req-inputs') }
      if (t.tag === 'WAR') { const rec = JSON.parse(was); await W.lwOpen(p, rec.date); shows = JSON.stringify(await A.rowRun(p, rec.pid, [rec.date])) + ' (was ' + (rec.code || rec.state || '') + ')'; await L.shot(p, 'rows-war') }
      if (t.tag === 'LINE') { await A.editWeek(p); await p.click('#histBtn'); await sleep(500); shows = ((await p.locator('.chgwin').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ').slice(0, 200); await L.shot(p, 'rows-line-history'); await p.click('.chgwin .win-x').catch(() => {}) }
      if (t.tag === 'ACCT') { const u = await W.usersPane(p); shows = u.list.slice(0, 300); await L.shot(p, 'rows-acct-users') }
      if (t.tag === 'ENR') { await W.toTracker(p); const pic = await W.trkPicture(p); shows = 'crew on screen: ' + JSON.stringify(pic.crew); await L.shot(p, 'rows-enr-tracker') }
      L.check(`${t.tag}-2: what the screen shows with ${t.what} damaged`, true, shows)
      /* an edit elsewhere, through the app */
      const edit = {
        REQ: () => W.fileReq(p, { person: 'nact', type: 'LL', from: '2026-10-07' }),
        WAR: () => W.lwBid(p, 'shaft', '2026-02-17'),
        LINE: () => W.dayNote(p, 'dn:2.0', 'ANOTHER LINE'),
        ACCT: async () => { await W.usersPane(p); await p.fill('#accAddCs', 'Second'); await p.fill('#accAddIni', 'SEC'); await p.selectOption('#accAddSeat', 'FCP'); await p.selectOption('#accAddCat', 'C'); await p.fill('#accAddName', 'second@unit.example'); await p.click('#accAdd'); await sleep(700) },
        ENR: async () => { await W.toTracker(p); await W.addStudent(p, 'ENR OTHER') },
      }[t.tag]
      const a = await L.step(p, `${t.tag}-3 an edit elsewhere with ${t.what} damaged`, edit)
      L.check(`${t.tag}-3: the edit wrote rows (it saved)`, a.put.length + a.del.length > 0, a.put.slice(0, 6))
      L.check(`${t.tag}-3: the damaged row is left byte for byte`, (await getRaw(p, t.key)) === BAD, (await getRaw(p, t.key) || 'GONE').slice(0, 80))
      await L.reloadCompare(p, `${t.tag}-4`, 'a', { page: t.tag === 'ENR' ? 'tracker' : null })
      L.check(`${t.tag}-4: after a reload the damaged row is still byte for byte, and the app loads`, (await getRaw(p, t.key)) === BAD && (await p.evaluate(() => !!document.querySelector('#vWeek .day'))))
      if (t.tag === 'ACCT') {
        /* the damaged account's man cannot sign in; an admin still can; no other account was rewritten */
        const others = pick(await L.rows(p), /^settings\/account:/)
        delete others[t.key]
        const before = pick(r0, /^settings\/account:/); delete before[t.key]
        const changed = Object.keys(others).filter(k => k in before && others[k] !== before[k])
        L.check('ACCT-5: no OTHER account row was rewritten (no lock-out repair touched them)', !changed.length, changed)
      }
      /* put it back for the next kind */
      await setRaw(p, t.key, was)
      await reloadIn(p)
    }
    await ctx.close()
  }
} catch (e) {
  L.check(`${part}: the walk ran to its end`, false, e && e.stack || String(e))
} finally {
  await browser.close()
}
L.check(`${part}: no console error, page error or failed request (beyond the expected boot refusal)`, errors.length === 0, errors.slice(0, 8))
if (expectedErrors.length) L.check(`${part}: the expected errors (the boot's own refusal of a store ahead)`, true, expectedErrors.slice(0, 4))
process.exitCode = L.save({ part }) ? 1 : 0
