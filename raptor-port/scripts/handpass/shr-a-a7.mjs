// shr-a-a7 — share A, A7 (F-S1, F-S2, F-S7, F-S11, Astra S09, O-S7): THE BUTTONS ON HIS HELD ROW of the Board, each on
// a fresh fixture, after start 0900 and a move into his end box (caret held); and the control: the same press after the
// caret has left (tap away first). SUB=a (the leave's name, then Delete) | b (Reject on a shared OD) | c (the LATE chip)
// | d (his puck, then a name on the crew list) | e (desktop: a name dragged onto his puck).
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit SUB=a node scripts/handpass/shr-a-a7.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, rowSel, typeIn, pressAt, pic, away, fixture, note, idOf, caret, NAMES, TAG } from './shr-a-lib.mjs'
const SUB = process.env.SUB || 'a'
console.log('shr-a-a7 v1', TAG, 'SUB', SUB)
const secs = p => p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove]')].map(s => { const rows = [...s.querySelectorAll('[data-inprow]')].filter(r => /bane|rocky/.test(r.getAttribute('data-inprow')) || r.querySelector('[data-person="bane"],[data-person="rocky"]')); return rows.length ? s.getAttribute('data-secmove') + ': ' + rows.map(r => r.getAttribute('data-inprow') + ' ' + [...r.querySelectorAll('.seat [data-person] .nm')].map(e => e.textContent.trim()).join('+') + ' ' + [...r.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => b.textContent.trim()).join('/')).join(' | ') : null }).filter(Boolean))
async function variant(held) {
  const V = `A7${SUB}-${held ? 'held' : 'control'}`
  const steps = [], pics = [], notes = []
  try {
    const w = await world(); const p = w.page
    const outlaw = await idOf(p, 'Outlaw'); NAMES[outlaw] = 'Outlaw'
    const ids = ['bane', 'rocky', outlaw]
    const iid = await fixture(w, [L.RANGER, L.HEX], SUB === 'b' ? { type: 'OD' } : {})
    await openBoard(w)
    steps.push({ ...(await read(p, 'filed', ids)), sections: await secs(p) })
    if (SUB === 'b') {
      /* a shared overseas duty: under Unavailable already, or accepted into it through the Board's own door */
      const inUnav = await p.locator('#sbBoard > [data-secmove$=".unav"] [data-inprow^="' + iid + '"]').count()
      if (!inUnav) {
        const acc = p.locator(`#schedBoard [data-inprow^="${iid}"] .accb:not(.undo)`).first()
        steps.push({ step: 'not under Unavailable on filing; accept buttons: ' + J(await p.locator(`#schedBoard [data-inprow^="${iid}"] .accb`).allTextContents()) })
        if (!(await acc.count())) throw new Error('the shared OD is not under Unavailable and offers no accept: ' + J(await secs(p)))
        await acc.scrollIntoViewIfNeeded(); await (w.tap ? acc.tap() : acc.click()); await sleep(800)
        notes.push('accept: ' + await note(p))
        steps.push({ ...(await read(p, 'accepted into Unavailable', ids)), sections: await secs(p) })
      }
    }
    const str = await boxSel(p, 'Ranger', 'str')
    if (w.tap) { await typeIn(w, str, '0900', null, 'str-tap'); await pressAt(w, await boxSel(p, 'Ranger', 'end'), 'end-tap') }
    else await typeIn(w, str, '0900', 'Tab')
    steps.push(await read(p, 'start 0900, caret moved into his end box', ids))
    pics.push(await pic(w, `${V}-held`))
    if (!held) { await away(w); steps.push(await read(p, 'caret left (control)', ids)); pics.push(await pic(w, `${V}-left`)) }
    const row = await rowSel(p, 'Ranger')
    const before = await caret(p)
    if (SUB === 'a') {
      await pressAt(w, `${row} .inpedit`, `${V}-label`)
      const win = await p.evaluate(() => { const win = document.querySelector('#inpEditPop'); if (!win || !win.offsetWidth) return null; return { head: (win.innerText || '').split('\n')[0], people: [...win.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')), person: win.querySelector('#inpEditPerson')?.value, start: win.querySelector('#inpEditStart')?.value, end: win.querySelector('#inpEditEnd')?.value, rmk: win.querySelector('#inpEditRmk')?.value } })
      steps.push({ step: 'the leave\'s name pressed', caretBefore: before, caretAfter: await caret(p), window: win, store: await L.ids(p).then(() => null) })
      pics.push(await pic(w, `${V}-window`, ['#inpEditPop']))
      if (!win) throw new Error('no window opened from the leave\'s name')
      await pressAt(w, '#inpEditDel', `${V}-delete`); await sleep(400)
      const conf = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth && /delete|remove|yes/i.test(b.textContent) && b.id !== 'inpEditDel').map(b => (b.id || b.getAttribute('data-testid') || '') + '|' + b.textContent.trim()))
      steps.push({ step: 'Delete pressed; confirm buttons offered: ' + J(conf), note: await note(p) })
      if (conf.length) { pics.push(await pic(w, `${V}-confirm`, ['body'])); const b = p.locator('button:visible', { hasText: new RegExp('^' + conf[0].split('|')[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }).first(); await (w.tap ? b.tap() : b.click()); await sleep(800) }
      notes.push('after delete: ' + await note(p))
      steps.push(await read(p, 'after Delete', ids))
      pics.push(await pic(w, `${V}-after-delete`))
      const s = steps.at(-1).store
      const ok = win.people.join() === 'bane' || win.person === 'bane'
      const okWin = ok && win.start === '09:00' && win.end === '10:00'
      const okDel = !s.some(x => /Ranger/.test(x)) && s.filter(x => /^LL Hex Jul 15 480-600 ""/.test(x)).length === 1
      add(V, okWin && okDel ? 'PASS' : 'FAIL', { window: win, steps, notes }, pics)
    } else if (SUB === 'b') {
      const rej = `${row} .accb[data-acc="x"]`
      if (!(await p.locator(rej).count())) throw new Error('no Reject on Ranger\'s row: ' + J(await secs(p)))
      await pressAt(w, rej, `${V}-reject`)
      notes.push('reject: ' + await note(p))
      steps.push({ ...(await read(p, 'Reject pressed on Ranger\'s row', ids)), caretBefore: before, caretAfter: await caret(p), sections: await secs(p) })
      const readPers = () => p.evaluate(() => { const s = [...document.querySelectorAll('#sbBoard > [data-secmove]')].find(x => /Personal inputs/i.test(x.querySelector('.sb-ph')?.textContent || '')); return s ? { key: s.getAttribute('data-secmove'), text: s.innerText.replace(/\s+/g, ' ').slice(0, 400), folded: !s.querySelector('.sb-pb') || !s.querySelector('.sb-pb').offsetHeight, ranger: !!s.querySelector('[data-person="bane"]'), hex: !!s.querySelector('[data-person="rocky"]') } : 'no Personal Inputs section' })
      let pers = await readPers()
      steps.push({ step: 'Personal Inputs section read', pers })
      if (!pers.ranger && await p.locator('#sbBoard [data-pitog]').count()) {
        await pressAt(w, '#sbBoard [data-pitog]', `${V}-unfold`); pers = await readPers()
        steps.push({ step: 'Personal Inputs unfolded by its heading, read again', pers })
      }
      if (pers.key) { await p.evaluate(k => document.querySelector(`#sbBoard > [data-secmove="${k}"]`).scrollIntoView({ block: 'start' }), pers.key); pics.push(await pic(w, `${V}-personal`, [`#sbBoard > [data-secmove="${pers.key}"]`])) }
      pics.push(await pic(w, `${V}-after-reject`))
      const rs = steps.find(s => s.step === 'Reject pressed on Ranger\'s row')
      const unav = rs.sections.find(x => /\.unav:/.test(x)) || ''
      const hexUnav = /Hex/.test(unav), rangerUnav = /Ranger/.test(unav)
      pers = steps.at(-1).pers
      const st = rs.store, hexOk = st.filter(x => /^OD Hex Jul 15 480-600 ""/.test(x) && !/acc=r/.test(x)).length === 1
      add(V, hexUnav && hexOk && !rangerUnav && pers.ranger && !pers.hex ? 'PASS' : 'FAIL', { steps, notes }, pics)
    } else if (SUB === 'c') {
      const hexRow = await rowSel(p, 'Hex')
      await pressAt(w, `${row} .latechip`, `${V}-late`)
      notes.push('late: ' + await note(p))
      const chips = await p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-inprow]')].filter(r => r.querySelector('.seat [data-person="bane"],.seat [data-person="rocky"]')).map(r => `${[...r.querySelectorAll('.seat .nm')].map(e => e.textContent.trim())} chip=${r.querySelector('.latechip') ? r.querySelector('.latechip').getAttribute('aria-pressed') + '/' + getComputedStyle(r.querySelector('.latechip')).opacity + '/' + r.querySelector('.latechip').textContent.trim() : 'none'}`))
      steps.push({ ...(await read(p, 'LATE pressed on Ranger\'s row', ids)), caretBefore: before, caretAfter: await caret(p), chips, hexRowWas: hexRow })
      pics.push(await pic(w, `${V}-after-late`))
      const lateRec = await p.evaluate(() => window.INPUTS.filter(r => (r.people || []).some(x => x.p === 'bane' || x.p === 'rocky') && r.date === 'Jul 15').map(r => `${(r.people || []).map(x => x.p)} ${Object.entries(r).filter(([k]) => /late/i.test(k)).map(([k, v]) => k + '=' + JSON.stringify(v)).join(' ')}`))
      steps.push({ step: 'late fields in store', lateRec })
      const r = chips.find(x => /^Ranger /.test(x)), h = chips.find(x => /^Hex /.test(x))
      add(V, r && h && /chip=true/.test(r) && /chip=false/.test(h) ? 'PASS' : 'FAIL', { steps, notes }, pics)
    } else if (SUB === 'd' || SUB === 'e' || SUB === 'f') {
      const puck = `${row} .seat [data-person="bane"]`
      /* the crew list: the right-hand (on a phone, drawer) list of names; the Available Crew grid only if it is not drawn */
      const right = p.locator(`#sbRoster .rpuck[data-person="${outlaw}"]`).filter({ visible: true })
      const pal = (await right.count()) || SUB === 'd' ? right : p.locator(`#schedBoard .ap-grid .seat[data-person="${outlaw}"]`).filter({ visible: true })
      steps.push({ step: 'crew list used: ' + ((await right.count()) ? 'the right-hand crew list' : 'not drawn yet (opens on the puck tap) / Available Crew grid') })
      if (SUB === 'd') {
        await pressAt(w, puck, `${V}-puck`)
        const arm = await p.evaluate(() => [...document.querySelectorAll('.ros-arm')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
        steps.push({ step: 'his puck pressed', caretBefore: before, caretAfter: await caret(p), arm })
        pics.push(await pic(w, `${V}-armed`, ['body']))
        /* the name in the list the arm strip heads (the crew list / drawer the puck press opened) */
        const where = await p.evaluate(o => {
          const arm = [...document.querySelectorAll('.ros-arm')].find(e => e.offsetWidth); if (!arm) return null
          const a = document.querySelector("#sbRoster")
          const t = a && a.querySelector(`.rpuck[data-person="${o}"]`)
          if (!t) return null; t.setAttribute('data-shra', '1'); return (a.id || a.className) + ' > ' + t.parentElement.className
        }, outlaw)
        steps.push({ step: 'Outlaw found in the list the arm strip heads: ' + where })
        if (!where) throw new Error('Outlaw not shown on the crew list after the puck press; arm ' + J(arm))
        const tgt = p.locator('[data-shra="1"]').first()
        const b2 = await caret(p)
        await tgt.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
        const bb = await tgt.boundingBox()
        const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('[data-shra]') ? 'the name' : e.tagName + '.' + e.className) : 'none' }, [bb.x + bb.width / 2, bb.y + bb.height / 2])
        steps.push({ step: `Outlaw's box ${J(bb && [bb.x, bb.y, bb.width, bb.height].map(Math.round))}; at its middle: ${hit}` })
        if (w.tap) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
        if (w.tap) await p.screenshot({ path: `${L.OUT}/${V}-outlaw-lift.png`, scale: 'css' })
        await sleep(800)
        steps.push({ step: 'Outlaw pressed on the crew list', caretBefore: b2, caretAfter: await caret(p) })
      } else {
        const a = await pal.first().boundingBox(), t = await p.locator(puck).first().boundingBox()
        if (!a || !t) throw new Error('drag ends not measured ' + J({ a, t }))
        await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down(); await sleep(120)
        const ax = a.x + a.width / 2, ay = a.y + a.height / 2
        let tx = t.x + t.width / 2, ty = t.y + t.height / 2
        for (let i = 1; i <= 15; i++) {
          if (SUB === 'f' && i === 4) { await sleep(400); const t2 = await p.locator(`${await rowSel(p, 'Ranger')} .seat [data-person="bane"]`).first().boundingBox(); steps.push({ step: `re-aimed once the drag began: Ranger's puck now at (${Math.round(t2.x)},${Math.round(t2.y)}), was (${Math.round(t.x)},${Math.round(t.y)})` }); tx = t2.x + t2.width / 2; ty = t2.y + t2.height / 2 }
          await p.mouse.move(ax + (tx - ax) * i / 15, ay + (ty - ay) * i / 15); await sleep(30)
        }
        const under = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const s = e?.closest('[data-inprow]'); return (s ? s.getAttribute('data-inprow') + ' ' : '') + (e?.closest('[data-person]')?.getAttribute('data-person') || e?.className || '') }, [tx, ty])
        await sleep(200); pics.push(await pic(w, `${V}-dragging`, ['body'])); await p.mouse.up(); await sleep(900)
        steps.push({ step: `Outlaw dragged from the crew list (${Math.round(ax)},${Math.round(ay)}) to (${Math.round(tx)},${Math.round(ty)}) — Ranger's puck measured at the press; under the pointer at the drop: ${under}`, caretBefore: before, caretAfter: await caret(p) })
      }
      notes.push('note: ' + await note(p))
      steps.push(await read(p, 'after the name', ids))
      pics.push(await pic(w, `${V}-after`))
      const s = steps.at(-1).store
      const ok = s.filter(x => /^LL Outlaw Jul 15 540-600/.test(x)).length === 1 && !s.some(x => /Ranger/.test(x)) && s.filter(x => /^LL Hex Jul 15 480-600 ""/.test(x)).length === 1
      add(V, ok ? 'PASS' : 'FAIL', { steps, notes }, pics)
    }
    await w.ctx.close()
  } catch (e) { add(V, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 3000), pics) }
}
await variant(true)
await variant(false)
await done('a7' + SUB)
