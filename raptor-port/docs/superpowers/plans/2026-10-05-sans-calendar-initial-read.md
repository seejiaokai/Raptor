# SANS calendar — initial independent meaning/rulings read, 5 Oct 2026

Sol recorded the owner request D569 before design. Astra
`/root/sans_calendar_coordinator` independently read the words/all four private
pictures and applicable rules/contracts/source. No application implementation plan
or code approval is claimed; first product questions are pending.

## Complete returned read — verbatim

D569 matches the owner’s words and all four pictures. One correction for the saved design note: editing/cancellation, overlapping offers and time choices already have established behaviour. Say they remain as built unless the owner changes them; do not present them all as unanswered.

The first picture contains a separate top count **and** F/O/A ratios. It does not establish what either count measures or what causes red/amber. No numeric default should be inferred.

Verified existing behaviour:

- SANS availability already uses Fly / AMT / OFT, with **one shared time window** for selected activities.
- All day, AM, PM and Custom already exist. AM means 00:00–12:00; PM means 12:01–23:59. Custom can cross midnight. The displayed 06:00–18:00 in picture four is an example, not an approved default.
- Remarks already has no placeholder for SANS.
- Members add, edit and delete their own inputs; admins can manage others. Other people’s inputs are readable, with the established read-only appearance.
- Existing validation requires a SANS person and at least one activity. It refuses overlapping SANS date ranges for the same person; the member edits the existing entry instead.
- The existing Inputs calendar is a Monday-first month grid at both widths, with SANS F/O/A chips and a shared day list. Its red/amber chip colours mean absence/local commitment, so the new shortage background needs its own clear legend.
- A submitted offer is positive availability, not a scheduled assignment. Existing scheduling separately checks the offered activity and hours. New month totals must not silently become a promise of full-day operational coverage.
- Inputs share the existing record across calendar, list and schedule. Published schedule changes retain the existing pending/amendment rules. The current app remains per-browser; a calendar build alone cannot make commitments shared between devices.

Recommended first round for the owner:

1. **What should the daily target measure?**
   - **One total number of people, with Fly / OFT / AMT counts underneath — recommended.**
   - A separate target for Fly, OFT and AMT.
   - Both an overall target and separate activity targets.

2. **What should determine red and amber?**
   - **How many more people are needed — recommended**, because each day can have a different target.
   - What percentage of the target is filled.
   - Fixed numbers of people who have committed.
   
   The admin still edits the actual cutoffs; no values are chosen yet.

3. **How should a short commitment count?**
   - **Count that person once, with their hours visible — recommended.** Someone offering several activities still counts once in the overall total.
   - Count them only when their hours cover the period the admin needs; the admin would also set that period.

4. **Where should members open it?**
   - **A clearly labelled “SANS Calendar” view inside Inputs — recommended.**
   - Its own “SANS Calendar” entry in the main menu.
   
   Either route should use the same availability already shown elsewhere.

Carry permissions forward as a statement, not another question: “Members can see everyone’s commitments and change their own. Admins set demand and colours and can manage commitments.”

After those answers, settle the actual cutoff boundaries/defaults and whether they apply across all days or can vary by date. Then prepare phone/desktop pictures of: the month with clear count labels and shortage legend; a day’s shared commitments with **+ Commitment**; the existing activity/time form with blank Remarks; and the admin’s demand/colour controls. Use invented names and clearly labelled example numbers. An independently challenged plan follows the accepted pictures.

Source pointers for the host: `engine-rules.md` §§SANS Availability and Who may file one; `ui-contracts.md` §§The Inputs month calendar and A member edits only their own personal inputs; `inputedit.tsx:128–237`; `inputs.ts:668–706`; `InputsPage.tsx:361–389,832`; `data-model.md:1409`; D178, D364 and D569 full rows.

No files changed, no tests or servers started. Rulings: none added by this delegate.

## Host dispositions

The named timing/edit/delete/overlap policies are settled. Corrected the full D569
row, design note and backlog to retain them as defaults, not unanswered choices;
read D178/D364 and the relevant current contracts independently. No owner policy
invented, no source change and no numeric cutoff/default chosen.

Relayed the four product questions through the current chat's asynchronous input
tool. Answers pending; recommendations/preselected options are not submitted
answers. Source design/picture-dependent work waits. Words-only checks apply now;
the eventual calendar's saved records/permissions/counts retain appropriate FULL
checks and every older required Claude read before main.
