/* [TRK-SESSION-PICK] D376 — each person reopens the Tracker on their OWN course and
   student (the leftovers walk, walker a, 28 Sep 26). Assertions of the RIGHT
   behaviour: a PASS means correct. Order list: Fable's A1–A13, Astra's scenario 20.
   One browser throughout per size (a shared PC): desktop 1440x900, then a phone
   390x844 with touch. Nothing injected: every pick is made with the app's own
   controls; the pick keys in browser storage are READ to confirm where each pick
   is filed (ocuLocal:who:<personId>:lastCourse / …:lastCrew:<courseId>).

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> HP_OUT=<dir> node scripts/handpass/trk-lo-2a-pick.mjs
     LO_ONLY=desk|phone to run one size. */
import { open, save, log, DESK, PHONE } from './trk-lib.mjs'
import { exportVia, importVia, tmp } from './trk-w1-lib.mjs'
import { sleep, qText, as, logout, toTracker, picked, optIds, pickKeys, dataDump, watch, watched, press, pressAt, choose, half, ballCentre, wedgePoint, waitQ, menu, shot } from './trk-lo-2a-lib.mjs'

const L = log()
const allErrors = []
const K = (pid, k) => 'ocuLocal:who:' + pid + ':' + k
const j = o => JSON.stringify(o)
const brief = p => `${p.course} / ${p.student}`
/* the bar's status corner: it must never tell this person about a course other than the one on screen */
const statusOk = async (page, p) => { const t = await page.evaluate(() => { const s = document.getElementById('saveStat'); return s ? s.textContent : '' }); const m = /switched to (.+)$/.exec(t.replace(/^●\s*/, '')); return { ok: !m || m[1].trim() === p.course, text: t } }

