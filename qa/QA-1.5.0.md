# UI motion verification — 1.5.0

The motion audit and specifications are in [MOTION.md](MOTION.md). Pointer translation remains direct, with 120ms pickup growth, 150ms landings and 180–260ms returns. Interrupted animation poses are captured before cancellation. The preview changes position immediately. Confetti, placement overshoot and continuous hint breathing are replaced by a steady outline and one completion halo.

The engine, mobile geometry, progression, fixed-orientation and campaign suites pass, including all 100 independent solutions and hint workers. An additional 192 checks cover re-grabbing from intermediate scales and positions, finger-clearance geometry, return durations and completion timing constraints.

Browser checks at 375×667 include valid placement, an invalid overlapping drop, completion, and the final nine-piece square with a 0.55-cell magnetic-edge overshoot. A slow-travel fixture checked Undo followed by immediate re-grabbing during travel. A forced reduced-motion fixture checked immediate placement, no celebration class, completion and Undo. This fixture exercises the shipped branch and CSS; it is not an OS preference test.

The final board fits 320×568 and 844×390 without page overflow. Placement, Undo, resizing and Restart leave no stranded held/moving classes. The three bentoad directions are a separate local concept artifact and do not rename the game.

Version 1.5.0 deployed successfully in [run 45312841651](https://github.com/leolunelove/squared/actions/runs/45312841651). HTTPS returned 200 with a validated certificate, and the live HTML matched the tested build byte for byte. A session-only copy of the player save retained the same current level and 2/100 earned completions. Live native-pointer placement, immediate Undo, re-placement and square completion passed. The normal save still showed 2/100 after testing. See [live motion evidence](qa/live-motion-1.5.0.json). Physical finger input, sound quality and haptics remain device-test boundaries.
