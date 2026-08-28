import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  advanceStage,
  getState,
  getVersion,
  ingestFromRaptor,
  initStore,
  setBidState,
  setCell,
  createWar,
  selectWar,
  setRole,
  setBidWindow,
  setCellRange,
  setDayEvent,
  setDayEventRange,
  addEventBand,
  removeEventBand,
  addEventType,
  updateEventType,
  removeEventType,
  resetEventTypes,
  addEventRow,
  removeEventRow,
  eventRowUsed,
  MAX_EVENT_ROWS,
  setManningThreshold,
  resetManningThreshold,
  saveManningRule,
  deleteManningRule,
  resetManningRules,
  setQualCatalog,
  orderedManningIds,
  moveManningRow,
  toggleManningRow,
  setPeople,
  setPerson,
  clearBidWindow,
  shiftBid,
  reopenStage,
  subscribe,
  setCells,
  clearCells,
  setBidStates,
  moveCells,
  movableCells,
  moveProblem,
  setViewer,
} from './store'
import { makeWar, seedRequirements } from '../engine'
import { localBackend, memoryBackend } from './storage'

beforeEach(() => {
  initStore(memoryBackend())
})

describe('store', () => {
  it('boots with the seeded roster and period', () => {
    expect(getState().people.length).toBeGreaterThan(0)
    expect(getState().period.days).toHaveLength(365)
  })

  it('writes a cell into the grid', () => {
    setCell('ramp', '2026-01-20', 'LL')
    expect(getState().grid.ramp['2026-01-20']).toBe('LL')
  })

  it('clears a cell when given an empty code', () => {
    setCell('ramp', '2026-01-20', 'LL')
    setCell('ramp', '2026-01-20', '')
    expect(getState().grid.ramp?.['2026-01-20']).toBeUndefined()
  })

  it('bumps the version on every write so subscribers re-read', () => {
    const before = getVersion()
    setCell('ramp', '2026-01-21', 'LL')
    expect(getVersion()).toBe(before + 1)
  })

  it('notifies subscribers', () => {
    const fn = vi.fn()
    subscribe(fn)
    setCell('ramp', '2026-01-22', 'LL')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('stops notifying after unsubscribe', () => {
    const fn = vi.fn()
    subscribe(fn)()
    setCell('ramp', '2026-01-23', 'LL')
    expect(fn).not.toHaveBeenCalled()
  })

  it('persists the grid through the backend and reloads it', () => {
    const backend = memoryBackend()
    initStore(backend)
    setCell('ramp', '2026-01-24', 'LL')
    initStore(backend)
    expect(getState().grid.ramp['2026-01-24']).toBe('LL')
  })

  it('falls back to the seed when the backend holds unreadable data', () => {
    const backend = memoryBackend()
    backend.write('grid', 'not json at all')
    initStore(backend)
    expect(getState().grid).toBeTypeOf('object')
    expect(getState().people.length).toBeGreaterThan(0)
    // Asserted against a seed-only value, same as the shapes below — a
    // fallback to `{}` would otherwise pass this just as easily.
    expect(getState().grid.ramp?.['2026-01-01']).toBe('OL')
  })

  // A grid whose top level is a plain object but whose rows are not objects
  // of strings (e.g. a numeric cell) used to pass the old top-level-only
  // guard, then crash on boot inside codeOf, which expects a string. The
  // guard's job is to degrade to the seed here exactly as it does above.
  it('falls back to the seed when a grid row is not a plain object of strings', () => {
    const backend = memoryBackend()
    backend.write('grid', '{"ramp":{"2026-01-01":123}}')
    initStore(backend)
    expect(getState().grid.ramp?.['2026-01-01']).toBe('OL')
  })

  // The three shapes below all parse as valid JSON but are not a plain
  // object, so each must be caught by the `typeof !== 'object' ||
  // Array.isArray` guard rather than the try/catch (which only sees
  // JSON.parse throw). Each is asserted against a seed-only value
  // ('ramp' → 'OL' on 2026-01-01, per seedGrid) so a fallback to `{}`
  // would not accidentally pass.
  it.each([
    ['an array', '[]'],
    ['null', 'null'],
    ['a bare primitive', '42'],
  ])('falls back to the seed when the backend holds %s as the grid', (_label, raw) => {
    const backend = memoryBackend()
    backend.write('grid', raw)
    initStore(backend)
    expect(getState().grid).toBeTypeOf('object')
    expect(Array.isArray(getState().grid)).toBe(false)
    expect(getState().grid.ramp?.['2026-01-01']).toBe('OL')
  })
})

describe('localBackend', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reads back what it writes through real localStorage', () => {
    const backend = localBackend()
    backend.write('grid', '{"ramp":{"2026-01-20":"LL"}}')
    expect(backend.read('grid')).toBe('{"ramp":{"2026-01-20":"LL"}}')
  })

  // Private browsing and disabled storage both throw on any localStorage
  // access, not just on write. A leave war that cannot persist should still
  // open and read, so the backend must swallow the throw rather than take
  // the page down.
  it('degrades instead of throwing when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage denied')
    })
    const backend = localBackend()
    expect(backend.read('grid')).toBeNull()
    expect(() => backend.write('grid', 'x')).not.toThrow()
  })
})

