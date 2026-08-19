// @vitest-environment jsdom
/* The Quals page — tfin's B24 (Scheduler appointment) and V (AAR invariant)
   page assertions, driven through the React table. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { validate, WARN } from '../engine/validate'
import { PEOPLE, isScheduler, isInstr, isInstrPilot, deriveQuals, ID_BY_CS, QCHIP, QCOLOR, QORDER, LEVELNAME } from '../engine/people'
import { sansGate } from '../engine/avail'
import { HOOKS } from '../engine/hooks'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* heading labels: the sorted column carries an arrow and, in EDIT QUALS, a
   grip and a ✕ — the label element is the name on its own */
const heads = () => $$('#qtbl thead th').map(x => {
  const lbl = x.querySelector('.qlbl')
  return ((lbl || x).textContent || '').replace(/[▲▼]/g, '')
})
/* the callsign column, top to bottom — what a sort is judged by */
const col = (sel: string) => $$(`#qtbl tbody tr:not(.grp) ${sel}`).map(x => (x.textContent || '').trim())
const callsigns = () => col('td.qname')

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'quals')!)
})

describe('the Quals page (tfin)', () => {
  it('quals rows', () => {
    expect($$('#qtbl tbody tr').length).toBeGreaterThan(10)
  })

  it('the Quals table has a Scheduler column, with the appointments', () => {
    const hs = $$('#qtbl thead th').map(x => x.textContent)
    expect(hs).toContain('Scheduler')
    expect($('#qtbl thead th.apt')).toBeTruthy()
  })

  it('appointed people are ticked, and a tick matches isScheduler', () => {
    expect($$('#qtbl td.qcell.apt-on').length).toBeGreaterThan(0)
    expect($$('#qtbl td[data-q$="|sched"]')
      .every(td => td.classList.contains('apt-on') === isScheduler(td.dataset.q!.split('|')[0]))).toBe(true)
  })

  it('every row carries the cell', () => {
    expect($$('#qtbl td[data-q$="|sched"]').length).toBe($$('#qtbl tbody tr:not(.grp)').length)
  })

  it('ticking the cell appoints them, unticking withdraws it', async () => {
    const td = $$('#qtbl td[data-q$="|sched"]').find(x => !x.classList.contains('apt-on'))!
    const id = td.dataset.q!.split('|')[0]
    await click($('#qEdit'))
    await click($(`#qtbl td[data-q="${id}|sched"]`))
    expect(isScheduler(id)).toBe(true)
    await click($(`#qtbl td[data-q="${id}|sched"]`))
    expect(isScheduler(id)).toBe(false)
  })

  /* the SANS tick grants REAL status: p.san, the flag every availability
     surface reads — not just the derived p.quals.san copy (bug-test fix). Prove
     it functionally: sansGate returns 'na' for a non-SANS person and 'none'
     (SANS, nothing filed) once the tick takes. Edit mode is already on from the
     Scheduler test above, the same way the AAR/SC tests below rely on it. */
  it('ticking SANS grants real SANS status (p.san), and unticking removes it', async () => {
    const id = Object.keys(PEOPLE).find(i => !PEOPLE[i].san && !PEOPLE[i].archived && !PEOPLE[i].special && PEOPLE[i].seat)!
    expect(id).toBeTruthy()
    expect(sansGate(id, 'Jul 13', 'fly', 480, 600).status).toBe('na')     // not SANS yet
    await click($(`#qtbl td[data-q="${id}|san"]`))
    expect(PEOPLE[id].san).toBe(true)
    expect(sansGate(id, 'Jul 13', 'fly', 480, 600).status).toBe('none')   // now judged as SANS
    await click($(`#qtbl td[data-q="${id}|san"]`))
    expect(PEOPLE[id].san).toBe(false)
    expect(sansGate(id, 'Jul 13', 'fly', 480, 600).status).toBe('na')     // removed again
  })

  /* SXO is the SAME one-way-copy trap as SANS: deriveQuals copies p.sxo ->
     quals.sxo, so the tick has to write the RAW p.sxo, not only the derived
     copy — Leave War's roster projection reads p.sxo, and before the fix an SXO
     marked here never showed there (owner, 18 Aug 26). */
  it('ticking SXO sets the raw p.sxo the Leave War projection reads', async () => {
    const id = Object.keys(PEOPLE).find(i => !PEOPLE[i].sxo && !PEOPLE[i].archived && !PEOPLE[i].special && PEOPLE[i].seat && !PEOPLE[i].pers)!
    expect(id).toBeTruthy()
    await click($(`#qtbl td[data-q="${id}|sxo"]`))
    expect(PEOPLE[id].sxo).toBe(true)
    expect(PEOPLE[id].quals.sxo).toBe(true)
    await click($(`#qtbl td[data-q="${id}|sxo"]`))
    expect(PEOPLE[id].sxo).toBe(false)
  })

  it('NAAR cannot be ticked before DAAR, and removing DAAR removes NAAR', async () => {
    const id = Object.keys(PEOPLE).find(i => PEOPLE[i].seat === 'FCP' && !PEOPLE[i].archived && !PEOPLE[i].quals.daar && !PEOPLE[i].special)!
    expect(id).toBeTruthy()
    await click($(`#qtbl td[data-q="${id}|naar"]`))
    expect(PEOPLE[id].quals.naar).toBeFalsy()          // refused — DAAR first
    await click($(`#qtbl td[data-q="${id}|daar"]`))
    await click($(`#qtbl td[data-q="${id}|naar"]`))
    expect(PEOPLE[id].quals.naar).toBe(true)
    await click($(`#qtbl td[data-q="${id}|daar"]`))    // withdraw DAAR
    expect(PEOPLE[id].quals.daar).toBe(false)
    expect(PEOPLE[id].quals.naar).toBe(false)          // NAAR went with it
  })

  /* the fixture above is an FCP with no DAAR, which on the seed roster means
     an OCU pilot — NOT an instructor, so his AAR cells are two-state and this
     test stays about the plain ladder. The coupling is invisible; if that
     `find` ever lands on an IP, the third state below is what it would meet. */
  it('SC NIGHT needs SC DAY, exactly as NAAR needs DAAR', async () => {
    const id = Object.keys(PEOPLE).find(i => PEOPLE[i].seat === 'FCP' && !PEOPLE[i].archived && !PEOPLE[i].quals.scDay && !PEOPLE[i].special)!
    expect(id).toBeTruthy()
    await click($(`#qtbl td[data-q="${id}|scNight"]`))
    expect(PEOPLE[id].quals.scNight).toBeFalsy()
    await click($(`#qtbl td[data-q="${id}|scDay"]`))
    await click($(`#qtbl td[data-q="${id}|scNight"]`))
    expect(PEOPLE[id].quals.scNight).toBe(true)
    await click($(`#qtbl td[data-q="${id}|scDay"]`))
    expect(PEOPLE[id].quals.scNight).toBe(false)
    await click($('#qSave'))
  })

  /* ---- the AAR instructor mark (owner, 10 Aug 26) ------------------------
     "A second click on a tick will show I instead of a tick. Next click will
     go back to blank. And it just goes in this logic loop." Only instructor
     PILOTS, only on the two AAR columns. */
  const anIP = () => Object.keys(PEOPLE).find(i => PEOPLE[i].seat === 'FCP' && isInstrPilot(PEOPLE[i].q) && !PEOPLE[i].archived && !PEOPLE[i].special)!
  const cellOf = (id: string, k: string) => $(`#qtbl td[data-q="${id}|${k}"]`)
  const glyph = (id: string, k: string) => (cellOf(id, k).textContent || '').trim()

  it('an instructor pilot\'s DAAR cell loops blank → tick → I → blank', async () => {
    const id = anIP()
    await click($('#qEdit'))
    PEOPLE[id].quals.daar = false; PEOPLE[id].quals.naar = false
    await act(async () => { notify() })
    expect(glyph(id, 'daar'), 'starts blank').toBe('')
    await click(cellOf(id, 'daar'))
    expect(PEOPLE[id].quals.daar).toBe(true)
    expect(glyph(id, 'daar')).toBe('✓')
    await click(cellOf(id, 'daar'))
    expect(PEOPLE[id].quals.daar, 'the second click promotes').toBe('I')
    expect(glyph(id, 'daar'), 'and it reads as a letter, not a tick').toBe('I')
    expect(cellOf(id, 'daar').querySelector('.qchk.qi'), 'carrying its own class').toBeTruthy()
    await click(cellOf(id, 'daar'))
    expect(PEOPLE[id].quals.daar, 'and the third closes the loop').toBe(false)
    expect(glyph(id, 'daar')).toBe('')
  })

  it('a pilot who is not an instructor still only toggles', async () => {
    const id = Object.keys(PEOPLE).find(i => PEOPLE[i].seat === 'FCP' && !isInstr(PEOPLE[i].q) && !PEOPLE[i].archived && !PEOPLE[i].special)!
    PEOPLE[id].quals.daar = false
    await act(async () => { notify() })
    await click(cellOf(id, 'daar'))
    expect(PEOPLE[id].quals.daar).toBe(true)
    await click(cellOf(id, 'daar'))
    expect(PEOPLE[id].quals.daar, 'no third state for him').toBe(false)
  })

  it('NAAR reaches I only once DAAR carries it — and never dead-ends before then', async () => {
    /* the regression that matters: refusing the promotion outright would
       strand the cell on a tick with blank unreachable, so while DAAR is a
       plain tick the NAAR cell must simply behave as two-state. */
    const id = anIP()
    PEOPLE[id].quals.daar = true; PEOPLE[id].quals.naar = true
    await act(async () => { notify() })
    await click(cellOf(id, 'naar'))
    expect(PEOPLE[id].quals.naar, 'it unticks rather than sticking').toBe(false)
    PEOPLE[id].quals.daar = 'I'; PEOPLE[id].quals.naar = true
    await act(async () => { notify() })
    await click(cellOf(id, 'naar'))
    expect(PEOPLE[id].quals.naar, 'with the day mark held, it promotes').toBe('I')
  })

  it('withdrawing the DAAR mark demotes NAAR rather than removing it', async () => {
    const id = anIP()
    PEOPLE[id].quals.daar = 'I'; PEOPLE[id].quals.naar = 'I'
    await act(async () => { notify() })
    await click(cellOf(id, 'daar'))          // I -> blank
    expect(PEOPLE[id].quals.daar).toBe(false)
    expect(PEOPLE[id].quals.naar, 'DAAR gone entirely takes NAAR with it').toBe(false)
    PEOPLE[id].quals.daar = 'I'; PEOPLE[id].quals.naar = 'I'
    await act(async () => { notify() })
    /* now the softer case: DAAR demoted from I to a tick by way of the loop */
    PEOPLE[id].quals.daar = true
    deriveQuals(PEOPLE[id])
    expect(PEOPLE[id].quals.naar, 'he keeps night currency, loses only the teaching').toBe(true)
  })

  it('signing someone off RE-CHECKS the week — the warning goes at once', async () => {
    /* owner, 10 Aug 26: "when I change the back seat to qualified to instruct,
       the warning is still there... I needed to type in the remarks some random
       thing, exit, then delete that random text." A qual is an INPUT to the
       rules, but ticking one only repainted — nothing recomputed WARN, so the
       board kept showing a warning the roster no longer justified until some
       unrelated schedule edit happened to run the validator. */
    const back = anIP()
    const front = Object.keys(PEOPLE).find(i => PEOPLE[i].seat === 'FCP' && !isInstr(PEOPLE[i].q) && !PEOPLE[i].archived && !PEOPLE[i].special)!
    const ac = DAYS[0].waves.find((w: any) => (w.formations || []).length)!.formations[0].aircraft[0]
    ac.p = front; ac.w = back; ac.rmks = '1A: AAR'
    PEOPLE[front].quals.daar = false
    PEOPLE[back].quals.daar = true            // current, not cleared to teach
    validate()
    const fired = () => WARN.all.filter((x: any) => x.code === 'AAR_INSTR').length
    expect(fired(), 'the warning is up to begin with').toBe(1)

    /* one click promotes the tick to I — and nothing else is touched */
    await act(async () => { notify() })
    await click($(`#qtbl td[data-q="${back}|daar"]`))
    expect(PEOPLE[back].quals.daar, 'sanity: he is now cleared to instruct').toBe('I')
    expect(fired(), 'and the warning is gone without editing the schedule').toBe(0)
  })

  it('a CAT change re-checks it too', async () => {
    /* CAT moves more rules than a tick does — the seat rules, the crew
       combination matrix, OCU-without-IP — so it is the worse one to leave
       stale. Demoting the front-seater to OCU makes an OCU pilot + CAT A-D
       WSO pair, which the matrix calls an unauthorised combination. */
    const front = Object.keys(PEOPLE).find(i => PEOPLE[i].seat === 'FCP' && PEOPLE[i].q === 'C' && !PEOPLE[i].archived && !PEOPLE[i].special)!
    const back = Object.keys(PEOPLE).find(i => PEOPLE[i].seat === 'RCP' && !isInstr(PEOPLE[i].q) && !PEOPLE[i].archived && !PEOPLE[i].special)!
    const ac = DAYS[0].waves.find((w: any) => (w.formations || []).length)!.formations[0].aircraft[0]
    ac.p = front; ac.w = back; ac.rmks = ''
    validate()
    const illegal = () => WARN.all.filter((x: any) => x.code === 'ILLEGAL_CREW' && (x.who || []).includes(front)).length
    expect(illegal(), 'a C pilot with this WSO is a legal pair').toBe(0)

    await act(async () => { notify() })
    const sel = $(`#qtbl select[data-lvl="${front}"]`) as HTMLSelectElement
    expect(sel, 'the CAT dropdown is on screen').toBeTruthy()
    await act(async () => { sel.value = 'OCU'; sel.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(PEOPLE[front].q, 'sanity: the CAT really changed').toBe('OCU')
    expect(illegal(), 'and the week was re-checked on the spot').toBeGreaterThan(0)
    PEOPLE[front].q = 'C'; deriveQuals(PEOPLE[front]); validate()
  })

  it('a CAT change out of the instructor ranks strips the mark', async () => {
    /* the invisible-privilege guard: the page only offers the third state to
       instructor pilots, so an I left behind by a demotion would render as a
       plain tick while still clearing a red warning in the engine. */
    const id = anIP()
    const was = PEOPLE[id].q
    PEOPLE[id].quals.daar = 'I'; PEOPLE[id].quals.naar = 'I'
    PEOPLE[id].q = 'C'
    deriveQuals(PEOPLE[id])
    expect(PEOPLE[id].quals.daar, 'demoted to a plain tick, not removed').toBe(true)
    expect(PEOPLE[id].quals.naar).toBe(true)
    PEOPLE[id].q = was
    deriveQuals(PEOPLE[id])
    await click($('#qSave'))
  })

  it('a WSO\'s AAR cells are struck out, not un-ticked', async () => {
    await click($('#qViewW'))
    expect($$('#qtbl td.qcell.na').length).toBeGreaterThan(0)
    await click($('#qViewP'))
  })

  /* owner, 5 Aug 26: a member edits the table's CONTENTS — they tick what
     they have been signed off for — while the roster and the LoX's shape
     stay with the admin */
  it('a member may enable editing and tick, but not add people or reshape the LoX', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    expect($$('#qtbl tbody tr').length).toBeGreaterThan(10)
    expect($('#qEdit'), 'Enable editing is theirs now').toBeTruthy()
    await click($('#qEdit'))
    expect($('#qEditQuals'), 'but EDIT QUALS is not').toBeFalsy()
    expect($('#qAddPerson'), 'and neither is Add person').toBeFalsy()
    /* the mode really works for them, it is not just a button */
    const td = $$('#qtbl td[data-q$="|tf"]').find(x => !x.querySelector('.qchk'))!
    const id = td.dataset.q!.split('|')[0]
    await click($(`#qtbl td[data-q="${id}|tf"]`))
    expect(PEOPLE[id].quals.tf, 'a member can record a qualification').toBe(true)
    await click($(`#qtbl td[data-q="${id}|tf"]`))
    expect(PEOPLE[id].quals.tf).toBe(false)
    await click($('#qSave'))
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
})

/* CALLSIGN + INITIALS (owner, Aug 26). The callsign is the identity the whole
   app plans by — it is what every puck prints — so it heads the table and is
   the only field Add person requires; first/last name are gone. */
describe('the callsign / initials columns', () => {
  const setV = async (el: HTMLElement, v: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
  })

  it('the table heads with Callsign then Initials, and Name is gone', () => {
    /* the sorted heading carries an arrow inside it, so read the LABEL —
       this assertion is about which columns exist, not how they are sorted */
    const hs = heads()
    expect(hs[0]).toBe('Callsign')
    expect(hs[1]).toBe('Initials')
    expect(hs).not.toContain('Name')
    // every row carries the new cell, so the columns stay square
    expect($$('#qtbl tbody tr:not(.grp) td.qinitc').length).toBe($$('#qtbl tbody tr:not(.grp)').length)
  })

  it('the Add person form folds behind a button and toggles open (owner, 15 Aug 26)', async () => {
    expect($('#qCS'), 'closed by default — no open form above the table').toBeFalsy()
    expect($('#qAddToggle'), 'the admin sees the toggle').toBeTruthy()
    await click($('#qAddToggle'))
    expect($('#qCS'), 'opens on click').toBeTruthy()
    await click($('#qAddToggle'))
    expect($('#qCS'), 'and closes again').toBeFalsy()
  })

  it('Add person takes callsign + initials + pilot/WSO + cat, with no name fields', async () => {
    /* the form folds behind the "+ Add person" button now (owner, 15 Aug 26) */
    expect($('#qCS'), 'the form is closed until the toggle is pressed').toBeFalsy()
    await click($('#qAddToggle'))
    expect($('#qLast')).toBeFalsy()
    expect($('#qFirst')).toBeFalsy()
    await setV($('#qCS') as HTMLElement, 'Tester')
    await setV($('#qInitials') as HTMLElement, 'tkl')
    /* owner audit, 15 Aug 26 — the two refusals (blank callsign, taken
       callsign) already toasted; a successful add was the one silent branch */
    const toasts: string[] = []
    const origToast = HOOKS.toast
    HOOKS.toast = (m: any) => { toasts.push(String(m)) }
    try { await click($('#qAddPerson')) } finally { HOOKS.toast = origToast }
    expect(toasts).toContain('Tester added')
    const id = Object.keys(PEOPLE).find(k => PEOPLE[k].cs === 'Tester')!
    expect(id, 'the person was added').toBeTruthy()
    expect(PEOPLE[id].initials).toBe('TKL')          // stored upper-case
    expect(PEOPLE[id].seat).toBe('FCP')
    expect(PEOPLE[id].q).toBe('OCU')
    // the callsign is what a puck would resolve — that identity still holds
    expect(ID_BY_CS['tester']).toBe(id)
    const row = $$('#qtbl tbody tr:not(.grp)').find(r => r.querySelector('.qname')!.textContent === 'Tester')!
    expect(row.querySelector('.qinitc')!.textContent).toBe('TKL')
    PEOPLE[id].archived = true; delete ID_BY_CS['tester']
    await act(async () => notify())
  })

  it('edit mode lets an existing person\'s initials be filled in', async () => {
    await click($('#qEdit'))
    const input = $('#qtbl input.qinit[data-init]') as HTMLInputElement
    expect(input, 'edit mode renders an initials input').toBeTruthy()
    const id = input.dataset.init!
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call(input, 'ab'); input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(PEOPLE[id].initials).toBe('AB')
    PEOPLE[id].initials = ''
    await act(async () => notify())
  })

  /* a personnel (ground crew) row's Remarks cell is a free-text note they own,
     editable by text in edit mode (owner, Aug 26). The mount is shared across
     tests, so enter edit mode only if needed and restore the default view. */
  it('edit mode lets a personnel remark be typed', async () => {
    if (!$('#qtbl select.qlvlsel')) await click($('#qEdit'))
    await click($('#qViewG'))
    const box = $('#qtbl input.qrmk[data-prmk]') as HTMLInputElement
    expect(box, 'the Personnel view renders an editable remarks input').toBeTruthy()
    const id = box.dataset.prmk!
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call(box, 'on course till Fri'); box.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(PEOPLE[id].remarks).toBe('on course till Fri')
    PEOPLE[id].remarks = ''
    await click($('#qViewP'))
  })
})

/* the callsign is editable in edit mode and the rename reaches the schedule —
   the pucks print the new name (owner, Aug 26) */
describe('editing a callsign', () => {
  const commit = async (el: HTMLInputElement, v: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('change', { bubbles: true }))
  })

  it('renames the person and every puck follows; duplicates are refused', async () => {
    if (!$('#qtbl input.qcs')) await click($('#qEdit'))
    const box = $('#qtbl input.qcs[data-cs="bane"]') as HTMLInputElement
    expect(box, 'edit mode renders a callsign input').toBeTruthy()

    await commit(box, 'Banzai')
    expect(PEOPLE.bane.cs).toBe('Banzai')
    expect(ID_BY_CS['banzai']).toBe('bane')
    expect(ID_BY_CS['bane']).toBeUndefined()

    // the schedule follows: a puck for that person now prints the new name
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
    const puck = $('#vWeek .puck[data-person="bane"] .nm')
    expect(puck, 'bane still holds a seat').toBeTruthy()
    expect(puck.textContent).toBe('Banzai')

    // and a duplicate is refused, leaving the name as it was.
    // NB: leaving the page unmounts QualsPage, so edit mode has to be re-armed
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'quals')!)
    if (!$('#qtbl input.qcs')) await click($('#qEdit'))
    const box2 = $('#qtbl input.qcs[data-cs="bane"]') as HTMLInputElement
    await commit(box2, 'Snap')
    expect(PEOPLE.bane.cs).toBe('Banzai')

    await commit($('#qtbl input.qcs[data-cs="bane"]') as HTMLInputElement, 'Bane')
    expect(PEOPLE.bane.cs).toBe('Bane')
  })
})

