# Trending Algorithm Documentation

## Overview

IMAA uses a **gravity-based time-decay algorithm** to rank apps by real user engagement. The system rewards genuine interaction and naturally decays older content, ensuring fresh and actively-used apps surface to the top.

---

## Formula

The trending score is calculated in three steps:

### 1. Engagement Score (Weighted Points)

Each unique user interaction earns points for the app:

| Action              | Points | Source Table              | Uniqueness Constraint        |
|---------------------|--------|---------------------------|------------------------------|
| Tries (Outbound Clicks) | **15** | `app_clicks`            | `UNIQUE(app_id, user_id)`    |
| Feedback Submissions    | **10** | `app_feedback_responses`| `COUNT(DISTINCT user_id)`    |
| Reviews / Ratings       | **5**  | `ratings`               | Per-row (one rating per user)|
| Saves (Bookmarks)       | **4**  | `saved_apps`            | One save per user per app    |
| Review Likes            | **2**  | `comments.likes_count`  | Aggregated like count        |
| Rating Count            | **1**  | `ratings`               | Total number of ratings      |

```
EngagementScore = (Tries × 15) + (Feedback × 10) + (Reviews × 5) + (Saves × 4) + (ReviewLikes × 2) + (Ratings × 1)
```

### 2. Quality Multiplier

The engagement score is multiplied by the app's average rating (minimum 1.0) to reward higher-quality apps:

```
QualityScore = EngagementScore × MAX(AverageRating, 1.0)
```

Apps with no ratings use an effective multiplier of 1.0 (no penalty, no boost).

### 3. Time Decay (Gravity)

A gravity function ensures older apps naturally lose ranking prominence:

```
TrendingScore = QualityScore / POWER((AgeInHours + 2), 1.5)
```

- **AgeInHours** = hours since the app was first published (`apps.created_at`)
- **+2** prevents division by zero and smooths the curve for very new apps
- **1.5** is the gravity exponent — higher values cause faster decay

---

## Database Tables Used

| Table                    | Role                                      |
|--------------------------|-------------------------------------------|
| `apps`                   | Source of published apps and `created_at`  |
| `app_clicks`             | Tracks unique outbound "Try App" clicks    |
| `app_feedback_responses` | Tracks unique feedback submissions         |
| `ratings`                | Stores ratings and review text             |
| `saved_apps`             | Tracks user bookmarks                      |
| `comments`               | Stores reviews; `likes_count` column used  |

---

## RPC Function: `get_trending_apps`

The algorithm runs as a **Supabase RPC function** (`public.get_trending_apps`) written in SQL with `SECURITY DEFINER` to bypass RLS and access all tables consistently.

### Parameters

| Parameter     | Type   | Default  | Description                                |
|---------------|--------|----------|--------------------------------------------|
| `time_filter` | `text` | `'week'` | Filter apps by age: `today`, `week`, `month`, `all` |
| `max_results` | `int`  | `30`     | Maximum number of results to return        |

### Returns

| Column             | Type    | Description                        |
|--------------------|---------|------------------------------------|
| `app_id`           | `uuid`  | The app's ID                       |
| `trending_score`   | `float` | Final calculated trending score    |
| `engagement_score` | `float` | Raw weighted engagement points     |
| `avg_rating`       | `float` | Average star rating                |
| `tries_count`      | `bigint`| Unique outbound clicks             |
| `feedback_count`   | `bigint`| Unique feedback submissions        |
| `reviews_count`    | `bigint`| Total reviews                      |
| `saves_count`      | `bigint`| Unique saves                       |
| `review_likes_count`| `bigint`| Total likes on reviews            |
| `ratings_count`    | `bigint`| Total ratings                      |

---

## Anti-Bias & Anti-Gaming Measures

1. **Unique Constraints**: `app_clicks` has a `UNIQUE(app_id, user_id)` constraint — each user can only contribute one "try" per app. Feedback and saves similarly count distinct users only.

2. **Time Decay**: The gravity formula (`POWER(age + 2, 1.5)`) ensures no app can stay at the top indefinitely. Even highly-engaged apps will naturally decline unless they continue receiving fresh interactions.

3. **Quality Gate**: The average rating multiplier means apps with poor ratings score lower even if they have high raw engagement. This prevents low-quality apps from gaming the system with volume alone.

4. **Server-Side Calculation**: The RPC function uses `SECURITY DEFINER` and runs entirely on the database, preventing client-side manipulation of scores.

5. **No Self-Boosting**: RLS policies ensure users can only insert their own interactions (`auth.uid() = user_id`), preventing one user from creating fake engagement on behalf of others.

---

## Time Filter Mapping

The frontend maps user-facing filter labels to RPC parameters:

| UI Label    | `time_filter` value |
|-------------|---------------------|
| Today       | `'today'`           |
| This Week   | `'week'`            |
| This Month  | `'month'`           |
| All Time    | `'all'`             |

---

## Example Calculation

An app published 48 hours ago with:
- 10 unique tries, 3 feedback submissions, 5 reviews, 8 saves, 12 review likes, 5 ratings
- Average rating: 4.2

```
EngagementScore = (10×15) + (3×10) + (5×5) + (8×4) + (12×2) + (5×1)
               = 150 + 30 + 25 + 32 + 24 + 5
               = 266

QualityScore = 266 × 4.2 = 1117.2

AgeInHours = 48
TrendingScore = 1117.2 / POWER(48 + 2, 1.5)
             = 1117.2 / POWER(50, 1.5)
             = 1117.2 / 353.55
             ≈ 3.16
```
