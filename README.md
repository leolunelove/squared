# Squared

A calm square-building puzzle designed for touch. Use every piece to fill the board, with no gaps or overlaps. Thirty-six levels grow from 3×3 to 8×8, with rotation introduced at level 5.

## Play

[Play Squared](https://squared.leolune.fun/)

Open `dist/index.html` in a browser. It is a complete, self-contained game with no dependencies or external assets. Or serve it locally:

```sh
python3 -m http.server 4173 --directory dist
```

Visit `http://localhost:4173`. For a phone on the same network, bind the server to the computer's LAN interface and visit its LAN address. A localhost address on a phone refers to the phone itself.

Drag pieces onto the square. Tap a piece to select it; on later levels, use Rotate or double-tap the piece to turn it. Tap placement and keyboard controls are also available. Hints respect compatible pieces already on the board. More complex partial boards are searched in a background worker; if the search cannot finish promptly, the hint suggests returning a piece to the tray. Undo and restart are unlimited. Local storage saves progress and sound preference; private browsing may limit persistence.

Sound uses quiet synthesized notes. Haptics use the browser vibration API where available; iOS browsers generally do not expose this API. Reduced-motion preferences are respected.

## Campaign

The original twelve puzzles and save format are preserved. Six chapters introduce larger squares gradually: First steps (1–6), Finding flow (7–12), Tricky (13–18), Intricate (19–24), Expert (25–30), and Master (31–36). The final chapter uses 8×8 boards, reaching nine pieces in the final three puzzles. Solver search effort, shape complexity and placement ambiguity inform the ordering; these are design aids rather than measured human difficulty ratings.

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
```

The grid engine accepts every valid tiling, rather than checking against a single prescribed solution. There are no accounts, analytics, network requests, or runtime packages.

## Hosting and verification

GitHub Pages publishes `docs/` from the `main` branch of [leolunelove/squared](https://github.com/leolunelove/squared). The custom domain is `squared.leolune.fun`. Rebuild with `python3 build.py` and commit the source and updated `docs/` together to publish changes. `dist/` contains the identical standalone game for local use.

Browser layout and interaction checks are recorded in `verification.json`. Physical phone feel, audio, and haptics still require device testing.
