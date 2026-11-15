# Campaign expansion verification — 1.2.0

All 36 puzzles were completed locally through native pointer drags and the Rotate control at 375×667. The original twelve level definitions are unchanged. Save compatibility checks confirm that finishing level 12 unlocks level 13 without resetting earlier completions.

The engine independently solves all 36 boards. Tests cover partial placements, connected shapes, bounds, overlap rejection, progression, and the actual hint-worker script on rotated alternative arrangements. New puzzles are ordered using size, piece count, shape clues and three shuffled exact-cover searches; search effort is a design aid, not a measured human difficulty score. See [grading details](qa/level-grading.json).

The final nine-piece puzzle fits 320×568 portrait and 844×390 landscape without page scrolling. The collection scrolls the current puzzle into view. An alternate rotated placement requests a background hint successfully; Restart clears stale hint work.

Live release verification is pending. Release playthroughs use a separate session save (`?playtest=1`) to avoid completing new levels in the player’s campaign.

These are browser checks at phone viewport sizes using pointer input. Physical phone touch feel, sound quality and vibration remain device-testing boundaries. The previous release evidence is retained in [the 1.1 verification record](qa/verification-1.1.0.json).
