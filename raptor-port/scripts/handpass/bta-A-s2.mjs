/* walker A — S12 (AVALON), S13 (OFT / AMT), S14 (duty, SC desk, ground, Common Programme). Usage: node bta-A-s2.mjs <s12|s13|s14>
   One fresh world per case (a take-off drag was not reliable enough to reuse a world). Every fixture through the app's own controls. */
import * as A from './bta-A-lib.mjs'
const { B, K, W, L, TUE, ID, CSN, sleep } = A
const which = process.argv[2] || 's12'
const clip = s => String(s).replace(/\s+/g, ' ')
const sz = A.PHONE ? '390×844 phone' : '1440×900 desktop'
const OTHER_A = 'taipan', OTHER_B = 'bullet'

/* every seat control on the open board under a prefix, as the DOM offers them */
const controls = (p, prefix) => p.evaluate(pre => [...new Set([...document.querySelectorAll('#schedBoard [data-slot], #schedBoard [data-fill]')].filter(e => e.offsetParent !== null).map(e => e.dataset.slot || e.dataset.fill).filter(k => k.startsWith(pre)))], prefix)

/* one placement: put X on `key` (arming it), read, judge against the oracle for `fam`; returns the row text */
async function one(p, type, fam, key, label, tag, { pics = true, prefill = [] } = {}) {
  for (const pid of prefill) await K.handPut(p, key, pid)
  const u = await A.putX(p, { key })
  const s = await A.read(p, tag.replace(/\W+/g, '_'), { pics })
  const j = A.judge(type, fam, s)
  return { u, s, j, key, label }
}
function row(id, did, o, extra = '') {
  K.R(id, did, `crew list before he is placed: ${A.sayRoster(o.u.r)}; placed ${o.u.took} on ${o.key}${o.u.toast ? ', toast "' + clip(o.u.toast).slice(0, 140) + '"' : ''}. ${A.say(o.s)} → oracle ${o.j.exp}${o.j.ok ? ' — matches' : ' — MISMATCH ' + o.j.why}.${extra}`, o.u.took && o.j.ok ? 'PASS' : 'FAIL', o.s.pics)
}
/* a world per case, with errors written as a row */
async function inWorld(id, fn) {
  const w = await K.fresh(); const { p, errors } = w
  try { await fn(p) } catch (e) { K.R(id, 'script', String(e.stack || e).slice(0, 500), 'FAIL', [await A.pic(p, ('ERR-' + id).replace(/\W+/g, '_'))]) }
  if (errors.length) K.R(id + '.err', 'browser errors', errors.join(' | ').slice(0, 400), 'FAIL')
  await w.browser.close()
}

