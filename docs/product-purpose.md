# Product purpose

Status: draft for the owner to correct. Lines marked **(assumed)** are my reading of the repo, README and the owner's messages; none came from user research yet.

## One sentence

PDA helps a person **think a system through before building it**: describe it once, get the right set of connected diagrams, and leave with something they can present or hand over.

## Who it is for (assumed)

| Person | Situation | What they need in the first 5 minutes |
|---|---|---|
| Student doing coursework (primary) | Has a case study or project brief; must deliver use case, BPMN, ERD, architecture, slides | Know *which* diagrams to make and in what order; get a first draft fast |
| Small-team PM / BA | Has a rough idea or PRD | Turn it into consistent diagrams without learning a tool |
| Solo developer / architect | Has the system in their head | Draw architecture quickly, with real tech logos |

## The job to be done

"When I have an idea or a brief, help me turn it into a complete, consistent set of diagrams, so I can explain it, get approval, and start building."

## What makes PDA different (keep these, they are the product)

1. **Goal → diagram set.** It tells you which diagrams you need (goal guide), not just how to draw one.
2. **One project, many pages, one memory.** PRD and glossary keep names consistent; "Cek integrasi" finds what one page uses and another forgets.
3. **AI that picks the diagram type** and places the result beside earlier work.
4. **One offline HTML file, no account.** Works from a USB stick; data stays on the user's disk.

Everything else is support for these four.

## Front door (decision)

An empty project shows **one question and one box**:

> What do you want to design?  `[ describe it… ]  →`
> chips: **An app** · **A business process** · **Cloud infrastructure** · **An AI agent**

- Typing a description runs AI intent → picks the diagram type → generates (existing `ai/intent.ts`, `ai/generate.ts`).
- A chip opens the goal guide for that goal (existing `guide/goals.ts`) with the ordered list of diagrams.
- Under the box, three quiet links: *Paste a PRD*, *Open an example*, *Blank canvas*.
- No API key yet? The box explains in one line and offers the goal chips, which work without AI.

## First five minutes (target flow)

1. Open file → see the question (0 clicks to understand what to do).
2. Type or tap a chip (1 action).
3. See a first diagram on the canvas, with a short line saying what was drawn and what to make next (≤ 30 s).
4. Edit by clicking shapes; the toolbar and palette appear only now.
5. Next suggested page, or Export / Present.

## Success measures (can be checked by hand)

- A new user reaches a first diagram in under 1 minute without reading docs.
- First screen shows at most 5 visible actions plus the box.
- A student can produce use case + BPMN + ERD + architecture for a case study in one sitting.
- Keyboard-only and screen-reader users can complete the same flow (axe suites stay green).

## Not now (hide or defer, do not delete)

Hidden from the default view and reachable by search, Ctrl+K or the ⋯ menu:

- Most of the 86 diagram types beyond the 12-15 common ones.
- Frameworks and templates (SWOT, BMC, PESTEL…): reached through the goal guide.
- Simulation, command palette hints, minimap, hint bar.
- Project folder, language, canvas font, theme: inside ⋯ / Settings.
- "My icons" upload: ⋯ → Library.

## Out of scope (not building)

Real-time multi-user editing, accounts, a backend, telemetry, runtime dependencies.

## Open for the owner

1. Is "student first" right, or is the real first audience someone else?
2. Is the front door box (AI) acceptable when many visitors have no API key? If not, the chips become the main door.
3. Which 12-15 diagram types are the default set? Proposal: Use case, Activity, Sequence, Class, ERD, BPMN, Architecture, Deployment, Flowchart, Wireframe, User flow, Mind map, Pitch deck, SWOT, Business Model Canvas.
