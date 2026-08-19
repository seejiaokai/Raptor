// The counter form (owner, 19 Aug 26): "instead of hard coding these
// permutations, make it editable… think of making it fully customisable and
// also future proofing… and these counters can also be deleted."
//
// A guided form, not free text (owner's pick, same day): every question is a
// picker, so the app always understands the rule exactly, and the plain-words
// explanation the tap-a-row sheet shows is WRITTEN FROM the answers
// (`describeRule`) — it cannot drift. The qualification chips come from the
// store's live catalogue, which the projection refreshes from Raptor's Quals
// page, so a qualification added next month appears here without a build.
//
// Two shapes cover everything the owner listed:
//   PEOPLE — count everyone matching one filter ("what type of crew? what CAT?
//            qualified in something? somebody except a certain type?"), and
//   TEAM   — sets of DIFFERENT people built from slots ("crew sets of a
//            certain qualification… crew sets plus a certain type of
//            qualification"), shown as complete sets or as the people in them.

import { useMemo, useState } from 'react'
import {
  CAT_LADDER,
  MAX_TEAM_SLOTS,
  ruleHave,
  type CrewFilter,
  type ManningRule,
  type RuleCount,
  type Seat,
} from '../engine'
import { deleteManningRule, getState, saveManningRule } from '../state/store'
import { Sheet } from './Sheet'
import { useVersion } from './useStore'
import './bidpicker.css'

// ---- Draft shapes: strings while typing, numbers only at Save --------------

interface FilterDraft {
  /** '' = any crew (pilot or WSO). */
  seat: '' | Seat
  /** Whether the CAT chips mean "must be one of" or "must NOT be one of". */
  catMode: 'is' | 'not'
  cats: string[]
  quals: string[]
  notQuals: string[]
}

interface SlotDraft {
  count: string
  filter: FilterDraft
}

const blankFilter = (): FilterDraft => ({ seat: '', catMode: 'is', cats: [], quals: [], notQuals: [] })

function toDraftFilter(f: CrewFilter): FilterDraft {
  // A filter somehow carrying BOTH lists (hand-written storage) loads its
  // notCats — the mode the toggle shows — so the form never shows one list
  // under the other's meaning.
  return {
    seat: f.seats?.length === 1 ? f.seats[0] : '',
    catMode: f.notCats?.length ? 'not' : 'is',
    cats: [...(f.notCats?.length ? f.notCats : f.cats ?? [])],
    quals: [...(f.quals ?? [])],
    notQuals: [...(f.notQuals ?? [])],
  }
}

function fromDraftFilter(d: FilterDraft): CrewFilter {
  const out: CrewFilter = {}
  if (d.seat) out.seats = [d.seat]
  if (d.cats.length) (d.catMode === 'is' ? (out.cats = [...d.cats]) : (out.notCats = [...d.cats]))
  if (d.quals.length) out.quals = [...d.quals]
  if (d.notQuals.length) out.notQuals = [...d.notQuals]
  return out
}

/** A new counter's id: the name as a slug, made unique against the rules that
 *  exist — ids are what the saved row order and hidden list hold, so they must
 *  never collide and never change once minted. */
function mintId(label: string, taken: Set<string>): string {
  const slug = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'counter'
  if (!taken.has(slug)) return slug
  for (let n = 2; ; n++) if (!taken.has(`${slug}-${n}`)) return `${slug}-${n}`
}

const toggled = (xs: string[], k: string): string[] =>
  xs.includes(k) ? xs.filter(x => x !== k) : [...xs, k]

// ---- One filter's pickers, shared by the people shape and every slot -------

