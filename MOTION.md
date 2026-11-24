# Motion language — 1.5.0

Applied from the [Polish UI motion prompt](https://aiuxplayground.com/prompts/polish-ui-motion), using the current game and source as evidence.

Calm, direct, tactile: the piece follows your hand, then settles into its place.

## Audit

| Existing motion | Decision | Reason |
| --- | --- | --- |
| Frame-scheduled drag translation | Keep | Direct manipulation must track input immediately. |
| Touch lift and tray-to-board growth | Refine | Retain finger clearance and the actual grabbed cell; capture visible position before interrupting movement. |
| Finishing old animations on pickup | Replace | Finishing first can move the piece before the grab point is calculated. Freeze the visible pose instead. |
| Landing preview with a transform transition | Remove the position tween | A cell preview must identify the current target immediately. Keep a short opacity fade. |
| Scale overshoot after placement | Replace | One short landing and shadow collapse provide enough confirmation. |
| Invalid-drop return | Refine | Travel back to the exact previous position, with duration based on distance. |
| Repeated hint breathing | Remove | A steady outline is clearer while someone thinks. |
| Confetti and long completion pause | Replace | A brief board halo and softened seams confirm that individual pieces now form one square. |
| Level-tile hover translation | Remove | This is repeated navigation rather than a meaningful spatial change. |

## Interaction specification

| Interaction | Timing | Behaviour | Reduced motion |
| --- | --- | --- | --- |
| Press | Immediate | Show a slight shadow lift without changing the grab point. | Immediate selection. |
| Pickup | 120 ms ease-out | Grow from the current visible scale. Touch rises above the finger. | Full size and useful finger clearance immediately. |
| Drag | One update per frame | Direct translation, no spring lag or inertial drift. | Same direct control. |
| Landing preview | 75 ms opacity only | Cell position changes immediately; overlaps remain invalid. | Immediate preview. |
| Valid release | 150 ms ease-out | Settle from the visible release pose into the legal square. No overshoot. | Immediate placement. |
| Invalid release | 180–260 ms ease-out | Return to the exact previous board position or tray home. | Immediate return. |
| Undo and Restart | 180–260 ms | Interrupt current visual travel, then move to the restored state. | Immediate restored state. |
| Complete square | 520 ms to card | Landing, one 460 ms board halo, then a 220 ms overlay and 250 ms card entrance. | 80 ms to an immediate card; no halo. |
| Restored completed square | 180 ms to card | No new celebration for an already earned arrangement. | 80 ms. |

All travel uses transforms with `cubic-bezier(.18,.8,.22,1)`. Pointer movement itself is not eased. No spring simulation is required. Hint markers, tray homes, page furniture and phase navigation stay still.

## Implementation and verification

- The visible DOM pose is captured before cancelling travel. Pickup uses that pose to calculate the grabbed cell.
- Each piece owns at most one visual travel animation. A new pickup, Undo, Restart or resize cancels the old one.
- Grid placement, overlap rules, the 100 levels, permanent IDs and saves are unchanged.
- Keyboard placement uses the same landing path and completion feedback.
- Reduced motion is checked with an explicitly forced local QA fixture; this does not substitute for a physical-device preference check.
- Geometry tests cover interrupted pickup at varying scales, board cell sizes and shapes. Browser checks cover valid/invalid release, interrupted slow travel, Undo, completion and the final nine-piece square.

## Working rules

Do preserve the grabbed cell, direct pointer tracking, fixed homes, legal placement and recoverable actions. Do keep feedback short and give every animation an immediate alternative.

Avoid pointer lag, pickup teleports, overshoot on routine placements, decorative loops and repeated celebrations. Do not animate a cell preview through cells it cannot occupy.