describe('initStore subscriber contract', () => {
  // Deliberate, not a bug: initStore() represents a fresh boot of the store
  // (a new backend, a reset version, a clean slate), so it drops all
  // subscribers rather than carrying old ones into the new session. The
  // hazard is that calling initStore() after a component has mounted and
  // subscribed will silently strand that subscriber — no error, no signal,
  // it just stops receiving updates. Any change to this behaviour should be
  // deliberate, which is what this test pins down.
  it('drops subscribers registered before a later initStore call', () => {
    const fn = vi.fn()
    subscribe(fn)
    initStore(memoryBackend())
    setCell('ramp', '2026-01-25', 'LL')
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('bids', () => {
  it('makes a new leave cell pending by itself', () => {
    setCell('ramp', '2026-02-02', 'LL')
    expect(getState().states.ramp['2026-02-02']?.state).toBe('pending')
  })

  it('gives a non-bid code no state at all', () => {
    setCell('ramp', '2026-02-03', 'CSE')
    expect(getState().states.ramp?.['2026-02-03']).toBeUndefined()
  })

  it('drops the state when the cell is cleared', () => {
    setCell('ramp', '2026-02-04', 'LL')
    setCell('ramp', '2026-02-04', '')
    expect(getState().states.ramp?.['2026-02-04']).toBeUndefined()
  })

  // The medical markers are management's vocabulary — only an admin writes
  // one (owner, 17 Aug 26), and since the 27 Aug overnight pass the store
  // refuses it too, not just the sheets.
  it('drops the state when a bid is overwritten by a non-bid code', () => {
    setRole('admin')
    setCell('ramp', '2026-02-05', 'LL')
    setCell('ramp', '2026-02-05', 'OML')
    expect(getState().states.ramp?.['2026-02-05']).toBeUndefined()
  })

  it('refuses a medical code from a member — the write path, not just the sheet', () => {
    setCell('ramp', '2026-02-05', 'OML')
    expect(getState().grid.ramp?.['2026-02-05']).toBeUndefined()
    setRole('admin')
    setCell('ramp', '2026-02-05', 'OML')
    expect(getState().grid.ramp['2026-02-05']).toBe('OML')
  })

  // Decisions are made by an admin once bidding is no longer open —
  // setBidState re-checks canDecide since the 27 Aug overnight pass, so each
  // of these earns its decision the way the sheet does: close the war first.
  it('keeps a decision when the same code is rewritten', () => {
    setCell('ramp', '2026-02-06', 'LL')
    setRole('admin')
    advanceStage()
    setBidState('ramp', '2026-02-06', 'approved')
    setCell('ramp', '2026-02-06', 'LL')
    expect(getState().states.ramp['2026-02-06']?.state).toBe('approved')
  })

  // Changing WHAT was asked for is a new ask. Re-typing LL over an approved
  // LL keeps the approval (above); turning it into OL must not inherit one —
  // nobody approved a week overseas.
  it('resets the decision when the bid is changed to different leave', () => {
    setCell('ramp', '2026-02-06', 'LL')
    setRole('admin')
    advanceStage()
    setBidState('ramp', '2026-02-06', 'approved')
    setCell('ramp', '2026-02-06', 'OL')
    expect(getState().states.ramp['2026-02-06']?.state).toBe('pending')
  })

  it('records a decision', () => {
    setCell('ramp', '2026-02-07', 'LL')
    setRole('admin')
    advanceStage()
    setBidState('ramp', '2026-02-07', 'refused')
    expect(getState().states.ramp['2026-02-07']?.state).toBe('refused')
  })

  // The store refuses the decision itself when the ROLE or the STAGE is
  // wrong — the same canDecide the sheet renders by, checked where it
  // counts (owner doctrine: the interface hides, the store makes it true).
  it('refuses a decision from a member, and from anyone while bidding is open', () => {
    setCell('ramp', '2026-02-07', 'LL')
    setBidState('ramp', '2026-02-07', 'approved')           // member, open
    expect(getState().states.ramp['2026-02-07']?.state).toBe('pending')
    setRole('admin')
    setBidState('ramp', '2026-02-07', 'approved')           // admin, still open
    expect(getState().states.ramp['2026-02-07']?.state).toBe('pending')
    advanceStage()
    setRole('member')
    setBidState('ramp', '2026-02-07', 'approved')           // member, closed
    expect(getState().states.ramp['2026-02-07']?.state).toBe('pending')
    setRole('admin')
    setBidState('ramp', '2026-02-07', 'approved')           // admin, closed
    expect(getState().states.ramp['2026-02-07']?.state).toBe('approved')
  })

  // The one invariant the parallel map exists to keep: a state never lives
  // on a cell nobody bid for. setCell enforces it; so must setBidState.
  it('refuses to decide a cell nobody bid for', () => {
    setRole('admin')
    setCell('ramp', '2026-02-12', 'CSE')
    advanceStage()
    setBidState('ramp', '2026-02-12', 'approved')
    expect(getState().states.ramp?.['2026-02-12']).toBeUndefined()
    setBidState('ramp', '2026-02-13', 'approved')
    expect(getState().states.ramp?.['2026-02-13']).toBeUndefined()
  })

  it('bumps the version so the interface re-reads', () => {
    setCell('ramp', '2026-02-08', 'LL')
    setRole('admin')
    advanceStage()
    const before = getVersion()
    setBidState('ramp', '2026-02-08', 'approved')
    expect(getVersion()).toBe(before + 1)
  })

  it('persists states and reloads them', () => {
    const backend = memoryBackend()
    initStore(backend)
    setCell('ramp', '2026-02-09', 'LL')
    setRole('admin')
    advanceStage()
    setBidState('ramp', '2026-02-09', 'approved')
    initStore(backend)
    expect(getState().states.ramp['2026-02-09']?.state).toBe('approved')
  })

  // States are seeded only alongside a seeded grid, so with no grid stored
  // the states key is not consulted at all — whatever it holds. This pins
  // the pairing rule, not the validator; the validator is exercised below,
  // where a stored grid makes the states key actually load.
  it('seeds the states when nothing usable is stored, whatever the states key holds', () => {
    const backend = memoryBackend()
    backend.write('states', 'not json')
    initStore(backend)
    expect(getState().states).toBeTypeOf('object')
    expect(Array.isArray(getState().states)).toBe(false)
    // Asserted against a seed-only value, same as the grid fallbacks above —
    // a fallback to `{}` would otherwise pass this just as easily.
    expect(getState().states.jaguar?.['2026-01-19']?.state).toBe('refused')
  })

  // The last two shapes name a cell the stored grid really holds and really
  // is a bid, so an accepted value would survive `reconcile` and land in
  // `states` — that is what makes them bite instead of passing vacuously
  // through the pruning, and they were rewritten to this form after the
  // first draft was found to pass with the leaf check removed.
  //
  // `null` and `[]` are weaker on purpose and worth knowing as such: each is
  // already caught before the leaf check (the try/catch, and pruning to an
  // empty map respectively), so they pin the observable behaviour without
  // isolating the plain-object guard. That guard is belt-and-braces here.
  it.each([
    ['null', 'null'],
    ['an array', '[]'],
    ['a leaf that is not a string', '{"jaguar":{"2026-01-19":123}}'],
    ['a state string nobody defined', '{"jaguar":{"2026-01-19":"maybe"}}'],
  ])('discards stored states that are %s, keeping the stored grid', (_label, raw) => {
    const backend = memoryBackend()
    backend.write('grid', '{"jaguar":{"2026-01-19":"OL"}}')
    backend.write('states', raw)
    initStore(backend)
    expect(getState().grid.jaguar['2026-01-19']).toBe('OL')
    expect(getState().states.jaguar?.['2026-01-19']).toBeUndefined()
  })

  it('keeps stored states that are well formed', () => {
    const backend = memoryBackend()
    backend.write('grid', '{"jaguar":{"2026-01-19":"OL"}}')
    backend.write('states', '{"jaguar":{"2026-01-19":"refused"}}')
    initStore(backend)
    expect(getState().states.jaguar['2026-01-19']?.state).toBe('refused')
  })

  // The parallel map's one weakness is drift, and load is where it can
  // arrive from outside setCell — hand-edited storage, or data written by a
  // build that predates states. A state whose cell no longer holds a code
  // someone bid for is dropped rather than left to colour a cell that is
  // now medical, or to remove a man who has no leave booked at all.
  it('drops a stored state whose code has gone or is no longer a bid', () => {
    const backend = memoryBackend()
    backend.write('grid', JSON.stringify({ ramp: { '2026-01-05': 'OML' } }))
    backend.write('states', JSON.stringify({
      ramp: { '2026-01-05': 'approved', '2026-01-06': 'approved' },
    }))
    initStore(backend)
    expect(getState().states.ramp?.['2026-01-05']).toBeUndefined()
    expect(getState().states.ramp?.['2026-01-06']).toBeUndefined()
  })

  // Seed decisions belong to the seed grid. Hanging them off a grid the user
  // has already written would approve cells nobody bid for.
  it('does not seed states over a stored grid', () => {
    const backend = memoryBackend()
    backend.write('grid', JSON.stringify({ jaguar: { '2026-01-19': 'OL' } }))
    initStore(backend)
    expect(getState().states.jaguar?.['2026-01-19']).toBeUndefined()
  })
})

describe('advanceStage', () => {
  /* advancing the cycle is ADMIN ONLY since 27 Aug 26 (owner — "for a member
     i shouldnt be able to click on bidding closed or published"), so these
     mechanics tests run as an admin; the member refusal is pinned on its own
     below */
  beforeEach(() => { setRole('admin') })

  it('is refused for a member — the cycle does not move', () => {
    setRole('member')
    expect(getState().period.stage).toBe('open')
    advanceStage()
    expect(getState().period.stage).toBe('open')
  })

  it('walks the period forward one stage at a time', () => {
    expect(getState().period.stage).toBe('open')
    advanceStage()
    expect(getState().period.stage).toBe('closed')
    advanceStage()
    expect(getState().period.stage).toBe('published')
  })

  it('stops at published rather than wrapping', () => {
    advanceStage(); advanceStage(); advanceStage()
    expect(getState().period.stage).toBe('published')
  })

  it('does not notify when there is nowhere further to go', () => {
    advanceStage(); advanceStage()
    const before = getVersion()
    advanceStage()
    expect(getVersion()).toBe(before)
  })

  it('persists the stage and reloads it', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')          // a fresh boot returns to member; advancing is admin-only
    advanceStage()
    initStore(backend)
    expect(getState().period.stage).toBe('closed')
  })
})

describe('the stored stage', () => {
  it.each([
    ['a stage nobody defined', 'reopened'],
    ['an empty string', ''],
    ['something that is not a stage at all', '{"stage":"open"}'],
  ])('falls back to the seeded stage when the backend holds %s', (_label, raw) => {
    const backend = memoryBackend()
    backend.write('stage', raw)
    initStore(backend)
    expect(getState().period.stage).toBe('open')
  })

  // Stage now lives INSIDE its war, because each war has its own. The bare
  // `stage` key survives only as part of the single-war migration below,
  // which is why these cases now write a grid alongside it.
  it('reloads every stage the cycle has, through the old single-war shape', () => {
    for (const stage of ['draft', 'open', 'closed', 'published']) {
      const backend = memoryBackend()
      backend.write('grid', '{"jaguar":{"2026-01-19":"OL"}}')
      backend.write('stage', stage)
      initStore(backend)
      expect(getState().period.stage).toBe(stage)
    }
  })

  it('reloads each war with its own stage, independently', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')          // advancing is admin-only (27 Aug 26)
    advanceStage() // the open war -> closed
    const other = getState().wars.find(w => w.period.id !== getState().currentId)!
    expect(other.period.stage).toBe('draft')
    initStore(backend)
    expect(getState().period.stage).toBe('closed')
    expect(getState().wars.find(w => w.period.id !== getState().currentId)!.period.stage).toBe('draft')
  })
})

describe('upgrading a browser that predates more than one war', () => {
  // Those browsers hold `grid`, `states` and `stage` and no `wars`, and all
  // of it belonged to the only period that existed. Rebuilding it as a
  // single war rather than discarding follows the same rule as the
  // bid-record migration: a squadron's real leave is not worth throwing away
  // to save a branch.
  it('rebuilds one war from the old keys, keeping the leave and the decisions', () => {
    const backend = memoryBackend()
    backend.write('grid', '{"jaguar":{"2026-01-19":"OL"}}')
    backend.write('states', '{"jaguar":{"2026-01-19":{"state":"refused","source":"bid"}}}')
    backend.write('stage', 'closed')
    initStore(backend)

    expect(getState().wars).toHaveLength(1)
    expect(getState().grid.jaguar['2026-01-19']).toBe('OL')
    expect(getState().states.jaguar['2026-01-19'].state).toBe('refused')
    expect(getState().period.stage).toBe('closed')
  })

  it('still seeds both wars on a genuinely fresh boot', () => {
    initStore(memoryBackend())
    expect(getState().wars.length).toBeGreaterThan(1)
  })

  // Once migrated, the next save writes the new shape, so the old keys stop
  // being consulted. Without this the migration would run on every boot and
  // quietly discard whatever had happened since.
  it('writes the new shape on the next save, so it migrates once', () => {
    const backend = memoryBackend()
    backend.write('grid', '{"jaguar":{"2026-01-19":"OL"}}')
    initStore(backend)
    setCell('jaguar', '2026-01-20', 'LL')
    initStore(backend)
    expect(getState().grid.jaguar['2026-01-20']).toBe('LL')
    expect(getState().wars).toHaveLength(1)
  })
})

describe('the stored bid record', () => {
  // Bids written by a build that predates sources are BARE STRINGS. Rejecting
  // them would degrade a squadron's real decisions to the seed to gain
  // nothing, so they are migrated instead. A string could only ever have
  // meant a bid placed here, so `source: 'bid'` is a fact, not a guess.
  it('migrates a bare string state written by an earlier build', () => {
    const backend = memoryBackend()
    backend.write('grid', '{"jaguar":{"2026-01-19":"OL"}}')
    backend.write('states', '{"jaguar":{"2026-01-19":"refused"}}')
    initStore(backend)
    expect(getState().states.jaguar['2026-01-19']).toEqual({ state: 'refused', source: 'bid' })
  })

  it('round-trips a source and a shift through storage', () => {
    const backend = memoryBackend()
    backend.write('grid', '{"jaguar":{"2026-01-19":"OL","2026-01-20":"LL"}}')
    backend.write('states', JSON.stringify({
      jaguar: {
        '2026-01-19': { state: 'approved', source: 'raptor' },
        '2026-01-20': { state: 'pending', source: 'bid', shiftedFrom: '2026-01-21' },
      },
    }))
    initStore(backend)
    expect(getState().states.jaguar['2026-01-19']).toEqual({ state: 'approved', source: 'raptor' })
    expect(getState().states.jaguar['2026-01-20']).toEqual({
      state: 'pending', source: 'bid', shiftedFrom: '2026-01-21',
    })
  })

  // Each shape names a cell the stored grid really holds and really is a bid,
  // so an accepted value would survive `reconcile` and land in `states` —
  // that is what makes these bite rather than pass vacuously through pruning.
  it.each([
    ['a source nobody defined', '{"jaguar":{"2026-01-19":{"state":"approved","source":"telepathy"}}}'],
    ['a record with no source at all', '{"jaguar":{"2026-01-19":{"state":"approved"}}}'],
    ['a state nobody defined', '{"jaguar":{"2026-01-19":{"state":"maybe","source":"bid"}}}'],
    ['a non-string shiftedFrom', '{"jaguar":{"2026-01-19":{"state":"pending","source":"bid","shiftedFrom":7}}}'],
    ['a leaf that is neither string nor record', '{"jaguar":{"2026-01-19":123}}'],
  ])('discards stored states holding %s, keeping the stored grid', (_label, raw) => {
    const backend = memoryBackend()
    backend.write('grid', '{"jaguar":{"2026-01-19":"OL"}}')
    backend.write('states', raw)
    initStore(backend)
    expect(getState().grid.jaguar['2026-01-19']).toBe('OL')
    expect(getState().states.jaguar?.['2026-01-19']).toBeUndefined()
  })

  // Deciding is the second half of a shift. Losing the provenance at exactly
  // the moment management approves the date they moved it to would make the
  // trail useless.
  it('keeps the source and the shift when a decision is recorded', () => {
    const backend = memoryBackend()
    backend.write('grid', '{"jaguar":{"2026-01-20":"LL"}}')
    backend.write('states', JSON.stringify({
      jaguar: { '2026-01-20': { state: 'pending', source: 'bid', shiftedFrom: '2026-01-21' } },
    }))
    initStore(backend)
    setRole('admin')
    advanceStage()
    setBidState('jaguar', '2026-01-20', 'approved')
    expect(getState().states.jaguar['2026-01-20']).toEqual({
      state: 'approved', source: 'bid', shiftedFrom: '2026-01-21',
    })
  })

  // Replacing WHAT was asked for replaces the whole ask. The shift belonged
  // to the bid that has just been overwritten, so it must not survive onto
  // a different one.
  it('drops the shift record when the bid is changed to different leave', () => {
    const backend = memoryBackend()
    backend.write('grid', '{"jaguar":{"2026-01-20":"LL"}}')
    backend.write('states', JSON.stringify({
      jaguar: { '2026-01-20': { state: 'pending', source: 'bid', shiftedFrom: '2026-01-21' } },
    }))
    initStore(backend)
    setCell('jaguar', '2026-01-20', 'OL')
    expect(getState().states.jaguar['2026-01-20']).toEqual({ state: 'pending', source: 'bid' })
  })
})

describe('the role', () => {
  it('opens as a member, not with the locks already off', () => {
    expect(getState().role).toBe('member')
  })

  /* Since the Raptor merge the role is DERIVED from the Raptor login on
     every session change (resetSession → setRole) and deliberately not
     persisted — a stored copy could only disagree with the session actually
     looking at the page. These two pin the non-persistence both ways:
     a set role does not survive a re-boot, and a stored value (a leftover
     from the standalone app, or a hand edit) is ignored. */
  it('switches, but a re-boot returns to member — the role is not persisted', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    expect(getState().role).toBe('admin')
    initStore(backend)
    expect(getState().role).toBe('member')
  })

  it('ignores a stored role entirely', () => {
    const backend = memoryBackend()
    backend.write('role', 'admin')
    initStore(backend)
    expect(getState().role).toBe('member')
  })

  it('does not notify when set to the role it already is', () => {
    setRole('admin')
    const before = getVersion()
    setRole('admin')
    expect(getVersion()).toBe(before)
  })
})

describe('leave that came in through Raptor', () => {
  // Entering leave in Raptor's input tab means the person asked verbally and
  // was told yes. The approval has already happened; Leave War is being told
  // about it, not being asked to decide it.
  it('lands already approved, and marked as Raptor\'s', () => {
    expect(ingestFromRaptor('dusk', '2026-02-11', 'LL')).toBe('written')
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
    expect(getState().states.dusk['2026-02-11']).toEqual({ state: 'approved', source: 'raptor' })
  })

  it('takes a half day in the squadron\'s own notation', () => {
    expect(ingestFromRaptor('dusk', '2026-02-11', '*LL')).toBe('written')
    expect(getState().grid.dusk['2026-02-11']).toBe('*LL')
  })

  // The spec's rule, unchanged: the system never overwrites a bid. It raises
  // the clash and a human decides.
  it('never overwrites a different bid — it reports a clash instead', () => {
    setCell('dusk', '2026-02-11', 'LL')
    expect(ingestFromRaptor('dusk', '2026-02-11', 'OL')).toBe('clash')
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
    expect(getState().states.dusk['2026-02-11']).toEqual({ state: 'pending', source: 'bid' })
  })

  // The same code is not a clash. That is Raptor confirming what was already
  // asked for, so the cell is upgraded in place rather than left pending
  // forever waiting on a decision that has already been made.
  it('confirms a matching bid in place, approving it', () => {
    setCell('dusk', '2026-02-11', 'LL')
    expect(ingestFromRaptor('dusk', '2026-02-11', 'LL')).toBe('confirmed')
    expect(getState().states.dusk['2026-02-11']).toEqual({ state: 'approved', source: 'raptor' })
  })

  it('ignores a code nobody bids for, and an empty one', () => {
    expect(ingestFromRaptor('dusk', '2026-02-11', 'CSE')).toBe('ignored')
    expect(ingestFromRaptor('dusk', '2026-02-11', '')).toBe('ignored')
    expect(ingestFromRaptor('dusk', '2026-02-11', 'ZZZ')).toBe('ignored')
    expect(getState().grid.dusk?.['2026-02-11']).toBeUndefined()
  })

  it('re-ingesting a cell Raptor already owns just updates it', () => {
    ingestFromRaptor('dusk', '2026-02-11', 'LL')
    expect(ingestFromRaptor('dusk', '2026-02-11', 'OL')).toBe('written')
    expect(getState().grid.dusk['2026-02-11']).toBe('OL')
    expect(getState().states.dusk['2026-02-11']).toEqual({ state: 'approved', source: 'raptor' })
  })
})

describe('a cell Raptor owns', () => {
  beforeEach(() => {
    ingestFromRaptor('dusk', '2026-02-11', 'LL')
  })

  // Raptor owns what Raptor last wrote. It is changed in Raptor's input tab
  // and syncs back here; changing it here would leave the two systems
  // disagreeing, which is the single failure this model exists to prevent.
  it('cannot be edited from Leave War', () => {
    setCell('dusk', '2026-02-11', 'OL')
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
    expect(getState().states.dusk['2026-02-11'].source).toBe('raptor')
  })

  it('cannot be cleared from Leave War', () => {
    setCell('dusk', '2026-02-11', '')
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
  })

  // There is nothing here to decide: the approval already happened, verbally,
  // before Leave War ever saw the cell.
  it('cannot be approved or refused from Leave War', () => {
    setBidState('dusk', '2026-02-11', 'refused')
    expect(getState().states.dusk['2026-02-11'].state).toBe('approved')
  })

  it('does not notify when a refused write is ignored', () => {
    const before = getVersion()
    setCell('dusk', '2026-02-11', 'OL')
    setBidState('dusk', '2026-02-11', 'refused')
    expect(getVersion()).toBe(before)
  })
})

describe('shifting a bid', () => {
  // Management moves leave to a different date instead of refusing it — what
  // they actually do when a week goes red and refusing outright is too blunt.
  it('moves the code to the new date and empties the old one', () => {
    setCell('dusk', '2026-02-11', 'LL')
    expect(shiftBid('dusk', '2026-02-11', '2026-02-18')).toBe('shifted')
    expect(getState().grid.dusk?.['2026-02-11']).toBeUndefined()
    expect(getState().grid.dusk['2026-02-18']).toBe('LL')
  })

  // A shift is a PROPOSAL with a paper trail, not a silent re-approval.
  // Management still has to approve the date they moved it to.
  it('lands pending, recording the date it came from', () => {
    // A management shift is a CLOSED-war action, and only then does it leave a
    // trail (owner, 27 Aug 26) — close the war before shifting.
    setRole('admin'); advanceStage()
    setCell('dusk', '2026-02-11', 'LL')
    setBidState('dusk', '2026-02-11', 'approved')
    shiftBid('dusk', '2026-02-11', '2026-02-18')
    expect(getState().states.dusk['2026-02-18']).toEqual({
      state: 'pending', source: 'bid', shiftedFrom: '2026-02-11',
    })
    expect(getState().states.dusk?.['2026-02-11']).toBeUndefined()
  })

  it('keeps the portion — a shifted morning is still a morning', () => {
    setCell('dusk', '2026-02-11', '*LL')
    shiftBid('dusk', '2026-02-11', '2026-02-18')
    expect(getState().grid.dusk['2026-02-18']).toBe('*LL')
  })

  it('approving afterwards keeps the trail', () => {
    setRole('admin'); advanceStage()   // a management shift once bidding closed
    setCell('dusk', '2026-02-11', 'LL')
    shiftBid('dusk', '2026-02-11', '2026-02-18')
    setBidState('dusk', '2026-02-18', 'approved')
    expect(getState().states.dusk['2026-02-18']).toEqual({
      state: 'approved', source: 'bid', shiftedFrom: '2026-02-11',
    })
  })

  // While bidding is OPEN a shift is ordinary shuffling and leaves NO trail —
  // the moved stripe must not appear on a bid the squadron simply tidied
  // (owner, 27 Aug 26). It records the trace only once bidding has closed.
  it('an OPEN-bidding shift records no moved trail; a closed one does', () => {
    setCell('dusk', '2026-02-11', 'LL')            // seed stage is OPEN
    expect(shiftBid('dusk', '2026-02-11', '2026-02-18')).toBe('shifted')
    expect(getState().states.dusk['2026-02-18']).toEqual({ state: 'pending', source: 'bid' })
    expect(getState().states.dusk['2026-02-18'].shiftedFrom).toBeUndefined()
    // close the war and shift again → NOW the trail is recorded
    setRole('admin'); advanceStage()
    expect(shiftBid('dusk', '2026-02-18', '2026-02-25')).toBe('shifted')
    expect(getState().states.dusk['2026-02-25']).toEqual({
      state: 'pending', source: 'bid', shiftedFrom: '2026-02-18',
    })
  })

  // Never overwrite. Moving one man's leave onto a day he already has
  // something booked would destroy the second booking to save the first.
  it('refuses a destination that already holds a code', () => {
    setCell('dusk', '2026-02-11', 'LL')
    setCell('dusk', '2026-02-18', 'OL')
    expect(shiftBid('dusk', '2026-02-11', '2026-02-18')).toBe('occupied')
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
    expect(getState().grid.dusk['2026-02-18']).toBe('OL')
  })

  it('refuses to move a cell Raptor owns', () => {
    ingestFromRaptor('dusk', '2026-02-11', 'LL')
    expect(shiftBid('dusk', '2026-02-11', '2026-02-18')).toBe('raptor')
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
    expect(getState().grid.dusk?.['2026-02-18']).toBeUndefined()
  })

  it('refuses to move a cell that holds no bid', () => {
    expect(shiftBid('dusk', '2026-02-11', '2026-02-18')).toBe('nothing')
    setCell('dusk', '2026-02-11', 'CSE')
    expect(shiftBid('dusk', '2026-02-11', '2026-02-18')).toBe('nothing')
  })

  it('refuses to move a bid onto the date it is already on', () => {
    setCell('dusk', '2026-02-11', 'LL')
    expect(shiftBid('dusk', '2026-02-11', '2026-02-11')).toBe('occupied')
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
  })

  it('does not notify when a shift is refused', () => {
    setCell('dusk', '2026-02-11', 'LL')
    setCell('dusk', '2026-02-18', 'OL')
    const before = getVersion()
    shiftBid('dusk', '2026-02-11', '2026-02-18')
    expect(getVersion()).toBe(before)
  })

  it('persists across a reload', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin'); advanceStage()   // closed, so the shift leaves a trail
    setCell('dusk', '2026-02-11', 'LL')
    shiftBid('dusk', '2026-02-11', '2026-02-18')
    initStore(backend)
    expect(getState().states.dusk['2026-02-18'].shiftedFrom).toBe('2026-02-11')
  })

  // The single-cell mover obeys the same day law as the drag mover
  // (moveCells). Before the 27 Aug overnight pass none of this was checked
  // here: a member could slide their bid after bidding closed, and a typed
  // date could land a bid on a day no column renders — gone from every
  // screen, still draining the leave balance.
  it('a member cannot shift a bid once bidding has closed', () => {
    setCell('dusk', '2026-02-11', 'LL')
    setRole('admin'); advanceStage(); setRole('member')
    expect(shiftBid('dusk', '2026-02-11', '2026-02-18')).toBe('window')
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
    expect(getState().grid.dusk?.['2026-02-18']).toBeUndefined()
  })

  it('refuses a landing day the war has no column for', () => {
    setRole('admin')
    setCell('dusk', '2026-02-11', 'LL')
    advanceStage()
    expect(shiftBid('dusk', '2026-02-11', '2027-02-18')).toBe('window')
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
    expect(getState().grid.dusk?.['2027-02-18']).toBeUndefined()
  })

  // A bid moved 11 → 18 → 25 was still BID on the 11th; the trail answers
  // exactly that. Overwriting the origin with each hop would trace a
  // two-hop move to a date nobody asked for.
  it('a chain of closed-war shifts keeps the ORIGINAL origin in the trail', () => {
    setRole('admin'); advanceStage()
    setCell('dusk', '2026-02-11', 'LL')
    shiftBid('dusk', '2026-02-11', '2026-02-18')
    shiftBid('dusk', '2026-02-18', '2026-02-25')
    expect(getState().states.dusk['2026-02-25'].shiftedFrom).toBe('2026-02-11')
  })
})

