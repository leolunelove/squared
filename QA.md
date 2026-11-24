# bentoad branding verification — 1.6.0

The approved Soft toad identity is applied to the header, accessible brand label, page metadata, favicon, home-screen icon and blue/chalk interface. Vector artwork and an embedded touch icon preserve the standalone build without runtime font or image requests.

The application, engine, motion module and all 100 level definitions match the published 1.5.0 source byte for byte. The permanent storage key, session playtest key, stable level IDs, save format, per-level boards, Undo history and sound preference are unchanged. The domain remains squared.leolune.fun.

All six suites pass: 6,273 engine checks, 6,473 mobile geometry checks, 39,696 progression checks, all 100 fixed-orientation solutions and hint workers, 74 legacy-save round trips, independent arrangement/history round trips and 192 motion checks.

Browser QA covered 375×667, 320×568 and 844×390. Header controls do not overlap, page bounds fit the viewport, and the instructions dialog scrolls. Native-pointer checks covered rejected overlap, hints, completion, Undo, reload and the final nine-piece square from a seeded partial arrangement. Two saved boards and their separate Undo histories survived level switching and reload. Landscape Restart returned all nine pieces to the tray. The fixture writes a dedicated session key and is excluded from publication.

Before publication, the existing live player board showed level 3, three pieces remaining and 2/100 earned completions. Post-deployment evidence is recorded in qa/live-branding-1.6.0.json. Physical finger feel, native OS motion preference, sound and haptics remain device-test boundaries.

Version 1.6.0 is live. [Pages run 45373111814](https://github.com/leolunelove/squared/actions/runs/45373111814) succeeded, and HTTPS returned 200 with a validated certificate. The live 98,852-byte HTML matches the tested build by SHA-256. Live placement, Undo, square completion and Next passed at 375×667 in an isolated session. Reloading the normal game still showed level 3, three pieces remaining, 2/100 earned completions and sound enabled.
