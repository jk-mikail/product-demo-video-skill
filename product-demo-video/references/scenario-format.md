# senaryo.json format

## Contents
- Top-level fields
- `settings`
- Scene fields
- Step types
- Timing rules
- Turkish keys
- Patterns

## Top-level fields

```json
{
  "title": "Customer visit walkthrough",   // transcript heading
  "settings": { ... },                     // optional
  "scenes": [ ... ]
}
```

## `settings`

| Field | Default | Meaning |
|---|---|---|
| `language` | `en` (with English keys) | Transcript language, badge, locale/timezone defaults (`en` \| `tr`) |
| `brand` | `""` | Small brand line above title cards. Empty = hidden. |
| `badge` | `"Demo data"` | Bottom-left badge. `""` = hidden. |
| `colors.dark` / `colors.dark2` | `#111827` / `#1e293b` | Card background, label background, phone-frame background |
| `colors.accent` / `colors.accent2` | `#3b82f6` / `#93c5fd` | Arrow, frame, click rings, spotlight, brand line |
| `font` | page font → Inter → Arial | Overlay font (CSS `font-family`) |
| `charsPerSec` | `15` (tr: `14`) | Narration reading speed. A scene lasts at least `length/charsPerSec + 0.6 s`. |
| `locale` / `timezone` | `en-US` / `UTC` (tr: `tr-TR` / `Europe/Istanbul`) | Browser context |

Brand palette example (navy + amber):
`"colors": { "dark": "#0b1d3a", "dark2": "#16305c", "accent": "#f5a623", "accent2": "#ffc857" }`

## Scene fields

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Short name. Also the audio file name (`<id>.mp3`). |
| `narration` | yes | Voice-over text. Sets the length. |
| `screen` | yes | What is on screen (goes into the transcript). |
| `steps` | yes | Step list. |
| `only` | no | `"desktop"` or `"mobile"` |

## Step types

| type | Fields | What happens |
|---|---|---|
| `title` | `title`, `subtitle?`, `ms?` (4000), `flow?`, `chips?` | Full-screen title card. If a scene has only a card, it stretches to the narration. |
| `goto` | `hash` | Changes `location.hash` (demo route). Same hash → `Demo.refresh()`. |
| `click` | `target`, `arrow?`, `side?` | Cursor glides. If `arrow` is set, arrow + label first. Click rings + real click. |
| `type` | `target`, `text` | Clicks, then types letter by letter (55 ms/letter). |
| `arrow` | `target`, `label`, `side?`, `ms?` (2000) | Curved arrow + label + pulsing frame. |
| `spotlight` | `target`, `ms?` (2000) | Everything except the target is dimmed. |
| `wait` | `ms` | Waits (for animations / state changes). |
| `clear` | — | Removes arrows, spotlight, cards. |

Every step accepts `only`.

`target` = the element's `data-demo` value. The recorder takes the **first visible**
`[data-demo="<target>"]`, scrolls it into view if needed. If not found it skips the step and logs a warning.

`side` = which side of the target the label sits on: `top | bottom | left | right`. If there is no room
it flips to the opposite side, then to bottom/top. On mobile `top` or `bottom` usually fits better.

### Title card variants

```json
{ "type": "title", "title": "Customer Visit", "subtitle": "step-by-step guide", "ms": 5000 }

{ "type": "title", "title": "Synced to your CRM", "ms": 6000,
  "flow": [["Panel", "Visit starts / ends"], ["CRM task", "Comment added"], ["Contact card", "Audio file attached"]] }

{ "type": "title", "title": "Open · Start · Stop · Finish", "subtitle": "The panel does the rest", "chips": true }
```

## Timing rules

```
scene length = max( real duration of the steps , narration.length / charsPerSec + 0.6 s )
scene gap    = 0.4 s
```

- If the steps are shorter than the narration, the recorder waits at the end (`dolguMs`, shown in the transcript).
- If the steps are longer, the scene grows; the narration fits comfortably.
- An arrow's `ms` is how long it stays on screen. It should be visible while the narration mentions that element.

## Turkish keys

The original pipeline uses Turkish keys. Both styles are accepted and may be mixed.

| English | Turkish |
|---|---|
| `scenes`, `steps`, `narration`, `screen`, `only`, `settings` | `sahneler`, `adimlar`, `anlatim`, `ekran`, `yalniz`, `ayar` |
| `type`: `title goto click type arrow spotlight wait clear` | `tur`: `baslik git tikla yaz ok isik bekle temizle` |
| `target`, `label`, `side` (`top bottom left right`), `text` | `sel`, `etiket`, `yon` (`ust alt sol sag`), `metin` |
| `title`, `subtitle`, `flow`, `chips`, `arrow` | `ust`, `alt`, `sema`, `cipler`, `ok` |
| `desktop`, `mobile` | `masaustu`, `mobil` |
| `brand`, `badge`, `colors{dark,dark2,accent,accent2}`, `charsPerSec`, `language` | `marka`, `rozet`, `renk{koyu,koyu2,vurgu,vurgu2}`, `karakterSn`, `dil` |

## Patterns

**Introduce an element + click**
```json
[{ "type": "arrow", "target": "day-header", "label": "Today's appointments", "side": "bottom", "ms": 2200 },
 { "type": "click", "target": "appt-1", "arrow": "Click the appointment", "side": "right" },
 { "type": "wait", "ms": 1000 }]
```

**Highlight a section**
```json
[{ "type": "spotlight", "target": "visit-section", "ms": 3000 }, { "type": "clear" }]
```

**Fill a form**
```json
[{ "type": "type", "target": "note", "text": "Interested in the 3-bedroom unit." },
 { "type": "click", "target": "add-note" }]
```

**Mobile-only warning**
```json
{ "type": "arrow", "target": "screen-warning", "label": "Keep the screen on", "side": "top", "ms": 3000, "only": "mobile" }
```
