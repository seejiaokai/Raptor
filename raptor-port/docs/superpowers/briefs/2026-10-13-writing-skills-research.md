# Writing skills from outside — what was read, and what is worth taking (`[SKILL-FUSION-WRITING]`, 13 Oct 26)

**He asked (13 Oct 26):** *"Can u read online on skills similar to this, is it worth installing to help us make our app
writing more clear and concise?"* — after sending the first shorter wordings back as "too summarised" (D825).
**Read by** a fresh Opus helper at each source (the skill file or the publisher's page fetched, not a registry's blurb —
its web tool returns a structured account of a page; the Pullum article was read word for word). **Nothing was
installed and nothing in the repo was changed by the read.** This note is the record; the answer he was given is its §1.

## 1. The answer

**None is worth installing as it is.** The skill he saw (`write-concisely`, NeoLab) and its better-known twin
(`writing-clearly-and-concisely`, obra) are both the 1918 Strunk book handed to the agent: rules for essays, nothing
about buttons, notes or warnings, with "omit needless words" as a headline and no test for which words are needless —
the very instruction that produced the over-cut notes of 13 Oct. The two skills written for on-screen text are closer,
but the design guide's §1 and the design skill's wording method already hold most of what they say. **What is worth
taking is a short list of checks (§3)**, mostly from Microsoft's and Apple's writing guides, one UX-writing skill's
checklist and Anthropic's document skill — nearly all of them guards against cutting too much. **And the day's own two
lessons (working notes 579, 580 — show the exact words cut; read each rewrite cold) are not yet in any guide: putting
them in matters more than anything found online.**

## 2. What was read

