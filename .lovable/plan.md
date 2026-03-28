# Plan: Complete Premium Dark SaaS Redesign

## Summary

Full visual and structural overhaul of every page and component to match the premium dark SaaS aesthetic seen in the reference screenshots (Supabase, Vercel, GitHub, Algonaut). All existing features preserved, repositioned for better UX. Mobile-first responsive design throughout.

---

## Design System Foundation

### Color Tokens (`src/index.css`)

Already using dark tokens from previous update. Refine slightly:

- Background: `#0D1117`, Card: `#161b22`, Elevated: `#21262D`
- Accent: `#58a6ff` (blue), green for success `#3fb950`
- Borders: `#30363d` at low opacity
- Text: primary `#e6edf3`, secondary `#8b949e`

### Typography

- Inter font (already set)
- Tighter letter-spacing on headings: `-0.03em`
- Body: 14-16px, line-height 1.6
- Section labels: 11px uppercase, `tracking-[0.15em]`, `text-muted-foreground`

### Spacing

- 8px grid: all padding/margins in multiples of 4/8
- Section gaps: 64px vertical
- Card padding: 24px
- Component gaps: 16-24px

---

## Page-by-Page Changes

### 1. Landing Page (`Index.tsx`, `Navbar.tsx`, `HeroSection.tsx`, `FeaturesSection.tsx`, `Footer.tsx`)

**Navbar** - Simplify to: Logo left, nav links center (Product, Explore, Pricing), right side has "Log in" text + "Get Started" filled green/primary button. Transparent bg with backdrop blur. Thin bottom border.

**HeroSection** - Complete redesign inspired by Algonaut reference:

- Remove tab-based carousel. Replace with a single powerful hero:
  - Pill badge at top: "NEW — Showcase 2.0 is live →" (subtle border, small text)
  - Massive centered headline (text-5xl to text-7xl): "The premium platform for modern builders"
  - Subtext (text-lg, muted): one-liner value prop
  - Single large CTA button: "Start Building" with arrow
  - Below: tab-based carouse, a large product screenshot/mockup in a rounded card with subtle glow/shadow, showing the different pages.
- Subtle radial gradient glow behind the hero content (primary/10 blur)

**FeaturesSection** - Redesign as 2-column card grid (like Supabase "Branching"/"Read Replicas"):

- Each card: `bg-card border border-border/40 rounded-2xl p-8`
- Title + "NEW" badge + bullet points with checkmarks
- Optional illustration/graphic on right side of card
- Cards for: "Discovery Feed", "Publish Workflow", "Creator Profiles", "Trending Analytics"

**Footer** - Minimal dark footer: Logo left, link columns (Product, Company, Legal), social icons right. `bg-card border-t border-border/20`

**CTA Section** - Simpler: centered headline + single button, subtle glow behind

### 2. Auth Page (`Auth.tsx`)

- Center card layout on dark bg
- Card: `bg-card border border-border/40 rounded-xl p-8 max-w-sm`
- Logo at top of card
- Inputs: dark bg, subtle border, focus glow
- Button: full-width primary
- Clean toggle between sign in/sign up

### 3. Feed Navbar (`FeedNavbar.tsx`)

- Cleaner structure: Logo | Search (center, wider) | Nav links (Home, Trending) | Notification bell | Avatar dropdown
- Search bar: `bg-card border border-border/40 rounded-lg` with `Cmd+K` hint badge
- Avatar: actual profile image or initial in circle
- Mobile bottom nav: simplified icons, no floating FAB — just 5 equal icons
- Remove the `+` logo box, use text "Showcase" or a small icon

### 4. Home Feed (`HomeFeed.tsx`, `FeedLayout.tsx`, `AppCard.tsx`, `FeedFilters.tsx`, `FeedSidebar.tsx`)

**FeedLayout** - Widen to `max-w-[1200px]`. Primary column `flex-1`, sidebar `w-[300px]`. Content sits directly on bg-background (no white card wrappers).

**FeedFilters** - Horizontal pill/tab bar: "For You | Following | Trending" as text tabs with underline active state. Sort dropdown on the right as a subtle `bg-card` select. Remove category chips from the filter bar (move to sidebar).

**AppCard** - Redesign as a cleaner row card:

- Left: app icon (48px rounded-xl)
- Center: App name (bold), publisher name + verified badge (small), one-line caption, tags as tiny muted pills
- Right: rating stars, platform icons, arrow/chevron
- Hover: subtle bg shift `hover:bg-card`, thin left border highlight `border-l-2 border-primary`
- Remove heavy shadows, use `border-b border-border/20` between cards (list style, not card style)

**FeedSidebar** - Clean modules:

- "Trending Tags" card: simple list, no heavy styling
- "Creators to Follow" card: avatar + name + follow button
- "Publish CTA": subtle card, not huge blue block. `bg-card` with primary text and outlined button

### 5. Trending Page (`Trending.tsx`, `TrendingCard.tsx`, `TrendingFilters.tsx`, `TrendingSidebar.tsx`)

- Same layout as Home but with time filter tabs (Today, This Week, This Month, All Time)
- TrendingCard: rank number on left (large, muted), then same row layout as AppCard
- Category chips in sidebar, not in filter bar

### 6. App Detail (`AppDetail.tsx` + sub-components)