/* ---- the CAT column (owner, Aug 5; ladder reworked Aug 5 '26) -----------
   "Level" is called CAT; CI, the generic I tier and the IP tick column have
   all left; instructor-ness lives in CAT itself as IW / IP / IR / FI. */
describe('the CAT column', () => {
  it('the heading says CAT, not Level', () => {
    const heads = $$('#qtbl thead th').map(th => th.textContent!.trim())
    expect(heads).toContain('CAT')
    expect(heads).not.toContain('Level')
  })

  it('CI and the generic I are off the ladder everywhere', () => {
    for (const map of [QCHIP, QCOLOR, QORDER, LEVELNAME]) {
      expect(Object.keys(map), 'CI is gone from the qual tables').not.toContain('CI')
      expect(Object.keys(map), 'the generic I is gone from the qual tables').not.toContain('I')
      for (const k of ['IW', 'IP', 'IR', 'FI']) expect(Object.keys(map)).toContain(k)
    }
    /* nobody is left holding the retired tiers, and the ip flag itself is gone */
    expect(Object.keys(PEOPLE).filter(id => PEOPLE[id].q === 'CI' || PEOPLE[id].q === 'I')).toEqual([])
    expect(Object.keys(PEOPLE).filter(id => 'ip' in PEOPLE[id])).toEqual([])
  })

  /* the CAT badges read at AA (owner, 15 Aug 26 — the badge-readability fix).
     The white-text fills were deepened to clear the 4.5:1 floor; C and B carry
     dark text and pass on their pale fills. Pin the CONTRAST, not the exact hex
     — a future colour tweak is fine as long as it stays readable. */
  it('every CAT badge meets the 4.5:1 contrast floor for its own text colour', () => {
    const lin = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
    const L = (h: string) => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin(n >> 16 & 255) + 0.7152 * lin(n >> 8 & 255) + 0.0722 * lin(n & 255) }
    const ratio = (a: string, b: string) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
    /* QualsPage's qmini gives C and B a dark letter (#04222b), every other CAT white */
    const ink = (k: string) => (k === 'C' || k === 'B') ? '#04222b' : '#ffffff'
    for (const k of Object.keys(QCOLOR)) {
      expect(ratio(QCOLOR[k], ink(k)), `${k} badge (${QCOLOR[k]})`).toBeGreaterThanOrEqual(4.5)
    }
  })

  /* the frozen callsign column's edge-seal is scroll-gated (owner, 16 Aug 26 —
     a wide CAT badge bled against the callsign while scrolling sideways; the
     seal fixes it, but must stay OFF at rest or it dims the next column's
     leading edge). jsdom cannot paint, so this pins the gating logic only; the
     seal's actual coverage is verified in the browser. */
  it('the frozen-column seal arms on horizontal scroll and disarms at the left edge', () => {
    const wrap = ($('#qtbl').parentElement) as HTMLElement
    expect(wrap.classList.contains('qwrap')).toBe(true)
    expect(wrap.classList.contains('xscroll'), 'off at rest').toBe(false)
    Object.defineProperty(wrap, 'scrollLeft', { value: 120, configurable: true })
    wrap.dispatchEvent(new Event('scroll'))
    expect(wrap.classList.contains('xscroll'), 'on once scrolled sideways').toBe(true)
    Object.defineProperty(wrap, 'scrollLeft', { value: 0, configurable: true })
    wrap.dispatchEvent(new Event('scroll'))
    expect(wrap.classList.contains('xscroll'), 'off again back at the left edge').toBe(false)
  })

  it('the CAT dropdown is seat-filtered: no IW for a pilot, no IP/IR for a WSO', async () => {
    /* the table opens on the pilots; the first row dropdown belongs to an FCP */
    if (!$('#qtbl select.qlvlsel')) await click($('#qEdit'))
    let opts = [...$$('#qtbl select.qlvlsel')[0].querySelectorAll('option')].map(o => o.textContent)
    expect(opts).toEqual(['OCU', 'D', 'C', 'B', 'A', 'IP', 'IR', 'FI'])
    await click($('#qViewW'))
    opts = [...$$('#qtbl select.qlvlsel')[0].querySelectorAll('option')].map(o => o.textContent)
    expect(opts).toEqual(['OCU', 'D', 'C', 'B', 'A', 'IW', 'FI'])
    await click($('#qViewP'))
  })

  /* the migration (owner, Aug 5 '26): every I-or-ip holder moved into the
     instructor CATs — FCP → IP, RCP → IW; Dice keeps IR under its new
     meaning (instrument rating examiner); Bane dropped his A for IP */
  it('the instructors were migrated into the CATs', () => {
    for (const id of ['mamba', 'shaft', 'chaps', 'boosh', 'beams', 'split', 'stiff', 'bane']) {
      expect(PEOPLE[id].q, id).toBe('IP')
      expect(isInstr(PEOPLE[id].q), id + ' still reads as an instructor').toBe(true)
      expect(PEOPLE[id].ip, id + ' has no ip flag left').toBeUndefined()
    }
    for (const id of ['freak', 'wolf', 'dirty', 'stuff', 'glass', 'drill', 'nasty'])
      expect(PEOPLE[id].q, id).toBe('IW')
    expect(PEOPLE.dice.q).toBe('IR')
    expect(isInstr('IR')).toBe(true)
  })

  it('CAT A, CAT B and IP tick columns are gone; nothing derives instr', () => {
    const heads = $$('#qtbl thead th').map(th => th.textContent!.trim())
    expect(heads).not.toContain('CAT A')
    expect(heads).not.toContain('CAT B')
    expect(heads, 'the IP tick went when IP became a CAT').not.toContain('IP')
    /* and the engine no longer derives any of the three it no longer shows */
    const bane = { ...PEOPLE.bane, quals: undefined }
    deriveQuals(bane)
    expect(bane.quals.catA).toBeUndefined()
    expect(bane.quals.catB).toBeUndefined()
    expect(bane.quals.instr).toBeUndefined()
  })
})

