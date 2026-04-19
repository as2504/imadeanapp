

# Plan: Upcoming Apps + "Notify Me"

Adding "Notify Me" to the previously approved plan. Decisions locked in from prior discussion: 1 upvote per user, anonymous viewing allowed, 5 active ideas max per builder.

## Navigation

Desktop: **Home · Trending · Upcoming** (with NEW pill for 30 days)
Mobile bottom: **Home · Trending · Upcoming · Account** + floating "+" FAB for Publish/Post Idea

## Database changes (single migration)

1. Allow `'upcoming'` as a valid `apps.status` value
2. Add columns: `apps.upvotes_count int default 0`, `apps.planned_launch text`, `apps.notify_count int default 0`
3. New table `idea_upvotes (id, app_id, user_id, created_at)` — unique `(app_id, user_id)`
4. New table `idea_notify_subscriptions (id, app_id, user_id, created_at, notified_at)` — unique `(app_id, user_id)`
5. New table `notifications (id, user_id, type, app_id, title, body, read, created_at)` — for in-app notification bell
6. Triggers:
   - Sync `upvotes_count` and `notify_count` on insert/delete
   - On `apps.status` change `upcoming → published`: insert a `notifications` row for every subscriber, mark `notified_at`
7. RLS:
   - Public can SELECT apps where `status IN ('published','upcoming')`
   - `idea_upvotes` / `idea_notify_subscriptions`: insert/delete by self, public read counts
   - `notifications`: SELECT/UPDATE only by `user_id`
8. Enforce 5-active-ideas cap via insert trigger on `apps`

## Pages & components

**New pages**
- `src/pages/Upcoming.tsx` — list with sort tabs (Top Voted · Most Recent · Most Discussed · Launching Soon)
- `src/pages/UpcomingDetail.tsx` — idea detail (upvote + notify-me + comments + owner "Convert to Published" banner)
- `src/pages/PostIdea.tsx` — single-step lightweight form

**New components**
- `src/components/upcoming/IdeaCard.tsx` — row card, upvote on left
- `src/components/upcoming/UpvoteButton.tsx` — optimistic toggle
- `src/components/upcoming/NotifyMeButton.tsx` — bell-icon toggle, shows count
- `src/components/upcoming/ConvertToPublishedBanner.tsx` — owner CTA
- `src/components/profile/ProfileIdeas.tsx` — new "Ideas" profile tab
- `src/components/layout/MobilePublishFAB.tsx` — floating "+" with menu (Publish App / Post Idea)
- `src/components/notifications/NotificationDropdown.tsx` — replaces empty bell popover in `FeedNavbar`

## Files to modify

| File | Change |
|---|---|
| `src/App.tsx` | Add routes `/upcoming`, `/upcoming/:slug`, `/post-idea` |
| `src/components/feed/FeedNavbar.tsx` | Add Upcoming link + NEW pill, rebuild mobile bar, wire notification dropdown |
| `src/pages/HomeFeed.tsx` | Verify `status='published'` filter, mount FAB |
| `src/pages/Trending.tsx` | Verify exclusion of upcoming |
| `src/pages/Profile.tsx` | Add "Ideas" tab |
| `src/components/feed/SearchBar.tsx` | Tag upcoming results with "Idea" badge |
| `src/components/publish/PublishForm.tsx` | When converting from upcoming, prefill from existing app row |

## "Notify Me" flow

1. On `/upcoming/:slug`, anyone (logged in) can click bell → row in `idea_notify_subscriptions`
2. Owner converts idea → publish (status update)
3. Trigger fans out: one `notifications` row per subscriber + marks `notified_at`
4. Bell icon in navbar shows unread badge; dropdown lists notifications; clicking deep-links to `/app/:slug`
5. Email notifications: deferred to v2 (would require email infra setup)

## Implementation order

1. Migration (tables, columns, triggers, RLS, 5-idea cap)
2. Routes + navbar (Upcoming link, mobile bar, FAB, notification dropdown shell)
3. PostIdea page → ideas in DB
4. Upcoming list + IdeaCard + UpvoteButton + NotifyMeButton
5. UpcomingDetail + comments + ConvertToPublishedBanner
6. Notification fan-out trigger + dropdown wiring
7. Profile "Ideas" tab

## Open confirmations

- **Notification scope**: in-app only for v1 (email later)? Recommend yes.
- **Notify Me requires login**: yes (need user_id to notify). Guests get a tooltip "Sign in to get notified".
- **Show notify count publicly on idea card** (e.g. "🔔 47 waiting")? Recommend yes — strong social proof for the builder.

