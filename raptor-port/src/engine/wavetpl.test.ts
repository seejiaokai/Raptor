import { beforeEach, describe, expect, it } from 'vitest'
import {
  WAVETPL_CFG, WAVEHIDE, addWaveTpl, delWaveTpl, renameWaveTpl, setWaveTplKind,
  moveWaveTpl, addWaveTplLine, delWaveTplLine, setWaveTplLine, moveWaveTplLine,
  waveFromTpl, waveTime, waveTplSave, waveTplLoad, waveTplReset, waveTplAreDefault,
  setWaveHidden, isWaveHidden, shownBuiltins, shownTemplates, kindIsStandby,
} from './wavetpl'
import { makeStandalone, dayCount } from './waves'
import { store, storeBackend } from './hooks'

/* storeBackend.impl is null headless — wire a fake, never real localStorage
   (the same shim dutytpl.test.ts uses) */
const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { mem[k] = v },
}

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  waveTplReset()
  /* reset deliberately SPARES the built-in kind flags now (the Admin page's
     curation, pinned below) — clear them by hand so each test starts truly
     clean rather than inheriting a neighbour's hides */
  WAVEHIDE.clear()
})

describe('wave-template library CRUD', () => {
  it('starts empty — the four built-in kinds are the baseline', () => {
    expect(WAVETPL_CFG.length).toBe(0)
    expect(waveTplAreDefault()).toBe(true)
    expect(shownBuiltins().map(b => b.key)).toEqual(['fly', 'sc', 'avalon', 'bb'])
  })

  it('adds, renames, reorders and deletes', () => {
    const a = addWaveTpl('Alpha')!, b = addWaveTpl('Bravo')!
    expect(WAVETPL_CFG.map(t => t.title)).toEqual(['Alpha', 'Bravo'])
    renameWaveTpl(a.id, 'Alpha-1')
    expect(WAVETPL_CFG[0]!.title).toBe('Alpha-1')
    moveWaveTpl(1, 0)
    expect(WAVETPL_CFG.map(t => t.title)).toEqual(['Bravo', 'Alpha-1'])
    delWaveTpl(b.id)
    expect(WAVETPL_CFG.map(t => t.title)).toEqual(['Alpha-1'])
  })

  it('a new template carries one blank line and defaults to the flying kind', () => {
    const t = addWaveTpl()!
    expect(t.kind).toBe('fly')
    expect(t.lines).toEqual([{ cs: '', msn: '', to: '', ld: '', spare: false }])
  })

  it('line add / edit / reorder / delete', () => {
    const t = addWaveTpl('W', 'sc')!
    addWaveTplLine(t.id)
    setWaveTplLine(t.id, 0, 'cs', 'VADER 1'); setWaveTplLine(t.id, 0, 'msn', 'BFM')
    setWaveTplLine(t.id, 0, 'to', '0700'); setWaveTplLine(t.id, 0, 'ld', '0830')
    setWaveTplLine(t.id, 1, 'cs', 'VADER 2')
    /* setWaveTplLine stores the time RAW — the modal normalises on blur and the
       mint/load paths normalise too, exactly as duty templates do (tplTime). */
    expect(t.lines[0]).toEqual({ cs: 'VADER 1', msn: 'BFM', to: '0700', ld: '0830', spare: false })
    moveWaveTplLine(t.id, 1, 0)
    expect(t.lines.map(l => l.cs)).toEqual(['VADER 2', 'VADER 1'])
    delWaveTplLine(t.id, 0)
    expect(t.lines.map(l => l.cs)).toEqual(['VADER 1'])
  })

  it('a time cell takes a clock time or nothing; a nonsense value drops to blank', () => {
    expect(waveTime('0700')).toBe('07:00')
    expect(waveTime('7:00')).toBe('07:00')
    expect(waveTime('2500')).toBe('')
    expect(waveTime('morning')).toBe('')
    expect(waveTime('')).toBe('')
  })
})