describe('balances in the store', () => {
  it('boots with an opening figure for everyone and a ledger', () => {
    expect(Object.keys(getState().openings).length).toBe(getState().people.length)
    expect(getState().ledger.length).toBeGreaterThan(0)
  })

  it('persists and reloads both', () => {
    const backend = memoryBackend()
    initStore(backend)
    const openings = getState().openings
    const ledger = getState().ledger
    initStore(backend)
    expect(getState().openings).toEqual(openings)
    expect(getState().ledger).toEqual(ledger)
  })

  // Each shape is asserted against a seed-only value so a fallback to `{}`
  // or `[]` would not pass by accident.
  it.each([
    ['not json', 'not json'],
    ['an array', '[]'],
    ['a counter nobody defined', '{"ramp":{"holiday":5}}'],
    ['a figure that is not a number', '{"ramp":{"annual":"lots"}}'],
    // NaN is the dangerous one: it propagates silently through every sum it
    // touches, turning a whole column of balances into "NaN" with nothing to
    // say why. JSON has no NaN literal, so it arrives as null.
    ['a non-finite figure', '{"ramp":{"annual":null}}'],
  ])('falls back to the seeded openings when the backend holds %s', (_label, raw) => {
    const backend = memoryBackend()
    backend.write('openings', raw)
    initStore(backend)
    expect(getState().openings.ramp.annual).toBe(12)
  })

  it.each([
    ['not json', 'not json'],
    ['an object rather than a list', '{}'],
    ['an entry with no reason', '[{"id":"x","personId":"ramp","counter":"annual","amount":1,"date":"2026-01-01","approvedBy":"SQNCDR"}]'],
    ['an entry with no approver', '[{"id":"x","personId":"ramp","counter":"annual","amount":1,"date":"2026-01-01","reason":"top-up"}]'],
    ['an entry against an unknown counter', '[{"id":"x","personId":"ramp","counter":"holiday","amount":1,"date":"2026-01-01","reason":"r","approvedBy":"a"}]'],
  ])('falls back to the seeded ledger when the backend holds %s', (_label, raw) => {
    const backend = memoryBackend()
    backend.write('ledger', raw)
    initStore(backend)
    expect(getState().ledger.some(e => e.id === 'l1')).toBe(true)
  })

  it('keeps a well-formed stored ledger', () => {
    const backend = memoryBackend()
    backend.write('ledger', '[{"id":"x","personId":"ramp","counter":"oil","amount":2.5,"date":"2026-01-01","reason":"CNY","approvedBy":"SQNCDR"}]')
    initStore(backend)
    expect(getState().ledger).toEqual([
      { id: 'x', personId: 'ramp', counter: 'oil', amount: 2.5, date: '2026-01-01', reason: 'CNY', approvedBy: 'SQNCDR' },
    ])
  })
})

