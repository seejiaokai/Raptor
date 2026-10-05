// @vitest-environment jsdom
/* The per-block day swap (ui/dayswap.ts): a changed day rewrites only the
   blocks whose markup changed, keeps every other node, and falls back to the
   whole-node replacement on any shape mismatch. */
import { describe, it, expect, beforeEach } from 'vitest'
import { swapDay, swapDayAround, chunksOf, chunksOfHTML } from './dayswap'

const day = (opts: { warn?: string; a?: string; b?: string; cls?: string; sign?: boolean; extra?: string } = {}) =>
  `<section class="day ${opts.cls || ''}" data-day="0"><div class="day-head"><span class="dow">Mon</span></div>`
  + (opts.sign ? `<div class="signoff day-sign">sign</div>` : '')
  + `<div class="day-body"><div class="dwbox">${opts.warn || ''}</div>`
  + `<div class="dsec" data-secmove="0.prog">${opts.a || 'A'}</div>`
  + `<div class="dsec" data-secmove="0.waves">${opts.b || 'B'}</div>`
  + (opts.extra || '')
  + `</div></section>`

let root: HTMLElement
beforeEach(() => { document.body.innerHTML = '<div class="week"></div>'; root = document.querySelector('.week')! })
const mount = (html: string) => { root.innerHTML = html; return root.firstElementChild! }

describe('swapDay', () => {
  it('rewrites only the changed block; the day, the head and the other blocks keep their nodes', () => {
    const sec = mount(day())
    const prev = chunksOf(sec)
    const head = sec.querySelector('.day-head')!, body = sec.querySelector('.day-body')!
    const blkA = sec.querySelector('[data-secmove="0.prog"]')!, blkB = sec.querySelector('[data-secmove="0.waves"]')!
    /* a decoration hung after the last repaint survives on the kept block */
    blkA.classList.add('kept-marker')
    const chunks = swapDay(sec, day({ b: 'B2' }), prev)
    expect(root.firstElementChild).toBe(sec)
    expect(sec.querySelector('.day-head')).toBe(head)
    expect(sec.querySelector('.day-body')).toBe(body)
    expect(sec.querySelector('[data-secmove="0.prog"]')).toBe(blkA)
    expect(blkA.classList.contains('kept-marker')).toBe(true)
    expect(sec.querySelector('[data-secmove="0.waves"]')).not.toBe(blkB)
    expect(sec.querySelector('[data-secmove="0.waves"]')!.textContent).toBe('B2')
    /* the returned chunks describe what is on screen now */
    expect(chunks).toEqual(chunksOfHTML(day({ b: 'B2' })))
    /* minus the decoration, what is on screen is exactly the new markup */
    blkA.classList.remove('kept-marker')
    expect(sec.outerHTML).toBe(mount(day({ b: 'B2' })).outerHTML)
  })
  it("syncs the section's own attributes without touching its children", () => {
    const sec = mount(day())
    const prev = chunksOf(sec)
    const blkA = sec.querySelector('[data-secmove="0.prog"]')!
    swapDay(sec, day({ cls: 'dok' }), prev)
    expect(root.firstElementChild).toBe(sec)
    expect(sec.classList.contains('dok')).toBe(true)
    expect(sec.querySelector('[data-secmove="0.prog"]')).toBe(blkA)
    swapDay(sec, day(), chunksOfHTML(day({ cls: 'dok' })))
    expect(sec.classList.contains('dok')).toBe(false)
  })
  it('a different block count replaces the whole day node (a section added)', () => {
    const sec = mount(day())
    const prev = chunksOf(sec)
    swapDay(sec, day({ extra: '<div class="dsec" data-secmove="0.duty">D</div>' }), prev)
    expect(root.firstElementChild).not.toBe(sec)
    expect(root.querySelectorAll('.dsec').length).toBe(3)
  })
  it('a different top-level count replaces the whole day node (a sign-off strip appearing)', () => {
    const sec = mount(day())
    const prev = chunksOf(sec)
    swapDay(sec, day({ sign: true }), prev)
    expect(root.firstElementChild).not.toBe(sec)
    expect(root.querySelector('.signoff')).not.toBeNull()
  })
  it('a live child list that no longer matches what was written replaces the whole day node', () => {
    const sec = mount(day())
    const prev = chunksOf(sec)
    sec.querySelector('.day-body')!.appendChild(document.createElement('div'))   // something else inserted a child
    swapDay(sec, day({ b: 'B2' }), prev)
    expect(root.firstElementChild).not.toBe(sec)
    expect(root.querySelectorAll('.day-body > *').length).toBe(3)
  })
  it('no previous chunks (after a whole-week rebuild) replaces the whole day node; chunksOfHTML restores the fine grain', () => {
    const sec = mount(day())
    swapDay(sec, day({ b: 'B2' }), null)
    expect(root.firstElementChild).not.toBe(sec)
    const sec2 = root.firstElementChild!
    const blkA = sec2.querySelector('[data-secmove="0.prog"]')!
    swapDay(sec2, day({ b: 'B3' }), chunksOfHTML(day({ b: 'B2' })))
    expect(root.firstElementChild).toBe(sec2)
    expect(sec2.querySelector('[data-secmove="0.prog"]')).toBe(blkA)
    expect(sec2.querySelector('[data-secmove="0.waves"]')!.textContent).toBe('B3')
  })
  it('the day-body attributes sync in place too, and the warnings box swaps like any block', () => {
    const sec = mount(day())
    const prev = chunksOf(sec)
    const body = sec.querySelector('.day-body')!, blkA = sec.querySelector('[data-secmove="0.prog"]')!
    swapDay(sec, day({ warn: '<b>late</b>' }), prev)
    expect(sec.querySelector('.day-body')).toBe(body)
    expect(sec.querySelector('[data-secmove="0.prog"]')).toBe(blkA)
    expect(sec.querySelector('.dwbox b')!.textContent).toBe('late')
  })
  it('an unchanged day string leaves every node alone', () => {
    const sec = mount(day())
    const prev = chunksOf(sec)
    const all = Array.from(sec.querySelectorAll('*'))
    swapDay(sec, day(), prev)
    expect(Array.from(sec.querySelectorAll('*'))).toEqual(all)
  })
  it('markup that is not a day at all still replaces cleanly', () => {
    const sec = mount(day())
    swapDay(sec, '<div class="other">x</div>', chunksOf(sec))
    expect(root.firstElementChild!.className).toBe('other')
  })
})