/* ---------------- S12 ---------------- */
/* AVALON wave with its shift times cleared AND an AVALON desk (+ Block from the AVALON template, row 1 times cleared) */
async function avSetup(p, type) {
  await A.fileType(p, type)
  const av = await K.addStandby(p, TUE, 'avalon')
  const hrsBefore = await p.evaluate(([i, g]) => { const x = window.DAYS[i].waves[g].formations[0]; return `start "${x.to}" end "${x.ld}"` }, [TUE, av.gi])
  await K.ff(p, TUE, av.gi, 0, 'to', ''); await K.ff(p, TUE, av.gi, 0, 'ld', '')
  const hrs = await p.evaluate(([i, g]) => { const x = window.DAYS[i].waves[g].formations[0]; return `start "${x.to}" end "${x.ld}"` }, [TUE, av.gi])
  await K.boardTo(p, TUE)
  const b = p.locator(`#schedBoard [data-dwadd="${TUE}"]`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(450)
  await p.locator('[data-blktpl]').filter({ hasText: /^AVALON/ }).first().click(); await sleep(800)
  const blk = (await p.evaluate(i => window.DAYS[i].dutywaves.length, TUE)) - 1
  const rows0 = await p.evaluate(([i, bb]) => window.DAYS[i].dutywaves[bb].rows.map(r => `${r.role} ${r.str}-${r.end}`), [TUE, blk])
  await K.boardTo(p, TUE); await W.boardText(p, `dr:${TUE}.${blk}.0.str`, ''); await W.boardText(p, `dr:${TUE}.${blk}.0.end`, '')
  const rowSt = await p.evaluate(([i, bb]) => { const r = window.DAYS[i].dutywaves[bb].rows[0]; return `role "${r.role}" start "${r.str}" end "${r.end}"` }, [TUE, blk])
  return { av, blk, text: `AVALON wave (shift ${hrsBefore} → cleared: ${hrs}); AVALON desk by + Block from the AVALON template (rows ${rows0.join(', ')}; row 1 cleared: ${rowSt})` }
}
async function s12() {
  for (const type of ['OL', 'ATT B', 'LL']) {
    const variants = [
      ['avMain', c => `${TUE}.${c.av.gi}.0.0.p`, 'AVALON MAIN front seat'], ['avMain', c => `${TUE}.${c.av.gi}.0.0.w`, 'AVALON MAIN rear seat'],
      ['avSpare', c => `${TUE}.${c.av.gi}.0.2.p`, 'AVALON SPARE front seat'], ['avSpare', c => `${TUE}.${c.av.gi}.0.2.w`, 'AVALON SPARE rear seat'],
      ['bbDesk', c => `d:${TUE}.${c.blk}.0.+`, 'AVALON desk, primary person'], ['bbDesk', c => `d:${TUE}.${c.blk}.0.+`, 'AVALON desk, extra person (another man first)', [OTHER_A]],
      ['bbDesk', c => `d:${TUE}.${c.blk}.0.+`, 'AVALON desk after the AVALON wave is deleted', [], true],
    ]
    for (const [fam, keyOf, label, prefill, delWave] of variants) {
      if (process.argv[3] === 'cockpit' && !/seat/.test(label)) continue
      await inWorld(`S12 ${type} ${label}`, async p => {
        const c = await avSetup(p, type)
        const o = await one(p, type, fam, keyOf(c), label, `s12-${type}-${label}`, { prefill: prefill || [], pics: !delWave })
        let extra = ''
        if (delWave) {
          const del = p.locator(`#schedBoard [data-gdel="${TUE}.${c.av.gi}"]`).first()
          await K.boardTo(p, TUE)
          await del.evaluate(e => e.scrollIntoView({ block: 'center' })); await del.click(); await sleep(900)
          const confirm = p.locator('[data-testid="confirm"]:visible, #confirmOk:visible, .modal button.danger:visible').first()
          if (await confirm.count()) { extra += ' (a confirm window appeared and was accepted)'; await confirm.click().catch(() => {}); await sleep(700) }
          const waves = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label), TUE)
          const deskNow = await p.evaluate(([i, bb]) => { const r = window.DAYS[i].dutywaves[bb] && window.DAYS[i].dutywaves[bb].rows[0]; return r ? JSON.stringify({ id: r.id, more: r.more }) : 'desk gone' }, [TUE, c.blk])
          o.s = await A.read(p, `s12-${type}-after-wave-delete`, { pics: true }); o.j = A.judge(type, fam, o.s)
          extra += ` After "✕ Wave": waves now ${waves.join(', ')}; desk row now ${deskNow}.`
          if (waves.includes('AVALON') || !deskNow.includes(ID)) o.j.ok = false
        }
        row(`S12 ${type} × ${label}`, `${sz}: ${type} filed for X for Tuesday; ${c.text}; X put on ${label}`, o, extra)
      })
    }
  }
}

