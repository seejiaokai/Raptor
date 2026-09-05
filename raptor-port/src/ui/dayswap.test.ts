// @vitest-environment jsdom
/* The per-block day swap (ui/dayswap.ts): a changed day rewrites only the
   blocks whose markup changed, keeps every other node, and falls back to the
   whole-node replacement on any shape mismatch. */
import { describe, it, expect, beforeEach } from 'vitest'
import { swapDay, chunksOf, chunksOfHTML } from './dayswap'

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
