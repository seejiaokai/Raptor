import { describe, it, expect, beforeEach } from 'vitest'
import { blkNoteHTML } from './html'
import { sbNote } from './board-html'
import { NOTEPUB, toggleNotePub, notePub } from '../state/view'
import { setSession } from '../state/auth'

/* Scheduler notes can be made public (owner, Aug 26 — "Scheduler notes can toggle
   to show in view only schedule. In which it will show as Public notes in edit
   schedule and scheduler board but in view only schedule it shows Notes"). The
   flag is view.NOTEPUB, keyed by the note's own funnel key so one flag governs
   all three surfaces. */
beforeEach(() => { NOTEPUB.clear(); setSession({ user: 'a', role: 'admin' }) })

describe('a public scheduler note', () => {
  const d: any = { prognotes: 'brief the duty crew' }

  it('edit week: header and toggle flip with the public flag', () => {
    const off = blkNoteHTML(0, d, true, 'pn', 'prognotes')
    expect(off).toContain('Scheduler notes')
    expect(off).toContain('data-notepub="pn:0"')     // the toggle rides the header
    expect(off).toContain('Make public')
    expect(off).toContain('class="blknote ed"')       // still editable
    toggleNotePub('pn:0')
    const on = blkNoteHTML(0, d, true, 'pn', 'prognotes')
    expect(on).toContain('Public notes')
    expect(on).toContain('On view-only')
  })

  it('view-only week: nothing unless public AND has text, then the header reads "Notes"', () => {
    expect(blkNoteHTML(0, d, false, 'pn', 'prognotes'), 'scheduler-only → not issued').toBe('')
    toggleNotePub('pn:0')
    const v = blkNoteHTML(0, d, false, 'pn', 'prognotes')
    expect(v).toContain('>Notes<')                    // the view-only heading is just "Notes"
    expect(v).not.toContain('Public notes')
    expect(v).not.toContain('data-notepub')           // no toggle for a viewer
    expect(v).toContain('brief the duty crew')
    /* public but empty → still nothing to issue */
    expect(blkNoteHTML(0, {}, false, 'pn', 'prognotes')).toBe('')
  })

  it('the board header mirrors the flag; a read-only board and a member cannot toggle', () => {
    expect(sbNote({ prognotes: 'x' }, 0, 'pn', 'prognotes', '', false)).toContain('Scheduler notes')
    toggleNotePub('pn:0')
    const on = sbNote({ prognotes: 'x' }, 0, 'pn', 'prognotes', '', false)
    expect(on).toContain('Public notes')
    expect(on).toContain('data-notepub="pn:0"')
    /* a read-only board (pv) shows the label but no control */
    expect(sbNote({ prognotes: 'x' }, 0, 'pn', 'prognotes', '', true)).not.toContain('data-notepub')
    /* a member is refused at the write path — nothing is flipped */
    setSession({ user: 'user', role: 'main' })
    expect(toggleNotePub('gn:0')).toBe(false)
    expect(notePub('gn:0')).toBe(false)
  })

  it('the flag is per note — making the programme note public leaves the ground note alone', () => {
    toggleNotePub('pn:0')
    expect(notePub('pn:0')).toBe(true)
    expect(notePub('gn:0')).toBe(false)
  })
})
