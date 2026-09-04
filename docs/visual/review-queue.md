# Review Queue — Visual Prototype v1

This records the current implementation through Milestone 8. It is not permission
to add Workspace navigation, async data or new Queue behavior.

## Frame and geometry

- Reference viewport: **1440 × 900**, with no horizontal scrollbar.
- Shell: 56px high, sticky at top 0; page side padding: 24px; content max-width:
  1600px, centered.
- Queue title/meta row: 56px; toolbar: 52px, sticky below the shell at top 56px.
- An 8px separator keeps controls apart from the table; sticky table header:
  40px high at top 116px.
- Body rows: 60px; existing horizontal cell padding: 12px.
- Native seven-column table with `table-layout: fixed` and separate borders.

| Column       | Width                    | Alignment |
| ------------ | ------------------------ | --------- |
| SLA          | 144px                    | Left      |
| Case         | 224px                    | Left      |
| Amount       | 128px                    | Right     |
| Client       | 180px                    | Left      |
| Recipient    | 180px                    | Left      |
| Risk signals | Flexible remaining width | Left      |
| Score        | 72px                     | Right     |

Risk signals absorb remaining width; do not shrink Case or SLA to make room.
Preserve the separation of `Breached 14 min` from Case metadata without reducing
SLA type size, copy or emphasis.

## Materials and layers

- Shell: near-solid light surface; supported enhancement uses 82% opacity,
  16px blur and 118% saturation, with a restrained shadow.
- Toolbar: near-solid white; supported enhancement uses 90% opacity and 12px
  blur, with restrained elevation above data.
- Table header, rows, empty/loading states, pagination and local popovers/tooltips
  use solid surfaces. Data does not use backdrop blur.
- Layer order: data → sticky header (18) → local cell overlays/separator (19)
  → toolbar (20) → shell (30). Popovers do not change row geometry.
- Opaque defaults work without `backdrop-filter`; reduced-transparency media
  rules remove blur and restore opaque shell/toolbar backgrounds.

## Domain cell grammar

- SLA: clock icon and primary `N min left` or `Breached N min`; secondary
  `Due HH:MM`. Normal is neutral. Due-soon is amber, breached is red; urgent
  states have a slim vertical marker. Prototype time is fixed at 13:24, not a
  live countdown.
- Case: compact `Queued` / `In review` lifecycle badge plus separate `Available`,
  `You` or analyst-name ownership text and marker. Second line contains Case ID,
  Operation ID and created time. IDs are plain text, not workspace links.
- Amount: right-aligned, semibold, grouped number and currency; tabular numerals.
- Client/Recipient: single-line names with CSS ellipsis. Full text stays in the
  DOM. Only actual overflow (`scrollWidth > clientWidth`) enables a tab stop and
  hover/focus tooltip; Escape dismisses it without moving focus. No native
  `title` tooltip and no tab stop for untruncated text.
- Risk signals: violet/indigo marker and up to two textual signals, with a middle
  dot separator. The second may truncate; the first and `+N` remain visible.
  `+N` opens an opaque list of additional signals. Only one row popover opens at
  a time; Escape closes and returns focus, outside pointer closes it.
- Score: neutral, right-aligned number, without traffic-light coloring.

## Toolbar and URL-owned state

Search/filter/page state belongs to the URL, not a duplicated local store.

- `q`: case-insensitive substring search across Case ID, Operation ID, Client and
  Recipient; comparison trims surrounding whitespace.
- Repeated `scope`: `queued`, `my_reviews`, `other_analyst`; selections combine
  with OR within the group.
- `sla=breached`: breached-only filter.
- Repeated `risk`: `unusual_amount`, `new_recipient`, `high_velocity`,
  `device_change`, `unusual_location`; selected signals combine with OR.
- Search, scope, SLA and risk groups combine with AND. Empty selections do not
  restrict their group.
- `page`: positive integer, default 1, page size 25. Invalid/out-of-range values
  normalize to a usable page. Search/filter changes reset page to 1.
- Typing replaces the history entry; filter/page actions push history entries.
  Reset clears Queue-owned parameters and preserves unrelated parameters.
- Order is fixed by `dueAt`, then `createdAt`, ascending. The SLA arrow is a visual
  order cue, not a sorting control.

Active filters use restrained blue emphasis. The Risk panel is a labeled
fieldset of native checkboxes, not a menu; Escape closes it and returns focus to
the trigger, outside pointer closes it, and keyboard navigation has no trap.

## Incoming cases and presentation states

- Ten initial fixtures plus one separately pending incoming fixture.
- `1 new case` inserts the fixture only on explicit activation. No automatic
  insertion or scroll jump; filtering, fixed order and pagination are reapplied.
- Preserve active URL controls. If filtered out, the incoming row stays hidden.
  A visible inserted row gets a restrained 1800ms highlight, without animation of
  its position. After the action, focus moves to the Risk filter trigger.
- Pending/highlight state is local and resets on remount; no polling or server
  subscription exists.
- Rows have subtle hover and `focus-within` treatments but are not clickable or
  focusable as whole rows.
- Empty results use a solid, seven-column spanning message.
- Loading is a table presentation prop: nine static skeleton rows with unchanged
  geometry, no shimmer/pulse. The results region is busy and skeleton content is
  hidden from assistive technology. It is not connected to an async request yet.
- Header workload counts and `Updated 13:24` are fixed prototype copy. Refresh
  has no data-fetch action yet; its accessible name and hover/focus tooltip are
  both `Refresh queue`.

## Accessibility and review contract

Preserve one main landmark, one page h1, table caption explaining fixed order,
`thead`/`tbody` and column-scoped native headers. Keep native buttons/inputs,
stable search label `Search review queue`, meaningful disclosure names,
`aria-expanded`/`aria-controls`, and a 2px blue focus outline with 2px offset.
Decorative icons and the SLA arrow are hidden from assistive technology.

Reduced-motion rules make transitions/animations effectively immediate. Review
keyboard focus, disclosures, truncation, active/empty/loading states, incoming
updates, sticky layers and horizontal overflow at the reference viewport after
UI changes. Review glass and opaque fallbacks; distinguish actual preference
emulation from source-only checks when browser tooling cannot emulate a feature.

Typography follows the current code; see the Inter discrepancy in
[the visual system](visual-system.md). Do not silently change it during unrelated
work.
