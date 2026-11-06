// @vitest-environment jsdom
/* A REFUSAL OF ONE CHANGE — "BLOCKED:" IN THE GREY NOTE (owner D1667, D1668, 6 Nov 26 — "B"; the drawing of record
   docs/mock/2026-11-05-notsaved-refusal/img/*-r2grey-*.png). The passing note keeps its own grey face; only a drawn
   "no entry" sign comes before its words, its lead (up to the first colon) bold, the rest quieter. What jsdom can see is
   pinned here — the note's parts, its words kept as text, a later note losing the face, the words given to a reader, the
   schedule's and the document's refusals raised in it; the look itself is the walk's (scripts/handpass/nsr1106-walk.mjs). */
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { toast, clearToast, blockedParts, BLOCKED } from './toast'
import { NOT_SAVED, NOT_YOURS, reasonRefusal } from './inputedit'

const note = () => document.getElementById('toastEl') as HTMLElement
afterEach(() => { clearToast(); note()?.remove(); vi.useRealTimers() })

describe('the grey "Blocked:" note (D1667, D1668)', () => {
  it('the sign, then "Blocked:" in bold, then the rest — and the note keeps the app\'s plain grey face', () => {
    toast(NOT_SAVED, 'blocked')
    const t = note()
    expect(t.dataset.face).toBe('blocked')
    expect(t.querySelector('.bk-sign')?.getAttribute('aria-hidden')).toBe('true')
    expect(t.querySelector('b')?.textContent).toBe('Blocked:')
    expect(t.querySelector('.bk-rest')?.textContent).toBe(' nothing was kept')
    expect(t.textContent).toBe('Blocked: nothing was kept')
    /* never the amber or red tint: the edge and words of a plain note */
    expect(t.style.borderColor).toBe('var(--edge-2)')
    expect(t.style.color).toBe('var(--ink)')
  })
  it('the schedule\'s two refusals read as drawn, "Not saved" no longer among them — the band\'s alone', () => {
    expect(NOT_SAVED).toBe('Blocked: nothing was kept')
    expect(NOT_YOURS).toBe('Blocked: that change is not yours to make')
    expect(NOT_SAVED.startsWith(`${BLOCKED}:`) && NOT_YOURS.startsWith(`${BLOCKED}:`)).toBe(true)
  })
  it('a refusal with its own reason is grey "Blocked:" too, its reason then what it cost, each a sentence (D1669)', () => {
    expect(reasonRefusal('Ranger is already on leave that day', true)).toBe('Blocked: Ranger is already on leave that day. Nothing was saved for anyone: take that person off the list, or change it.')
    expect(reasonRefusal('Ranger is already on leave that day.', false)).toBe('Blocked: Ranger is already on leave that day. Nothing was saved.')
    toast(reasonRefusal('Ranger is already on leave that day', false), 'blocked')
    expect(note().querySelector('b')?.textContent).toBe('Blocked:')
    expect(note().dataset.face).toBe('blocked')
  })
  it('a document too big to store keeps its own words, its lead the words before the colon', () => {
    const doc = "Couldn't save that document: your browser storage may be full, so it may not be here after a reload."
    expect(blockedParts(doc)).toEqual({ lead: "Couldn't save that document:", rest: 'your browser storage may be full, so it may not be here after a reload.' })
    /* the boot raises it as a blocked note, in these words (boot.ts) */
    const boot = readFileSync('src/boot.ts', 'utf8')
    expect(boot).toContain(`HOOKS.toast(${JSON.stringify(doc)}, 'blocked')`)
  })
  it('words with no colon are all lead; a colon far in is not taken for one', () => {
    expect(blockedParts('Blocked')).toEqual({ lead: 'Blocked', rest: '' })
    const long = 'x'.repeat(70) + ': y'
    expect(blockedParts(long)).toEqual({ lead: long, rest: '' })
  })
  it('a name typed with markup in it stays words, never markup', () => {
    toast('Blocked: <img src=x onerror=alert(1)> LVE App bal.', 'blocked')
    expect(note().querySelector('img')).toBeNull()
    expect(note().textContent).toBe('Blocked: <img src=x onerror=alert(1)> LVE App bal.')
  })
  it('the next note, of any other kind, is a plain note again: no sign, no face', () => {
    toast(NOT_SAVED, 'blocked')
    toast('Input added', undefined)
    expect(note().dataset.face).toBeUndefined()
    expect(note().querySelector('.bk-sign')).toBeNull()
    expect(note().textContent).toBe('Input added')
    toast(NOT_YOURS, 'blocked')
    toast('Already on Monday', 'warn')
    expect(note().dataset.face).toBeUndefined()
    expect(note().style.color).toBe('var(--adv)')
  })
  it('it holds as long as an amber note — it says something did not happen', () => {
    vi.useFakeTimers()
    toast('Blocked: x', 'blocked')
    vi.advanceTimersByTime(4100)
    expect(note().style.opacity).toBe('1')
    vi.advanceTimersByTime(200)
    expect(note().style.opacity).toBe('0')
  })
  it('a screen reader hears the whole sentence', () => {
    vi.useFakeTimers()
    toast(NOT_YOURS, 'blocked')
    vi.advanceTimersByTime(40)
    expect(document.getElementById('srSay')?.textContent).toBe('Blocked: that change is not yours to make')
  })
  it('the stylesheet reads it from the left, the sign red, the lead the app\'s white — no red box', () => {
    const css = readFileSync('src/ui/scheduler/28-blocked.css', 'utf8')
    expect(css).toMatch(/#toastEl\[data-face="blocked"\]\{display:flex;align-items:flex-start;gap:7px;text-align:left !important\}/)
    expect(css).toContain("stroke='%23FF7A84'")
    expect(css).toMatch(/#toastEl\[data-face="blocked"\] b\{color:var\(--ink\)/)
    expect(css).not.toMatch(/#2a1215/i)
  })
})