/* W15 (the Codex stack check, 5 Oct 26): while a text box holds the caret, everything that does NOT hold it is still
   brought up to date — the block with the caret is the one thing left standing, and it is caught up the moment the
   caret leaves. */
describe('swapDayAround — the block holding the caret is left standing, every other block is written', () => {
  it('the warnings box and the other sections change; the block holding the caret keeps its node', () => {
    const sec = mount(day({ b: '<span class="box" tabindex="0">typing</span>' }))
    const prev = chunksOf(sec)
    const caret = sec.querySelector('.box')!, held = sec.querySelector('[data-secmove="0.waves"]')!
    const next = day({ warn: '1 issue', a: 'A2', b: '<span class="box" tabindex="0">typing</span> ring', cls: 'dok' })
    const r = swapDayAround(sec, next, prev, caret)
    expect(r.held, 'something was held back').toBe(true)
    expect(sec.querySelector('.dwbox')!.textContent, 'the warnings box is up to date').toBe('1 issue')
    expect(sec.querySelector('[data-secmove="0.prog"]')!.textContent, 'the other section is up to date').toBe('A2')
    expect(sec.classList.contains('dok'), 'the section attributes are synced').toBe(true)
    expect(sec.querySelector('[data-secmove="0.waves"]'), 'the block with the caret is the same node').toBe(held)
    expect(sec.querySelector('.box')).toBe(caret)
    expect(held.textContent, 'and still shows what it showed').toBe('typing')
    /* what came back describes what is ON SCREEN, so the next ordinary swap writes exactly the held block */
    const body = sec.querySelector('.day-body')!, box = sec.querySelector('.dwbox')!, a = sec.querySelector('[data-secmove="0.prog"]')!
    const after = swapDay(sec, next, r.chunks)
    expect(sec.querySelector('.day-body')).toBe(body)
    expect(sec.querySelector('.dwbox')).toBe(box)
    expect(sec.querySelector('[data-secmove="0.prog"]')).toBe(a)
    expect(sec.querySelector('[data-secmove="0.waves"]')).not.toBe(held)
    expect(sec.querySelector('[data-secmove="0.waves"]')!.textContent).toBe('typing ring')
    expect(after).toEqual(chunksOfHTML(next))
  })
  it('a change that needs the whole day replaced writes NOTHING while the caret is in that day', () => {
    const sec = mount(day({ b: '<span class="box" tabindex="0">typing</span>' }))
    const prev = chunksOf(sec), caret = sec.querySelector('.box')!, before = sec.outerHTML
    const r = swapDayAround(sec, day({ sign: true, warn: 'x' }), prev, caret)
    expect(r.held).toBe(true)
    expect(root.firstElementChild).toBe(sec)
    expect(sec.outerHTML).toBe(before)
    expect(r.chunks).toEqual(prev)
  })
  it('a day that does not hold the caret is swapped the ordinary way', () => {
    const sec = mount(day()), prev = chunksOf(sec)
    const elsewhere = document.createElement('span'); document.body.append(elsewhere)
    const r = swapDayAround(sec, day({ b: 'B2' }), prev, elsewhere)
    expect(r.held).toBe(false)
    expect(sec.querySelector('[data-secmove="0.waves"]')!.textContent).toBe('B2')
    expect(r.chunks).toEqual(chunksOfHTML(day({ b: 'B2' })))
  })
})

