# Plan: Settings Alignment, Feedback Dashboard Actions, Edit App Flow, Favicon, Published Apps UX

## 1. Align Settings Page Content with Navbar

**Problem:** The "Back" button, "Settings" heading, sidebar, and content panel don't align with the IMAA logo (left) and profile icon (right) in the navbar.

**Fix in `Settings.tsx`:** Change `max-w-[1000px]` to `max-w-[1200px]` to match the navbar's `max-w-[1200px]`. This aligns the left edge of "Back"/sidebar with the logo and the right edge of the content card with the profile icon.

## 2. Feedback Dashboard — 3-Dot Menu with Edit/Delete

**Fix in `Settings.tsx` (feedback list items):** Add a `DropdownMenu` with a 3-dot (`MoreVertical`) icon on each feedback config row. Options:

- **Edit** — navigates to `/feedback-setup/:appId` (the existing setup page loads current questions for editing)
- **Delete** — deletes the `app_feedback_config` row and refreshes the list with a confirmation toast

**Also show total response count** in the dashboard header area (already shown, confirm it's visible).

## 3. "Update App" Opens Edit Page with Update Note 

**Problem:** "Update App" in ProfilePublishedApps navigates to `/publish?edit=appId` which opens the full publish form. Instead it should open an edit page that pre-fills current details AND asks for an update note.

**Fix:**

- Keep navigating to `/publish?edit=appId` — the `PublishForm.tsx` already handles edit mode
- In `PublishForm.tsx`, when in edit mode (`editId` present) and the app status is `"published"`:
  - After user clicks "Save Changes", show a dialog asking for an **update note** (required text input)
  - On submit, update the app row AND insert a row into `app_updates` with the note
- For draft apps (status !== `"published"`), skip the update note dialog

## 4. Draft Apps — Edit Without Update Note

**Fix in `ProfileDraftApps.tsx`:** The "Edit" action already navigates to `/publish?edit=appId`. Since drafts aren't published, `PublishForm` will skip the update note dialog (per step 3 logic).

## 5. Favicon — Use IMAA Logo

**Fix in `index.html`:** Change `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` to `<link rel="icon" type="image/png" href="/logos/IMAAx192x192w.png" />`.

## 6. Reviews Analytics Icon

**Fix in `Settings.tsx`:** The `Star` icon is already used for "Reviews Analytics". This looks fine — no change needed unless a different icon is preferred. Already has an icon.

## 7. Published Apps — Remove 3-Dot Hover, Click-Only Dropdown

**Problem:** The 3-dot button appears on hover (`opacity-0 group-hover/card:opacity-100`), and on mobile touching/scrolling triggers it.

**Fix in `ProfilePublishedApps.tsx`:**

- Remove `opacity-0 group-hover/card:opacity-100` classes from the 3-dot button — make it always visible (subtle styling)
- OR better: remove the visible 3-dot icon entirely. Instead, make the entire card clickable to navigate to app details, and use a **long-press or right-click context menu** approach
- **Chosen approach:** Remove the hover-triggered 3-dot. Instead, make the card navigate on click. Add a small persistent but subtle 3-dot button (always visible, not hover-dependent). On mobile, this prevents scroll-triggered menus since the button is a discrete tap target, not a hover effect.
- Change the button styling: remove `opacity-0 group-hover/card:opacity-100`, keep it always visible with subtle muted styling (`opacity-60 hover:opacity-100`).

## 8. Same Fix for Draft Apps

**Fix in `ProfileDraftApps.tsx`:** Apply the same pattern — remove hover-triggered 3-dot, make it always visible but subtle.

---

## Files Summary


| File                                              | Change                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/pages/Settings.tsx`                          | Align to `max-w-[1200px]`, add 3-dot edit/delete on feedback items            |
| `src/components/profile/ProfilePublishedApps.tsx` | Remove hover 3-dot, make always-visible subtle button                         |
| `src/components/profile/ProfileDraftApps.tsx`     | Same 3-dot fix                                                                |
| `src/components/publish/PublishForm.tsx`          | Add update note dialog when editing published apps, insert into `app_updates` |
| `index.html`                                      | Update favicon to IMAA logo                                                   |