describe('the MAIN/SPARE flag follows the rule-set', () => {
  it('a SPARE flag sticks on a standby kind but never on flying', () => {
    const t = addWaveTpl('W', 'sc')!
    setWaveTplLine(t.id, 0, 'spare', true)
    expect(t.lines[0]!.spare).toBe(true)
    setWaveTplLine(t.id, 0, 'spare', true)
    setWaveTplKind(t.id, 'fly')                 // flip to flying: the flag is cleared
    expect(t.lines[0]!.spare).toBe(false)
    setWaveTplLine(t.id, 0, 'spare', true)      // and can't be set back while flying
    expect(t.lines[0]!.spare).toBe(false)
  })

  it('kindIsStandby is true only for sc/avalon/bb', () => {
    expect(kindIsStandby('fly')).toBe(false)
    expect(['sc', 'avalon', 'bb'].every(k => kindIsStandby(k as any))).toBe(true)
  })
})

describe('minting a wave from a template', () => {
  it('a flying template mints an ordinary, checked wave', () => {
    const t = addWaveTpl('Package', 'fly')!
    setWaveTplLine(t.id, 0, 'cs', 'HORNET'); setWaveTplLine(t.id, 0, 'msn', 'DACT')
    setWaveTplLine(t.id, 0, 'to', '1300'); setWaveTplLine(t.id, 0, 'ld', '1430')
    const w = waveFromTpl(t.id)
    expect(w.standalone).toBe(false)
    expect(w.noconf).toBe(false)
    expect(w.kind).toBeUndefined()
    expect(w.label).toBe('Package')
    expect(w.formations).toHaveLength(1)
    expect(w.formations[0].cs).toBe('HORNET')
    expect(w.formations[0].to).toBe('13:00')
    expect(w.formations[0].aircraft[0]).toEqual({ p: '', w: '', area: '', rmks: '', opts: {} })
  })

  it('a standby template mints a standalone wave with the kind flags and MAIN/SPARE rows', () => {
    const t = addWaveTpl('Night', 'avalon')!
    setWaveTplLine(t.id, 0, 'cs', 'OWL 1'); setWaveTplLine(t.id, 0, 'spare', false)
    addWaveTplLine(t.id); setWaveTplLine(t.id, 1, 'cs', 'OWL 2'); setWaveTplLine(t.id, 1, 'spare', true)
    const w = waveFromTpl(t.id)
    expect(w.standalone).toBe(true)
    expect(w.kind).toBe('avalon')
    expect(w.noconf).toBe(true)               // AVALON — the whole wave is exempt
    expect(w.night).toBe(true)
    expect(w.formations[0].aircraft[0]).toMatchObject({ spare: false, role: 'MAIN' })
    expect(w.formations[1].aircraft[0]).toMatchObject({ spare: true, role: 'SPARE' })
  })

  it('an SC template is standalone but not noconf (only its SPARE lines are exempt)', () => {
    const t = addWaveTpl('Standby', 'sc')!
    const w = waveFromTpl(t.id)
    expect(w.standalone).toBe(true)
    expect(w.kind).toBe('sc')
    expect(w.noconf).toBe(false)
    expect(w.night).toBe(false)
  })

  it('a missing id mints nothing', () => {
    expect(waveFromTpl('nope')).toBeNull()
  })

  /* the 26 Aug 26 seam close: a standby template's consecutive same-shift lines
     become ONE formation with a crew row per line, matching makeStandalone's
     shape — so the day badge and every per-formation reader treat a template
     SC exactly like + Wave → SC. */
  it('a hand-built SC-shaped template reproduces the built-in structure exactly', () => {
    const t = addWaveTpl('My SC', 'sc')!
    const shifts: Array<[string, string, string]> = [['AM', '0700', '1300'], ['PM', '1300', '1900']]
    let li = 0
    for (const [nm, st, en] of shifts) for (let i = 0; i < 4; i++) {
      if (li > 0) addWaveTplLine(t.id)
      setWaveTplLine(t.id, li, 'cs', 'SC'); setWaveTplLine(t.id, li, 'msn', nm)
      setWaveTplLine(t.id, li, 'to', st); setWaveTplLine(t.id, li, 'ld', en)
      setWaveTplLine(t.id, li, 'spare', i >= 2)
      li++
    }
    const w = waveFromTpl(t.id)
    const ref = makeStandalone('sc')
    expect(w.formations).toHaveLength(2)
    expect(w.formations).toEqual(ref.formations)
  })

  it('the day badge tallies a template SC like the built-in (max non-spare per shift)', () => {
    const t = addWaveTpl('My SC', 'sc')!
    for (let i = 0; i < 2; i++) {
      if (i > 0) addWaveTplLine(t.id)
      setWaveTplLine(t.id, i, 'cs', 'SC'); setWaveTplLine(t.id, i, 'msn', 'AM')
      setWaveTplLine(t.id, i, 'to', '0700'); setWaveTplLine(t.id, i, 'ld', '1300')
    }
    const w = waveFromTpl(t.id)
    expect(w.formations).toHaveLength(1)
    expect(w.formations[0].aircraft).toHaveLength(2)
    expect(dayCount({ waves: [w] })).toBe('0 / 2')
  })

  it('lines naming different shifts (or times) still mint separate formations', () => {
    const t = addWaveTpl('Split', 'sc')!
    setWaveTplLine(t.id, 0, 'cs', 'SC'); setWaveTplLine(t.id, 0, 'msn', 'AM')
    setWaveTplLine(t.id, 0, 'to', '0700'); setWaveTplLine(t.id, 0, 'ld', '1300')
    addWaveTplLine(t.id)
    setWaveTplLine(t.id, 1, 'cs', 'SC'); setWaveTplLine(t.id, 1, 'msn', 'PM')
    setWaveTplLine(t.id, 1, 'to', '1300'); setWaveTplLine(t.id, 1, 'ld', '1900')
    const w = waveFromTpl(t.id)
    expect(w.formations).toHaveLength(2)
    expect(w.formations.map((f: any) => f.shift)).toEqual(['AM', 'PM'])
    expect(w.formations.every((f: any) => f.aircraft.length === 1)).toBe(true)
  })

  it('flying templates keep the 1:1 line-to-formation mint even with identical lines', () => {
    const t = addWaveTpl('Pair', 'fly')!
    setWaveTplLine(t.id, 0, 'cs', 'HAWK'); setWaveTplLine(t.id, 0, 'msn', 'DACT')
    addWaveTplLine(t.id)
    setWaveTplLine(t.id, 1, 'cs', 'HAWK'); setWaveTplLine(t.id, 1, 'msn', 'DACT')
    const w = waveFromTpl(t.id)
    expect(w.formations).toHaveLength(2)
  })
})

