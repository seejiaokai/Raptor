/* Helpers for blocks C and D of the OIL hand pass — retraction, editing,
   publishing, amending. Everything reads what the SCREEN says. */
import { tap, go, board, B } from './lib.mjs'

export const BASE_STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/cd/base.json'
export const PUB_STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/cd/pub.json'

/** The day's publish strip, exactly as a scheduler reads it. */
export async function dayHead(page, di) {
  return page.evaluate(i => {
    const b = document.querySelector('#schedBoard')
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : null
    const beak = b.querySelector(`[data-beak="${i}"]`)
    return {
      plan: t(b.querySelector('[data-planmenu]')),
      version: t(b.querySelector('.verchip, .dverchip, .alchip, .dver')),
      beak: beak ? { text: t(beak), disabled: !!beak.disabled, cls: beak.className } : null,
      headRow: t(b.querySelector('.sb-planrow, .planselbtn') ? b.querySelector('.planselbtn').parentElement : null),
      signNote: t([...b.querySelectorAll('*')].find(e => /to sign ·|Signed off|signed/i.test(e.innerText || '') && (e.innerText || '').length < 140)),
      unpublish: t([...b.querySelectorAll('button')].find(e => /Unpublish/i.test(e.innerText || ''))),
    }
  }, di)
}

/** Sign every role that still needs one, then press the day's publish button. */
export async function signAndPublish(page, di) {
  const sels = page.locator(`#schedBoard [data-signday="${di}"]:visible`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const cur = await sels.nth(i).inputValue().catch(() => '')
    if (cur && cur !== '' && cur !== '—') continue
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(400)
  const beak = page.locator(`#schedBoard [data-beak="${di}"]:visible`).first()
  const before = (await beak.innerText()).trim()
  if (await beak.isDisabled()) return { published: false, why: before }
  await beak.click()
  await page.waitForTimeout(700)
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await page.waitForTimeout(900) }
  await page.waitForTimeout(500)
  return { published: true, pressed: before, head: await dayHead(page, di) }
}

/** Sign the four roles (they are cleared by every publish) and issue the next
    amendment through the day's own "Publish AL n" button. */
export async function publishAL(page, di) {
  const btn = page.locator(`#schedBoard [data-alpub="${di}"]:visible`).first()
  if (!(await btn.count())) return { published: false, why: 'no AL button on the day' }
  const label = (await btn.innerText()).replace(/\s+/g, ' ').trim()
  const lockedTitle = await btn.getAttribute('title')
  if (await btn.isDisabled()) {
    const sels = page.locator(`#schedBoard [data-signday="${di}"]:visible`)
    for (let i = 0; i < await sels.count(); i++) {
      const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
      if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
      await page.waitForTimeout(120)
    }
    await page.waitForTimeout(400)
  }
  const stillLocked = await btn.isDisabled()
  if (stillLocked) return { published: false, label, lockedTitle, why: 'still locked after signing' }
  await btn.click()
  await page.waitForTimeout(1100)
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
  if (await ok.count() && await ok.isVisible() && !(await ok.isDisabled())) { await ok.click(); await page.waitForTimeout(1000) }
  await page.waitForTimeout(500)
  return { published: true, label, lockedTitle, head: await dayHead(page, di) }
}

/** The amendment panel behind the day's "N pending / N changes" chip. */
export async function pendingPanel(page) {
  const chip = await page.evaluate(() => {
    const b = document.querySelector('#schedBoard')
    const c = [...b.querySelectorAll('*')].filter(e => e.offsetParent && /^\d+ (pending|change)/i.test((e.innerText || '').trim()) && (e.innerText||'').length < 24).pop()
    if (c) c.click()
    return c ? (c.innerText || '').trim() : null
  })
  await page.waitForTimeout(800)
  const text = await page.evaluate(() => [...document.querySelectorAll('.sheet,.pop,.modal,.wavemenu,[class*=chg]')]
    .filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 700)).join(' ||| ').slice(0, 1400))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  return { chip, text }
}

/** Every OIL mark on the board, per puck, as painted. */
export async function bars(page) {
  return page.evaluate(() => {
    const P = window.PEOPLE
    return [...document.querySelectorAll('#schedBoard .puck[data-person]')]
      .filter(e => !e.closest('#sbRoster'))
      .map(e => ({
        who: (P[e.dataset.person] || {}).cs || e.dataset.person,
        bar: e.className.match(/oilbar-(fo|ho)/)?.[1] || (/oilbar/.test(e.className) ? 'plain' : null),
        row: ((e.closest('tr, .sb-arow, .sb-line, .sb-drow') || {}).innerText || '').replace(/\s+/g, ' ').trim().slice(0, 38),
        title: (e.getAttribute('title') || '').slice(0, 120),
      }))
  })
}

