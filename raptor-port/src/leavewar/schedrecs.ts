/* THE LEAVE WAR'S ONE DOORWAY TO THE SCHEDULE'S INPUTS AND ROSTER — moved whole out of absences.ts on 31 Oct 26 (the
   inputs guard, src/engine/inputs-readers.test.ts): absences.ts reads one man's absences from LINES, and this doorway hands
   out the stored list itself, records and writes alike, so it stands on the guard's RECORDS list in a file of its own and
   the guard knows its names (`warInputs(`, `warLines(`). absences.ts passes it on, so every import stays as it was. */
import { INPUTS, inputLines } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import type { Input, Person as RaptorPerson } from '../engine/schema'

/* ---- THE SCHEDULE'S RECORDS, TYPED ONCE AT THE WAR'S EDGE -----------------
   The schedule's live lists (engine/inputs.ts INPUTS, engine/people.ts PEOPLE) are typed `any` by the word-for-word
   engine. The Leave War reads them HERE as the records they hold, so no body on this side has to guess (D1537). */

/** An Input as the Leave War reads and writes it: the schedule's record (engine/schema.ts `Input`) and the fields kept on
 *  it beyond the schema's list — a till tick of its own (`till`, D953), the war's moved-from marks (`lwMoved`), the placer
 *  of the request it was approved from (`lwBy`, `lwAt` — M4 8.6) and an overseas duty put on the Ground Programme
 *  (`odGround`). Its `type` is the catalogue code as stored, read as words; `mod` and `allday` are absent on a row this
 *  layer has just built without them, and on a thin stored one. */
export type WarInput = Omit<Input, 'type' | 'mod' | 'allday'> & {
  type: string
  mod?: string
  allday?: boolean
  till?: boolean
  lwMoved?: Record<string, string>
  lwBy?: string
  lwAt?: number
  odGround?: boolean
}
/** WHAT THE READERS BELOW ASK OF A ROW — any of an Input's fields, each of any kind: they read rows of every age (a seed
 *  literal, a stored record, a restore's after-image, a test's own row) and ask of each field only what it holds. */
export type InputRead = { readonly [K in keyof WarInput]?: unknown }

/** The schedule's inputs — the live list itself, never a copy: a push, a splice or a field written through it is written
 *  to the list. Read at every call, so a list put in its place is the one read. */
export const warInputs = (): WarInput[] => INPUTS
/** One line a named person of each input — the input's fields with `person` his id (engine/inputs.ts inputLines, frozen):
 *  of the live inputs, or of a list handed in. */
export const warLines = (list?: readonly InputRead[]): readonly WarInput[] => inputLines(list)
/** A person of the schedule's roster by his id (engine/schema.ts `Person`) — undefined for an id it does not hold. */
export const rosterBody = (id: string): RaptorPerson | undefined => PEOPLE[id]