/* ---- the columns themselves (owner, 5 Aug 26) ---------------------------
   a fixed left-to-right arrangement, Downchit dropped, TF added. */
describe('the qualification columns', () => {
  const QCOLS = ['SANS', 'SXO', 'Scheduler', 'SC DAY', 'SC NIGHT', 'DAAR', 'NAAR', 'NVG', 'IMC', 'TF']

  it('run SANS → TF in the owner\'s order, between CAT and Remarks', () => {
    const hs = heads()
    expect(hs.slice(hs.indexOf('CAT') + 1, hs.indexOf('Remarks'))).toEqual(QCOLS)
  })

  it('Downchit is gone from the table and from the derived quals', () => {
    expect(heads()).not.toContain('Downchit')
    expect($$('#qtbl td[data-q$="|dnif"]')).toEqual([])
    const p = { ...PEOPLE.bane, quals: undefined }
    deriveQuals(p)
    expect(p.quals.dnif, 'a downchit is an INPUT with dates, not a permanent tick').toBeUndefined()
  })

  it('TF is a real column that starts held by nobody', () => {
    expect($$('#qtbl td[data-q$="|tf"]').length).toBe($$('#qtbl tbody tr:not(.grp)').length)
    expect(Object.keys(PEOPLE).filter(id => PEOPLE[id].quals && PEOPLE[id].quals.tf)).toEqual([])
    expect($$('#qtbl td[data-q$="|tf"] .qchk')).toEqual([])
  })

  it('and TF ticks and unticks like any other qualification', async () => {
    await click($('#qEdit'))
    await click($('#qtbl td[data-q="bane|tf"]'))
    expect(PEOPLE.bane.quals.tf).toBe(true)
    expect($('#qtbl td[data-q="bane|tf"] .qchk')).toBeTruthy()
    await click($('#qtbl td[data-q="bane|tf"]'))
    expect(PEOPLE.bane.quals.tf).toBe(false)
    await click($('#qSave'))
  })
})