/** What the OIL Earn mode is showing right now: the item switches and pucks. */
export async function modeSnap(page) {
  return page.evaluate(() => {
    const b = document.querySelector('#schedBoard')
    const P = window.PEOPLE
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    return {
      bar: t(b.querySelector('.sb-oilbar, .oilbar-day, .sb-top')).slice(0, 220),
      items: [...b.querySelectorAll('[data-oilitem]')].map(e => ({ k: e.dataset.oilitem, text: t(e).slice(0, 26), cls: e.className.slice(0, 44), title: (e.getAttribute('title') || '').slice(0, 130) })),
      people: [...b.querySelectorAll('[data-oilp]')].map(e => {
        const pk = e.querySelector('[data-person]') || e
        const id = pk.dataset ? pk.dataset.person : ''
        const row = e.closest('tr, .sb-arow, .sb-line, .sb-drow, .sb-irow, .sb-row')
        const sec = e.closest('.sb-sec')
        return { k: e.dataset.oilp, who: (P[id] || {}).cs || id, cls: e.className.slice(0, 56),
                 where: ((sec ? (sec.querySelector('.sb-sech, h3, .sech') || {}).innerText || '' : '') + ' :: ' + (row ? (row.innerText || '') : '')).replace(/\s+/g, ' ').trim().slice(0, 60),
                 title: (e.getAttribute('title') || '').slice(0, 140) }
      }),
    }
  })
}

/** Tap the OIL puck for a person, on the first row that offers one (or the nth). */
export async function tapOilPerson(page, cs, n = 0) {
  const keys = await page.evaluate(c => {
    const P = window.PEOPLE
    return [...document.querySelectorAll('#schedBoard [data-oilp]')].map(e => {
      const pk = e.querySelector('[data-person]') || e
      const id = pk.dataset && pk.dataset.person
      return { k: e.dataset.oilp, who: (P[id] || {}).cs || id }
    }).filter(x => x.who === c).map(x => x.k)
  }, cs)
  if (!keys[n]) return 'NO PUCK for ' + cs
  await tap(page, `[data-oilp="${keys[n]}"]`)
  return keys[n]
}

export async function tapOilItem(page, textRe) {
  const src = textRe.source || String(textRe)
  const k = await page.evaluate(re => {
    const rx = new RegExp(re, 'i')
    const hit = [...document.querySelectorAll('#schedBoard [data-oilitem]')].find(e => rx.test(e.innerText || ''))
    return hit ? hit.dataset.oilitem : null
  }, src)
  if (!k) return 'NO ITEM for ' + src
  await tap(page, `[data-oilitem="${k}"]`)
  return k
}