| Skill or guide | Read at source? | Fit for short on-screen text | What it would add | Pushes toward over-cutting? |
|---|---|---|---|---|
| `write-concisely` — NeoLab, context-engineering-kit (GPL-3.0; the Strunk text is public domain) | yes | poor | a list of padding phrases with shorter equals | high — the rule is a headline with no test |
| `writing-clearly-and-concisely` — obra, the-elements-of-style (carries the whole book, about 12,000 tokens; tells the agent to hand a draft to a helper to copy-edit) | yes | poor | the same padding list | high — a helper copy-editing by Strunk, nothing checking facts against the original |
| Anthropic's own public skills (internal-comms, doc-coauthoring, brand-guidelines) | three read | poor — none covers on-screen text | one idea: test the text on a fresh reader who has only the text | none |
| `ux-writing-skill` — Christopher Greer (MIT) | yes, with its checklist | good | two checklist lines (no word removable without losing meaning; the small joining words stay); typical lengths | mixed — its word-count and reading-grade targets push toward a number |
| `ux-writing` in designer-skills — Owl-Listener (MIT) | yes | partial | nothing — every line is already in our guide | high — it ranks short above complete |
| Apple, Human Interface Guidelines — Writing | yes (Apple's data feed of the page) | good | say what to do, not what was wrong; "your" / "we" only where they carry something; several ideas become several short pieces | low |
| Nielsen Norman Group — error-message guidelines | yes | good | "concise and precise" as a pair; no humour in a message seen often | low |
| Microsoft Writing Style Guide (three pages) | yes | good | **the best find:** keep articles, "that", "who" and the verb in a short label; watch words that are both a thing and an action | two-sided — one page says prune every word, another says keep the small words; take the second |
| GOV.UK writing guidance; Google Material writing page; plainlanguage.gov | NOT read (redirects, an empty page, not found) | not judged | — | — |
| Geoffrey Pullum, "50 Years of Stupid Grammar Advice" — the source that cuts against | yes, in full | — | §4 | — |

Not opened, so not judged: four other copy-editing skills named by directory searches.

## 3. The pieces worth taking — in our words; none is in our guides today

1. **A shortened note is still a full sentence** — the small joining words stay (the, a, that, who, to, from, is); never
   telegram style. *(Microsoft; the UX-writing checklist.)* It alone would have stopped "no times — no OIL from it".
2. **Only four kinds of word may be cut, and the method names them:** a padding phrase with a shorter equal ("in order
   to" → "to"); a thing said twice in one note; an announcement or courtesy ("Heads up", "Note that", "please"); an
   intensifier or hedge (very, just, quite, actually). Anything else is content. *(Strunk's list; Microsoft; the checklist.)*
3. **Swap before you delete** — a shorter phrase that means the same comes first; taking a word out comes second.
4. **Never trade a named thing for "it", "this" or a vaguer word to save space** — a note is read alone, later.
   *(Strunk on specific words; Nielsen Norman.)*
5. **Watch words that are both a thing and an action** (here: input, file, post, mark, record, report, amend) — in a
   short note keep the small word that settles which is meant. *(Microsoft.)*
6. **A fresh-reader test with set questions** — the new wording alone, to a reader who has not seen the original: what
   happened, why, what does it cost, where do I put it right? An answer that differs from the original's is a lost fact.
   *(Anthropic's document skill.)* This is note 580's "cold read" made checkable.
7. **If a note cannot lose a word, make it easier to read, not shorter** — two short sentences, what happened first;
   or a headline with the detail under it. *(Apple; Microsoft.)* Beside D825's "left whole".
8. **Say what will work, not only what was wrong** — the allowed form, not the forbidden one. *(Apple.)*
9. **"Your" and "we" are filler only when they carry nothing** — "your row" set against another's is a fact. *(Apple.)*
10. **Length is a sanity check, never a target** — one skill gives 12 to 18 words as usual for an error message (its own
    figure, untraced); use it only to say a 15-word warning is not wordy.
11. **No joke or chatty word in a note people see often.** *(Nielsen Norman; Apple.)*

Where they go: 1–4, 6, 10 into the method for shortening existing text (the design skill's `clarify` playbook as we use
it, and the design guide's §1); 5, 7, 8, 9, 11 into the guide's §1 (words on screen); 6, lighter, also suits a long
report written to him (`.claude/rules/plain-language.md`).

## 4. What not to take; and what the critique says

- **Not taken:** Strunk's grammar rules and list of misused words (essays, 1918; several wrong); "use the active voice"
  as a blanket (the app's notes — "Saved", "Day published" — are right as they are); "put the strong word last" (on a
  screen the key word goes first); paragraph rules; word-count targets, reading-grade scores and outside scoring tools
  (they turn shortening into hitting a number, and would flatten words his schedulers know — OIL, AL, crew rest); a 0-to-10
  scorecard half of which scores sales aims and a chatty tone; any rule that ranks short above complete; handing a draft
  to a helper to copy-edit against the whole book; onboarding, calls to action, voice charts, translation rules. None of
  the NeoLab kit's own wording is copied (GPL-3.0).
- **The critique** (Pullum) is mainly of the book's grammar; of the style advice he says it is mostly harmless but
  empty, and of "omit needless words" that those who know which words are needless do not need the instruction — that
  is, the rule gives no test. He does NOT claim that concise writing loses meaning, and no study was found measuring
  clipped on-screen text against full sentences. So the case against over-cutting rests on the "no test" point, on
  Microsoft's keep-the-small-words rule and on Strunk's own caveat (the rule does not ask for short sentences or less
  detail) — which both Strunk skills leave buried.
- **So the pieces are worded as TESTS, never maxims:** the protected list first (what happened, why, what it costs,
  where to put it right, every name and number), then what may go; "left whole" a proper result; the check done by
  someone who has not seen the original; no word count as a goal anywhere.

## 5. Next — his to say

A change to working guides: drafted in our own words (the design guide's §1 and its use of `clarify`; one line in
`plain-language.md`), with notes 579 and 580, read by an independent reader, then put to him to approve (D70). Nothing
is installed (D486, D491, D623, D812).

## Sources opened

Read in full: NeoLab `write-concisely` SKILL.md · obra `writing-clearly-and-concisely` SKILL.md · Anthropic
`internal-comms`, `doc-coauthoring`, `brand-guidelines` SKILL.md · content-designer `ux-writing-skill` SKILL.md and its
content-usability checklist · Owl-Listener `designer-toolkit/skills/ux-writing` SKILL.md · Apple HIG Writing (data feed)
· nngroup.com error-message guidelines · Microsoft Style Guide: brand voice, simple words and concise sentences, global
writing tips · Pullum, "50 Years of Stupid Grammar Advice" (his university copy). Read in part: the three repositories'
front pages; obra's copy of the Strunk text (two rules). Failed or listing only: the Chronicle's copy of Pullum
(refused), GOV.UK's clear-language page, Material's writing page, digital.gov's plain-language page, Anthropic's skills
folder listing, four directory searches.
