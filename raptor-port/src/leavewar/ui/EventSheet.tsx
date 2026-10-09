// The Event sheet — where an admin writes, ranges, merges, tags and deletes a
// day event (owner, Aug 26: "click on the event and an edit button is at the
// top").
//
// It carries the whole surface the two inline textareas used to be:
//   · open text for the day (or a range);
//   · a range, chosen on the same calendar the bid window uses;
//   · for a range, MERGE (one bar, the default) or REPEAT (the word in each
//     day);
//   · a TAG (off / no-leave / work) for THIS event — held on the event itself
//     and saved with it (owner, 18 Aug 26: "I don't want u to save it as a
//     type"). It used to mint the typed word into the type library; now the
//     library changes only inside Edit types, and a library word still
//     classifies by match when the event carries no tag of its own;
//   · and, behind the "Edit types" button at the top, the whole type library.
//
// The tag never shows as words in the grid; it reads only as colour (Matrix
// paints the column; the word itself goes red for work).
//
// REDRAWN 8 Oct 26 (the Inputs / SANS redesign, plan §3.12; owner D643, D644, D645). Shown the sheet above he asked
// "which one do I click?": it had two rows of near-identical chips — a saved word to insert, and a "Tag" to class
// whatever was typed — with nothing saying which did what. The first view is now:
//   · PRESETS — the squadron's own ready-made events, in their colours, the picked one LIT, then "Other…"; under the
//     row a read-out of a few words for the one fact that changes a decision (whether work on the day earns OIL);
//   · NAME, optional under a preset (the event is then the preset's own name), and ON GRID — the short form the grid
//     prints, suggested from the preset or the name and his to type over;
//   · KIND — Public holiday, Off day, No leave, Work, Note — only under "Other…";
//   · this day / a range, the merge choice, the calendar, Save, Move and Delete: as they were.
// Two rules both readers of the plan asked for, and the tests pin (ui/eventsheet-presets.test.tsx):
//   A. OPENING AN EVENT NEVER CHANGES IT. A preset is lit only when its NAME matches the text AND its kind is the
//      event's real kind (its own tag, else its word's); anything else opens on "Other…" with its real kind lit. A
//      Save with nothing changed writes the same text, tag and short form back.
//   B. "NOTE" IS "NO TAG", AND NO TAG IS NOT NO KIND. An untagged word that matches a preset takes that preset's kind
//      by its name, as it always has — so a name that matches a preset IS that preset: as it is typed the sheet
//      lights it and leaves "Other…", and "Note" can never be paired with a preset's name.
// Save and Delete are each ONE command now (state/store.ts saveEvent / deleteEvent): one Undo step, and a refused
// replacement leaves the event it would have replaced exactly as it was.

import { useState } from 'react'
import {
  bandAt,
  classifyEvent,
  dayEventKind,
  dayEventShort,
  defKey,
  EVENT_KINDS,
  EVENT_KIND_WORDS,
  normShort,
  shortOf,
  type EventDef,
  type EventKind,
} from '../engine'
import {
  addEventType,
  deleteEvent,
  getState,
  removeEventType,
  resetEventTypes,
  saveEvent,
  updateEventType,
} from '../state/store'
import { RangePicker, type Range } from './RangePicker'
import { Sheet } from './Sheet'
import { shortSpan } from './dates'
import { useVersion } from './useStore'
import './eventsheet.css'

const KIND_LABEL: Record<EventKind, string> = {
  off: 'PH',
  free: 'Off day',
  nolv: 'No leave',
  work: 'Work',
}

/* THE KIND ROW under "Other…" — the four kinds in words, then "Note" (no tag). */
const KIND_ROW: readonly { kind: EventKind | null; label: string }[] = [
  { kind: 'off', label: EVENT_KIND_WORDS.off },
  { kind: 'free', label: EVENT_KIND_WORDS.free },
  { kind: 'nolv', label: EVENT_KIND_WORDS.nolv },
  { kind: 'work', label: 'Work' },
  { kind: null, label: 'Note' },
]
/* THE READ-OUT — a few words for the one fact that changes a decision (D644: every helper sentence went; this stayed).
   Under the Presets row it names the kind too, because a preset's chip shows its NAME ("PH", "SC"); under the Kind
   row the kind is the lit button itself, so only the fact is said. */