/* ---- sorting by heading (owner, 5 Aug 26) -------------------------------
   the Sort chips are gone: a click on a heading sorts by it, a second click
   inverts. CAT sorts by seniority and a qual column by who holds it. */
describe('sorting by clicking a heading', () => {
  const th = (k: string) => $(`#qtbl thead th[data-sort="${k}"]`)
  /* the same comparison the page sorts with, so the expectation is not
     testing localeCompare's opinion against the code's */
  const alpha = (list: string[]) => [...list].sort((a, b) => {
    const x = a.toLowerCase(), y = b.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0
  })
  const catOf = (cs: string) => QORDER[PEOPLE[ID_BY_CS[cs.toLowerCase()]].q]

  beforeAll(async () => {
    if ($('#qtbl').classList.contains('editing')) await click($('#qSave'))
    await click($('#qViewP'))
  })

  it('the seat view is a segmented control above the table, and the toolbar keeps Enable editing + Export', () => {
    /* owner, 15 Aug 26: the view switch moved out of the toolbar to a strip
       directly above the table; Enable editing and Export stayed up top. */
    expect($$('.segview button').map(x => x.textContent)).toEqual(['Pilots', 'WSOs', 'Personnel', 'All'])
    expect($('.qtablehead .segview'), 'the seat view heads the table now').toBeTruthy()
    expect($$('.qbar .fchip').length, 'no seat chips left in the toolbar').toBe(0)
    expect($('#qEdit') || $('#qSave'), 'Enable editing stays in the toolbar').toBeTruthy()
    expect($('#qExport'), 'Export stays in the toolbar').toBeTruthy()
    expect($$('.qbar .lab, .qtablehead .seglab').map(x => x.textContent)).not.toContain('Sort')
    for (const k of ['cs', 'initials', 'flight', 'cat', 'tf']) expect(th(k), k).toBeTruthy()
  })

  it('opens on callsign, ascending', () => {
    expect(callsigns()).toEqual(alpha(callsigns()))
    expect(th('cs').getAttribute('aria-sort')).toBe('ascending')
    expect(th('cs').className).toContain('on')
  })

  it('a second click inverts it, a third puts it back', async () => {
    await click(th('cs'))
    expect(th('cs').getAttribute('aria-sort')).toBe('descending')
    expect(callsigns()).toEqual(alpha(callsigns()).reverse())
    await click(th('cs'))
    expect(th('cs').getAttribute('aria-sort')).toBe('ascending')
    expect(callsigns()).toEqual(alpha(callsigns()))
  })

  it('initials sort alphabetically, with the blanks at the bottom', async () => {
    await click(th('initials'))
    const inits = col('td.qinitc')
    const filled = inits.filter(x => x)
    expect(filled).toEqual(alpha(filled))
    expect(inits.slice(0, filled.length), 'no blank interrupts the filled ones').toEqual(filled)
    expect(th('initials').className).toContain('on')
    expect(th('cs').className, 'only one column sorts at a time').not.toContain('on')
  })

  /* the roster arrived with every Flight blank, so the grouping is proved on
     flights typed in through edit mode — which is also the only way the
     squadron will ever get them in (owner, 5 Aug 26) */
  it('flight is editable in edit mode, and the grouping follows what is typed', async () => {
    await click($('#qEdit'))
    const box = $('#qtbl input.qflt[data-flt="bane"]') as HTMLInputElement
    expect(box, 'the Flight cell is a field in edit mode').toBeTruthy()
    await act(async () => {
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      set.call(box, 'b flt'); box.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(PEOPLE.bane.flight, 'upper-cased so it groups with any other B FLT').toBe('B FLT')
    for (const [id, f] of [['snap', 'B FLT'], ['dice', 'A FLT'], ['chaps', 'A FLT']] as const) {
      const b = $(`#qtbl input.qflt[data-flt="${id}"]`) as HTMLInputElement
      await act(async () => {
        const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
        set.call(b, f); b.dispatchEvent(new Event('change', { bubbles: true }))
      })
    }
    await click($('#qSave'))
    await click(th('flight'))
    const fl = col('td.qfltc')
    const named = fl.filter(x => x)
    expect(named, 'the two A FLT sit together, then the two B FLT').toEqual(['A FLT', 'A FLT', 'B FLT', 'B FLT'])
    /* the blanks stay in one block of their own rather than splitting them */
    expect(fl.slice(0, named.length)).toEqual(named)
  })

  it('flight groups each flight together, pointed either way', async () => {
    /* the test above left it sorted by flight, so point it back at ascending
       rather than assuming which way a click leaves it */
    if (th('flight').getAttribute('aria-sort') !== 'ascending') await click(th('flight'))
    /* every flight appears in exactly ONE run of rows — that is what
       "grouped" means, and it is stronger than checking the order */
    const runsOf = () => { const fl = col('td.qfltc'); return fl.filter((f, i) => f !== fl[i - 1]) }
    const up = runsOf()
    expect(up.length, 'no flight is split across two blocks').toBe(new Set(up).size)
    const named = up.filter(x => x)
    expect(named).toEqual(alpha(named))
    expect(up[up.length - 1], 'the people with no flight yet sit at the bottom').toBe('')
    /* inverting keeps the blocks whole; it only turns them round */
    await click(th('flight'))
    const down = runsOf()
    expect(down.length).toBe(new Set(down).size)
    expect(down.filter(x => x)).toEqual(alpha(named).reverse())
    expect(down[0], 'and the blanks come to the top instead').toBe('')
    await click(th('cs'))
  })

  it('CAT sorts by seniority, most senior first, and inverts', async () => {
    await click(th('cat'))
    const down = callsigns().map(catOf)
    expect(down, 'FI at the top, OCU at the bottom').toEqual([...down].sort((a, b) => b - a))
    await click(th('cat'))
    const up = callsigns().map(catOf)
    expect(up).toEqual([...up].sort((a, b) => a - b))
  })

  it('a qualification column brings the qualified to the top', async () => {
    await click(th('scDay'))
    const held = $$('#qtbl tbody tr:not(.grp) td[data-q$="|scDay"]').map(td => !!td.querySelector('.qchk'))
    expect(held.indexOf(false) === -1 || held.lastIndexOf(true) < held.indexOf(false),
      'no unqualified row sits above a qualified one').toBe(true)
    /* and the inversion puts the unqualified on top instead */
    await click(th('scDay'))
    const flipped = $$('#qtbl tbody tr:not(.grp) td[data-q$="|scDay"]').map(td => !!td.querySelector('.qchk'))
    expect(flipped.indexOf(true) === -1 || flipped.lastIndexOf(false) < flipped.indexOf(true)).toBe(true)
    await click(th('cs'))
  })

  it('a WSO with no AAR at all sorts with the unqualified, not above them', async () => {
    await click($('#qViewW'))
    await click(th('daar'))
    /* every WSO row is struck out in BOTH AAR columns, so the sort has
       nothing to lift: the block stays whole rather than the dashes being
       thrown to the top as if they were ticks */
    const rows = $$('#qtbl tbody tr:not(.grp)').length
    expect($$('#qtbl tbody tr:not(.grp) td.qcell.na').length).toBe(rows * 2)
    expect(callsigns().length).toBe(rows)
    await click($('#qViewP')); await click(th('cs'))
  })
})

/* ---- View: Pilots / WSOs / All (owner, 5 Aug 26) ------------------------- */
describe('the View chips', () => {
  it('All shows the pilots, the WSOs and the personnel together', async () => {
    await click($('#qViewP')); const pilots = callsigns().length
    await click($('#qViewW')); const wsos = callsigns().length
    await click($('#qViewG')); const pers = callsigns().length
    await click($('#qViewA'))
    expect(callsigns().length).toBe(pilots + wsos + pers)
    expect(callsigns()).toContain('Bane')      // a pilot
    expect(callsigns()).toContain('Freak')     // a WSO
    expect(callsigns()).toContain('Torque')    // ground crew
    expect($('#qtbl tbody tr.grp').textContent).toContain('Assigned aircrew')
    expect($('#qViewA').className).toContain('on')
  })

  /* Personnel (ground crew, owner Aug 26) get their own view: only ground
     crew, their CAT and every qualification column blank, and a free-text
     Remarks cell they can edit. */
  it('the Personnel view shows only ground crew, with no CAT or quals', async () => {
    await click($('#qViewG'))
    expect(callsigns()).toContain('Torque')
    expect(callsigns()).not.toContain('Bane')   // no pilots
    expect(callsigns()).not.toContain('Freak')  // no WSOs
    expect($('#qtbl tbody tr.grp').textContent).toContain('Personnel (ground crew)')
    /* a personnel row carries no CAT chip and no qualification ticks */
    const row = $('#qtbl tbody tr.persrow')!
    expect(row.querySelector('.qmini')).toBeFalsy()
    expect(row.querySelector('.qchk')).toBeFalsy()
    await click($('#qViewP'))
  })

  it('and the seat views still show only their own seat', async () => {
    await click($('#qViewP'))
    expect(callsigns()).not.toContain('Freak')
    expect($('#qtbl tbody tr.grp').textContent).toContain('Assigned pilots')
    await click($('#qViewW'))
    expect(callsigns()).not.toContain('Bane')
    expect($('#qtbl tbody tr.grp').textContent).toContain('Assigned WSOs')
    await click($('#qViewP'))
  })
})

/* ---- EDIT QUALS (owner, 5 Aug 26) ---------------------------------------
   a second mode inside edit mode, admin only: add a qualification, remove
   one, drag a heading to move it. */
describe('Edit quals', () => {
  /* pointer events, as a mouse or a finger sends them. jsdom has no
     PointerEvent constructor and no layout, so they are dispatched as mouse
     events with the pointer type names — which is exactly what the delegated
     listeners bind to, so the machine under test is the real one. */
  const pointer = async (type: string, el: Element | Document) =>
    act(async () => { el.dispatchEvent(new MouseEvent(type, { bubbles: true })) })
  const dragCol = async (from: string, to: string) => {
    await pointer('pointerdown', $(`#qtbl thead th[data-col="${from}"]`))
    await pointer('pointermove', $(`#qtbl thead th[data-col="${to}"]`))
    await pointer('pointerup', document)
  }
  const qualCols = () => $$('#qtbl thead th[data-col]').map(t => t.dataset.col)
  const on = async () => {
    if (!$('#qEditQuals')) await click($('#qEdit'))
    if ($('#qEditQuals').getAttribute('aria-pressed') !== 'true') await click($('#qEditQuals'))
  }

  beforeAll(async () => { await click($('#qViewP')) })

  it('the button only exists under Enable editing, and only for an admin', async () => {
    if ($('#qEditQuals')) await click($('#qSave'))
    expect($('#qEditQuals'), 'not before editing is enabled').toBeFalsy()
    await click($('#qEdit'))
    expect($('#qEditQuals')).toBeTruthy()
    expect($('#qEditQuals').getAttribute('aria-pressed'), 'off until it is pressed').toBe('false')
    /* blue while it is the thing to press, dark with a ✕ once you are in it —
       the button shows the way OUT, exactly as Enable editing / Save changes
       do beside it (owner, 5 Aug 26) */
    expect($('#qEditQuals').className).toContain('primary')
    expect($('#qEditQuals').textContent).toBe('Edit quals')
    await click($('#qEditQuals'))
    expect($('#qEditQuals').className, 'the same dark button once it is on').not.toContain('primary')
    expect($('#qEditQuals').textContent).toBe('✕ Edit quals')
    await click($('#qEditQuals'))
    expect($('#qEditQuals').className).toContain('primary')
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    expect($('#qEditQuals'), 'a member never sees it').toBeFalsy()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  it('turning it on hands the headings over: they move and delete, not sort', async () => {
    await on()
    expect($('#qtbl').className).toContain('qediting')
    expect(qualCols().length, 'every qualification column is a handle').toBe(10)
    expect($$('#qtbl thead th[data-col] .qdel').length).toBe(10)
    /* the sort attribute is GONE from them, so a drag can never land as a
       click that re-sorts the table under the hand doing the dragging */
    expect($('#qtbl thead th[data-sort="tf"]')).toBeFalsy()
    const before = callsigns()
    await click($('#qtbl thead th[data-col="tf"]'))
    expect(callsigns(), 'clicking a heading does not sort in this mode').toEqual(before)
    /* the identity columns are not part of the arrangement and stay sortable */
    expect($('#qtbl thead th[data-sort="cs"]')).toBeTruthy()
    expect($('#qtbl thead th[data-col="cs"]')).toBeFalsy()
  })

  it('adds a qualification, held by nobody until it is ticked', async () => {
    await on()
    await act(async () => {
      const box = $('#qNewQual') as HTMLInputElement
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      set.call(box, 'low level'); box.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await click($('#qAddQualBtn'))
    expect(qualCols()).toContain('lowlevel')
    expect(heads(), 'named as it was typed, in the table\'s own case').toContain('LOW LEVEL')
    expect($$('#qtbl td[data-q$="|lowlevel"] .qchk'), 'nobody holds it yet').toEqual([])
    expect($$('#qtbl td[data-q$="|lowlevel"]').length).toBe($$('#qtbl tbody tr:not(.grp)').length)
    /* and it behaves like any other column once it exists */
    await click($('#qtbl td[data-q="bane|lowlevel"]'))
    expect(PEOPLE.bane.quals.lowlevel).toBe(true)
  })

  it('refuses a duplicate and a nameless qualification', async () => {
    await on()
    const set = async (v: string) => act(async () => {
      const box = $('#qNewQual') as HTMLInputElement
      const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      s.call(box, v); box.dispatchEvent(new Event('input', { bubbles: true }))
    })
    const was = qualCols().length
    await set('LOW LEVEL'); await click($('#qAddQualBtn'))
    await set('   '); await click($('#qAddQualBtn'))
    await set('!!'); await click($('#qAddQualBtn'))
    expect(qualCols().length).toBe(was)
  })

  it('removes a column the rules do not read, and keeps who held it', async () => {
    await on()
    expect(PEOPLE.bane.quals.lowlevel).toBe(true)
    await click($('#qtbl thead th[data-col="lowlevel"] .qdel'))
    expect(qualCols(), 'one press is enough — no rule reads it').not.toContain('lowlevel')
    expect(PEOPLE.bane.quals.lowlevel, 'the record itself is untouched').toBe(true)
    /* adding it back brings the ticks with it */
    await act(async () => {
      const box = $('#qNewQual') as HTMLInputElement
      const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      s.call(box, 'LOW LEVEL'); box.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await click($('#qAddQualBtn'))
    expect($('#qtbl td[data-q="bane|lowlevel"] .qchk'), 'Bane still holds it').toBeTruthy()
    await click($('#qtbl thead th[data-col="lowlevel"] .qdel'))
  })

  it('arms first on a column the rules DO read, then removes it', async () => {
    await on()
    const held = Object.keys(PEOPLE).filter(id => PEOPLE[id].quals && PEOPLE[id].quals.scDay).length
    expect(held).toBeGreaterThan(0)
    await click($('#qtbl thead th[data-col="scDay"] .qdel'))
    expect(qualCols(), 'the first press only asks').toContain('scDay')
    expect($('#qtbl thead th[data-col="scDay"]').className).toContain('arm')
    expect($('#qtbl thead th[data-col="scDay"] .qdel').textContent).toBe('remove?')
    await click($('#qtbl thead th[data-col="scDay"] .qdel'))
    expect(qualCols(), 'the second press removes it').not.toContain('scDay')
    /* the rule that reads it still sees everyone who held it */
    expect(Object.keys(PEOPLE).filter(id => PEOPLE[id].quals && PEOPLE[id].quals.scDay).length).toBe(held)
  })

  it('removing the column the table is sorted by falls back to callsign', async () => {
    await click($('#qSave'))                       // sorting needs the reading mode
    await click($('#qtbl thead th[data-sort="nvg"]'))
    expect($('#qtbl thead th[data-sort="nvg"]').getAttribute('aria-sort')).toBe('ascending')
    await on()
    await click($('#qtbl thead th[data-col="nvg"] .qdel'))
    await click($('#qSave'))
    expect($('#qtbl thead th[data-sort="cs"]').getAttribute('aria-sort'),
      'the arrow goes back somewhere it can sit').toBe('ascending')
    expect(callsigns()).toEqual([...callsigns()].sort((a, b) => {
      const x = a.toLowerCase(), y = b.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0
    }))
    await on()
  })

  it('drags a heading to move its column', async () => {
    await on()
    const before = qualCols()
    expect(before[0]).toBe('san')
    await dragCol('tf', 'san')                       // last one to the front
    expect(qualCols()[0]).toBe('tf')
    expect(qualCols().length, 'moved, not copied').toBe(before.length)
    expect(new Set(qualCols()).size).toBe(before.length)
    await dragCol('tf', 'imc')                       // and back to the end
    expect(qualCols()[qualCols().length - 1]).toBe('tf')
    /* a drag that ends on its own column changes nothing */
    const same = qualCols()
    await dragCol('tf', 'tf')
    expect(qualCols()).toEqual(same)
  })

  it('the cells follow their heading, so no column shows another one\'s ticks', async () => {
    await on()
    await dragCol('sched', 'san')
    const order = qualCols()
    const row = $$(`#qtbl tbody tr:not(.grp)`)[0]
    expect([...row.querySelectorAll('td[data-q]')].map(td => (td as HTMLElement).dataset.q!.split('|')[1]))
      .toEqual(order)
  })

  it('Save changes puts the table back to reading, and the mode with it', async () => {
    await on()
    await click($('#qSave'))
    expect($('#qtbl').className).not.toContain('qediting')
    expect($('#qEditQuals'), 'the button goes with edit mode').toBeFalsy()
    expect($('#qtbl thead th[data-sort="tf"]'), 'the headings sort again').toBeTruthy()
    expect($$('#qtbl .qdel')).toEqual([])
  })
})

describe('the Archived section (owner, 19 Aug 26)', () => {
  /* the drawer under the table: where the ✕ (and the Leave War post-out's
     auto-archive) put a body, and where an admin puts one back */
  it('archiving with the ✕ lands the person in the drawer, and the schedules are untouched', async () => {
    /* make sure editing is on — the previous describe's Save turned it off */
    if ($('#qtbl')!.className.indexOf('editing') < 0) await click($('#qEdit'))
    const archBtn = $$('#qtbl [data-arch]')[0]
    const id = archBtn.dataset.arch!
    const daysBefore = JSON.stringify(DAYS)
    await click(archBtn)
    expect(PEOPLE[id].archived).toBe(true)
    /* off the roster table… */
    expect($(`#qtbl [data-arch="${id}"]`)).toBeFalsy()
    /* …into the drawer, folded to a count by default */
    expect($('#qArchToggle')).toBeTruthy()
    expect($('#qArchToggle')!.textContent).toContain('Archived')
    expect($('[data-testid="qarchlist"]')).toBeFalsy()
    await click($('#qArchToggle'))
    expect($(`[data-testid="qarchrow-${id}"]`)).toBeTruthy()
    /* archiving is a flag, never a schedule write — every puck stays */
    expect(JSON.stringify(DAYS)).toBe(daysBefore)
    /* the ALL AVAIL sentinel is archived by construction and is not a person */
    expect($('[data-testid="qarchrow-allavail"]')).toBeFalsy()
  })

  it('Restore puts them straight back on the roster', async () => {
    const row = $$('[data-testid^="qarchrow-"]')[0]
    expect(row, 'the previous test left someone archived').toBeTruthy()
    const id = row.dataset.testid!.slice('qarchrow-'.length)
    await click(row.querySelector(`[data-restore="${id}"]`))
    expect(PEOPLE[id].archived).toBe(false)
    expect($(`[data-testid="qarchrow-${id}"]`)).toBeFalsy()
  })
})