- Remove the huge rounded card wrapper. Content flows directly on `bg-background`
- Header: App icon (64px) + name + publisher + rating display + "Try App" button + share
- Horizontal tab bar with underline: Overview | Updates | Comments
- Screenshots: horizontal scroll with subtle shadows
- Stats/tags: inline pills below header, not in a separate section
- Description: clean prose with good line-height
- Comments: clean list with avatars
- Related apps: horizontal scroll row at bottom

### 7. Profile Page (`Profile.tsx`, `ProfileHeader.tsx`, `ProfileStatsStrip.tsx`, `ProfileSidebar.tsx`)

**ProfileHeader** - Simplified:

- No huge gradient banner. Subtle top border or thin gradient line
- Avatar (80px circle) + username + display name + bio + follow/edit button, all in a horizontal layout
- Follower count inline with username

**StatsStrip** - Horizontal row of 4 stats, no card wrapper. Just icon + number + label inline, separated by thin dividers.

**Tabs** - Underline tabs (not pill buttons): Published Apps | Saved | Activity

**Sidebar** - Social links, skills summary in clean card

### 8. Edit Profile (`EditProfile.tsx`)

- Left sidebar navigation (like GitHub settings screenshot):
  - Vertical nav: Profile, Experience, Dev
  - Active item: `text-primary bg-primary/10 border-l-2 border-primary`
- Main content area: clean form sections
- Save button: sticky at bottom or in top-right
- Remove the huge rounded card wrapper — use `bg-background` with section dividers

### 9. Publish Form (`PublishForm.tsx`)

- Two-column layout: main form left, preview/metadata right
- Clean form sections with labels and spacing
- Dark inputs with focus states
- Platform selector: clean dropdown with icons
- Tags/tech: chip input with autocomplete
- Save Draft / Publish buttons: top-right, primary + secondary styles

### 10. 404 Page (`NotFound.tsx`)

- Centered: large "404" + message + "Go Home" button

---

## Component Updates

### Shared UI Components


| Component           | Change                                                            |
| ------------------- | ----------------------------------------------------------------- |
| `button.tsx`        | Already dark-themed, keep. Ensure `rounded-lg` not `rounded-full` |
| `card.tsx`          | Already dark-themed, keep                                         |
| `input.tsx`         | Already dark-themed, keep                                         |
| `dropdown-menu.tsx` | Ensure `bg-card border-border/40`, items `hover:bg-[#21262D]`     |
| `skeleton.tsx`      | Use `bg-[#21262D]`                                                |


### New Patterns

- Section headers: `<h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">`
- Dividers: `<div className="border-t border-border/20" />` between sections
- List items: no card per item, use border-bottom separation
- Hover states: subtle bg change + optional left border accent

---

## Files Summary


| File                                                 | Change                                                    |
| ---------------------------------------------------- | --------------------------------------------------------- |
| `src/index.css`                                      | Minor token refinements, add utility classes              |
| `src/components/landing/Navbar.tsx`                  | Simplified nav with centered links                        |
| `src/components/landing/HeroSection.tsx`             | Complete rewrite: pill badge + hero headline + screenshot |
| `src/components/landing/FeaturesSection.tsx`         | 2-column feature cards like Supabase                      |
| `src/components/landing/Footer.tsx`                  | Minimal dark footer                                       |
| `src/pages/Index.tsx`                                | Simplified CTA section                                    |
| `src/pages/Auth.tsx`                                 | Card-based centered form                                  |
| `src/components/feed/FeedNavbar.tsx`                 | Cleaner nav, wider search, simplified mobile              |
| `src/components/layout/FeedLayout.tsx`               | Wider container, no wrappers                              |
| `src/components/feed/AppCard.tsx`                    | List-style row card                                       |
| `src/components/feed/FeedFilters.tsx`                | Tab bar with underline                                    |
| `src/components/feed/FeedSidebar.tsx`                | Simpler modules, no huge CTA block                        |
| `src/components/feed/FeedSkeleton.tsx`               | Match new card layout                                     |
| `src/pages/HomeFeed.tsx`                             | Layout adjustments                                        |
| `src/pages/Trending.tsx`                             | Layout adjustments                                        |
| `src/components/trending/TrendingCard.tsx`           | Row card with rank                                        |
| `src/components/trending/TrendingFilters.tsx`        | Tab bar style                                             |
| `src/components/trending/TrendingSidebar.tsx`        | Cleaner modules                                           |
| `src/pages/AppDetail.tsx`                            | Remove card wrapper, cleaner layout                       |
| `src/components/app-detail/AppDetailHeader.tsx`      | Horizontal layout                                         |
| `src/components/app-detail/AppDetailScreenshots.tsx` | Subtle shadows                                            |
| `src/components/app-detail/AppDetailStats.tsx`       | Inline pills                                              |
| `src/components/app-detail/AppDetailComments.tsx`    | Clean list                                                |
| `src/components/app-detail/RelatedApps.tsx`          | Horizontal scroll                                         |
| `src/pages/Profile.tsx`                              | Underline tabs, cleaner layout                            |
| `src/components/profile/ProfileHeader.tsx`           | Simplified, no banner                                     |
| `src/components/profile/ProfileStatsStrip.tsx`       | Inline stats row                                          |
| `src/components/profile/ProfileSidebar.tsx`          | Clean card                                                |
| `src/components/profile/ProfilePublishedApps.tsx`    | List style                                                |
| `src/pages/EditProfile.tsx`                          | Vertical sidebar nav, form sections                       |
| `src/components/publish/PublishForm.tsx`             | Cleaner form layout                                       |
| `src/components/feed/SearchBar.tsx`                  | Wider, with keyboard shortcut hint                        |
