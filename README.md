# Squared

A calm square-building puzzle designed for touch. Use every piece to fill the board, with no gaps or overlaps. Twelve levels grow from 3×3 to 6×6, with rotation introduced at level 5.

## Play

[Play Squared](https://squared.leolune.fun/)

Open `dist/index.html` in a browser. It is a complete, self-contained game with no dependencies or external assets. Or serve it locally:

```sh
python3 -m http.server 4173 --directory dist
```

Visit `http://localhost:4173`. For a phone on the same network, bind the server to the computer's LAN interface and visit its LAN address. A localhost address on a phone refers to the phone itself.

Drag pieces onto the square. Tap a piece to select it; on later levels, use Rotate to turn it. Tap placement and keyboard controls are also available. Hints respect compatible pieces already on the board and suggest removing a piece when an arrangement cannot be finished. Undo and restart are unlimited. Local storage saves progress and sound preference; private browsing may limit persistence.

Sound uses quiet synthesized notes. Haptics use the browser vibration API where available; iOS browsers generally do not expose this API. Reduced-motion preferences are respected.

## Edit and verify

Source files are in `src/`. Rebuild the standalone file and GitHub Pages output with:

```sh
python3 build.py
```

With Node installed, run the solver and geometry checks:

```sh
node tests/engine.test.mjs
```

The grid engine accepts every valid tiling, rather than checking against a single prescribed solution. There are no accounts, analytics, network requests, or runtime packages.

## Hosting and verification

GitHub Pages publishes `docs/` from the `main` branch of [leolunelove/squared](https://github.com/leolunelove/squared). The custom domain is `squared.leolune.fun`. Rebuild with `python3 build.py` and commit the source and updated `docs/` together to publish changes. `dist/` contains the identical standalone game for local use.

Browser layout and interaction checks are recorded in `verification.json`. Physical phone feel, audio, and haptics still require device testing.