describe('show / hide for the + Wave picker', () => {
  it('hides a built-in kind and a template, and a deleted template drops its flag', () => {
    const t = addWaveTpl('T')!
    setWaveHidden('bb', true)
    setWaveHidden(t.id, true)
    expect(isWaveHidden('bb')).toBe(true)
    expect(shownBuiltins().map(b => b.key)).toEqual(['fly', 'sc', 'avalon'])
    expect(shownTemplates()).toEqual([])
    delWaveTpl(t.id)
    expect(WAVEHIDE.has(t.id)).toBe(false)   // the hide flag went with the template
  })
})

describe('persistence', () => {
  it('a default library writes nothing; a customised one round-trips', () => {
    waveTplSave()
    expect(store.get('wavetpl', null)).toBeNull()

    const t = addWaveTpl('Saved', 'sc')!
    setWaveTplLine(t.id, 0, 'cs', 'GHOST'); setWaveTplLine(t.id, 0, 'to', '0900')
    setWaveTplLine(t.id, 0, 'spare', true)
    setWaveHidden('avalon', true)
    waveTplSave()

    /* clear the in-memory library WITHOUT writing (reset would wipe storage too),
       then reload from storage — the round-trip a fresh session performs */
    delWaveTpl(t.id); setWaveHidden('avalon', false)
    expect(WAVETPL_CFG.length).toBe(0)
    waveTplLoad()
    expect(WAVETPL_CFG).toHaveLength(1)
    expect(WAVETPL_CFG[0]!.title).toBe('Saved')
    expect(WAVETPL_CFG[0]!.kind).toBe('sc')
    expect(WAVETPL_CFG[0]!.lines[0]).toMatchObject({ cs: 'GHOST', to: '09:00', spare: true })
    expect(isWaveHidden('avalon')).toBe(true)
  })

  it('untrusted storage is clamped: bad kind coerces to fly, junk lines dropped, nonsense times blanked', () => {
    store.set('wavetpl', [
      { id: 'w7', title: 'X', kind: 'nonsense', lines: [{ cs: 'A', to: '2500' }, 'junk', { msn: 5 }] },
      { title: 'no-lines' },                       // no lines array → dropped
      'not-an-object',
    ] as any)
    store.set('wavehide', ['fly', 'ghost-key'] as any)   // ghost-key is neither a kind nor a live id
    waveTplLoad()
    expect(WAVETPL_CFG).toHaveLength(1)
    const t = WAVETPL_CFG[0]!
    expect(t.kind).toBe('fly')
    expect(t.lines).toHaveLength(2)                // the string 'junk' skipped
    expect(t.lines[0]).toMatchObject({ cs: 'A', to: '' })   // 2500 blanked
    expect(t.lines[1]).toMatchObject({ cs: '', msn: '' })   // msn:5 coerced to ''
    expect(isWaveHidden('fly')).toBe(true)
    expect(isWaveHidden('ghost-key')).toBe(false) // an unknown key is not restored
  })

  it('a restored wN id does not collide with a freshly added one', () => {
    store.set('wavetpl', [{ id: 'w5', title: 'Old', kind: 'fly', lines: [{}] }] as any)
    waveTplLoad()
    const fresh = addWaveTpl('New')!
    expect(fresh.id).not.toBe('w5')
    expect(new Set(WAVETPL_CFG.map(t => t.id)).size).toBe(WAVETPL_CFG.length)
  })

  /* hand-edited storage can carry one id twice — delete/rename/hide address by
     id and would only ever reach the first wearer (26 Aug 26 bug pass) */
  it('two stored entries sharing an id are told apart — the second gets a fresh one', () => {
    store.set('wavetpl', [
      { id: 'w3', title: 'First', kind: 'fly', lines: [{}] },
      { id: 'w3', title: 'Second', kind: 'fly', lines: [{}] },
    ] as any)
    waveTplLoad()
    expect(WAVETPL_CFG).toHaveLength(2)
    expect(new Set(WAVETPL_CFG.map(t => t.id)).size).toBe(2)
  })
})

