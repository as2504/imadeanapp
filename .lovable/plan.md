

# Plan: Fix Screenshot Duplication & Tags Overflow

## 1. Fix screenshot duplication bug (CRITICAL)

**File:** `src/components/publish/PublishForm.tsx`

**Root cause:** When removing a screenshot preview (line 523), only `screenshotPreviews` is updated — `screenshotFiles` is left unchanged. This causes removed screenshots to still get uploaded on submit, and the merge logic on line 296-297 can produce duplicates.

**Fix:**
- On screenshot removal (line 523), also remove the corresponding entry from `screenshotFiles`. Need to track which previews are blob URLs (new files) vs existing URLs. When removing a blob preview at index `i`, compute the file index and remove from `screenshotFiles` too.
- Simplify the submit logic: instead of merging `existingUrls` + `screenshotUrls`, build `finalScreenshots` directly from `screenshotPreviews` — replace each blob URL with its uploaded counterpart, keep existing URLs as-is.
- Reset the file input after each selection to prevent stale `onChange` events.

**Concrete changes:**
- Line 523: Update remove handler to also call `setScreenshotFiles(prev => prev.filter((_, idx) => idx !== fileIndex))` where `fileIndex` is calculated based on how many blob URLs precede index `i`.
- Lines 284-297: Rewrite upload logic — iterate `screenshotPreviews`, upload only blob entries from matching `screenshotFiles`, keep non-blob URLs as-is. Result is exactly the screenshots the user sees.
- Line 248: After setting files, reset the input: `e.target.value = ''`.

## 2. Tags overflow with "See more/less" toggle

**File:** `src/components/app-detail/AppDetailStats.tsx`

**Problem:** All tags render in a single row with `overflow-x-auto`, which on desktop pushes the Related Apps sidebar off-screen when there are many tags.

**Fix:**
- Wrap tags in a container with `max-h` and `overflow-hidden` when collapsed (show ~1 row).
- Add a `showAllTags` state toggle.
- When collapsed, only tags that fit in one line are visible (use `flex-wrap` + fixed height ~36px for one row).
- Show a "See more" button below tags when there are more than fit in one row. When expanded, show all tags wrapped. Button changes to "See less".
- Use a ref + `useEffect` to detect if tags overflow (scrollHeight > clientHeight) to conditionally show the toggle.

## Files Summary

| File | Change |
|---|---|
| `src/components/publish/PublishForm.tsx` | Fix screenshot removal sync, rewrite upload merge logic, reset input |
| `src/components/app-detail/AppDetailStats.tsx` | Add collapsible tags with "See more/less" toggle |