/* P2-F1 (the Tab-route reader's second pass, 6 Oct 26): a day with nothing to warn about draws NO warnings box, so its
   first warning adds a block — a shape change, which held the whole day back while the caret was in it: the one case
   W15 most needed. The box coming and going is handled on its own; everything else still lines up block for block. */
describe('swapDayAround — a day gains its first warning, or loses its last, with the caret in it', () => {
  const bare = (html: string) => html.replace('<div class="dwbox"></div>', '')
  it('the first warning: the box appears, the other blocks follow, the block with the caret stands', () => {
    const sec = mount(bare(day({ b: '<span class="box" tabindex="0">typing</span>' })))
    expect(sec.querySelector('.dwbox')).toBeNull()
    const prev = chunksOf(sec), caret = sec.querySelector('.box')!, held = sec.querySelector('[data-secmove="0.waves"]')!
    const next = day({ warn: '1 issue', a: 'A2', b: '<span class="box" tabindex="0">typing</span> ring' })
    const r = swapDayAround(sec, next, prev, caret)
    expect(sec.querySelector('.dwbox')?.textContent, 'the warnings box is on screen').toBe('1 issue')
    expect(sec.querySelector('.day-body')!.firstElementChild!.classList.contains('dwbox'), 'at the head of the day').toBe(true)
    expect(sec.querySelector('[data-secmove="0.prog"]')!.textContent).toBe('A2')
    expect(sec.querySelector('[data-secmove="0.waves"]'), 'the caret block is the same node').toBe(held)
    expect(r.held).toBe(true)
    expect(swapDay(sec, next, r.chunks)).toEqual(chunksOfHTML(next))
    expect(sec.querySelector('[data-secmove="0.waves"]')!.textContent).toBe('typing ring')
  })
  it('the last warning cleared: the box goes, the block with the caret stands', () => {
    const sec = mount(day({ warn: '1 issue', b: '<span class="box" tabindex="0">typing</span>' }))
    const prev = chunksOf(sec), caret = sec.querySelector('.box')!, held = sec.querySelector('[data-secmove="0.waves"]')!
    const next = bare(day({ a: 'A2', b: '<span class="box" tabindex="0">typing</span>' }))
    const r = swapDayAround(sec, next, prev, caret)
    expect(sec.querySelector('.dwbox'), 'no warnings box left standing').toBeNull()
    expect(sec.querySelector('[data-secmove="0.prog"]')!.textContent).toBe('A2')
    expect(sec.querySelector('[data-secmove="0.waves"]')).toBe(held)
    expect(r.chunks).toEqual(chunksOfHTML(next))
  })
})
