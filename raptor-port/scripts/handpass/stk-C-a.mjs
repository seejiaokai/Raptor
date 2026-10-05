/* P3-01, P3-02, P3-03 — published wording / older version / reissue */
import * as C from './stk-C-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const CREW = ['Saber', 'Echo']

async function setup() {
  const w = await C.world()
  const p = w.p
  await C.tracking(p, true)
  await C.board(p, 0)
  await C.bset(p, 'ff:0.0.0.msn', 'ACM')
  await C.bset(p, 'fr:0.0.0.0', 'DS FOR RU')
  const q = await C.question(p)
  if (q.nQ) await C.side(p, 'later')
  return { ...w, q0: q }
}
const mixNow = async p => C.mixOf(await C.insightsRead(p), ...CREW)

/* ---------------- P3-01 ---------------- */
async function p301() {
  const { browser, p, q0 } = await setup()
  try {
    const pics = []
    const base = await mixNow(p); pics.push(await C.pic(p, 'p301-base'))
    const pub = await C.publish2(p, 0)
    const h1 = await C.headOf(p, 0)
    const ver = await p.evaluate(() => window.dayCurVer(0))
    const afterPub = await mixNow(p)
    pics.push(await C.pic(p, 'p301-published'))
    // change working remarks wording
    await C.bset(p, 'fr:0.0.0.0', 'DS FROM RU')
    const qW = await C.question(p)
    if (qW.nQ) await C.side(p, 'later')
    const h2 = await C.headOf(p, 0)
    const pend = await C.pending(p, 0)
    pics.push(await C.pic(p, 'p301-working-edit'))
    const s0 = await C.snap(p)
    // answer Red on the latest-published view
    await C.preview(p, ver)
    const qp = await C.openQuestion(p, 0, { published: true })
    pics.push(await C.pic(p, 'p301-published-question'))
    await C.side(p, 'red')
    const s1 = await C.snap(p)
    const hp1 = await C.headOf(p, 0)
    const h3 = await C.headOf(p, 0)
    const mixPubRed = await mixNow(p)
    pics.push(await C.pic(p, 'p301-published-red'))
    // back to the working copy, answer Blue
    await C.live(p, 0)
    const hLive1 = await C.headOf(p, 0)
    const qWork = await C.openQuestion(p, 0, { published: false })
    pics.push(await C.pic(p, 'p301-working-question'))
    await C.side(p, 'blue')
    const h4 = await C.headOf(p, 0)
    const pend4 = await C.pending(p, 0)
    const s2 = await C.snap(p)
    const mixPubStill = await mixNow(p)
    pics.push(await C.pic(p, 'p301-working-blue'))
    // issue the wording amendment
    const al = await C.alIssue(p, 0)
    const h5 = await C.headOf(p, 0)
    const mixAfterAL = await mixNow(p)
    pics.push(await C.pic(p, 'p301-after-al'))
    const ok = /Red|1r|^$/.test('') || true
    const cond = [
      `publishedRed=${mixPubRed}`.includes('Echo:2b/1r') || mixPubRed.includes('Echo:2b/1r'),
      mixPubStill === mixPubRed,
      mixAfterAL.includes('Echo:3b/0r'),
      s1.days === s0.days && s1.book === s0.book,
      s2.days === s1.days && s2.book === s1.book,
    ]
    C.row('P3-01', 'ACM VL "DS FOR RU" unanswered, published Mon; working remarks → "DS FROM RU"; Red on the latest-published view (version menu, read-only Remarks → Choose mission role); back to working copy, Blue; then Publish AL',
      `base ${base}. After publish (head ${J(h1)}): ${afterPub}. Working edit → head ${J(h2)} pending ${J(pend)}; working question ${J(qW)}. Published question ${J(qp)}; after Red: Insights ${mixPubRed}; head ${J(h3)}; days/signature book unchanged by Red: ${s1.days === s0.days && s1.book === s0.book}. Back on working copy head ${J(hLive1)} (before Red it was ${J(h2)}). Working question ${J(qWork)}; after Blue head ${J(h4)} pending ${J(pend4)}; Insights while amendment pending: ${mixPubStill}; days/book unchanged by Blue: ${s2.days === s1.days && s2.book === s1.book}. After Publish AL ${J(al)} head ${J(h5)}: Insights ${mixAfterAL}`,
      cond.every(Boolean) ? 'PASS' : 'CHECK', pics)
  } catch (e) { C.row('P3-01', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p301-error')]) }
  finally { await browser.close() }
}

/* ---------------- P3-02 ---------------- */
async function p302() {
  const { browser, p } = await setup()
  try {
    const pics = []
    const orig = await C.publish2(p, 0)
    const ver0 = await p.evaluate(() => window.dayCurVer(0))
    // AL1 with different cue wording
    await C.bset(p, 'fr:0.0.0.0', 'DS FROM RU')
    if ((await C.question(p)).nQ) await C.side(p, 'later')
    const al = await C.alIssue(p, 0)
    const ver1 = await p.evaluate(() => window.dayCurVer(0))
    const vs = await C.versions(p)
    pics.push(await C.pic(p, 'p302-versions'))
    // Original preview
    await C.preview(p, ver0)
    const f0 = p.locator('#schedBoard [data-role-remarks]:visible').first()
    const n0 = await p.locator('#schedBoard [data-role-remarks]').count()
    let q0 = null, txt0 = null
    if (n0) { await f0.click(); await C.sleep(300); q0 = await C.question(p); txt0 = await f0.inputValue().catch(() => f0.innerText()) }
    const ro0 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard textarea, #schedBoard input[data-bfld]')].length)
    pics.push(await C.pic(p, 'p302-original'))
    // go to latest (AL1) preview
    await C.live(p, 0)
    await C.preview(p, ver1)
    const f1 = p.locator('#schedBoard [data-role-remarks]:visible').first()
    const n1 = await p.locator('#schedBoard [data-role-remarks]').count()
    let q1 = null, txt1 = null, ro1 = null
    if (n1) { await f1.click(); await C.sleep(300); q1 = await C.question(p); txt1 = await f1.inputValue().catch(() => f1.innerText()); ro1 = await f1.getAttribute('readonly') }
    pics.push(await C.pic(p, 'p302-latest'))
    C.row('P3-02', 'published Original (DS FOR RU) then AL1 (DS FROM RU) through Publish / Publish AL; opened each version in the board\'s version menu and focused its Remarks',
      `versions listed ${J(vs)}. Original(${ver0}) preview: role-remarks boxes ${n0}, text ${J(txt0)}, question UI after click ${J(q0)}, editable inputs on board ${ro0}. Latest AL1(${ver1}) preview: role-remarks boxes ${n1}, text ${J(txt1)}, readonly attr ${J(ro1)}, after click ${J(q1)}`,
      (n0 === 0 || (q0 && !q0.choose && !q0.nQ)) && n1 > 0 && q1 && q1.choose ? 'PASS' : 'CHECK', pics)
  } catch (e) { C.row('P3-02', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p302-error')]) }
  finally { await browser.close() }
}

/* ---------------- P3-03 ---------------- */
async function p303() {
  const { browser, p } = await setup()
  try {
    const pics = []
    await C.publish2(p, 0)
    const ver = await p.evaluate(() => window.dayCurVer(0))
    await C.preview(p, ver)
    const q = await C.openQuestion(p, 0, { published: true })
    pics.push(await C.pic(p, 'p303-open-question'))
    // leave the preview
    await C.live(p, 0)
    const afterLive = await C.question(p)
    // unpublish, reissue
    const un = await W.unpublish(p, 0)
    const head1 = await C.headOf(p, 0)
    pics.push(await C.pic(p, 'p303-unpublished'))
    const re = await C.publish2(p, 0)
    const ver2 = await p.evaluate(() => window.dayCurVer(0))
    const head2 = await C.headOf(p, 0)
    await C.preview(p, ver2)
    const afterReissue = await C.question(p)
    pics.push(await C.pic(p, 'p303-reissued-view'))
    const q2 = await C.openQuestion(p, 0, { published: true })
    pics.push(await C.pic(p, 'p303-new-question'))
    await C.side(p, 'red')
    const mix = await mixNow(p)
    pics.push(await C.pic(p, 'p303-answered'))
    C.row('P3-03', 'open a Published question on latest issued day; leave the preview (Live); Unpublish (armed+confirm), re-sign + Publish; return to the preview',
      `question opened ${J(q)}; after leaving preview ${J(afterLive)}; unpublish ${J(un)} head ${J(head1)}; reissue ${J(re.r)} head ${J(head2)} ver ${ver}→${ver2}; on returning to the reissued preview question UI is ${J(afterReissue)}; new question via Choose ${J(q2)}; after Red Insights ${mix}`,
      !afterLive.nQ && !afterReissue.nQ && q2.nQ ? 'PASS' : 'CHECK', pics)
  } catch (e) { C.row('P3-03', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p303-error')]) }
  finally { await browser.close() }
}
const only = (process.env.ONLY || 'p301,p302,p303').split(',')
if (only.includes('p301')) await p301()
if (only.includes('p302')) await p302()
if (only.includes('p303')) await p303()
C.save('a')
