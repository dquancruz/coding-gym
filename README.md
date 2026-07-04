# 🏋️ Coding Gym

Active practice repo to go from **junior to senior** on a full-stack + AI
stack, using Claude Code as your coach.

## Using this with your team
This repo is a **template**: if a coworker wants to use it, have them clone
or fork their own copy. Everyone keeps their own `progress/` — there's no
shared state or levels stepping on each other between people.

## How it works
1. `CLAUDE.md` defines the rules of the game (read this first if you're Claude Code).
2. `ROADMAP.md` defines the full stack, the 3 available paths, and their phases.
3. Each `NN-track/` folder has its own junior→mid checklist in its `README.md`.
4. `progress/tracker.md` and `progress/log.md` keep the progress record.

## First use
If this is your first time in your copy of the repo, run in order:

```
choose path
```
I'll show you the 3 available paths (Full-stack Web, Backend & Data, Applied
AI) and you pick one.

```
assess level
```
If you already have prior experience, this evaluates your real level per
skill instead of assuming you start at 🟥 (junior) across the board.

## Daily use
Then, in each session:

```
exercise
```

Claude will pick the track and skill based on your path, the active phase,
and your tracker, and will generate an exercise in `NN-track/exercises/`.
Solve it, then:

```
review
```

Other commands: `progress`, `level up [skill]`, `next phase`.

## Levels
🟥 Junior → 🟨 Junior+ → 🟩 Mid → 🟦 Senior. The mid→senior jump is graded
with a different rubric (design, ambiguity, mentoring) — see `CLAUDE.md`.

## Paths and current phase
See the full detail (the 3 paths and their Junior→Mid / Mid→Senior phases)
in `ROADMAP.md`. Your path and active phase are tracked in
`progress/tracker.md`.
