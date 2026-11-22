I read an exported copy of commit 1a1be5a7e.

Three findings by inspection. I changed no files and ran neither the app nor tests. The Vitest cases below are proposed failing tests, not observed test results.

1. **ALL AVAIL wrongly excludes a posted SANS man who is planned with us.**

Steps: leave “Show SANS” off; post Hex as SANS from 15 July; on 16 July name him for a briefing at 16:00–17:00 and place ALL AVAIL at 08:00–15:00. He is excluded from the earlier crowd despite having no overlapping commitment. Turning “Show SANS” on can change that answer.

Cause: [availableFor](/C:/Users/User/rc140b/raptor-port/src/leavewar/sync.ts:2091) correctly accepts the named SANS man, then rejects him through `inSquadron`. Its person comes from Leave War’s displayed roster, whose end date depends on “Show SANS”.

D27 includes a SANS man planned with us, subject to timing conflicts. This missed path can freeze an incomplete crowd into a publication and omit that event’s OIL work.

Fix: derive the scheduling window from the saved posting, independently of the display switch. From a completed SANS posting’s date, do not treat that posting as departure from scheduling eligibility. Retain the post-in, squadron, archive/delete, named-on-programme and conflict checks.

Append inside the existing fixture in `src/leavewar/sans-from-date.test.ts`:

```ts
it('counts a planned posted SANS man with Show SANS off', () => {
  onlyTheEvent(THU)
  ;(DAYS[THU] as any).ground.push({
    prog: 'BRIEFING', str: '1600', end: '1700', who: 'rocky',
  })
  afterSchedMutate()
  expect(postOut('rocky', WED_ISO, 'sans')).toBe(true)
  raptorNotify()
  expect(getState().showSans).toBe(false)
  expect(availableFor(THU_ISO, WIN, DAYS[THU] as any)).toContain('rocky')
})
```

2. **A hand re-tick can lose the posting date while the previous squadron’s Leave War remains open.**

Steps: Osprey’s SANS posting starts on 14 July; untick him on 15 July. Hunter moves from 142 to 149 overnight while an open Leave War window holds 142’s war loaded. On 16 July, open Quals for his new squadron and re-tick Osprey. The code starts SANS on 16 July, leaving 15 July falsely regular; D2313 requires the posting’s date again.

Cause: [sansPostedFrom](/C:/Users/User/rc140b/raptor-port/src/leavewar/sync.ts:1978) reads only the loaded war’s posting records. Other nearby posting readers already resolve the person’s squadron separately.

Fix: resolve whose posting record to read; when that squadron’s war is not loaded, read its stored posting without switching the open war. Keep the existing SANS-outcome and matching completion-date checks.

Append to `src/ui/msq-own-facts.test.tsx`, which already supplies the real move, midnight and held-window fixture:

```ts
import { postOut } from '../leavewar/sync'
import { updatePersonField } from '../state/quals-write'
import { sansOn } from '../engine/people'

it('a re-tick reads the posting from the new squadron’s stored war', () => {
  signInAs('kestrel')
  expect(postOut(PID.osprey, '2026-07-14', 'sans')).toBe(true)
  expect(updatePersonField(PID.osprey, { tick: 'san' })).toBeNull()
  signInAs('saber')
  acrossMove(PID.hunter, 'u142', 'u149')
  signInAs('hunter')
  setEntryHold(() => 'war')
  pastMidnight()
  expect([pageUnit('own'), worldUnit()]).toEqual(['u149', 'u142'])
  expect(updatePersonField(PID.osprey, { tick: 'san' })).toBeNull()
  expect(sansOn(PID.osprey, '2026-07-15')).toBe(true)
})
```

3. **The dated input editor’s “Several people” picker still uses today’s SANS status.**

Steps: tick Hex SANS on 15 July; open a Meeting dated 13 July and choose “Several people”. Hex appears under SANS with the purple mark. Pressing “All” under WSOs misses him. D2313 says he was an ordinary WSO on that date.

Cause: [PeoplePick](/C:/Users/User/rc140b/raptor-port/src/ui/PeoplePick.tsx:29) receives the draft’s first date, but groups people through raw `p.san` and draws their pucks outside the dated context. This is the input editor, separate from the excluded calendar opened-day issue.

Fix: group people using SANS status on the supplied date and draw their pucks inside `withDrawDay` for that date. Keep the explicitly excluded current-status permission to file SANS availability.

Append to `src/ui/peoplepick.test.tsx`, using its existing fixture:

```tsx
it('groups and draws a dated Meeting’s people before their SANS start', async () => {
  Object.assign(PEOPLE.rocky, { san: true, sanFrom: '2026-07-15' })
  await act(async () => {
    root.render(<PeoplePick people={['bane']} several type="Meeting"
      unit={BOOT_UNIT} iso="2026-07-13" onChange={() => {}} />)
  })
  expect($('[data-ppgroup="wsos"] [data-pp="rocky"]')).not.toBeNull()
  expect($('[data-pp="rocky"] .puck.san')).toBeNull()
})
```

Explicit negatives, from source inspection:

- I found no additional fault in nested drawing-context restoration, exception cleanup, frozen-face precedence or the inspected consumers of `personShown` copies.
- I found no additional missing date in published-person comparisons or next-week preview handling. Print/export do not expose a SANS status column.
- I found no additional fault in D2314’s names, placeholder wording or sentence joins; duplicate people are rejected before saving.
- Both date fields are carried by the people store’s save/restore paths and allowed by the posting pass. I found no new own-row permission refusal.
- I have not counted the expressly excluded or already-filed issues as findings.

Tidiness, noted only: the same SANS transition is duplicated in the loaded-war and stored-war posting runs. I found no new dead helper or misleading name requiring a separate finding.

Rulings: none this session.