const PRESET_READOUT: Record<EventKind, string> = {
  off: 'Public holiday · work on it earns OIL',
  free: 'Off day · no OIL',
  nolv: 'No leave · heads-up only',
  work: 'Working event',
}
const KIND_READOUT: Record<EventKind | 'note', string> = {
  off: 'Work on it earns OIL',
  free: 'No OIL for work on it',
  nolv: 'Heads-up only · never blocks a bid',
  work: 'A working commitment',
  note: 'Just a note · no colour',
}
/* the preset an event of this text and kind IS: its name matches (the fold a kind is matched on) AND its kind is `kind` */
const presetOf = (defs: EventDef[], text: string, kind: EventKind | null): number =>
  defs.findIndex(d => defKey(d.name) === defKey(text) && d.kind === kind)
const presetNamed = (defs: EventDef[], text: string): number =>
  (defKey(text) ? defs.findIndex(d => defKey(d.name) === defKey(text)) : -1)

export function EventSheet({ line, date, to, onClose, onMove }: { line: number; date: string; to?: string; onClose: () => void; onMove?: (m: { line: number; from: string; to: string }) => void }) {
  useVersion()
  const { period, eventDefs: defs } = getState()
  // The band (if any) that owns this cell. Editing it means replacing it, so
  // it is captured up front and removed on apply/delete.
  const band = bandAt(period.bands, line, date)
  const day = period.days.find(d => d.date === date)
  // A DRAG opens the sheet already ranged from the swept span (owner, 27 Aug
  // 26); a plain click leaves `to` undefined and opens on the one day.
  const dragged = to !== undefined && to !== date

  /* THE EVENT AS IT WAS SAVED — its text, its own tag and its own short form — read once, when the sheet opens. Null
     for an empty cell. Everything below starts from it and nothing is worked out again from a preset: opening an
     event never changes it (rule A at the head of this file). */
  const [orig] = useState<{ text: string; kind: EventKind | null; short: string | null } | null>(() => {
    const t = band ? band.text : (day?.events[line] ?? '')
    if (!t) return null
    return band
      ? { text: t, kind: band.kind ?? null, short: normShort(band.short) }
      : { text: t, kind: day ? dayEventKind(day, line) : null, short: day ? dayEventShort(day, line) : null }
  })
  const [text, setText] = useState(orig ? orig.text : '')
  const [scope, setScope] = useState<'day' | 'range'>(band || dragged ? 'range' : 'day')
  // A RANGE opens on ONE MERGED BAR (owner, 28 Aug 26 — "can the default
  // selection be one merged bar instead of repeat each day"). A span of days
  // that share a name is nearly always one thing — an exercise, a detachment,
  // a stand-down — so the bar is the shape a scheduler wants; repeating the
  // word into each cell is the exception, and it is one tap away. An existing
  // band already opened merged, so this only changes the fresh-range case (a
  // plain click that is then ranged, or a drag-swept span).
  const [mode, setMode] = useState<'merge' | 'repeat'>('merge')
  const [range, setRange] = useState<Range | null>(
    band ? { from: band.from, to: band.to } : { from: date, to: to ?? date },
  )
  const [view, setView] = useState<'event' | 'types'>('event')
  const [problem, setProblem] = useState('')

  // THIS event's own tag (owner, 18 Aug 26 — "I don't want u to save it as a
  // type"). Tapping a tag used to write the typed word into the squadron's
  // type library; now the tag is held here and saved ON the event. It starts
  // as whatever instance tag the event already carries; the EFFECTIVE tag the
  // buttons light is that, or failing it the library's word match — so "PH"
  // still reads as an off day without anyone tagging it again.
  /* WHAT IS PICKED. `pressed` is his own choice — a preset's place in the list, "Other…", or nothing yet; `otherKind`
     is the kind lit in the Kind row (null = Note). What the sheet SHOWS as picked is worked out from those and the
     Name, because a name that matches a preset IS that preset (rule B):
       · "Other…" with a kind chosen holds, whatever the name — that is how a "PH" is tagged Off day;
       · else a name that matches a preset lights that preset;
       · else his own choice — and a name typed with nothing chosen is "Other…", a note.
     An existing event starts on the preset it IS (name and kind both), else on "Other…" with its real kind. */
  const [pressed, setPressed] = useState<number | 'other' | null>(() => {
    if (!orig) return null
    return presetOf(defs, orig.text, orig.kind ?? classifyEvent(defs, orig.text)) >= 0 ? null : 'other'
  })
  const [otherKind, setOtherKind] = useState<EventKind | null>(() => (orig ? (orig.kind ?? classifyEvent(defs, orig.text)) : null))
  const named = presetNamed(defs, text)
  const pick: number | 'other' | null =
    pressed === 'other' && otherKind !== null ? 'other'
      : named >= 0 ? named
        : typeof pressed === 'number' ? (pressed < defs.length ? pressed : null)
          : pressed ?? (text.trim() ? 'other' : null)
  const preset = typeof pick === 'number' ? defs[pick]! : null
  /* the event's text as it would be saved: the Name, else the picked preset's own name */
  const textNow = text.trim() || (preset ? preset.name : '')

  /* ON GRID. Until he types in the box it shows the SUGGESTION — the preset's short form, or one from the name's
     initials — and follows the Name; once typed it is his and is no longer re-suggested (an emptied box is "none
     typed": the suggestion prints anyway). An event's own saved short form counts as typed. */
  const [grid, setGrid] = useState(orig?.short ?? '')
  const [gridTyped, setGridTyped] = useState(!!orig?.short)
  const hint = shortOf(defs, textNow, null)
  const suggestion = hint === '•' ? '' : hint

  const apply = () => {
    setProblem('')
    if (pick === null) return setProblem('Pick a preset, or type a name.')
    if (pick === 'other' && !text.trim()) return setProblem('Type a name for it.')
    /* THE KIND SAVED ON THE EVENT. Under "Other…": the kind lit there (Note = none). Under a preset: its kind, saved
       on the event itself when the name is the event's own ("National Day" under PH) so the name need not match a
       library word; with the preset's own name the event carries no tag and follows its preset, as a typed "PH"
       always has — unless it is the event as it was opened, which keeps the tag it had. */
    const sameText = !!orig && defKey(orig.text) === defKey(textNow)
    let kind: EventKind | null
    if (pick === 'other') {
      kind = otherKind
      /* rule B, kept at the save as well as on screen: "Note" is never paired with a preset's name */
      if (kind === null && named >= 0) return setProblem(`“${defs[named]!.name}” is a preset — pick it above, or choose its kind here.`)
    } else {
      kind = defKey(textNow) !== defKey(preset!.name) ? preset!.kind : sameText ? orig!.kind : null
    }
    /* THE SHORT FORM SAVED ON THE EVENT: what he typed in "On grid"; untouched, the one it had while its name stands;
       else none — it then prints its preset's or one from its name, and follows them if they change. */
    const short = gridTyped ? grid : sameText ? orig!.short : null
    if (scope !== 'day' && !range) return setProblem('Pick the dates first.')
    const r = saveEvent({
      line, date,
      scope: scope === 'day' ? 'day' : mode,
      from: range?.from, to: range?.to,
      text: textNow, kind, short,
    })
    if (r.ok) return onClose()
    setProblem(r.message)
  }

  const del = () => {
    deleteEvent(line, date)
    onClose()
  }

  /* Press a preset: it is the pick. A Name that was ANOTHER preset's own name goes with that preset — it was never
     a name of this event's own. */
  const pressPreset = (i: number) => {
    setProblem('')
    if (named >= 0 && named !== i) setText('')
    setPressed(i)
    setOtherKind(null)
  }
  /* Press "Other…": the Kind row opens on the kind the event has NOW (a preset's kind is carried in, lit), so a "PH"
     can be given another kind there; choosing Note for a preset's name hands it back to its preset (rule B). */
  const pressOther = () => {
    setProblem('')
    setOtherKind(pick === 'other' ? otherKind : preset ? preset.kind : null)
    setPressed('other')
  }
  /* Choose a kind in the Kind row; the one already lit, pressed again, goes back to Note. */
  const pressKind = (k: EventKind | null) => {
    setProblem('')
    setOtherKind(k !== null && k === otherKind ? null : k)
  }

  if (view === 'types') {
    return (
      <Sheet testid="event-types-sheet" label="Event presets" onClose={onClose}>
        <div className="bidsheet-hd">
          <span className="who">PRESETS</span>
          <span className="dt">name · on grid · kind</span>
          <button className="x" data-testid="types-back" onClick={() => setView('event')} aria-label="Back">
            ‹
          </button>
        </div>
        <div className="evtypes">
          {/* Keyed by the type's NAME, not its index (bug sweep, 18 Aug 26).
              The name field is uncontrolled (defaultValue, applied once on
              mount), so an index key let a mid-list delete shift the array
              under the same DOM inputs: the row then showed a stale name and
              blurring it renamed the WRONG type. Keying by the stable name
              keeps each row bound to its own type across a delete — the same
              fix the personnel-label input (key={val}) already uses. Names are
              unique by the store's own refusal of a duplicate. */}
          {defs.map((d, i) => (
            <div className="evtype" key={d.name} data-testid={`evtype-${i}`}>
              <input
                className="evtype-name"
                defaultValue={d.name}
                aria-label={`Name of event type ${i + 1}`}
                data-testid={`evtype-name-${i}`}
                onBlur={e => {
                  const err = updateEventType(i, { name: e.target.value })
                  setProblem(err ?? '')
                }}
                onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              />
              {/* ITS SHORT FORM — what the grid prints for an event of this name (D645). Uncontrolled like the name,
                  and keyed by the saved value so a Reset or a refused edit shows what is really stored. Emptied, the
                  preset carries none and its events print one from the name. */}
              <input
                className="evtype-short"
                key={d.short ?? ''}
                defaultValue={d.short ?? ''}
                maxLength={3}
                placeholder={shortOf([], d.name, null)}
                aria-label={`What the grid prints for ${d.name}`}
                data-testid={`evtype-short-${i}`}
                onBlur={e => {
                  const err = updateEventType(i, { short: e.target.value })
                  setProblem(err ?? '')
                  if (err) e.target.value = d.short ?? ''
                }}
                onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              />
              <div className="evkinds">
                {EVENT_KINDS.map(k => (
                  <button
                    key={k}
                    className={`evkind ${k}${d.kind === k ? ' on' : ''}`}
                    data-testid={`evtype-kind-${i}-${k}`}
                    aria-pressed={d.kind === k}
                    onClick={() => setProblem(updateEventType(i, { kind: k }) ?? '')}
                  >
                    {KIND_LABEL[k]}
                  </button>
                ))}
              </div>
              <button
                className="evtype-del"
                data-testid={`evtype-del-${i}`}
                aria-label={`Delete ${d.name}`}
                onClick={() => removeEventType(i)}
              >
                ✕
              </button>
            </div>
          ))}
          <AddType onProblem={setProblem} />
        </div>
        <div className="bidsheet-row">
          <button className="dchip" data-testid="types-reset" onClick={() => resetEventTypes()}>
            Reset to standard
          </button>
          <button className="dchip approve" data-testid="types-done" onClick={() => setView('event')}>
            Done
          </button>
          {problem && <span className="note warn" data-testid="event-problem">{problem}</span>}
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet testid="event-sheet" label="Edit event" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">EVENT {line + 1}</span>
        <span className="dt">{scope === 'range' && range ? shortSpan(range.from, range.to) : shortSpan(date, date)}</span>
        <button className="evtypes-open" data-testid="event-edit-types" onClick={() => setView('types')}>
          Edit presets
        </button>
        <button className="x" data-testid="event-cancel" onClick={onClose} aria-label="Cancel">
          ✕
        </button>
      </div>

      {/* PRESETS — the squadron's ready-made events, the picked one lit; then "Other…". */}
      <div className="evlab" id="ev-presets-lab">Presets</div>
      <div className="bidsheet-row evquick" data-testid="event-quickpicks" role="group" aria-labelledby="ev-presets-lab">
        {defs.map((d, i) => (
          <button
            key={i}
            className={`evchip ${d.kind}${pick === i ? ' on' : ''}`}
            data-testid={`event-quick-${i}`}
            aria-pressed={pick === i}
            onClick={() => pressPreset(i)}
          >
            {d.name}
          </button>
        ))}
        <button
          className={`evchip other${pick === 'other' ? ' on' : ''}`}
          data-testid="event-other"
          aria-pressed={pick === 'other'}
          onClick={pressOther}
        >
          Other…
        </button>
      </div>
      {preset && <div className="evreadout" data-testid="event-readout">{PRESET_READOUT[preset.kind]}</div>}

      {/* NAME (optional under a preset) and ON GRID, side by side. */}
      <div className="evnamerow">
        <label className="evlab" htmlFor="ev-name">Name</label>
        <label className="evlab" htmlFor="ev-short">On grid</label>
        <input
          id="ev-name"
          className="evtext"
          data-testid="event-text"
          placeholder={preset ? preset.name : 'Type a name…'}
          value={text}
          /* AUTOFOCUS ONLY A FRESH SINGLE-DAY TAP (owner, 31 Aug 26 — "I want
             to see the full window … the calendar takes a lot of vertical
             space"). A phone can't show the keyboard AND the whole calendar at
             once, but the keyboard is only ever needed to type the NAME, never
             to pick dates. So a plain day tap still focuses the field to type
             at once (the sheet is short and Sheet.tsx lifts it clear of the
             keys); a sheet that opens already ranged — a drag-swept span or an
             existing band, the tall case — opens with NO keyboard, so the full
             window (calendar + Save/Delete) shows. Tapping "A range" is a
             button, which drops the keyboard on its own, so switching a day to
             a range reveals the full window too. */
          autoFocus={!(band || dragged)}
          onChange={e => setText(e.target.value)}
          /* Enter/Return closes the keyboard (owner, 1 Sep 26 — "when I press
             enter the keyboard should close"). It blurs the field rather than
             saving: the sheet still has the scope, tag and dates to set, so
             Enter means "done typing the name", the same as the type-name row
             above. Dropping focus dismisses the keyboard, and useKeyboardInset
             then lets the panel fall back to the full window. */
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        />
        {/* What the grid prints — one to three letters or digits, put in capitals as he types. The rule itself is
            the store's (engine/eventshort.ts): a value it refuses comes back as a sentence, the sheet left open. */}
        <input
          id="ev-short"
          className="evtext evshort"
          data-testid="event-short"
          maxLength={3}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          placeholder={suggestion}
          value={gridTyped ? grid : suggestion}
          onChange={e => { setGrid(e.target.value.toUpperCase()); setGridTyped(true) }}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        />
      </div>

      {/* KIND — only under "Other…". */}
      {pick === 'other' && (
        <>
          <div className="bidsheet-row evtagrow" data-testid="event-kindrow" role="group" aria-label="Kind">
            <span className="evlab">Kind</span>
            {KIND_ROW.map(k => (
              <button
                key={k.kind ?? 'note'}
                className={`evkind ${k.kind ?? 'note'}${otherKind === k.kind ? ' on' : ''}`}
                data-testid={`event-tag-${k.kind ?? 'note'}`}
                aria-pressed={otherKind === k.kind}
                onClick={() => pressKind(k.kind)}
              >
                {k.label}
              </button>
            ))}
          </div>
          <div className="evreadout" data-testid="event-readout">{KIND_READOUT[otherKind ?? 'note']}</div>
        </>
      )}

      {/* One day, or a span. */}
      <div className="bidsheet-row evscope">
        <button
          className={`dchip${scope === 'day' ? ' approve' : ''}`}
          data-testid="event-scope-day"
          onClick={() => setScope('day')}
        >
          This day
        </button>
        <button
          className={`dchip${scope === 'range' ? ' approve' : ''}`}
          data-testid="event-scope-range"
          onClick={() => setScope('range')}
        >
          A range
        </button>
      </div>

      {scope === 'range' && (
        <>
          <div className="bidsheet-row evmode">
            <button
              className={`dchip${mode === 'merge' ? ' approve' : ''}`}
              data-testid="event-mode-merge"
              onClick={() => setMode('merge')}
            >
              One merged bar
            </button>
            <button
              className={`dchip${mode === 'repeat' ? ' approve' : ''}`}
              data-testid="event-mode-repeat"
              onClick={() => setMode('repeat')}
            >
              Repeat each day
            </button>
          </div>
          <div className="bidsheet-row">
            <RangePicker
              testid="event"
              compact
              min={period.start}
              max={period.end}
              value={range}
              onChange={setRange}
            />
          </div>
        </>
      )}

      {/* Save + Delete sit at the RIGHT of the footer, Save in the app's cyan
          (owner, 31 Aug 26 — "move the save and delete buttons to the right …
          Save … make it blue cyan like how it is usually"). Save is `dchip save`,
          not the green `approve` the scope toggles use, so it reads as the one
          commit button. A problem note keeps its place on the LEFT (margin-right
          :auto) so the error never shoves the buttons around. */}
      <div className="bidsheet-row evactions">
        {problem && <span className="note warn" data-testid="event-problem">{problem}</span>}
        {/* MOVE an existing event (owner, 31 Aug 26 — "drag an existing event to
            move it, like LL"). Shown only for a placed event/band; it hands the
            event's own span to the matrix, which runs the same drag-to-a-day move
            mode the roster uses. Closes the sheet first, exactly like the roster
            Move button. */}
        {onMove && (band || (day && day.events[line])) && (
          <button
            className="dchip move"
            data-testid="event-move"
            onClick={() => { onClose(); onMove({ line, from: band ? band.from : date, to: band ? band.to : date }) }}
          >
            Move…
          </button>
        )}
        <button className="dchip save" data-testid="event-apply" onClick={apply}>
          Save
        </button>
        {(band || (day && day.events[line])) && (
          <button className="dchip refuse" data-testid="event-delete" onClick={del}>
            Delete
          </button>
        )}
      </div>
    </Sheet>
  )
}

/** The add-a-type row, its own small state so the name field clears on add. */
function AddType({ onProblem }: { onProblem: (s: string) => void }) {
  const [name, setName] = useState('')
  const [short, setShort] = useState('')
  const [kind, setKind] = useState<EventKind>('off')
  const add = () => {
    const err = addEventType(name, kind, short)
    if (err) return onProblem(err)
    setName('')
    setShort('')
    onProblem('')
  }
  return (
    <div className="evtype evtype-add" data-testid="evtype-add">
      <input
        className="evtype-name"
        placeholder="New preset…"
        aria-label="New preset name"
        data-testid="evtype-add-name"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && add()}
      />
      <input
        className="evtype-short"
        maxLength={3}
        placeholder={shortOf([], name, null) === '•' ? '' : shortOf([], name, null)}
        aria-label="What the grid prints for the new preset"
        data-testid="evtype-add-short"
        value={short}
        onChange={e => setShort(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && add()}
      />
      <div className="evkinds">
        {EVENT_KINDS.map(k => (
          <button
            key={k}
            className={`evkind ${k}${kind === k ? ' on' : ''}`}
            data-testid={`evtype-add-kind-${k}`}
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <button className="evtype-add-btn" data-testid="evtype-add-btn" onClick={add} aria-label="Add event type">
        ＋
      </button>
    </div>
  )
}