/** Several Leave War cells at once — one trip to the war. */
export async function warCells(page, pairs) {
  await go(page, 'leavewar')
  await page.waitForTimeout(900)
  return page.evaluate(ps => ps.map(([p, d]) => {
    const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`)
    return { pid: p, date: d, found: !!c, text: c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : '', cls: c ? c.className : '', title: c ? (c.getAttribute('title') || '') : '' }
  }), pairs)
}

/** The OIL tracker sheet — every credit box it lists. */
export async function oilTracker(page) {
  await go(page, 'leavewar')
  await page.waitForTimeout(700)
  const btn = page.locator('[data-testid="oil-tracker"]').first()
  await btn.click()
  await page.waitForTimeout(1000)
  return page.evaluate(() => {
    const s = document.querySelector('[data-testid="oil-sheet"]') || [...document.querySelectorAll('.sheet')].find(e => e.offsetParent)
    if (!s) return { open: false, text: null, entries: [] }
    return {
      open: true,
      text: (s.innerText || '').replace(/\s+/g, ' ').slice(0, 2200),
      entries: [...s.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160)),
    }
  })
}

export async function closeSheet(page) {
  const x = page.locator('[data-testid="oil-close"]').first()
  if (await x.count() && await x.isVisible()) { await x.click(); await page.waitForTimeout(400); return }
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
}

/** The day's change history, as the History button shows it. */
export async function history(page) {
  const btn = page.locator('#sbHist')
  if (!(await btn.count())) return null
  await btn.click()
  await page.waitForTimeout(900)
  const out = await page.evaluate(() => {
    const pane = document.querySelector('#schedBoard .sb-boardwrap.hist-on, #schedBoard .tb-hist')
    const top = document.querySelector('#schedBoard .histln-top')
    const list = [...document.querySelectorAll('#schedBoard .histln, #schedBoard .histrow, #schedBoard [class*=histln]')]
      .map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean)
    const paneTxt = pane ? (pane.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 600) : null
    return { top: top ? (top.innerText || '').replace(/\s+/g, ' ').trim() : null, lines: [...new Set(list)].slice(0, 30), pane: paneTxt }
  })
  await page.locator('#sbHist').click()
  await page.waitForTimeout(400)
  return out
}

/** The plans / versions selector at the head of the day. */
export async function planMenu(page, di) {
  await tap(page, `[data-planmenu="${di}"]`)
  await page.waitForTimeout(700)
  return page.evaluate(() => {
    const cands = [...document.querySelectorAll('div,ul,section')].filter(e => e.offsetParent
      && /working copy|Saved plan|version|ORIG|AL\d|Duplicate|plan/i.test(e.innerText || '')
      && (e.innerText || '').length < 900 && e.querySelectorAll('button,li,a').length)
    const m = cands.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)[0]
    if (!m) return { open: false, text: null, items: [] }
    return {
      open: true,
      text: (m.innerText || '').replace(/\s+/g, ' ').slice(0, 900),
      items: [...m.querySelectorAll('button, [role=button], li, a')].filter(e => e.offsetParent)
        .map(e => ({ t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60), d: Object.entries(e.dataset || {}).map(([k, v]) => k + '=' + v).join(' ') }))
        .filter(x => x.t || x.d),
    }
  })
}

export async function toastText(page) {
  return page.evaluate(() => [...document.querySelectorAll('.toast, .snack, [class*=toast], [class*=snack]')]
    .filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 4))
}

/** The day's warning list, plus the pending-changes chip beside it. */
export async function dayWarn(page) {
  return page.evaluate(() => {
    const side = document.querySelector('#sbSide')
    const txt = side ? (side.innerText || '') : ''
    const cut = txt.indexOf('PLACEHOLDERS')
    const head = (cut > 0 ? txt.slice(0, cut) : txt).split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    return head.filter(l => l !== '✕' && l !== '·').slice(0, 16)
  })
}

/** Open the Personal Inputs panel only if it is folded — the header TOGGLES. */
export async function showInputs(page, di) {
  const seen = await page.locator(`#schedBoard [data-inpedit]:visible`).count()
  if (seen) return 'already open'
  await tap(page, `[data-pitog="${di}"]`)
  await page.waitForTimeout(500)
  return 'opened'
}


/** Tap a Leave War day cell and read the detail sheet it opens. */
export async function cellDetail(page, pid, date) {
  await go(page, 'leavewar')
  await page.waitForTimeout(800)
  const c = page.locator(`[data-testid="cell-${pid}-${date}"]`).first()
  if (!(await c.count())) return { found: false }
  await c.click()
  await page.waitForTimeout(900)
  const txt = await page.evaluate(() => {
    const s = [...document.querySelectorAll('.sheet,[role=dialog]')].filter(e => e.offsetParent)
    return s.map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 700))
  })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  return { found: true, sheets: txt }
}

/** Drag a row by its dotted grip, the way a scheduler does. */
export async function dragRow(page, fromMove, toMove) {
  const g = page.locator(`#schedBoard [data-move="${fromMove}"] .sb-grip`).first()
  const t = page.locator(`#schedBoard [data-move="${toMove}"]`).first()
  if (!(await g.count())) return 'no grip on ' + fromMove
  await g.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(250)
  const a = await g.boundingBox(), b = await t.boundingBox()
  if (!a || !b) return 'no box'
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(200)
  const y0 = a.y + a.height / 2, y1 = b.y + b.height * 0.75
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(a.x + a.width / 2 + 6, y0 + (y1 - y0) * i / 10)
    await page.waitForTimeout(70)
  }
  await page.waitForTimeout(250)
  await page.mouse.up()
  await page.waitForTimeout(900)
  return 'dragged from ' + fromMove + ' onto ' + toMove
}

/** Drag a seated puck off its row into empty space — the board's own way of
    taking a man off (there is no cross on the puck). */
export async function dragPuckOff(page, rowText, person) {
  const pk = page.locator('#schedBoard .puck[data-person="' + person + '"]').filter({ has: page.locator('xpath=.') })
  const loc = await page.evaluateHandle(([txt, pid]) => {
    const row = [...document.querySelectorAll('#schedBoard .sb-grow, #schedBoard tr, #schedBoard .sb-arow')]
      .find(e => e.offsetParent && new RegExp(txt, 'i').test(e.innerText || ''))
    return row ? row.querySelector(`.puck[data-person="${pid}"]`) : null
  }, [rowText, person])
  const el = loc.asElement()
  if (!el) return 'no puck for ' + person + ' on ' + rowText
  const box = await el.boundingBox()
  if (!box) return 'no box'
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(200)
  for (let i = 1; i <= 8; i++) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 30 * i); await page.waitForTimeout(60) }
  await page.mouse.move(20, 300); await page.waitForTimeout(200)
  await page.mouse.up()
  await page.waitForTimeout(900)
  return 'dragged ' + person + ' off ' + rowText
}

export { tap, go, board, B }
