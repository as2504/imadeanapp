# Plan: Redesign AppCard Layout + Fix Icon Rendering

## Summary

Redesign the AppCard, and fix the icon rendering bug where uploaded icon URLs display as text instead of images.

## Changes to `src/components/feed/AppCard.tsx`

### 1. Fix Icon Rendering

The `appIcon` field contains either an emoji (e.g. "📱") or a URL (e.g. `https://...`). Currently it always renders as `<span>{post.appIcon}</span>`. Fix: detect if it's a URL and render `<img>` instead.

### 2. Three-dot menu → Dropdown with Save & Share

Replace the plain `<button>` with a `DropdownMenu` containing two options: "Save" and "Share". And Keep the three dots always visible.

### 3. Remove tech stack chips

Delete the tech stack section entirely from the card.

### 4. Remove bottom action bar (like, comment, share, save, try)

Delete the divider and the entire actions row at the bottom.

### 5. New layout for tags row

On the same row as tags, place the "Try" button on the right side (where tech stack used to be). This replaces the bottom action bar. and add a divider above that.

### 6. Move platform icons

Place platform icons (Web/Android/iOS) on the same line as the three-dot menu, to its left, in the header area.

### 7. Remove comment preview section

### Final card structure:

```
Header:  [icon] [name + publisher + time]  [platform icons] [⋯ dropdown]
Caption: text
Tags row: [tag pills ...]                              [Try button]
```

## Changes to `src/components/trending/TrendingCard.tsx`

Apply the same icon fix (URL vs emoji detection). Keep the trending-specific layout but apply the same structural changes:

- Remove bottom action bar
- Move Try button to tags row and add a divider above it [this row]
- Three-dot menu with Save/Share
- Platform icons near the top-right area

## Files to Edit


| File                                       | Changes                            |
| ------------------------------------------ | ---------------------------------- |
| `src/components/feed/AppCard.tsx`          | Full redesign as described         |
| `src/components/trending/TrendingCard.tsx` | Icon fix + same structural updates |