/* CLEAR-ALL CLEARS THE LIBRARY, NOT THE ADMIN'S CURATION (26 Aug 26 bug pass).
   WAVEHIDE holds two ownership domains — per-template flags (they die with the
   library) and the built-in kind flags the Admin page sets. Wiping both meant
   clearing the template library silently resurfaced a hidden BB in every
   + Wave menu. */
describe('clear-all spares the built-in show/hide flags', () => {
  it('reset wipes the library and its template flags; the built-in kind flags survive and persist', () => {
    const t = addWaveTpl('Mine')!
    setWaveHidden(t.id, true)
    setWaveHidden('bb', true)                    // the Admin page's own curation
    waveTplReset()
    expect(WAVETPL_CFG).toHaveLength(0)
    expect(isWaveHidden(t.id), "the cleared template's flag dies with it").toBe(false)
    expect(isWaveHidden('bb'), "the Admin's built-in hide survives the library clear").toBe(true)
    expect(store.get('wavehide', null), 'and it is what persists').toEqual(['bb'])
  })
})

/* the raw keystroke value persists per save until blur normalises it through
   waveTime — bounded like cs/msn so a paste cannot ride storage (26 Aug 26) */
describe('time-cell input bound', () => {
  it('a pasted monster into to/ld is clamped before blur normalises it', () => {
    const t = addWaveTpl('T')!
    setWaveTplLine(t.id, 0, 'to', 'X'.repeat(400))
    expect((WAVETPL_CFG[0]!.lines[0]!.to as string).length).toBeLessThanOrEqual(12)
  })
})