describe('more than one leave war', () => {
  it('boots with the first war on screen', () => {
    expect(getState().wars.length).toBeGreaterThan(1)
    expect(getState().currentId).toBe(getState().wars[0].period.id)
    expect(getState().period.name).toBe('JAN - DEC 26')
  })

  it('switches to another war, and the grid on screen switches with it', () => {
    const other = getState().wars[1].period.id
    selectWar(other)
    expect(getState().currentId).toBe(other)
    expect(getState().period.name).toBe('JAN - DEC 27')
    // The Jan–Mar leave is no longer what `grid` answers with.
    expect(getState().grid.ramp?.['2026-01-01']).toBeUndefined()
  })

  it('ignores a war that does not exist rather than blanking the screen', () => {
    const before = getState().currentId
    selectWar('no-such-war')
    expect(getState().currentId).toBe(before)
  })

  it('does not notify when asked to select the war already on screen', () => {
    const before = getVersion()
    selectWar(getState().currentId)
    expect(getVersion()).toBe(before)
  })

  it('remembers which war was on screen across a reload', () => {
    const backend = memoryBackend()
    initStore(backend)
    selectWar(getState().wars[1].period.id)
    const chosen = getState().currentId
    initStore(backend)
    expect(getState().currentId).toBe(chosen)
  })

  // Writes land in the war on screen and nowhere else. A cell written while
  // looking at Apr–Jun must not appear in Jan–Mar.
  // Admin, and that is not incidental. This test used to pass as a MEMBER
  // writing into a DRAFT war, because `setCell` checked neither stage nor
  // role — the edit lock lived only in the grid's click handler, so anything
  // calling the store directly walked straight past it. Adding the bidding
  // window put all three checks in the store and this test went red, which is
  // the tightening working rather than the test being wrong. Its own subject
  // — that a write lands in the war on screen — is unchanged.
  it('writes into the war on screen, leaving the others untouched', () => {
    setRole('admin')
    const [q1, q2] = getState().wars.map(w => w.period.id)
    selectWar(q2)
    setCell('dusk', '2027-04-20', 'LL')
    expect(getState().grid.dusk['2027-04-20']).toBe('LL')
    selectWar(q1)
    expect(getState().grid.dusk?.['2027-04-20']).toBeUndefined()
  })

  it('advances the stage of the war on screen only', () => {
    setRole('admin')          // advancing is admin-only (27 Aug 26)
    const [q1, q2] = getState().wars.map(w => w.period.id)
    selectWar(q2)
    advanceStage() // draft -> open
    expect(getState().period.stage).toBe('open')
    selectWar(q1)
    expect(getState().period.stage).toBe('open') // its own, unchanged
    advanceStage()
    expect(getState().period.stage).toBe('closed')
    selectWar(q2)
    expect(getState().period.stage).toBe('open')
  })
})

