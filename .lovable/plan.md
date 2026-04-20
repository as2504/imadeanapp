

## Plan

### 1. PostIdea — remove tagline
In `src/pages/PostIdea.tsx`, delete the `<p>` line: *"Validate before you build. No URL, no screenshots needed."* Keep the heading.

### 2. Mobile bottom nav — center the FAB
Currently the FAB (`MobilePublishFAB`) floats above the bottom-right of the screen, separate from the bottom nav. The request is to embed a circular "+" button **in the middle of the bottom nav bar** itself (like Instagram/X mobile pattern).

Changes:
- **`src/components/feed/FeedNavbar.tsx`** — Restructure the mobile bottom bar to 5 slots: `Home · Trending · [+] · Upcoming · Account`. The middle slot is a raised circular primary-colored button that opens a small action sheet (Publish App / Post Idea).
- **`src/components/layout/MobilePublishFAB.tsx`** — Remove (no longer needed as a separate floating element). The action-sheet logic moves inline into FeedNavbar, OR refactor MobilePublishFAB into a centered inline variant. Simpler: inline the button + popover inside FeedNavbar and delete MobilePublishFAB.

### 3. Desktop navbar — center the nav links
Reference image shows: `[IMAA logo]  ······  Home · Trending · Upcoming  ······  [search 🔍 🔔 👤]`

Currently nav links sit on the right next to the icons. Restructure `FeedNavbar.tsx` desktop layout to a 3-column grid:
- Left: IMAA logo
- Center: Home / Trending / Upcoming (absolutely centered)
- Right: Search (mobile toggle hidden on desktop), notifications, avatar

Use `flex justify-between` with the center group absolutely positioned, OR a 3-column grid (`grid-cols-3`) with center group `justify-center`. Grid is cleaner.

The desktop search input that currently lives between logo and nav will move into a popover/icon-trigger like the reference (search becomes an icon-button on desktop too, opening an inline expandable input or a command-style modal). Keeping it minimal: convert desktop search to icon-trigger that expands/opens a search popover, matching the reference.

### 4. Auth — premium password requirements UI
Currently `Auth.tsx` shows a giant red error block listing the entire alphabet — looks like a wall of regex output. Replace with a classy inline checklist that lives **below the password field** and updates live as the user types. Pattern used by Stripe, Linear, Vercel:

```
Password
[••••••••••••       👁]
✓ At least 8 characters
✓ One uppercase letter
○ One number
○ One special character
```

- Each rule renders as a small row: subtle muted icon + text, turns to primary/green check when satisfied
- No big red error block on submit — instead disable the submit button until all rules pass, OR show a single concise toast
- Compact, tasteful, no shouty colors

Implementation in `src/pages/Auth.tsx`:
- Add a `passwordChecks` derived object computed from the current `password` value
- Render a small `<ul>` below the password input (signup mode only)
- Remove the existing big red error block for password complexity
- Keep destructive errors only for actual server errors (wrong credentials, network, etc.)

### Files touched
- `src/pages/PostIdea.tsx` — remove one line
- `src/components/feed/FeedNavbar.tsx` — desktop 3-col layout, mobile 5-slot bar with centered "+"
- `src/components/layout/MobilePublishFAB.tsx` — delete (logic moves inline)
- `src/pages/Auth.tsx` — replace password error block with live checklist