for (const mode of (process.env.LO_ONLY ? [process.env.LO_ONLY] : ['desk', 'phone'])) {
  const touch = mode === 'phone'
  const M = mode === 'phone' ? 'P' : 'D'
  const S = (n, what) => `lo-2a-${M}${n}-${what}`
  const { browser, page, errors } = await open({ size: touch ? PHONE : DESK, who: 'a', touch })
  const tab = async () => { await toTracker(page); await half(page, 'flow', touch) }
  const addStudent = async name => {
    await half(page, 'info', touch)
    await press(page, '#addStu:visible', touch)
    await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(250)
    await page.fill('#dlgInput', name); await press(page, '#dlgOk', touch); await sleep(500)
    await half(page, 'flow', touch)
  }
  const reloadAt = async who => { await page.reload(); await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' }); await as(page, who) }

  /* ---- S0/S1: the admin's place — a second course (it lands at the TOP), two students
     on it, then back to 26ABSG and STUDENT B ---- */
  let ids = await optIds(page, '#courseSel')
  const c26 = ids['26ABSG']
  L.ok(`${M} S0 admin opens the Tracker on a fresh browser: his pick is filed under his person (stiff)`, (await pickKeys(page))[K('stiff', 'lastCourse')] === c26, j(await pickKeys(page)))
  await menu(page, 'course', 'addCourse', touch)
  await waitQ(page); await page.fill('#dlgInput', 'LO SECOND'); await press(page, '#dlgOk', touch); await sleep(700)
  ids = await optIds(page, '#courseSel')
  const cLO = ids['LO SECOND']
  L.note(`${M} S1 + Add course "LO SECOND"`, `courses now ${Object.keys(ids).join(', ')}`)
  await addStudent('LO ONE'); await addStudent('LO TWO')
  const loStu = await optIds(page, '#activeSel')
  const kk1 = await pickKeys(page)
  L.ok(`${M} S1 + Add remembers the student just added as the admin's pick on that course (Fable A13)`, kk1[K('stiff', 'lastCrew:' + cLO)] === loStu['LO TWO'], `stiff lastCrew:LO SECOND = ${kk1[K('stiff', 'lastCrew:' + cLO)]} (LO TWO is ${loStu['LO TWO']})`)
  await choose(page, '#courseSel', '26ABSG')
  const st = await optIds(page, '#activeSel')
  await choose(page, '#activeSel', 'STUDENT B')
  const adminPick = await picked(page)
  const k2 = await pickKeys(page)
  L.ok(`${M} S1 the admin picked 26ABSG / STUDENT B — filed under stiff`, adminPick.course === '26ABSG' && adminPick.student === 'STUDENT B' && k2[K('stiff', 'lastCourse')] === c26 && k2[K('stiff', 'lastCrew:' + c26)] === st['STUDENT B'], brief(adminPick) + ' · ' + j(k2))
  await shot(page, S('01', 'admin-pick'))
  const ballAt = await ballCentre(page, 'ST-01')
  const before = await dataDump(page)

  /* ---- S2 (A1 + A4): logout, the member signs in on the same browser WITHOUT a
     reload and opens the Tracker. The CPU is slowed so the switch has a window: while
     her place loads the page must read "Loading…" and a press where a ball was must
     grade nobody. ---- */
  await logout(page)
  await as(page, 'member')
  await watch(page)
  /* The press on the Tracker's tab and the press where ST-01 was are handed to the
     browser's own input queue back to back (CDP Input.dispatch…, the path a real
     mouse or finger takes), with the CPU slowed 20x — so the second press reaches the
     page as soon as it takes any input at all after the switch has begun. */
  const cdp = await page.context().newCDPSession(page)
  const centre = sel => page.evaluate(sel => { const a = document.querySelector(sel); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, sel)
  const mouse = (type, p) => cdp.send('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'left', clickCount: 1 })
  const finger = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: p.x, y: p.y, id: 1 }] })
  let trp
  if (touch) { await press(page, '#burger', true); await sleep(400); trp = await centre('#drawer a[data-page="tracker"]') }
  else { trp = await centre('#topnav a[data-page="tracker"]'); await mouse('mouseMoved', trp) }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 20 })
  const queued = touch
    ? [finger('touchStart', trp), finger('touchEnd', trp), finger('touchStart', ballAt), finger('touchEnd', ballAt)]
    : [mouse('mousePressed', trp), mouse('mouseReleased', trp), mouse('mouseMoved', ballAt), mouse('mousePressed', ballAt), mouse('mouseReleased', ballAt)]
  await Promise.all(queued)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
  await page.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await sleep(900)
  const w2 = await watched(page)
  const on2 = w2.resume.find(r => r.on)
  L.ok(`${M} S2 while her place loads the page reads "Loading…", the admin's chart and panel hidden`, !!on2 && /Loading/.test(on2.text) && on2.visibleBalls === 0 && !on2.shown.length,
    j(w2.resume) + (on2 && on2.paintedWhileOn === false ? ' — the switch ended before the browser drew a single frame of it' : ''))
  const pressDuring = w2.presses.find(p => p.resuming), ballPress = w2.presses[w2.presses.length - 1]
  const popAfter = await page.locator('#pop').isVisible().catch(() => false)
  const popWho = popAfter ? await page.locator('#popTitle').innerText() : ''
  if (pressDuring) L.ok(`${M} S2 a press where a ball was, made while it loads, grades nobody`, !popAfter, `press ${j(pressDuring)} · pop-up after: ${popAfter} ${popWho}`)
  else L.note(`${M} S2 COULD NOT REACH a press inside the load — the page took no input until the switch was over (CPU 20x slower); the press queued during it landed after, on her own chart`,
    `presses ${j(w2.presses)} · pop-up after: ${popAfter}${popWho ? ' "' + popWho + '"' : ''}`)
  L.ok(`${M} S2 …that press never opened the admin's student's pop-up`, !/STUDENT B/.test(popWho), popWho || 'no pop-up')
  if (popAfter) await page.keyboard.press('Escape')
  const after = await dataDump(page)
  const changed = Object.keys({ ...before, ...after }).filter(k => before[k] !== after[k])
  L.ok(`${M} S2 …no mark written anywhere by the switch or the press`, !changed.some(k => /:m:|marks/i.test(k)), 'stored keys that changed: ' + (changed.join(', ') || 'none'))
  const mem1 = await picked(page)
  L.ok(`${M} S2 (A1) the member opens on HER own place: the FIRST course (she has none), its first student — never the admin's`,
    mem1.courseIndex === 0 && mem1.course === 'LO SECOND' && mem1.student === 'LO ONE' && !(mem1.course === adminPick.course && mem1.student === adminPick.student),
    brief(mem1) + ` (admin had ${brief(adminPick)}; the admin's own pick on LO SECOND is LO TWO)`)
  const k3 = await pickKeys(page)
  L.ok(`${M} S2 her place is filed under her person (bane); the admin's keys untouched`, k3[K('bane', 'lastCourse')] === cLO && k3[K('stiff', 'lastCourse')] === c26 && k3[K('stiff', 'lastCrew:' + c26)] === st['STUDENT B'], j(k3))
  const st2 = await statusOk(page, mem1)
  L.ok(`${M} S2 the bar's status corner does not tell her about another person's course`, st2.ok, `status "${st2.text}" while she is on ${mem1.course}`)
  await shot(page, S('03', 'member-own-place'))

  /* ---- S3 (A2): she picks 26ABSG / STUDENT A; logout; the admin is back on HIS ---- */
  await choose(page, '#courseSel', '26ABSG')
  L.note(`${M} S3 the member switches to 26ABSG: the student it shows (her first visit there — the last one anyone graded, else the first)`, brief(await picked(page)))
  await choose(page, '#activeSel', 'STUDENT A')
  const k4 = await pickKeys(page)
  L.ok(`${M} S3 the member's Crew pick is filed under bane, not stiff`, k4[K('bane', 'lastCourse')] === c26 && k4[K('bane', 'lastCrew:' + c26)] === st['STUDENT A'] && k4[K('stiff', 'lastCrew:' + c26)] === st['STUDENT B'], j(k4))
  await logout(page); await as(page, 'admin'); await watch(page); await tab()
  const ad2 = await picked(page)
  L.ok(`${M} S3 the admin signs in again (no reload): back on 26ABSG / STUDENT B, not the member's STUDENT A`, ad2.course === '26ABSG' && ad2.student === 'STUDENT B', brief(ad2) + ' · resume ' + j((await watched(page)).resume))
  await shot(page, S('04', 'admin-back-on-his'))

  /* ---- S4: the same WITH a page reload between the two ---- */
  await logout(page); await reloadAt('member'); await tab()
  const m3 = await picked(page)
  L.ok(`${M} S4 after a reload the member opens on 26ABSG / STUDENT A (hers, from storage)`, m3.course === '26ABSG' && m3.student === 'STUDENT A', brief(m3))
  await shot(page, S('05', 'member-after-reload'))
  await logout(page); await reloadAt('admin'); await tab()
  const a3 = await picked(page)
  L.ok(`${M} S4 after a reload the admin opens on 26ABSG / STUDENT B (his)`, a3.course === '26ABSG' && a3.student === 'STUDENT B', brief(a3))
  await shot(page, S('06', 'admin-after-reload'))

  /* ---- S5 (A3): a sign-in that never opens the Tracker, then another person ---- */
  await logout(page); await as(page, 'member'); await logout(page)
  await as(page, 'hex'); await watch(page); await tab()
  const h1 = await picked(page)
  const k5 = await pickKeys(page)
  L.ok(`${M} S5 member signed in and out without opening the Tracker; then Hex opens it: HIS own place (the first course, its first student)`, h1.courseIndex === 0 && h1.course === 'LO SECOND' && h1.student === 'LO ONE' && k5[K('rocky', 'lastCourse')] === cLO, brief(h1) + ' · rocky lastCourse ' + k5[K('rocky', 'lastCourse')])
  const st5 = await statusOk(page, h1)
  L.ok(`${M} S5 the bar's status corner does not tell Hex about another person's course`, st5.ok, `status "${st5.text}" while he is on ${h1.course}`)
  await shot(page, S('07', 'hex-own-place'))
  await logout(page); await as(page, 'admin'); await logout(page)
  await as(page, 'member'); await watch(page); await tab()
  const m4 = await picked(page)
  L.ok(`${M} S5 two sign-ins without the Tracker (admin), then the member opens it: hers, 26ABSG / STUDENT A`, m4.course === '26ABSG' && m4.student === 'STUDENT A', brief(m4))

  /* ---- S6 (A9): the same person out and in — nothing reloads, no "Loading…", the
     chart where she left it ---- */
  const scroll0 = await page.evaluate(() => { const b = document.getElementById('board'); return b ? { t: b.scrollTop, l: b.scrollLeft } : null })
  await shot(page, S('07b', 'member-before-out'))
  await logout(page); await as(page, 'member'); await watch(page); await tab()
  const w6 = await watched(page)
  const m5 = await picked(page)
  const scroll1 = await page.evaluate(() => { const b = document.getElementById('board'); return b ? { t: b.scrollTop, l: b.scrollLeft } : null })
  L.ok(`${M} S6 (A9) the same person out and in: same place, no "Loading…" at all`, m5.course === '26ABSG' && m5.student === 'STUDENT A' && !w6.resume.some(r => r.on), brief(m5) + ' · resume log ' + j(w6.resume))
  L.note(`${M} S6 the chart's scroll before / after`, j({ scroll0, scroll1 }))
  await shot(page, S('07c', 'member-after-in'))

  /* ---- S7: every door that picks a student files it as HER pick ---- */
  await choose(page, '#activeSel', 'STUDENT B')
  L.ok(`${M} S7a the Crew box: STUDENT B → her pick`, (await pickKeys(page))[K('bane', 'lastCrew:' + c26)] === st['STUDENT B'], (await pickKeys(page))[K('bane', 'lastCrew:' + c26)])
  /* a press on STUDENT A's slice of a ball's ring */
  const wiA = (await page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))).indexOf('STUDENT A')
  const pt = await wedgePoint(page, 'ST-01', wiA)
  if (pt) await pressAt(page, pt.x, pt.y, touch)
  const p7 = await picked(page)
  L.ok(`${M} S7b a press on STUDENT A's slice of ST-01 picks her (no pop-up) and files it as the member's pick`, !!pt && p7.student === 'STUDENT A' && !(await page.locator('#pop').isVisible().catch(() => false)) && (await pickKeys(page))[K('bane', 'lastCrew:' + c26)] === st['STUDENT A'],
    `point ${j(pt)} → ${p7.student}; key ${(await pickKeys(page))[K('bane', 'lastCrew:' + c26)]}`)
  await shot(page, S('08', 'slice-press-picked-A'))
  await addStudent('LO THREE')
  const p8 = await picked(page), s8 = await optIds(page, '#activeSel')
  L.ok(`${M} S7c + Add "LO THREE": the Crew box shows him and he is her pick`, p8.student === 'LO THREE' && (await pickKeys(page))[K('bane', 'lastCrew:' + c26)] === s8['LO THREE'], `${p8.student}; key ${(await pickKeys(page))[K('bane', 'lastCrew:' + c26)]}`)
  await shot(page, S('09', 'add-picked-LO-THREE'))
  /* an undo that moves the picker: grade ST-02 for STUDENT A, switch to B, ↶ */
  await choose(page, '#activeSel', 'STUDENT A')
  const bc = await ballCentre(page, 'ST-02')
  await pressAt(page, bc.x, bc.y, touch)
  const popUp = await page.locator('#pop').isVisible().catch(() => false)
  const popTitle = popUp ? await page.locator('#popTitle').innerText() : '(no pop-up)'
  if (popUp) await press(page, '#pop button:has-text("DCO")', touch)
  await sleep(300)
  await choose(page, '#activeSel', 'STUDENT B')
  const kB = (await pickKeys(page))[K('bane', 'lastCrew:' + c26)]
  await press(page, '#trUndoBtn', touch); await sleep(600)
  const p9 = await picked(page)
  L.ok(`${M} S7d ↶ taking back STUDENT A's grade moves the picker to her, and that is filed as the member's pick`, popUp && kB === st['STUDENT B'] && p9.student === 'STUDENT A' && (await pickKeys(page))[K('bane', 'lastCrew:' + c26)] === st['STUDENT A'],
    `graded "${popTitle}"; after B the key was ${kB}; after ↶: ${p9.student}, key ${(await pickKeys(page))[K('bane', 'lastCrew:' + c26)]}`)
  await shot(page, S('10', 'undo-moved-picker'))
  await logout(page); await as(page, 'admin'); await tab()
  const a4 = await picked(page)
  L.ok(`${M} S7e none of her picks moved the admin: he signs in on 26ABSG / STUDENT B`, a4.course === '26ABSG' && a4.student === 'STUDENT B', brief(a4))

  /* ---- S8 (A7): the admin's member-view switch changes nothing ---- */
  await watch(page)
  const k8 = await pickKeys(page)
  if (touch) { await press(page, '#burger', true); await sleep(300); await press(page, '#drawerRole', true); await sleep(400); if (await page.locator('#drawer.open, #drawer:visible').count()) { await press(page, '#burger', true).catch(() => {}); await sleep(300) } }
  else await press(page, '#roleBadge', false)
  await sleep(500)
  const badge = await page.evaluate(() => { const b = document.getElementById('roleBadge'); return b ? b.textContent : '' })
  const a5 = await picked(page)
  const w8 = await watched(page)
  L.ok(`${M} S8 the admin taps his name badge (member view): same place, no "Loading…", no pick key changed`, /member/i.test(badge) && a5.course === '26ABSG' && a5.student === 'STUDENT B' && !w8.resume.some(r => r.on) && j(await pickKeys(page)) === j(k8),
    `badge "${badge}" · ${brief(a5)} · resume ${j(w8.resume)} · page ${await page.evaluate(() => window.CURPAGE)}`)
  await shot(page, S('11', 'member-view-same-place'))
  if (await page.evaluate(() => window.CURPAGE) !== 'tracker') await tab()
  await choose(page, '#activeSel', 'LO THREE')
  const k8b = await pickKeys(page)
  L.ok(`${M} S8 a pick made in the member view is still the ADMIN's (stiff), never the member's (bane)`, k8b[K('stiff', 'lastCrew:' + c26)] === s8['LO THREE'] && k8b[K('bane', 'lastCrew:' + c26)] === st['STUDENT A'], `stiff ${k8b[K('stiff', 'lastCrew:' + c26)]} · bane ${k8b[K('bane', 'lastCrew:' + c26)]}`)
  if (touch) { await press(page, '#burger', true); await sleep(300); await press(page, '#drawerRole', true); await sleep(400) }
  else await press(page, '#roleBadge', false)
  await sleep(400)
  if (await page.evaluate(() => window.CURPAGE) !== 'tracker') await tab()
  const a6 = await picked(page), w8b = await watched(page)
  L.ok(`${M} S8 back to the admin view: still LO THREE, no "Loading…"`, a6.student === 'LO THREE' && !w8b.resume.some(r => r.on), `${brief(a6)} · badge "${await page.evaluate(() => document.getElementById('roleBadge') && document.getElementById('roleBadge').textContent)}"`)
  await choose(page, '#activeSel', 'STUDENT B')

  /* ---- S9 (A10): a remembered course deleted since falls back cleanly ---- */
  await logout(page); await as(page, 'member'); await tab()
  await choose(page, '#courseSel', 'LO SECOND')
  L.ok(`${M} S9 the member's course is now LO SECOND`, (await pickKeys(page))[K('bane', 'lastCourse')] === cLO, (await pickKeys(page))[K('bane', 'lastCourse')])
  await logout(page); await as(page, 'admin'); await tab()
  await choose(page, '#courseSel', 'LO SECOND')
  await menu(page, 'course', 'delCourse', touch)
  const dq = await waitQ(page); await press(page, '#dlgOk', touch); await sleep(800)
  L.note(`${M} S9 the admin deletes LO SECOND`, `asked "${(dq || '').replace(/\s+/g, ' ')}" · courses now ${Object.keys(await optIds(page, '#courseSel')).join(', ')}`)
  await logout(page); await as(page, 'member'); await watch(page); await tab()
  const m6 = await picked(page)
  L.ok(`${M} S9 the member's remembered course is gone: she falls back to the first course, a student in the Crew box, no error`, m6.course === '26ABSG' && !!m6.student && errors.length === 0, brief(m6) + ' · errors ' + errors.length)
  await shot(page, S('12', 'member-fallback-deleted-course'))
  await logout(page); await as(page, 'admin'); await tab()
  await menu(page, 'course', 'ordCourse', touch)
  await page.waitForSelector('#ordModal', { state: 'visible' })
  const rs = page.locator('#ordHidden .ordrow').filter({ hasText: 'LO SECOND' }).locator('button', { hasText: 'Restore' })
  const canRestore = await rs.count()
  if (canRestore) { if (touch) await rs.first().tap(); else await rs.first().click(); await sleep(500) }
  if (await page.locator('#ordModal').isVisible().catch(() => false)) await press(page, '#ordCancel', touch)
  L.note(`${M} S9 the admin restores LO SECOND (⇅ Reorder courses → ↺ Restore)`, `restore offered: ${!!canRestore} · courses now ${Object.keys(await optIds(page, '#courseSel')).join(', ')}`)
  await logout(page); await as(page, 'member'); await tab()
  const m7 = await picked(page)
  L.note(`${M} S9 (Fable A10's second half) after the restore the member opens on`, brief(m7) + ' · bane lastCourse = ' + (await pickKeys(page))[K('bane', 'lastCourse')] + (m7.course === 'LO SECOND' ? ' (back on the restored course)' : ' (the fallback rewrote her remembered course, so the restore does not bring her back)'))
  await shot(page, S('13', 'member-after-restore'))

  /* ---- S10 (A5): her picked student is removed by someone else: she falls back, the
     Crew box never blank ---- */
  if (m7.course !== '26ABSG') await choose(page, '#courseSel', '26ABSG')
  await choose(page, '#activeSel', 'LO THREE')
  const lo3 = (await optIds(page, '#activeSel'))['LO THREE']
  L.ok(`${M} S10 the member picks LO THREE`, (await pickKeys(page))[K('bane', 'lastCrew:' + c26)] === lo3, (await pickKeys(page))[K('bane', 'lastCrew:' + c26)])
  await logout(page); await as(page, 'admin'); await tab()
  await half(page, 'info', touch)
  await press(page, `[data-rm="${lo3}"]:visible`, touch)
  const rq = []
  for (let i = 0; i < 3; i++) { const q = await waitQ(page, 1500); if (!q) break; rq.push(q.replace(/\s+/g, ' ').slice(0, 80)); await press(page, '#dlgOk', touch); await sleep(500) }
  await half(page, 'flow', touch)
  L.note(`${M} S10 the admin removes LO THREE (the chip's ×)`, `asked ${JSON.stringify(rq)} · students now ${(await picked(page)).students.join(', ')}`)
  await logout(page); await as(page, 'member'); await tab()
  const m8 = await picked(page)
  L.ok(`${M} S10 the member signs in: her removed pick falls back to a student on the course, the Crew box not blank, no error`, m8.course === '26ABSG' && !!m8.student && m8.student !== 'LO THREE' && errors.length === 0, brief(m8) + ' · errors ' + errors.length)
  await shot(page, S('14', 'member-removed-pick-fallback'))

  /* ---- S10b (A6): the student she picked is RENAMED — her pick still lands on him ---- */
  await choose(page, '#activeSel', 'STUDENT A')
  const sa = (await optIds(page, '#activeSel'))['STUDENT A']
  await half(page, 'info', touch)
  await press(page, `[data-ren="${sa}"]:visible`, touch)
  await waitQ(page); await page.fill('#dlgInput', 'STUDENT AA'); await press(page, '#dlgOk', touch); await sleep(500)
  await half(page, 'flow', touch)
  await logout(page); await as(page, 'hex'); await tab(); await logout(page)
  await as(page, 'member'); await tab()
  const m9 = await picked(page)
  L.ok(`${M} S10b her student renamed "STUDENT AA"; after Hex has used the Tracker she signs in on him still`, m9.course === '26ABSG' && m9.student === 'STUDENT AA' && m9.studentId === sa, brief(m9))

  /* ---- S11 (A12): an Import by the member — the pick after it is hers, nobody else's ---- */
  const kBefore = await pickKeys(page)
  const file = tmp(`lo-2a-pick-${M}.json`)
  await exportVia(page, { tick: ['2026'], students: false, file })
  const asked = await importVia(page, file, async msg => /already exists/.test(msg) ? 'ok' : 'ok')
  const kAfter = await pickKeys(page)
  const m10 = await picked(page)
  const moved = Object.keys({ ...kBefore, ...kAfter }).filter(k => kBefore[k] !== kAfter[k])
  L.ok(`${M} S11 the member imports a chart (Replace it): she stays on her place; no pick key of anyone else moves, no browser-wide pick key is written`,
    m10.course === '26ABSG' && m10.student === 'STUDENT AA' && moved.every(k => k.startsWith('ocuLocal:who:bane:')) && !Object.keys(kAfter).some(k => /^ocuLocal:(lastCourse|lastCrew)/.test(k)),
    `${brief(m10)} · import said ${JSON.stringify(asked.map(a => a.msg.slice(0, 50)))} · keys that changed ${JSON.stringify(moved)}`)

  L.note(`${M} console / page errors`, errors.join(' | ') || 'none')
  allErrors.push(...errors.map(e => M + ': ' + e))
  await browser.close()
}

save('lo-2a-pick', { rows: L.rows, errors: allErrors })
const fails = L.rows.filter(r => r.pass === false).length
console.log(`\n${fails} FAIL · errors ${JSON.stringify(allErrors)}`)
process.exit(fails ? 1 : 0)