describe('creating a leave war', () => {
  beforeEach(() => {
    setRole('admin')
  })

  it('creates one over any span, down to a single month', () => {
    expect(createWar('JUL 28', '2028-07-01', '2028-07-31')).toBe('created')
    const made = getState().wars.find(w => w.period.name === 'JUL 28')!
    expect(made.period.days).toHaveLength(31)
    expect(made.grid).toEqual({})
  })

  // A new war starts in draft and is NOT switched to. Creating next
  // quarter's war should not yank the admin off the one they are working in.
  it('starts it in draft and leaves the current war on screen', () => {
    const before = getState().currentId
    createWar('JUL 28', '2028-07-01', '2028-07-31')
    expect(getState().currentId).toBe(before)
    expect(getState().wars.find(w => w.period.name === 'JUL 28')!.period.stage).toBe('draft')
  })

  // A date belongs to at most one war, or a person could hold leave on it
  // twice over and the manning counts would count him away twice.
  it('refuses a span that overlaps a war that already exists', () => {
    const before = getState().wars.length
    expect(createWar('CLASH', '2026-03-15', '2026-05-15')).toBe('overlap')
    expect(getState().wars).toHaveLength(before)
  })

  it('allows a span that begins the day after another ends', () => {
    expect(createWar('JUL 28', '2028-07-01', '2028-07-31')).toBe('created')
  })

  it('refuses a range that ends before it starts', () => {
    expect(createWar('BACKWARDS', '2028-07-31', '2028-07-01')).toBe('backwards')
    expect(getState().wars.every(w => w.period.name !== 'BACKWARDS')).toBe(true)
  })

  it('refuses a war with no name', () => {
    expect(createWar('   ', '2028-07-01', '2028-07-31')).toBe('unnamed')
  })

  // Creating a leave war is an admin act. A member has no business making
  // one, and the store says so rather than relying on the button being
  // hidden — the switch that hides it is unguarded.
  it('refuses a member, not just hides the button', () => {
    setRole('member')
    expect(createWar('JUL 28', '2028-07-01', '2028-07-31')).toBe('forbidden')
    expect(getState().wars.every(w => w.period.name !== 'JUL 28')).toBe(true)
  })

  it('gives every war a distinct id, even for two wars named alike', () => {
    createWar('JUL 28', '2028-07-01', '2028-07-31')
    createWar('JUL 28', '2028-08-01', '2028-08-31')
    const ids = getState().wars.map(w => w.period.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('persists a new war across a reload', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    createWar('JUL 28', '2028-07-01', '2028-07-31')
    initStore(backend)
    expect(getState().wars.some(w => w.period.name === 'JUL 28')).toBe(true)
  })

  it('does not notify when a creation is refused', () => {
    const before = getVersion()
    createWar('CLASH', '2026-03-15', '2026-05-15')
    expect(getVersion()).toBe(before)
  })
})

describe('reading stored wars', () => {
  const stored = (...wars: unknown[]) => JSON.stringify(wars)
  const war = (id: string, start: string, end: string) => makeWar(id, id.toUpperCase(), start, end)

  it('keeps a well-formed pair', () => {
    const backend = memoryBackend()
    backend.write('wars', stored(war('a', '2026-01-01', '2026-03-31'), war('b', '2026-04-01', '2026-06-30')))
    initStore(backend)
    expect(getState().wars.map(w => w.period.id)).toEqual(['a', 'b'])
  })

  // The one shape nothing downstream can resolve: two wars claiming the same
  // day. `warHolding` would answer with whichever came first, and a person
  // could hold leave on that date twice over. Reject the blob entire rather
  // than pick a winner.
  it('rejects two wars that share a day, falling back to the seed', () => {
    const backend = memoryBackend()
    backend.write('wars', stored(war('a', '2026-01-01', '2026-03-31'), war('b', '2026-03-31', '2026-06-30')))
    initStore(backend)
    expect(getState().wars.map(w => w.period.id)).toEqual(['y2026', 'y2027'])
  })

  it('rejects two wars sharing an id', () => {
    const backend = memoryBackend()
    backend.write('wars', stored(war('a', '2026-01-01', '2026-03-31'), war('a', '2026-04-01', '2026-06-30')))
    initStore(backend)
    expect(getState().wars.map(w => w.period.id)).toEqual(['y2026', 'y2027'])
  })

  it.each([
    ['an empty list', '[]'],
    ['not a list', '{}'],
    ['a war that is not an object', '["nope"]'],
  ])('rejects %s, falling back to the seed', (_label, raw) => {
    const backend = memoryBackend()
    backend.write('wars', raw)
    initStore(backend)
    expect(getState().wars).toHaveLength(2)
    expect(getState().period.name).toBe('JAN - DEC 26')
  })

  it('rejects a war whose stage is not one of the cycle', () => {
    const backend = memoryBackend()
    const w = war('a', '2026-01-01', '2026-03-31') as unknown as { period: Record<string, unknown> }
    w.period.stage = 'reopened'
    backend.write('wars', stored(w))
    initStore(backend)
    expect(getState().period.name).toBe('JAN - DEC 26')
  })

  it('rejects a war whose range runs backwards', () => {
    const backend = memoryBackend()
    const w = war('a', '2026-01-01', '2026-03-31') as unknown as { period: Record<string, unknown> }
    w.period.end = '2025-12-01'
    backend.write('wars', stored(w))
    initStore(backend)
    expect(getState().period.name).toBe('JAN - DEC 26')
  })

  // A day carries events, a blocked flag and its reason — facts the date
  // range cannot regenerate. They are stored in full and must survive, or a
  // scheduler loses their exercise week on every reload.
  it('keeps each day’s events, blocked flag and reason', () => {
    const backend = memoryBackend()
    initStore(backend)
    // A WRITE is what saves. Without one, `initStore` twice over just seeds
    // twice and never round-trips through storage at all — which is how the
    // first draft of this test passed against a loader that discarded every
    // day.
    setCell('ramp', '2026-01-20', 'LL')
    initStore(backend)
    expect(getState().grid.ramp['2026-01-20']).toBe('LL')
    const blocked = getState().period.days.find(d => d.date === '2026-03-10')!
    expect(blocked.blocked).toBe(true)
    expect(blocked.blockedReason).toBe('Exercise week')
    expect(getState().period.days.find(d => d.date === '2026-01-01')!.ph).toBe(true)
  })
})

describe('the bidding window', () => {
  beforeEach(() => {
    initStore(memoryBackend())
  })

  // The seed opens the year on its first quarter, so the window is real from
  // the first screen rather than a feature nobody can see until they set one.
  it('seeds the current war with bidding open on the first quarter', () => {
    expect(getState().period.bidFrom).toBe('2026-01-01')
    expect(getState().period.bidTo).toBe('2026-03-31')
  })

  it('lets a member write inside the window', () => {
    setCell('ramp', '2026-02-11', 'LL')
    expect(getState().grid.ramp['2026-02-11']).toBe('LL')
  })

  // The store is what makes the lock true. The grid hides an unopenable cell,
  // but anything calling the store directly — a keyboard path, a future sync,
  // a test — has to hit the same wall.
  it('refuses a member writing outside the window, silently and without a version bump', () => {
    const before = getVersion()
    setCell('ramp', '2026-08-11', 'LL')
    expect(getState().grid.ramp?.['2026-08-11']).toBeUndefined()
    expect(getVersion()).toBe(before)
  })

  it('lets an admin write outside the window', () => {
    setRole('admin')
    setCell('ramp', '2026-08-11', 'LL')
    expect(getState().grid.ramp['2026-08-11']).toBe('LL')
  })

  it('moves the window, and the member follows it', () => {
    setRole('admin')
    expect(setBidWindow('2026-07-01', '2026-09-30')).toBe('set')
    setRole('member')
    setCell('ramp', '2026-08-11', 'LL')
    expect(getState().grid.ramp['2026-08-11']).toBe('LL')
    setCell('ramp', '2026-02-11', 'OL')
    expect(getState().grid.ramp?.['2026-02-11']).toBeUndefined()
  })

  it('refuses a window a member tries to set', () => {
    expect(setBidWindow('2026-07-01', '2026-09-30')).toBe('forbidden')
    expect(getState().period.bidFrom).toBe('2026-01-01')
  })

  it('refuses a window that leaves the war, and one that runs backwards', () => {
    setRole('admin')
    expect(setBidWindow('2025-12-01', '2026-03-31')).toBe('outside')
    expect(setBidWindow('2026-11-01', '2027-02-01')).toBe('outside')
    expect(setBidWindow('2026-09-30', '2026-07-01')).toBe('backwards')
    // Refused means UNCHANGED, not partly applied.
    expect(getState().period.bidFrom).toBe('2026-01-01')
    expect(getState().period.bidTo).toBe('2026-03-31')
  })

  it('clears the window, opening the whole war again', () => {
    setRole('admin')
    expect(clearBidWindow()).toBe('set')
    setRole('member')
    setCell('ramp', '2026-08-11', 'LL')
    expect(getState().grid.ramp['2026-08-11']).toBe('LL')
  })

  it('belongs to the war, not to the app', () => {
    setRole('admin')
    setBidWindow('2026-07-01', '2026-09-30')
    const [, y27] = getState().wars.map(w => w.period.id)
    selectWar(y27)
    expect(getState().period.bidFrom).toBeNull()
    expect(getState().wars[0].period.bidFrom).toBe('2026-07-01')
  })

  it('survives a reload', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    setBidWindow('2026-07-01', '2026-09-30')
    initStore(backend)
    expect(getState().period.bidFrom).toBe('2026-07-01')
    expect(getState().period.bidTo).toBe('2026-09-30')
  })

  // A war written before the window existed has neither key. Reading it as
  // "the whole period is open" is what that war actually did, and rejecting
  // it would throw away a squadron's grid over a field that did not exist
  // when it was saved. Everything else in this loader degrades to the seed;
  // this one field is deliberately lenient, so it gets its own test.
  it('reads a stored war with no window at all as fully open', () => {
    const backend = memoryBackend()
    const war = makeWar('old', 'OLD', '2026-01-01', '2026-12-31')
    const { bidFrom: _f, bidTo: _t, ...periodWithoutWindow } = war.period
    backend.write('wars', JSON.stringify([{ ...war, period: { ...periodWithoutWindow, stage: 'open' } }]))
    backend.write('current', JSON.stringify('old'))
    initStore(backend)

    expect(getState().period.id).toBe('old')
    expect(getState().period.bidFrom).toBeNull()
    setCell('ramp', '2026-08-11', 'LL')
    expect(getState().grid.ramp['2026-08-11']).toBe('LL')
  })

  // Present but nonsense is corruption, not an older shape, and falls back to
  // the seed like every other malformed field here.
  it('rejects a stored window that leaves its own war', () => {
    const backend = memoryBackend()
    const war = makeWar('bad', 'BAD', '2026-01-01', '2026-12-31')
    war.period.bidFrom = '2025-01-01'
    backend.write('wars', JSON.stringify([war]))
    backend.write('current', JSON.stringify('bad'))
    initStore(backend)
    expect(getState().wars.map(w => w.period.id)).toEqual(['y2026', 'y2027'])
  })
})

describe('writing leave over a range', () => {
  beforeEach(() => {
    initStore(memoryBackend())
  })

  // The owner's ask: a fortnight of leave should be one selection, not
  // fourteen taps on fourteen cells.
  it('writes the same code across every day in the span', () => {
    const { written, skipped } = setCellRange('dusk', '2026-02-09', '2026-02-20', 'LL')
    expect(written).toBe(12)
    expect(skipped).toBe(0)
    for (let d = 9; d <= 20; d++) {
      expect(getState().grid.dusk[`2026-02-${String(d).padStart(2, '0')}`]).toBe('LL')
    }
    expect(getState().grid.dusk?.['2026-02-08']).toBeUndefined()
    expect(getState().grid.dusk?.['2026-02-21']).toBeUndefined()
  })

  it('gives every day in the span its own pending state', () => {
    setCellRange('dusk', '2026-02-09', '2026-02-11', 'LL')
    for (const d of ['2026-02-09', '2026-02-10', '2026-02-11']) {
      expect(getState().states.dusk[d]?.state).toBe('pending')
    }
  })

  it('writes both ends of the span, inclusive', () => {
    setCellRange('dusk', '2026-02-09', '2026-02-11', 'LL')
    expect(getState().grid.dusk['2026-02-09']).toBe('LL')
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
  })

  it('writes a single day when both ends are the same', () => {
    expect(setCellRange('dusk', '2026-02-09', '2026-02-09', 'LL').written).toBe(1)
  })

  it('writes nothing at all for a backwards span', () => {
    const before = getVersion()
    expect(setCellRange('dusk', '2026-02-20', '2026-02-09', 'LL')).toEqual({ written: 0, skipped: 0 })
    expect(getVersion()).toBe(before)
  })

  // ONE notify for the whole range, not one per day. Without this a fortnight
  // is fourteen re-renders and every subscriber watches the range being
  // written a day at a time.
  it('notifies once for the whole span', () => {
    const fn = vi.fn()
    subscribe(fn)
    setCellRange('dusk', '2026-02-09', '2026-02-20', 'LL')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('saves the whole span, not only the last day of it', () => {
    const backend = memoryBackend()
    initStore(backend)
    setCellRange('dusk', '2026-02-09', '2026-02-11', 'LL')
    initStore(backend)
    for (const d of ['2026-02-09', '2026-02-10', '2026-02-11']) {
      expect(getState().grid.dusk[d]).toBe('LL')
    }
  })

  // PARTIAL BY DESIGN. Refusing the whole range would make the common case —
  // a fortnight that happens to include one locked day — impossible to ask
  // for at all, so it writes what it may and reports what it did not.
  it('writes up to the edge of the bidding window and reports the rest', () => {
    const { written, skipped } = setCellRange('dusk', '2026-03-29', '2026-04-04', 'LL')
    expect(written).toBe(3) // 29, 30, 31 March
    expect(skipped).toBe(4) // 1-4 April, outside the window
    expect(getState().grid.dusk['2026-03-31']).toBe('LL')
    expect(getState().grid.dusk?.['2026-04-01']).toBeUndefined()
  })

  it('skips a cell Raptor owns and writes around it', () => {
    setRole('admin')
    const { written, skipped } = setCellRange('tata', '2026-01-08', '2026-01-10', 'LL')
    expect(skipped).toBe(1)
    expect(written).toBe(2)
    // Raptor's own OIL on the 9th is untouched.
    expect(getState().grid.tata['2026-01-09']).toBe('OIL')
    expect(getState().grid.tata['2026-01-08']).toBe('LL')
  })

  // SWITCHER is posted out on 2026-01-12. Bidding leave for a man who has
  // left is a data-entry accident, not a bid.
  it('skips days outside a person\'s time in the squadron', () => {
    const { written, skipped } = setCellRange('switcher', '2026-01-10', '2026-01-15', 'LL')
    expect(written).toBe(3) // 10, 11, 12
    expect(skipped).toBe(3) // 13, 14, 15 — posted out
    expect(getState().grid.switcher?.['2026-01-13']).toBeUndefined()
  })

  it('writes nothing and notifies nobody when every day is refused', () => {
    const before = getVersion()
    const { written, skipped } = setCellRange('dusk', '2026-06-01', '2026-06-05', 'LL')
    expect(written).toBe(0)
    expect(skipped).toBe(5)
    expect(getVersion()).toBe(before)
  })

  // The batching flag is released in a `finally`, so a throw mid-range cannot
  // leave the store permanently silent. Asserted by writing again afterwards.
  it('goes on notifying after a range that wrote nothing', () => {
    setCellRange('dusk', '2026-06-01', '2026-06-05', 'LL')
    const fn = vi.fn()
    subscribe(fn)
    setCell('dusk', '2026-02-09', 'LL')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('clears a whole span when given an empty code', () => {
    setCellRange('dusk', '2026-02-09', '2026-02-11', 'LL')
    setCellRange('dusk', '2026-02-09', '2026-02-11', '')
    for (const d of ['2026-02-09', '2026-02-10', '2026-02-11']) {
      expect(getState().grid.dusk?.[d]).toBeUndefined()
    }
  })
})

describe('editing the roster', () => {
  beforeEach(() => {
    initStore(memoryBackend())
  })

  it('refuses a member', () => {
    expect(setPerson('tata', { seat: 'wso' })).toBe(false)
    expect(getState().people.find(p => p.id === 'tata')!.seat).toBe('pilot')
  })

  it('changes seat, band and SXO for an admin', () => {
    setRole('admin')
    expect(setPerson('tata', { seat: 'wso', band: 'ops', sxo: true })).toBe(true)
    const tata = getState().people.find(p => p.id === 'tata')!
    expect(tata).toMatchObject({ seat: 'wso', band: 'ops', sxo: true })
  })

  it('ignores a person who does not exist, without notifying', () => {
    setRole('admin')
    const before = getVersion()
    expect(setPerson('nobody', { sxo: true })).toBe(false)
    expect(getVersion()).toBe(before)
  })

  it('leaves everyone else untouched', () => {
    setRole('admin')
    const others = getState().people.filter(p => p.id !== 'tata').map(p => ({ ...p }))
    setPerson('tata', { sxo: true })
    expect(getState().people.filter(p => p.id !== 'tata')).toEqual(others)
  })

  /* Since the sync wires the roster is a PROJECTION of Raptor's PEOPLE
     (state/raptorRoster.ts), installed by main.tsx via setPeople on every
     boot and deliberately not persisted — the same reasoning as the role at
     the merge: a stored copy could only ever disagree with the roster Raptor
     is actually flying. These pin the non-persistence both ways, exactly as
     the role tests do: an edit does not survive a re-boot, and a stored
     roster (a leftover from the standalone app, or a hand edit) is ignored. */
  it('edits in session, but a re-boot returns to the seed — the roster is not persisted', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    setPerson('tata', { seat: 'wso', sxo: true })
    expect(getState().people.find(p => p.id === 'tata')).toMatchObject({ seat: 'wso', sxo: true })
    initStore(backend)
    expect(getState().people.find(p => p.id === 'tata')).toMatchObject({ seat: 'pilot', sxo: false })
  })

  it('ignores a stored roster entirely', () => {
    const backend = memoryBackend()
    backend.write('people', JSON.stringify([
      { id: 'solo', callsign: 'SOLO', seat: 'wso', band: 'instructor', sxo: true, from: null, to: null },
    ]))
    initStore(backend)
    expect(getState().people.length).toBeGreaterThan(10)
    expect(getState().people.find(p => p.id === 'solo')).toBeUndefined()
    expect(getState().people.find(p => p.id === 'tata')).toBeTruthy()
  })

  it('setPeople replaces the roster without persisting it', () => {
    const backend = memoryBackend()
    initStore(backend)
    setPeople([
      { id: 'solo', callsign: 'SOLO', seat: 'wso', band: 'instructor', sxo: true, from: null, to: null },
    ])
    expect(getState().people.map(p => p.id)).toEqual(['solo'])
    initStore(backend)
    expect(getState().people.find(p => p.id === 'tata')).toBeTruthy()
  })
})

// Owner, 10 Aug 26: "as an admin I can open bidding again after closing it".
describe('reopening a period', () => {
  it('steps an admin back from closed to open', () => {
    setRole('admin')
    advanceStage()
    expect(getState().period.stage).toBe('closed')
    expect(reopenStage()).toBe(true)
    expect(getState().period.stage).toBe('open')
  })

  it('lets an admin walk all the way back to draft', () => {
    setRole('admin')
    advanceStage()
    advanceStage()
    expect(getState().period.stage).toBe('published')
    reopenStage()
    reopenStage()
    expect(getState().period.stage).toBe('open')
    reopenStage()
    expect(getState().period.stage).toBe('draft')
  })

  it('stops at draft rather than falling off the beginning', () => {
    setRole('admin')
    reopenStage()
    expect(getState().period.stage).toBe('draft')
    expect(reopenStage()).toBe(false)
    expect(getState().period.stage).toBe('draft')
  })

  // The refusal lives at the write, not only in the strip that hides the
  // button: the role switch is an affordance, so anything reachable from a
  // console has to be refused here too.
  it('refuses a member even though nothing hides the call from them', () => {
    setRole('admin')          // an admin closes the war (advancing is admin-only)…
    advanceStage()
    setRole('member')         // …and a member still may not step it back
    expect(getState().role).toBe('member')
    expect(getState().period.stage).toBe('closed')
    expect(reopenStage()).toBe(false)
    expect(getState().period.stage).toBe('closed')
  })

  // The whole reason reopening is safe enough to allow. Reopening changes
  // what may happen next; it must rewrite nothing that already happened, or
  // an admin reopening to catch one late input would silently undo every
  // decision already made.
  it('leaves every decision exactly as it was', () => {
    setRole('admin')
    advanceStage()
    setBidState('asics', '2026-01-23', 'approved')
    setBidState('jaguar', '2026-01-19', 'refused')
    reopenStage()
    expect(getState().period.stage).toBe('open')
    expect(getState().states.asics['2026-01-23'].state).toBe('approved')
    expect(getState().states.jaguar['2026-01-19'].state).toBe('refused')
  })

  it('leaves the grid and the bidding window alone', () => {
    setRole('admin')
    const grid = JSON.stringify(getState().grid)
    const window = [getState().period.bidFrom, getState().period.bidTo]
    advanceStage()
    reopenStage()
    expect(JSON.stringify(getState().grid)).toBe(grid)
    expect([getState().period.bidFrom, getState().period.bidTo]).toEqual(window)
  })

  it('survives a reload, like every other stage change', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    advanceStage()
    reopenStage()
    initStore(backend)
    expect(getState().period.stage).toBe('open')
  })

  // Wars are independent: reopening the one on screen must not walk another
  // war's cycle back with it.
  it('moves only the war on screen', () => {
    setRole('admin')
    const other = getState().wars.find(w => w.period.id !== getState().period.id)!
    const before = other.period.stage
    advanceStage()
    reopenStage()
    expect(getState().wars.find(w => w.period.id === other.period.id)!.period.stage).toBe(before)
  })
})

describe('events — ranged repeat, merged bands, and the type library', () => {
  it('repeats a word across a range on one line (admin only)', () => {
    setRole('admin')
    expect(setDayEventRange('2026-01-05', '2026-01-07', 0, 'SC')).toBe(true)
    const on = (d: string) => getState().period.days.find(x => x.date === d)!.events[0]
    expect(on('2026-01-05')).toBe('SC')
    expect(on('2026-01-06')).toBe('SC')
    expect(on('2026-01-07')).toBe('SC')
    expect(on('2026-01-08')).toBe('')
  })

  it('refuses a range write for a member', () => {
    setRole('member')
    expect(setDayEventRange('2026-01-05', '2026-01-07', 0, 'SC')).toBe(false)
    expect(getState().period.days.find(x => x.date === '2026-01-05')!.events[0]).toBe('')
  })

  it('an admin can add and remove event rows (owner, 18 Aug 26)', () => {
    setRole('admin')
    expect(getState().eventRows).toBe(2)
    expect(addEventRow()).toBe(true)
    expect(getState().eventRows).toBe(3)
    // a write into the new (third) row grows the day array on demand
    expect(setDayEvent('2026-01-05', 2, 'Trial')).toBe(true)
    expect(getState().period.days.find(x => x.date === '2026-01-05')!.events[2]).toBe('Trial')
    // the row is in use, so removing it is refused rather than losing the word
    expect(removeEventRow()).toBe('nonempty')
    expect(getState().eventRows).toBe(3)
    // clear it, then it removes
    setDayEvent('2026-01-05', 2, '')
    expect(removeEventRow()).toBe('removed')
    expect(getState().eventRows).toBe(2)
    // never below the default two
    expect(removeEventRow()).toBe('min')
  })

  it('the remove guard sees EVERY war, not only the open one (review fix, 19 Aug 26)', () => {
    setRole('admin')
    expect(addEventRow()).toBe(true)                       // rows: 3, squadron-wide
    const home = getState().currentId
    expect(createWar('JUL 28', '2028-07-01', '2028-07-31')).toBe('created')
    // by the created id, not "any other war" — the seed already holds several
    const other = 'war-2028-07-01-2028-07-31'
    selectWar(other)
    expect(setDayEvent('2028-07-06', 2, 'Exercise')).toBe(true)
    selectWar(home)
    // the open war's line 2 is empty, but 2028's is not — the row must stay
    expect(eventRowUsed(2)).toBe(true)
    expect(removeEventRow()).toBe('nonempty')
    expect(getState().eventRows).toBe(3)
    // clear the OTHER war's word and the remove goes through
    selectWar(other)
    setDayEvent('2028-07-06', 2, '')
    selectWar(home)
    expect(eventRowUsed(2)).toBe(false)
    expect(removeEventRow()).toBe('removed')
    expect(getState().eventRows).toBe(2)
  })

  it('caps the row count and gates both writers to admin', () => {
    setRole('admin')
    for (let i = 2; i < MAX_EVENT_ROWS; i++) expect(addEventRow()).toBe(true)
    expect(getState().eventRows).toBe(MAX_EVENT_ROWS)
    expect(addEventRow()).toBe(false)          // at the cap
    setRole('member')
    expect(addEventRow()).toBe(false)
    expect(removeEventRow()).toBe('forbidden')
    expect(getState().eventRows).toBe(MAX_EVENT_ROWS)
  })

  it('adds a merged band and clears the per-day text under it', () => {
    setRole('admin')
    setDayEvent('2026-01-06', 0, 'stale')
    expect(addEventBand(0, '2026-01-05', '2026-01-09', 'Exercise')).toBe('set')
    const band = getState().period.bands.find(b => b.line === 0 && b.from === '2026-01-05')
    expect(band).toMatchObject({ line: 0, from: '2026-01-05', to: '2026-01-09', text: 'Exercise' })
    // the word that sat under the band is gone, so a later delete cannot resurrect it
    expect(getState().period.days.find(x => x.date === '2026-01-06')!.events[0]).toBe('')
  })

  it('refuses an overlapping band on the same line', () => {
    setRole('admin')
    expect(addEventBand(0, '2026-01-05', '2026-01-09', 'A')).toBe('set')
    expect(addEventBand(0, '2026-01-08', '2026-01-12', 'B')).toBe('overlap')
    // the other line is free
    expect(addEventBand(1, '2026-01-08', '2026-01-12', 'B')).toBe('set')
  })

  it('refuses a band outside the war, backwards, or for a member', () => {
    setRole('admin')
    expect(addEventBand(0, '2026-01-09', '2026-01-05', 'x')).toBe('backwards')
    expect(addEventBand(0, '2025-12-01', '2026-01-05', 'x')).toBe('outside')
    setRole('member')
    expect(addEventBand(0, '2026-01-05', '2026-01-09', 'x')).toBe('forbidden')
  })

  it('a repeat write skips days already under a band', () => {
    setRole('admin')
    addEventBand(0, '2026-01-05', '2026-01-07', 'Exercise')
    setDayEventRange('2026-01-05', '2026-01-09', 0, 'SC')
    const on = (d: string) => getState().period.days.find(x => x.date === d)!.events[0]
    expect(on('2026-01-06')).toBe('') // under the band, untouched
    expect(on('2026-01-08')).toBe('SC') // free, written
  })

  it('removes a band by the line and a covered date', () => {
    setRole('admin')
    addEventBand(0, '2026-01-05', '2026-01-09', 'Exercise')
    expect(removeEventBand(0, '2026-01-07')).toBe(true)
    expect(getState().period.bands).toHaveLength(0)
    expect(removeEventBand(0, '2026-01-07')).toBe(false)
  })

  it('bands and event types survive a reload', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    addEventBand(0, '2026-01-05', '2026-01-09', 'Exercise')
    addEventType('Standby', 'work')
    initStore(backend)
    expect(getState().period.bands).toHaveLength(1)
    expect(getState().period.bands[0]).toMatchObject({ text: 'Exercise' })
    expect(getState().eventDefs.some(d => d.name === 'Standby')).toBe(true)
  })

  it('boots with the three seeded event types', () => {
    expect(getState().eventDefs).toEqual([
      { name: 'PH', kind: 'off' },
      { name: 'No Leave', kind: 'nolv' },
      { name: 'SC', kind: 'work' },
    ])
  })

  it('adds, updates, removes and resets event types (admin only)', () => {
    setRole('admin')
    expect(addEventType('Standby', 'work')).toBeNull()
    expect(getState().eventDefs).toHaveLength(4)
    expect(updateEventType(3, { kind: 'off' })).toBeNull()
    expect(getState().eventDefs[3]!.kind).toBe('off')
    expect(removeEventType(3)).toBe(true)
    expect(getState().eventDefs).toHaveLength(3)
    // reset restores the seed
    addEventType('Temp', 'off')
    resetEventTypes()
    expect(getState().eventDefs).toHaveLength(3)
  })

  it('refuses type edits for a member', () => {
    setRole('member')
    expect(addEventType('Standby', 'work')).toContain('admin')
    expect(removeEventType(0)).toBe(false)
    expect(getState().eventDefs).toHaveLength(3)
  })
})

// The manning amber/red lines are the squadron's own (owner, 19 Aug 26 —
// "when does the amber show or red show… is customisable"). The rules are
// whole data now (`manningdefs`); the old `manningthresh` overlay is read at
// boot as a migration, which the corrupt-blob test below still exercises.
describe('the manning thresholds are editable, admin-gated and persisted', () => {
  it('a member cannot move a line', () => {
    expect(setManningThreshold('sets', 6, 5)).toBe(false)
    expect(getState().requirements.default.rules.find(r => r.id === 'sets')!.threshold).toEqual({ amber: 5, red: 4.5 })
  })

  it('an admin moves a line and the derived requirements follow, sets included', () => {
    setRole('admin')
    expect(setManningThreshold('sets', 6, 5)).toBe(true)
    expect(getState().requirements.default.rules.find(r => r.id === 'sets')!.threshold).toEqual({ amber: 6, red: 5 })
    expect(setManningThreshold('scd', 2, 2)).toBe(true)
    expect(getState().requirements.default.rules.find(r => r.id === 'scd')!.threshold).toEqual({ amber: 2, red: 2 })
    // The rule's words are code-owned and survive the overlay untouched.
    expect(getState().requirements.default.rules.find(r => r.id === 'scd')!.desc).toBeTruthy()
  })

  it('refuses malformed numbers and unknown rows, accepts the no-amber-band decision', () => {
    setRole('admin')
    expect(setManningThreshold('ip', NaN, 1)).toBe(false)
    expect(setManningThreshold('ip', -1, 1)).toBe(false)
    expect(setManningThreshold('ip', 2, Infinity)).toBe(false)
    expect(setManningThreshold('nosuchrow', 2, 1)).toBe(false)
    expect(getState().requirements.default.rules.find(r => r.id === 'ip')!.threshold).toEqual({ amber: 3, red: 2 })
    // Amber at or under red is a decision (no amber band), not corruption.
    expect(setManningThreshold('ip', 1, 4)).toBe(true)
  })

  it('a saved line survives a reload; reset returns the seeded default', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    setManningThreshold('flp', 3, 2)
    initStore(backend)
    expect(getState().requirements.default.rules.find(r => r.id === 'flp')!.threshold).toEqual({ amber: 3, red: 2 })
    setRole('admin')
    resetManningThreshold('flp')
    expect(getState().requirements.default.rules.find(r => r.id === 'flp')!.threshold).toEqual({ amber: 0, red: 0 })
    initStore(backend)
    expect(getState().requirements.default.rules.find(r => r.id === 'flp')!.threshold).toEqual({ amber: 0, red: 0 })
  })

  it('a member cannot reset either', () => {
    setRole('admin')
    setManningThreshold('ip', 5, 4)
    setRole('member')
    resetManningThreshold('ip')
    expect(getState().requirements.default.rules.find(r => r.id === 'ip')!.threshold).toEqual({ amber: 5, red: 4 })
  })

  it('a corrupt stored blob degrades to the defaults instead of crashing', () => {
    const backend = memoryBackend()
    backend.write('manningthresh', JSON.stringify({ ip: { amber: 'six', red: 2 }, sets: { amber: 7, red: 6 } }))
    initStore(backend)
    // The bad entry is dropped; the good one beside it still applies.
    expect(getState().requirements.default.rules.find(r => r.id === 'ip')!.threshold).toEqual({ amber: 3, red: 2 })
    expect(getState().requirements.default.rules.find(r => r.id === 'sets')!.threshold).toEqual({ amber: 7, red: 6 })
  })
})

// The counters as data (owner, 19 Aug 26): built, reworked and deleted by an
// admin, refused from anyone else, persisted whole, and validated on the way
// in BY THE SAME READER the boot uses — so nothing can be saved that a reload
// would drop.
describe('custom manning counters', () => {
  const nvgRule = () => ({
    id: 'nvg-pilots',
    label: 'NVG PILOTS',
    count: { kind: 'people' as const, filter: { seats: ['pilot' as const], quals: ['nvg'] } },
    threshold: { amber: 2, red: 1 },
  })

  it('a member cannot save, delete or reset', () => {
    expect(saveManningRule(nvgRule())).toBe(false)
    expect(deleteManningRule('ip')).toBe(false)
    const before = getState().requirements.default.rules.length
    resetManningRules()
    expect(getState().requirements.default.rules.length).toBe(before)
  })

  it('an admin adds a counter and it joins the row set, at the end', () => {
    setRole('admin')
    expect(saveManningRule(nvgRule())).toBe(true)
    const ids = orderedManningIds()
    expect(ids[ids.length - 1]).toBe('nvg-pilots')
    expect(getState().requirements.default.rules.find(r => r.id === 'nvg-pilots')!.label).toBe('NVG PILOTS')
  })

  it('saving an existing id reworks the rule in place — position kept', () => {
    setRole('admin')
    const before = orderedManningIds()
    expect(saveManningRule({ ...nvgRule(), id: 'ip', label: 'IP (NVG)' })).toBe(true)
    expect(orderedManningIds()).toEqual(before)
    const ip = getState().requirements.default.rules.find(r => r.id === 'ip')!
    expect(ip.label).toBe('IP (NVG)')
    // A rework drops the seeded hand words — the sheet writes fresh ones
    // from the definition, so the words can never describe the old rule.
    expect(ip.desc).toBeUndefined()
  })

  it('refuses a malformed rule whole — the reader is the validator', () => {
    setRole('admin')
    expect(saveManningRule({ ...nvgRule(), threshold: { amber: -1, red: 0 } })).toBe(false)
    expect(saveManningRule({ ...nvgRule(), label: '' })).toBe(false)
    const bad: any = { ...nvgRule(), count: { kind: 'team', slots: [] } }
    expect(saveManningRule(bad)).toBe(false)
    const sevenSlots: any = { ...nvgRule(), count: { kind: 'team', slots: Array.from({ length: 7 }, () => ({ count: 1, filter: {} })) } }
    expect(saveManningRule(sevenSlots)).toBe(false)
    expect(getState().requirements.default.rules.some(r => r.id === 'nvg-pilots')).toBe(false)
  })

  it('deletes a counter — the seeded ones included — and its order/hidden entries with it', () => {
    setRole('admin')
    moveManningRow('scd', -1)
    toggleManningRow('scd')
    expect(deleteManningRule('scd')).toBe(true)
    expect(getState().requirements.default.rules.some(r => r.id === 'scd')).toBe(false)
    expect(getState().manningOrder).not.toContain('scd')
    expect(getState().manningHidden).not.toContain('scd')
    expect(deleteManningRule('scd')).toBe(false)
  })

  it('custom counters and deletions survive a reload; a corrupt blob falls back to the seed', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    saveManningRule(nvgRule())
    deleteManningRule('wmp')
    initStore(backend)
    expect(getState().requirements.default.rules.some(r => r.id === 'nvg-pilots')).toBe(true)
    expect(getState().requirements.default.rules.some(r => r.id === 'wmp')).toBe(false)

    const broken = memoryBackend()
    broken.write('manningdefs', '{"not":"a list"}')
    initStore(broken)
    expect(getState().requirements.default.rules.length).toBe(seedRequirements().default.rules.length)
  })

  it('a stored rule set wins over the legacy threshold overlay; the overlay migrates when no set is stored', () => {
    const legacy = memoryBackend()
    legacy.write('manningthresh', JSON.stringify({ ip: { amber: 9, red: 8 } }))
    initStore(legacy)
    // Migration: the seed with the old numbers laid on.
    expect(getState().requirements.default.rules.find(r => r.id === 'ip')!.threshold).toEqual({ amber: 9, red: 8 })
    // The first persist writes `manningdefs`; from then on the overlay is
    // inert — even one pointing at different numbers.
    setRole('admin')
    setManningThreshold('ip', 4, 3)
    legacy.write('manningthresh', JSON.stringify({ ip: { amber: 9, red: 8 } }))
    initStore(legacy)
    expect(getState().requirements.default.rules.find(r => r.id === 'ip')!.threshold).toEqual({ amber: 4, red: 3 })
  })

  it('deleting EVERY counter is a decision that survives a reload — the seed does not resurrect', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    for (const id of getState().requirements.default.rules.map(r => r.id)) deleteManningRule(id)
    expect(getState().requirements.default.rules).toEqual([])
    initStore(backend)
    expect(getState().requirements.default.rules).toEqual([])
  })

  it('reset puts the whole built-in set back, admin only', () => {
    setRole('admin')
    saveManningRule(nvgRule())
    deleteManningRule('sets')
    resetManningRules()
    const ids = getState().requirements.default.rules.map(r => r.id)
    expect(ids).toEqual(seedRequirements().default.rules.map(r => r.id))
  })

  it('the qual catalogue installs through its setter and starts on the seed three', () => {
    expect(getState().qualCatalog.map(q => q.k)).toEqual(['sxo', 'scDay', 'scNight'])
    setQualCatalog([{ k: 'nvg', label: 'NVG' }])
    expect(getState().qualCatalog.map(q => q.k)).toEqual(['nvg'])
  })
})

