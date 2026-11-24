# Squared

A calm square-building puzzle designed for touch. Use every piece to fill the board, with no gaps or overlaps. One hundred levels grow from 3×3 to 8×8, with every piece already facing its fitting direction.

## Play

[Play Squared](https://squared.leolune.fun/)

Open `dist/index.html` in a browser. It is a complete, self-contained game with no dependencies or external assets. Or serve it locally:

```sh
python3 -m http.server 4173 --directory dist
```

Visit `http://localhost:4173`. For a phone on the same network, bind the server to the computer's LAN interface and visit its LAN address. A localhost address on a phone refers to the phone itself.

Drag pieces onto the square. Pieces keep a fixed orientation; drag them into place. Tap placement and keyboard controls are also available. Hints respect compatible pieces already on the board. More complex partial boards are searched in a background worker; if the search cannot finish promptly, the hint suggests returning a piece to the tray. Undo and restart are unlimited. Local storage saves progress and sound preference; private browsing may limit persistence.

Sound uses quiet synthesized notes. Haptics use the browser vibration API where available; iOS browsers generally do not expose this API. Reduced-motion preferences are respected.

## Motion

Pickup grows over 120ms while preserving the visible grabbed cell. Drag movement follows the pointer directly. Legal placements settle over 150ms; rejected drops return over 180–260ms. A quiet board halo replaces confetti, with completion available after 520ms. New gestures, Undo, Restart and resizing interrupt travel cleanly. Reduced motion uses immediate movement and no halo. See `MOTION.md` for the audit, interaction specifications and working rules.

## Campaign

Five phases contain twenty puzzles each: Learn (1–20), Connect (21–40), Compare (41–60), Plan (61–80), and Master (81–100). Boards grow from 3×3 to 8×8, with up to nine pieces. Each phase introduces its larger board or piece count gently, then increases structural ambiguity.

All 36 existing puzzle layouts retain stable IDs. Legacy completion marks and the current square migrate to those IDs even when the displayed level number changes. Unfinished arrangements and up to eighty Undo steps are saved separately for each visited puzzle. A legacy player retains access to their former current square and the newly inserted puzzles before it.

Five shuffled fixed-orientation exact-cover searches, concavity, rectangular clues and placement ambiguity inform the ordering. These are structural design aids rather than measured human difficulty ratings. Final calibration needs real-player sessions.

Release playthroughs use `?playtest=1`, which seeds a separate session save from the player’s progress and never writes to the campaign save.

## Edit and verify

Source files are in `src/`. Rebuild the standalone file and GitHub Pages output with:

```sh
python3 build.py
```

With Node installed, run the solver and geometry checks:

```sh
node tests/engine.test.mjs
node tests/mobile.test.mjs
node tests/progression.test.mjs
node tests/fixed-orientation.test.mjs
node tests/campaign.test.mjs
node tests/motion.test.mjs
```

The grid engine accepts every valid tiling, rather than checking against a single prescribed solution. There are no accounts, analytics, network requests, or runtime packages.

## Hosting and verification

GitHub Pages publishes `docs/` from the `main` branch of [leolunelove/squared](https://github.com/leolunelove/squared). The custom domain is `squared.leolune.fun`. Rebuild with `python3 build.py` and commit the source and updated `docs/` together to publish changes. `dist/` contains the identical standalone game for local use.

Browser layout and interaction checks are recorded in `verification.json`. Physical phone feel, audio, and haptics still require device testing.
