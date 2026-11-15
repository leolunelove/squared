# Squared domain setup

Live game: https://squared.leolune.fun/

Repository: https://github.com/leolunelove/squared

GitHub Pages publishes `main` → `/docs`. The initial build and deployment succeeded in [run 43410481549](https://github.com/leolunelove/squared/actions/runs/43410481549).

## DNS record

The following record is saved in Namecheap’s `leolune.fun` DNS zone:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| CNAME | squared | leolunelove.github.io | Automatic |

## Verification — 13 November 2026

- The CNAME resolves correctly through the local resolver and Google Public DNS.
- GitHub’s TLS certificate was issued and Enforce HTTPS is enabled.
- HTTPS returns 200 and the certificate verifies successfully.
- HTTP returns 301 to the HTTPS address.
- The live 1.1.0 HTML exactly matches the tested standalone build (53,547 bytes).
- The game and instructions dialog load correctly in Chrome on the live domain.

The deployment is self-contained and has no runtime dependencies or external assets. Physical phone touch, audio quality, and haptics remain device-test items.

## Mobile polish — 15 November 2026

Version 1.1.0 is deployed from commit `07c51bfd6617c8b0c24991b77838d3c86c37b973`. All twelve levels were completed on the updated HTTPS site. See `QA.md` for scope and evidence.