/* ---------------- S13 ---------------- */
async function s13() {
  let cases = []
  await inWorld('S13 controls', async p => {
    await K.boardTo(p, TUE)
    const before = await controls(p, 's:')
    const oft = await A.build(p, 'sim')
    const sb = p.locator(`#schedBoard [data-sblkadd="${TUE}"]`).first(); await sb.evaluate(e => e.scrollIntoView({ block: 'center' })); await sb.click(); await sleep(800)
    const after = await controls(p, 's:')
    const fresh = after.filter(k => !before.includes(k))
    const amtRows = await p.evaluate(i => window.DAYS[i].sims.amt.map((r, n) => `${n}:${r.label} ${r.str || '-'}/${r.end || '-'}`), TUE)
    K.R('S13 — controls', `${sz}: "+ Row" in OFT; "+ Block" (AMT block: BRIEF, BOX, DEBRIEF)`, `new person controls offered by the new rows: ${JSON.stringify(fresh)}; AMT rows now ${amtRows.join(' | ')}`, 'RECORDED', [await A.pic(p, 's13-controls')])
    cases = [[`s:${TUE}.oft.${oft.ri}.p`, 'OFT row front seat', false], [`s:${TUE}.oft.${oft.ri}.w`, 'OFT row rear seat', false], [`s:${TUE}.oft.${oft.ri}.+`, 'OFT row extra person (front and rear taken by two others)', true]]
    for (const k of fresh.filter(k => /^s:\d+\.amt\./.test(k))) cases.push([k, `AMT block control ${k.replace(`s:${TUE}.amt.`, 'row ')}`, false])
  })
  for (const type of ['OL', 'ATT B']) for (const [key, label, two] of cases) {
    await inWorld(`S13 ${type} ${label}`, async p => {
      await A.fileType(p, type)
      const oft = await A.build(p, 'sim'); await A.blankIt(p, oft)
      const sb = p.locator(`#schedBoard [data-sblkadd="${TUE}"]`).first(); await sb.evaluate(e => e.scrollIntoView({ block: 'center' })); await sb.click(); await sleep(800)
      if (two) { await K.handPut(p, `s:${TUE}.oft.${oft.ri}.p`, OTHER_A); await K.handPut(p, `s:${TUE}.oft.${oft.ri}.w`, OTHER_B) }
      const o = await one(p, type, 'sim', key, label, `s13-${type}-${label}`)
      const where = await p.evaluate(([i, r]) => JSON.stringify(window.DAYS[i].sims.oft[r]), [TUE, oft.ri])
      row(`S13 ${type} × ${label}`, `${sz}: ${type} filed for X for Tuesday; a new OFT row (no name, no times) and a new AMT block; X put on ${label}`, o, ` OFT row now ${where.slice(0, 200)}`)
    })
  }
}

/* ---------------- S14 ---------------- */
async function s14() {
  const paths = [
    ['duty', 'ordinary duty row — main person', 'duty'], ['duty', 'ordinary duty row — extra person', 'duty', [OTHER_A]],
    ['scdesk', 'SC-linked duty desk — main person', 'duty'], ['scdesk', 'SC-linked duty desk — extra person', 'duty', [OTHER_A]],
    ['ground', 'Ground Programme row — main person', 'ground'], ['ground', 'Ground Programme row — extra person', 'ground', [OTHER_A]],
    ['prog', 'Common Programme row — first crowd member', 'prog'], ['prog', 'Common Programme row — second crowd member', 'prog', [OTHER_A]],
  ]
  for (const type of ['OL', 'ATT B']) for (const [fam, label, oracleFam, prefill] of paths) {
    await inWorld(`S14 ${type} ${label}`, async p => {
      await A.fileType(p, type)
      let key, st
      if (fam === 'scdesk') {
        await K.boardTo(p, TUE)
        const b = p.locator(`#schedBoard [data-dwadd="${TUE}"]`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(450)
        await p.locator('[data-blktpl]').filter({ hasText: /^SC Shift/ }).first().click(); await sleep(800)
        const blk = (await p.evaluate(i => window.DAYS[i].dutywaves.length, TUE)) - 1
        const r0 = await p.evaluate(([i, bb]) => window.DAYS[i].dutywaves[bb].rows.map(r => `${r.role} ${r.str}-${r.end}`), [TUE, blk])
        await K.boardTo(p, TUE); await W.boardText(p, `dr:${TUE}.${blk}.0.str`, ''); await W.boardText(p, `dr:${TUE}.${blk}.0.end`, '')
        key = `d:${TUE}.${blk}.0.+`; st = `SC Shift block rows ${r0.join(', ')}; row 1 start/end cleared`
      } else { const h = await A.build(p, fam); await A.blankIt(p, h); key = h.key; st = h.label + ' — ' + await h.state() }
      const o = await one(p, type, oracleFam, key, label, `s14-${type}-${label}`, { prefill: prefill || [] })
      row(`S14 ${type} × ${label}`, `${sz}: ${type} filed for X for Tuesday; ${st}${prefill ? '; another man put on it first' : ''}; X put on it`, o)
    })
  }
}

if (which === 's12') await s12()
if (which === 's13') await s13()
if (which === 's14') await s14()
B.savePart('bta-A-' + which)
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n      ${clip(r.did).slice(0, 220)}\n      → ${clip(r.saw).slice(0, 1300)}`)