// The whole war is session-only (owner, 19 Aug 26): a fresh session forgets
// everything, the manning counters included — a counter built or deleted does
// not survive a reload, matching Raptor's own session-only INPUTS.
describe('session-only counters', () => {
  it('a store booted on a fresh session keeps neither its war edits nor its counter changes', () => {
    initStore(memoryBackend())
    setRole('admin')
    setCell('ramp', '2026-01-05', 'LL')
    deleteManningRule('scn')
    expect(getState().requirements.default.rules.some(r => r.id === 'scn')).toBe(false)
    // A "reload": a brand-new backend, nothing carried across.
    initStore(memoryBackend())
    expect(getState().grid['ramp']?.['2026-01-05']).toBeUndefined()
    expect(getState().requirements.default.rules.some(r => r.id === 'scn')).toBe(true)
  })
})

// The drag-selection batch writers (owner, 27 Aug 26). They carry the SAME
// per-cell guards as their single-cell parents, batch to ONE notify, and are
// partial by design — a selection clipping a Raptor cell writes the rest.
describe('the batch writers (drag-select)', () => {
  beforeEach(() => { initStore(memoryBackend()); setRole('admin') })
  const cells = (person: string, ...dates: string[]) => dates.map(date => ({ personId: person, date }))

  it('setCells writes one code across every named cell', () => {
    const r = setCells(cells('ramp', '2026-01-06', '2026-01-07', '2026-01-08'), 'LL')
    expect(r).toEqual({ written: 3, skipped: 0 })
    for (const d of ['2026-01-06', '2026-01-07', '2026-01-08']) expect(getState().grid.ramp[d]).toBe('LL')
  })

  it('setCells skips a Raptor-owned cell and writes around it — partial by design', () => {
    // tata carries a Raptor-owned OIL on 2026-01-09 (seed)
    const r = setCells(cells('tata', '2026-01-08', '2026-01-09', '2026-01-10'), 'LL')
    expect(r).toEqual({ written: 2, skipped: 1 })
    expect(getState().grid.tata['2026-01-09']).toBe('OIL')
    expect(getState().grid.tata['2026-01-08']).toBe('LL')
  })

  it('fills across MULTIPLE people in one call', () => {
    const r = setCells([...cells('ramp', '2026-01-06'), ...cells('dusk', '2026-01-06')], 'OL')
    expect(r.written).toBe(2)
    expect(getState().grid.ramp['2026-01-06']).toBe('OL')
    expect(getState().grid.dusk['2026-01-06']).toBe('OL')
  })

  it('notifies ONCE for the whole batch', () => {
    const fn = vi.fn()
    subscribe(fn)
    setCells(cells('ramp', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-12'), 'LL')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('writes nothing and does not notify when every cell is refused', () => {
    const fn = vi.fn()
    subscribe(fn)
    const r = setCells(cells('tata', '2026-01-09'), 'LL') // the one Raptor cell
    expect(r).toEqual({ written: 0, skipped: 1 })
    expect(fn).not.toHaveBeenCalled()
  })

  it('clearCells empties a set of cells', () => {
    setCells(cells('ramp', '2026-01-06', '2026-01-07'), 'LL')
    const r = clearCells(cells('ramp', '2026-01-06', '2026-01-07'))
    expect(r.written).toBe(2)
    expect(getState().grid.ramp?.['2026-01-06']).toBeUndefined()
    expect(getState().grid.ramp?.['2026-01-07']).toBeUndefined()
  })

  // A loose delete-box sweeps up empty cells around the bids. They are not
  // deletions and not refusals — the sheet's "N deleted" must count what was
  // actually removed, and an all-empty box must not persist or notify at all.
  it('clearCells counts only real deletions — swept-up empty cells count as neither', () => {
    setCells(cells('ramp', '2026-01-06'), 'LL')
    const r = clearCells(cells('ramp', '2026-01-06', '2026-01-07', '2026-01-08'))
    expect(r).toEqual({ written: 1, skipped: 0 })
    const fn = vi.fn()
    subscribe(fn)
    expect(clearCells(cells('ramp', '2026-01-07', '2026-01-08'))).toEqual({ written: 0, skipped: 0 })
    expect(fn).not.toHaveBeenCalled()
  })

  // A member never writes a medical marker — the batch predicate reports the
  // refusal in the count instead of silently absorbing it in setCell.
  it('setCells refuses a medical code from a member, counted as skipped', () => {
    setRole('member')
    const r = setCells(cells('ramp', '2026-01-06', '2026-01-07'), 'HL')
    expect(r).toEqual({ written: 0, skipped: 2 })
    expect(getState().grid.ramp?.['2026-01-06']).toBeUndefined()
  })

  it('a member can fill in the window but never batch-decide', () => {
    setRole('member')
    expect(setCells(cells('ramp', '2026-01-06'), 'LL').written).toBe(1)
    expect(setBidStates(cells('ramp', '2026-01-06'), 'approved')).toEqual({ decided: 0, skipped: 1 })
    expect(getState().states.ramp['2026-01-06'].state).toBe('pending')
  })

  it('setBidStates (admin) decides biddable cells and skips a Raptor cell', () => {
    setCells(cells('ramp', '2026-01-06', '2026-01-07'), 'LL')
    advanceStage()  // decisions live at closed/published — canDecide, same as the single writer
    const r = setBidStates([...cells('ramp', '2026-01-06', '2026-01-07'), ...cells('tata', '2026-01-09')], 'approved')
    expect(r).toEqual({ decided: 2, skipped: 1 })
    expect(getState().states.ramp['2026-01-06'].state).toBe('approved')
    expect(getState().states.ramp['2026-01-07'].state).toBe('approved')
  })

  it('moveCells slides a block by a delta, landing pending with the moved trail', () => {
    advanceStage()   // close the war: a move then leaves the moved trail (27 Aug 26)
    setCells(cells('ramp', '2026-01-06', '2026-01-07'), 'LL')
    expect(moveCells(cells('ramp', '2026-01-06', '2026-01-07'), 4)).toBe('moved')
    expect(getState().grid.ramp?.['2026-01-06']).toBeUndefined()
    expect(getState().grid.ramp['2026-01-10']).toBe('LL')
    expect(getState().states.ramp['2026-01-10']).toEqual({ state: 'pending', source: 'bid', shiftedFrom: '2026-01-06' })
    expect(getState().grid.ramp['2026-01-11']).toBe('LL')
  })

  // The moved stripe must not appear on a bid shuffled while bidding was OPEN,
  // even after the war closes — the trail is recorded only for a move made once
  // bidding has closed (owner, 27 Aug 26 — "only after bidding is closed AND the
  // input is moved").
  it('a move while OPEN records no moved trail; a move once CLOSED does', () => {
    setCells(cells('ramp', '2026-01-06', '2026-01-07'), 'LL')       // seed stage is OPEN
    expect(moveCells(cells('ramp', '2026-01-06', '2026-01-07'), 4)).toBe('moved')
    expect(getState().states.ramp['2026-01-10']).toEqual({ state: 'pending', source: 'bid' })
    expect(getState().states.ramp['2026-01-10'].shiftedFrom).toBeUndefined()
    // close, then move again → the trail is recorded now
    advanceStage()
    expect(moveCells(cells('ramp', '2026-01-10', '2026-01-11'), 4)).toBe('moved')
    expect(getState().states.ramp['2026-01-14']).toEqual({ state: 'pending', source: 'bid', shiftedFrom: '2026-01-10' })
  })

  it('moveCells allows a self-overlapping slide (the block moves over its own days)', () => {
    setCells(cells('ramp', '2026-01-06', '2026-01-07'), 'LL')
    // +1 lands 07 (its own vacating source) and 08 — the occupied check must
    // exclude the selection's own sources
    expect(moveCells(cells('ramp', '2026-01-06', '2026-01-07'), 1)).toBe('moved')
    expect(getState().grid.ramp?.['2026-01-06']).toBeUndefined()
    expect(getState().grid.ramp['2026-01-07']).toBe('LL')
    expect(getState().grid.ramp['2026-01-08']).toBe('LL')
  })

  it('moveCells REFUSES atomically onto an occupied day — nothing moves', () => {
    setCells(cells('ramp', '2026-01-06', '2026-01-07'), 'LL')
    setCells(cells('ramp', '2026-01-10'), 'OL') // a blocker at the +4 landing of 06
    const r = moveCells(cells('ramp', '2026-01-06', '2026-01-07'), 4)
    expect(r).toEqual({ reason: 'occupied', at: '2026-01-10' })
    // atomic: the untouched source is still where it was
    expect(getState().grid.ramp['2026-01-06']).toBe('LL')
    expect(getState().grid.ramp['2026-01-07']).toBe('LL')
    expect(getState().grid.ramp['2026-01-10']).toBe('OL')
  })

  it('moveCells refuses a Raptor-owned source', () => {
    expect(moveCells(cells('tata', '2026-01-09'), 3)).toEqual({ reason: 'raptor', at: '2026-01-09' })
  })

  it('moveCells refuses a landing day outside the war', () => {
    setCells(cells('ramp', '2026-01-06'), 'LL')
    expect(moveCells(cells('ramp', '2026-01-06'), -400)).toMatchObject({ reason: 'window' })
    expect(getState().grid.ramp['2026-01-06']).toBe('LL')
  })

  // The loose-selection move (owner, 27 Aug 26 — "move items … that are present
  // … if I select more area than required it registers as nothing"). The empty
  // cells swept up around the inputs are dropped; only the inputs move.
  it('movableCells keeps only the cells holding a bid this role may move', () => {
    setCells(cells('ramp', '2026-01-07', '2026-01-08'), 'LL')
    // a loose box: 06 and 09 are empty, 07/08 hold LL
    const box = cells('ramp', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09')
    expect(movableCells(box)).toEqual(cells('ramp', '2026-01-07', '2026-01-08'))
    // a Raptor-owned cell is not movable either (tata OIL on 09, seed)
    expect(movableCells(cells('tata', '2026-01-09'))).toEqual([])
    // a box of nothing but empty cells has nothing to move
    expect(movableCells(cells('ramp', '2026-01-20', '2026-01-21'))).toEqual([])
  })

  it('a loose box moves the inputs present and keeps the gap between them', () => {
    // LL on 07 and 09, a one-day gap at 08 between them
    setCells(cells('ramp', '2026-01-07'), 'LL')
    setCells(cells('ramp', '2026-01-09'), 'LL')
    // the user sweeps a wider box (06..09, empties at 06 and 08) and drops it so
    // the first input (07) lands on 15 → delta +8
    const movers = movableCells(cells('ramp', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09'))
    expect(moveCells(movers, 8)).toBe('moved')
    expect(getState().grid.ramp['2026-01-15']).toBe('LL')   // first input on the tapped day
    expect(getState().grid.ramp['2026-01-17']).toBe('LL')   // the 2-day gap is kept
    expect(getState().grid.ramp['2026-01-16']).toBeUndefined()
    expect(getState().grid.ramp?.['2026-01-07']).toBeUndefined()   // sources vacated
    expect(getState().grid.ramp?.['2026-01-09']).toBeUndefined()
  })

  // The landing preview asks moveProblem BEFORE painting, so it can never
  // show half a landing the atomic commit would wholly refuse — one body
  // with moveCells' own guards, exercised here without writing anything.
  it('moveProblem answers what moveCells would refuse, without writing', () => {
    setCells(cells('ramp', '2026-01-06', '2026-01-07'), 'LL')
    expect(moveProblem(cells('ramp', '2026-01-06', '2026-01-07'), 4)).toBeNull()
    setCells(cells('ramp', '2026-01-10'), 'OL')
    expect(moveProblem(cells('ramp', '2026-01-06', '2026-01-07'), 4)).toEqual({ reason: 'occupied', at: '2026-01-10' })
    expect(moveProblem(cells('ramp', '2026-01-06'), -400)).toMatchObject({ reason: 'window' })
    // nothing was written by any of that
    expect(getState().grid.ramp['2026-01-06']).toBe('LL')
  })

  // A two-hop closed-war move traces to the day the man actually bid, not
  // the intermediate hop (same rule as shiftBid).
  it('a chain of closed-war moves keeps the ORIGINAL origin in the trail', () => {
    advanceStage()
    setCells(cells('ramp', '2026-01-06'), 'LL')
    expect(moveCells(cells('ramp', '2026-01-06'), 4)).toBe('moved')
    expect(moveCells(cells('ramp', '2026-01-10'), 4)).toBe('moved')
    expect(getState().states.ramp['2026-01-14']).toEqual({
      state: 'pending', source: 'bid', shiftedFrom: '2026-01-06',
    })
  })
})

// A member writes only their OWN row — the person they are viewing as (owner,
// 27 Aug 26 — "if I am viewing as a member and I view as ranger on the leave
// war, I shouldn't be able to input on other people's row except mine"). The
// identity in this prototype IS the "View as" selection (`viewer`); an admin
// is bound by neither the window nor the row.
describe('a member edits only their own row', () => {
  beforeEach(() => { initStore(memoryBackend()); setRole('member'); setViewer('ramp') })
  const cells = (person: string, ...dates: string[]) => dates.map(date => ({ personId: person, date }))

  it('setCell writes the viewer’s own row but refuses another', () => {
    setCell('dusk', '2026-01-06', 'LL')          // not my row
    expect(getState().grid.dusk?.['2026-01-06']).toBeUndefined()
    setCell('ramp', '2026-01-06', 'LL')          // my row
    expect(getState().grid.ramp['2026-01-06']).toBe('LL')
  })

  it('setCells writes my row and reports the other rows as skipped, not silently dropped', () => {
    const r = setCells([...cells('ramp', '2026-01-06'), ...cells('dusk', '2026-01-06')], 'LL')
    expect(r).toEqual({ written: 1, skipped: 1 })
    expect(getState().grid.ramp['2026-01-06']).toBe('LL')
    expect(getState().grid.dusk?.['2026-01-06']).toBeUndefined()
  })

  it('setCellRange stays on my row across a span', () => {
    expect(setCellRange('dusk', '2026-01-06', '2026-01-08', 'LL')).toEqual({ written: 0, skipped: 3 })
    expect(setCellRange('ramp', '2026-01-06', '2026-01-08', 'LL').written).toBe(3)
  })

  it('the viewing person is the row: switch to view as dusk and dusk becomes editable, ramp does not', () => {
    setViewer('dusk')
    setCell('ramp', '2026-01-06', 'LL')
    expect(getState().grid.ramp?.['2026-01-06']).toBeUndefined()
    setCell('dusk', '2026-01-06', 'LL')
    expect(getState().grid.dusk['2026-01-06']).toBe('LL')
  })

  it('a member may move only their own row’s bids', () => {
    // bids planted as admin on two rows, then viewed as ramp
    setRole('admin'); setCells(cells('ramp', '2026-01-06'), 'LL'); setCells(cells('dusk', '2026-01-06'), 'LL')
    setRole('member'); setViewer('ramp')
    // movableCells keeps only my row
    expect(movableCells([...cells('ramp', '2026-01-06'), ...cells('dusk', '2026-01-06')]))
      .toEqual(cells('ramp', '2026-01-06'))
    // a direct move of the other row is refused as nothing-to-move; my row slides
    expect(moveCells(cells('dusk', '2026-01-06'), 3)).toMatchObject({ reason: 'nothing' })
    expect(getState().grid.dusk['2026-01-06']).toBe('LL')     // untouched
    expect(moveCells(cells('ramp', '2026-01-06'), 3)).toBe('moved')
  })

  it('an admin is bound by neither window nor row — every row stays editable', () => {
    setRole('admin'); setViewer('ramp')
    const r = setCells([...cells('ramp', '2026-01-06'), ...cells('dusk', '2026-01-06')], 'LL')
    expect(r).toEqual({ written: 2, skipped: 0 })
  })
})
