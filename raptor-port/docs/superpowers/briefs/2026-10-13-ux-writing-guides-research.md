# How an app should speak — the outside guides read, and what is worth taking (`[SKILL-FUSION-WRITING]`, D833; 13 Oct 26)

**He asked (13 Oct 26, D833):** a standing writing guide for all app text — *"intuitive clean simple smooth less verbose
more human text with less -"* — and said outside guides, *"and reviews on what's good"*, may shape it. The first read
(`2026-10-13-writing-skills-research.md`) covered only how to SHORTEN, and three sources would not open. This is the second
read: how an app should SPEAK. **Nothing was installed; nothing here is copied — each piece is taken in our own words into
`raptor-port/docs/design-practices.md` §1b.**

**How it was read.** By the chat that drafted the guide. Google's, Apple's and Atlassian's pages were opened in a browser
and read word for word. The others came through a fetch tool that returns a small model's account of the page — an
account, not the page; where a figure matters it is marked below. Two of the three sources that failed last time had
only moved (GOV.UK's, the US plain-language site's); the third (Google's) needs a real browser.

## 1. Which guides reviewers call the best

No head-to-head review was found; the lists that rank them (UX Writing Hub's sixteen, JetBrains' ten, a curated GitHub
list) agree on a short set, and say what each is for — these are summaries by people who teach or sell UX writing, not
tests:

| Guide | What reviewers say it is best for | Fit for this app |
|---|---|---|
| GOV.UK — writing guidelines and A to Z style | the strongest for plain language; written from reading research | high — a serious service spoken plainly |
| Google Material 3 — content design | on-screen text tied to components; the clearest rules on punctuation | high |
| Apple — Human Interface Guidelines, Writing | short, about interface text only | high (he asked for Apple's cleanliness, D821) |
| Microsoft Writing Style Guide — voice | the most quoted line: "talk like a person" | medium — one page also says prune every word |
| Atlassian — voice and tone | product text for people at work, under deadline | medium — its "bold, optimistic, with a wink" is a brand |
| Mailchimp Content Style Guide | the most cited overall; voice against tone | low — a marketing brand's dry humour |
| Shopify Polaris — content | interface decisions | not read: the page has moved and did not open |
| Books: Podmajersky, *Strategic Writing for UX*; Yifrah, *Microcopy* | reader reviews rate both highly — the first for editing in passes (purposeful, concise, conversational, clear), the second for examples | not read — only reviews and the publisher's own words were seen |

## 2. What was read, and what each says

- **GOV.UK** (the tone page and the clear-language page; the A to Z list). Tone: *brisk but not terse*; exact rather than
  friendly — friendliness "can lead to a lack of precision and unnecessary words" — *but still human, not a faceless
  machine*; serious, not pompous; no feeling-words. Write as you would talk to the person one to one, with the authority
  of someone who can help. "You" for the reader. No "please". **No semicolons — "often mis-read"; make two sentences.**
  "To" in a range of dates or times, never a dash. Split a sentence past 25 words. Short familiar words ("buy", not
  "purchase"). Negative contractions ("can't", "don't") are avoided because some readers miss the "not". Block capitals
  are hard to read. **Specialists prefer plain English too** — it cites a study of legal wording in which 80% preferred
  the plain sentence, more so the more expert the reader (the figure is the page's, through the fetch tool; the study
  itself was not opened).
- **Google Material 3** (three pages, read in the browser). **"Em dashes are best avoided in UX writing, as they indicate
  a break in the flow of a sentence that could be simplified using a comma, period, or new sentence."** Dashes "can
  interrupt a sentence and lead to a fragmented experience". Brackets define a term; never an afterthought — put what is
  needed in the sentence. Use contractions (stiff without), but "do not" where caution needs the weight. "You" and
  "your"; never mixed with "my"; "we" avoided. Consequences in neutral, direct words — never alarming. Sentence case;
  no block capitals; exclamation marks almost never; no "e.g." or "etc.".
- **Apple** (read in the browser). "When in doubt, read your writing out loud." Clear over clever: "Send", not "Let's do
  it!". **Avoid "we" altogether** — "Unable to load content" is clearer than "We're having trouble loading this
  content". "Oops" and its kind sound insincere. The most important thing first. An error says what to do. A setting
  describes what ON does. Keep a list of the app's terms and use them the same way everywhere.
- **Microsoft** (the voice page, quoted in full by the fetch tool). "Talk like a person … short everyday words,
  contractions." "Get to the point fast." Also "prune every excess word" — the line that pushes toward over-cutting
  (the first read's finding stands).
- **Atlassian** (read in the browser). "Tell people only what they need to know in the moment and nothing more."
  "Simply tell people what they need to know and get out of the way." Write "as if you are explaining to your friend
  how to travel somewhere you've visited regularly". **Plainer when the person is stressed, blocked or on a deadline.**
  Delight: "once may amuse, but a dozen times may annoy."
- **Mailchimp** (voice and tone; grammar). Voice is constant, tone changes with the reader's state. Plain-spoken first;
  clarity over entertainment. Say what is, not what is not.
- **The US plain-language guide** (digital.gov, three pages). One idea a sentence. Present tense. A verb, not a noun
  made from one ("we analyse", not "we conduct an analysis"). Say it in the positive; **never a double negative**. **No
  slash for "and" or "or"** — it leaves the reader to decide which. Keep the linking words ("however", "so",
  "therefore") — readers follow the thought by them.
- **Nielsen Norman Group — the tone-of-voice study** (2016; 100 people in an online survey, made-up brands; the figures
  are the article's own). Casual wording was rated friendlier in all four pairs. But **trust, not friendliness,
  predicted whether people would recommend** (about 52% of the difference against about 8%), and the playful insurer was
  trusted LESS than the serious one. A plain-spoken serious tone did well. Humour is a risk.
- **Nielsen Norman Group — plain language for experts** (observations of specialists, no figures). Experts want short,
  scannable text as much as anyone — and **the terms their trade shares stay**; explaining what they already know
  puts them off.

## 3. What cuts against

- **On dashes the guides do not agree.** Google says avoid the long dash; GOV.UK bans it only in ranges; **Mailchimp
  uses it** for an aside and suggests it in place of a semicolon. So "fewer dashes" rests on his own word (D833) and on
  Google's reason — a dash is a break a comma, a full stop or a new sentence says more plainly — not on any agreed rule.
- **Two popular reasons were checked and NOT taken.** That screen readers stumble on a dash: the tests found disagree
  (some pause, some say "dash", it depends on the person's settings) and none tested this app. That a dash "looks
  machine-written": a claim from 2025 opinion pieces, with no baseline; the one article that weighed it says it is not a
  reliable sign. Neither is used as a reason in the guide.
- **On contractions the guides do not agree.** Google, Microsoft and Mailchimp say use them; GOV.UK avoids the negative
  ones because a reader in a hurry can miss the "not". The guide takes both: as people say them, but "not" written out
  where it is the whole point of a warning.
- **"Conversational" is not "chatty".** The one measured study says friendliness buys little and can cost trust; GOV.UK
  says it costs precision and words. So "more human" is taken as *a person's sentence*, never as warmth, cheer or jokes.
- **No study was found** that measures any of this on a dense working tool for trained people. The evidence is
  consumer websites and public services; the rest is practice.

## 4. Worth taking — into the guide's §1b, in our words

1. **Say it aloud** — the test for "human": would the duty scheduler say this sentence to the person, across the desk?
   *(Apple; GOV.UK; Atlassian.)*
2. **A thought is joined to the next by a word or a full stop, not by a mark** — the long dash, the semicolon, the
   middle dot, the slash, brackets round an afterthought. The linking word (so, because, but, until) is a fact, which
   ties this to D825. *(Google; GOV.UK; the US guide.)*
3. **One thought a sentence; what happened first.** A sentence past about 25 words usually holds two. *(GOV.UK; the US
   guide; Apple.)*
4. **The squadron's own words stay; everyday words for the rest.** *(Nielsen Norman on experts; GOV.UK.)*
5. **Say what is and what will work; never a double negative; "not" written out where it is the point.** *(The US
   guide; Google; GOV.UK.)*
6. **"You" for the person; the app is never "we" or "I".** *(Apple; Google.)*
7. **One steady voice, plainer as the stakes rise** — exact before friendly; no alarm, no cheer, no capitals for
   stress. *(GOV.UK; Google; Atlassian; the Nielsen Norman study.)*
8. **A pair speaks as a pair, a family alike; one list of the app's terms.** *(Apple.)*
9. **Verbs, in the present.** *(The US guide.)*

**Not taken:** a brand personality or voice chart ("bold", "with a wink", dry humour); warmth, apology and
encouragement as aims; "we"; emoji; exclamation marks; reading-grade scores and length targets (as before); "prune every
word"; dropping the full stop from a sentence (Google's rule — the app's notes are sentences); the two dash arguments
in §3; anything about marketing, onboarding, search or translation.

## Sources opened

In a browser, word for word: m3.material.io/foundations/content-design (style guide: best practices, word choice,
grammar and punctuation) · developer.apple.com/design/human-interface-guidelines/writing ·
atlassian.design/foundations/content/voice-tone. Through the fetch tool (an account of the page):
guidance.publishing.service.gov.uk — the right tone, use clear language, the A to Z style guide ·
digital.gov/guides/plain-language — writing, clear and short, style · learn.microsoft.com/style-guide — brand voice ·
styleguide.mailchimp.com — voice and tone, grammar and mechanics · nngroup.com — tone-voice-users,
plain-language-experts · vispero.com — on dashes, AI and screen readers · one reader's review of Podmajersky's book
(dev.to). Search summaries only: the lists that rank the guides; the reviews of the two books; the screen-reader
threads. Did not open: Shopify Polaris's content pages (moved).
