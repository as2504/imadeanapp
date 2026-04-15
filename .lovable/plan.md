

# Plan: Caption Length, Platform Icon Cleanup, Gallery Note, Settings Reorder

## 1. Caption character limit → 150

**File:** `src/components/publish/PublishForm.tsx`
- Line 455: Change `.slice(0, 80)` to `.slice(0, 150)`
- Line 463: Change `{formData.caption.length}/80` to `{formData.caption.length}/150`

## 2. Remove Zap icon from platform chips

**File:** `src/components/app-detail/AppDetailStats.tsx`
- Line 52: Remove the `<Zap size={14} className="text-primary shrink-0" />` element from the platforms group. The platform icons (web/android/iOS) are self-explanatory.
- Remove `Zap` from the lucide imports (line 3).

## 3. Add gallery note in publish form

**File:** `src/components/publish/PublishForm.tsx`
- Below the "Gallery" label (line 525), add a helper text: `<p className="text-[9px] text-muted-foreground/60 ml-0.5">These images will be shown in the gallery section of app details after publishing.</p>`

## 4. Reorder Settings sidebar: Legal above Support

**File:** `src/pages/Settings.tsx`

Current desktop sidebar order:
```
[sections: General, App Feedback, App Analytics, Legal]
--- border ---
Support
--- border ---
Log out
```

Target order:
```
[sections: General, App Feedback, App Analytics]
--- border ---
Legal
Support
--- border ---
Log out
```

Changes:
- Remove `legal` from the `sections` array (line 133)
- In the desktop sidebar (line ~273), add a Legal button in the same `border-t` group as Support — Legal first, then Support
- In the mobile dropdown, add Legal as a standalone item before Support (similar pattern)
- Define `legalSection` similar to `supportSection`
- Update `activeSectionData` to also check for `legalSection`

## Files Summary

| File | Change |
|---|---|
| `src/components/publish/PublishForm.tsx` | Caption limit 80→150, add gallery helper note |
| `src/components/app-detail/AppDetailStats.tsx` | Remove Zap icon from platforms |
| `src/pages/Settings.tsx` | Move Legal into same group as Support, above it |