function FilterFields({ d, tid, qualChips, onChange }: {
  d: FilterDraft
  /** Test-id prefix — `cf` for the people filter, `s0`/`s1`… per slot. */
  tid: string
  qualChips: { k: string; label: string }[]
  onChange: (d: FilterDraft) => void
}) {
  const seatChip = (seat: '' | Seat, label: string) => (
    <button
      key={seat || 'any'}
      className={`tchip${d.seat === seat ? ' on' : ''}`}
      data-testid={`${tid}-seat-${seat || 'any'}`}
      aria-pressed={d.seat === seat}
      onClick={() => onChange({ ...d, seat })}
    >
      {label}
    </button>
  )
  return (
    <>
      <div className="bidsheet-row cf-row">
        <span className="lab">Crew</span>
        {seatChip('', 'Any crew')}
        {seatChip('pilot', 'Pilots')}
        {seatChip('wso', 'WSOs')}
      </div>
      <div className="bidsheet-row cf-row">
        <span className="lab">CAT</span>
        {/* One toggle rather than two chip rows: a "must be" list already
            excludes everything off it, so is/not are the only two readings. */}
        <button
          className="tchip cf-not"
          data-testid={`${tid}-catmode`}
          title={d.catMode === 'is' ? 'Ticked CATs are the ones counted — tap for "everyone except"' : 'Ticked CATs are EXCLUDED — tap to count only them'}
          onClick={() => onChange({ ...d, catMode: d.catMode === 'is' ? 'not' : 'is' })}
        >
          {d.catMode === 'is' ? 'is' : 'is not'}
        </button>
        {CAT_LADDER.map(c => (
          <button
            key={c}
            className={`tchip${d.cats.includes(c) ? ' on' : ''}`}
            data-testid={`${tid}-cat-${c}`}
            aria-pressed={d.cats.includes(c)}
            onClick={() => onChange({ ...d, cats: toggled(d.cats, c) })}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="bidsheet-row cf-row">
        <span className="lab">Holding</span>
        {qualChips.map(q => (
          <button
            key={q.k}
            className={`tchip${d.quals.includes(q.k) ? ' on' : ''}`}
            data-testid={`${tid}-qual-${q.k}`}
            aria-pressed={d.quals.includes(q.k)}
            onClick={() => onChange({ ...d, quals: toggled(d.quals, q.k), notQuals: d.notQuals.filter(k => k !== q.k) })}
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="bidsheet-row cf-row cf-sub">
        <span className="lab">Without</span>
        {qualChips.map(q => (
          <button
            key={q.k}
            className={`tchip${d.notQuals.includes(q.k) ? ' on' : ''}`}
            data-testid={`${tid}-noqual-${q.k}`}
            aria-pressed={d.notQuals.includes(q.k)}
            onClick={() => onChange({ ...d, notQuals: toggled(d.notQuals, q.k), quals: d.quals.filter(k => k !== q.k) })}
          >
            {q.label}
          </button>
        ))}
      </div>
    </>
  )
}

export function CounterForm({ ruleId, onClose }: {
  /** `null` builds a new counter; an id edits that one. */
  ruleId: string | null
  onClose: () => void
}) {
  useVersion()
  const { requirements, qualCatalog, people, grid, states, period } = getState()
  const rules = requirements.default.rules
  const existing = ruleId ? rules.find(r => r.id === ruleId) : undefined

  // The qualification chips: the live catalogue, plus any key this rule
  // already names that the catalogue no longer carries (a column since
  // removed) — dropping its chip would silently rewrite the rule on Save.
  const qualChips = useMemo(() => {
    const out = [...qualCatalog]
    const known = new Set(out.map(q => q.k))
    const f = (fl?: CrewFilter) => {
      for (const k of [...(fl?.quals ?? []), ...(fl?.notQuals ?? [])]) {
        if (!known.has(k)) { out.push({ k, label: k.toUpperCase() }); known.add(k) }
      }
    }
    if (existing?.count.kind === 'people') f(existing.count.filter)
    if (existing?.count.kind === 'team') existing.count.slots.forEach(s => f(s.filter))
    return out
  }, [qualCatalog, existing])

  const [label, setLabel] = useState(existing?.label ?? '')
  const [mode, setMode] = useState<'people' | 'team'>(existing?.count.kind ?? 'people')
  const [filter, setFilter] = useState<FilterDraft>(() =>
    existing?.count.kind === 'people' ? toDraftFilter(existing.count.filter) : blankFilter(),
  )
  // A fresh team starts as the crew-set shape — one pilot plus one WSO — the
  // combination the owner named first; every part of it is editable.
  const [slots, setSlots] = useState<SlotDraft[]>(() =>
    existing?.count.kind === 'team'
      ? existing.count.slots.map(s => ({ count: String(s.count), filter: toDraftFilter(s.filter) }))
      : [
          { count: '1', filter: { ...blankFilter(), seat: 'pilot' } },
          { count: '1', filter: { ...blankFilter(), seat: 'wso' } },
        ],
  )
  const [showPeople, setShowPeople] = useState(existing?.count.kind === 'team' && existing.count.show === 'people')
  const [presence, setPresence] = useState(existing?.count.kind === 'team' && !!existing.count.presence)
  const [amber, setAmber] = useState(existing ? String(existing.threshold.amber) : '0')
  const [red, setRed] = useState(existing ? String(existing.threshold.red) : '0')
  const [armDel, setArmDel] = useState(false)

  const a = parseFloat(amber)
  const r = parseFloat(red)
  const slotCounts = slots.map(s => parseInt(s.count, 10))
  const slotsValid = slots.length >= 1 && slotCounts.every(n => Number.isInteger(n) && n >= 1 && n <= 9)
  const valid =
    label.trim().length > 0 &&
    Number.isFinite(a) && a >= 0 &&
    Number.isFinite(r) && r >= 0 &&
    (mode === 'people' || slotsValid)

  const draftCount = (): RuleCount =>
    mode === 'people'
      ? { kind: 'people', filter: fromDraftFilter(filter) }
      : {
          kind: 'team',
          slots: slots.map((s, i) => ({ count: slotCounts[i], filter: fromDraftFilter(s.filter) })),
          ...(showPeople ? { show: 'people' as const } : {}),
          ...(presence ? { presence: true } : {}),
        }

  // A live sample, so the admin sees what the rule reads BEFORE saving it —
  // the war's first day, the one every open war is guaranteed to have.
  const sampleDate = period.days[0]?.date
  const sample = valid && sampleDate ? ruleHave(draftCount(), people, grid, states, sampleDate) : null

  const save = () => {
    if (!valid) return
    const id = existing?.id ?? mintId(label, new Set(rules.map(x => x.id)))
    // `desc` deliberately absent: a rule saved from this form gets its sheet
    // words written from the definition (describeRule), so they cannot lie.
    const rule: ManningRule = { id, label: label.trim(), count: draftCount(), threshold: { amber: a, red: r } }
    if (saveManningRule(rule)) onClose()
  }

  return (
    <Sheet testid="counter-form" label={existing ? `Edit ${existing.label}` : 'New counter'} onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{existing ? existing.label : 'New counter'}</span>
        <span className="dt">{existing ? 'edit this counter' : 'build a counting rule'}</span>
        <button className="x" data-testid="cform-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="bidsheet-row cf-row">
        <span className="lab">Name</span>
        <input
          className="namein"
          data-testid="cform-name"
          placeholder="e.g. NVG PILOTS"
          maxLength={80}
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
      </div>

      <div className="bidsheet-row cf-row">
        <span className="lab">Count</span>
        <button
          className={`tchip${mode === 'people' ? ' on' : ''}`}
          data-testid="cform-mode-people"
          aria-pressed={mode === 'people'}
          onClick={() => setMode('people')}
        >
          People
        </button>
        <button
          className={`tchip${mode === 'team' ? ' on' : ''}`}
          data-testid="cform-mode-team"
          aria-pressed={mode === 'team'}
          onClick={() => setMode('team')}
        >
          Sets / teams
        </button>
        <span className="cf-hint">
          {mode === 'people'
            ? 'Adds up everyone matching the picks below.'
            : 'Counts complete sets — every slot filled by a different person.'}
        </span>
      </div>

      {mode === 'people' && (
        <FilterFields d={filter} tid="cf" qualChips={qualChips} onChange={setFilter} />
      )}

      {mode === 'team' && (
        <>
          {slots.map((s, i) => (
            <div className="cf-slot" data-testid={`cform-slot-${i}`} key={i}>
              <div className="bidsheet-row cf-row cf-slothd">
                <span className="lab">Slot {i + 1}</span>
                <input
                  className="mth-in cf-count"
                  data-testid={`s${i}-count`}
                  type="number"
                  min={1}
                  max={9}
                  step={1}
                  inputMode="numeric"
                  value={s.count}
                  onChange={e => setSlots(ss => ss.map((x, j) => (j === i ? { ...x, count: e.target.value } : x)))}
                />
                <span className="cf-hint">of…</span>
                {slots.length > 1 && (
                  <button
                    className="tchip cf-slotdel"
                    data-testid={`s${i}-remove`}
                    title="Remove this slot"
                    onClick={() => setSlots(ss => ss.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                )}
              </div>
              <FilterFields
                d={s.filter}
                tid={`s${i}`}
                qualChips={qualChips}
                onChange={f => setSlots(ss => ss.map((x, j) => (j === i ? { ...x, filter: f } : x)))}
              />
            </div>
          ))}
          <div className="bidsheet-row cf-row">
            <button
              className="tchip"
              data-testid="cform-slot-add"
              disabled={slots.length >= MAX_TEAM_SLOTS}
              title={slots.length >= MAX_TEAM_SLOTS ? `At most ${MAX_TEAM_SLOTS} slots` : 'Add another slot to the team'}
              onClick={() => setSlots(ss => [...ss, { count: '1', filter: blankFilter() }])}
            >
              ＋ Slot
            </button>
          </div>
          <div className="bidsheet-row cf-row">
            <span className="lab">Show</span>
            <button
              className={`tchip${!showPeople ? ' on' : ''}`}
              data-testid="cform-show-teams"
              aria-pressed={!showPeople}
              onClick={() => setShowPeople(false)}
            >
              Complete sets
            </button>
            <button
              className={`tchip${showPeople ? ' on' : ''}`}
              data-testid="cform-show-people"
              aria-pressed={showPeople}
              onClick={() => setShowPeople(true)}
            >
              People in them
            </button>
          </div>
          <div className="bidsheet-row cf-row">
            <button
              className={`tchip${presence ? ' on' : ''}`}
              data-testid="cform-presence"
              aria-pressed={presence}
              title="With this on, someone standing SC duty still counts — they are at work, just off the flying programme"
              onClick={() => setPresence(p => !p)}
            >
              {presence ? '✓ ' : ''}SC duty still counts
            </button>
          </div>
        </>
      )}

      <div className="mth-edit">
        <label className="mth-field">
          <span className="lab">Amber below</span>
          <input
            className="mth-in" data-testid="cform-amber" type="number" min={0} step={0.5}
            inputMode="decimal" value={amber} onChange={e => setAmber(e.target.value)}
          />
        </label>
        <label className="mth-field">
          <span className="lab">Red below</span>
          <input
            className="mth-in" data-testid="cform-red" type="number" min={0} step={0.5}
            inputMode="decimal" value={red} onChange={e => setRed(e.target.value)}
          />
        </label>
      </div>

      {sample !== null && (
        <div className="mwhen" data-testid="cform-preview">
          On this war's first day that counts {String(Math.round(sample * 10) / 10)}.
        </div>
      )}

      <div className="cfoot mth-foot">
        <button className="creset pri" data-testid="cform-save" disabled={!valid} onClick={save}>
          {existing ? 'Save counter' : 'Add counter'}
        </button>
        <button className="creset" data-testid="cform-cancel" onClick={onClose}>Cancel</button>
        {/* Delete arms first (owner: counters can be deleted) — one stray tap
            must not remove a rule the whole squadron reads. */}
        {existing && (
          <button
            className={`creset cf-del${armDel ? ' arm' : ''}`}
            data-testid="cform-delete"
            onClick={() => {
              if (!armDel) { setArmDel(true); return }
              if (deleteManningRule(existing.id)) onClose()
            }}
          >
            {armDel ? 'Really delete?' : 'Delete counter'}
          </button>
        )}
      </div>
    </Sheet>
  )
}
