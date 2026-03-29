You are an expert UI/UX designer creating a premium, modern, zero-scroll wizard-style "Publish App" page. The entire experience must feel dense, professional, and high-end like Supabase settings pages — no wasted space, tight vertical spacing, clean typography, and every pixel purposeful.
Overall page layout:

The page uses the site's existing colored background (keep the exact same color palette as the rest of the site — do not invent new colors).
The entire wizard lives inside a centered white rounded card ( soft shadow, generous but tight internal padding). This white card is what makes the page feel full and premium.
No left sidebar anywhere.
No live preview pane.

Top bar (inside the white card, sticky):

Left side: Text-only link “Cancel” (subtle, no arrow, no heavy button styling). When clicked, show a clean modal: “Save draft before leaving?” if any of the details are entered. with two buttons — “Save & Exit” (primary) and “Discard” (secondary).
Center: Non-interactive horizontal progress bar (0–100%). It updates live as the user fills required fields. At 100% show a green tick with a subtle scale animation.
Right side: Two buttons — “Save as Draft” (secondary outline button) and “Publish App” (primary blue button). “Publish App” is disabled until Step 4 and all required fields are filled.

Wizard structure:

Exactly 4 steps. Only one step visible at a time.
Smooth fade transition (0.2s) when moving between steps.
Progress bar updates automatically based on completed required fields per step.

Bottom bar (inside white card, fixed at top of the card):

Left: From Step 2 onwards, show subtle text “← Back” (no heavy button). On Step 1 this is hidden.
Right: Prominent button “Next →” (with right arrow). On Step 4 this button becomes “Publish App” (same styling as the top-right one) and triggers confetti.

Field states (apply everywhere):

Default: light gray border.
Active/focused: blue border.
Required but empty and user clicks Next: red border + small red helper text “This field is required”.
Soft warning (optional): yellow border + small helper.

Step 1 – App info
Fields (tight vertical spacing like Supabase):

App Name (required, single line input, placeholder “What’s your app called?”, max 20 chars, live counter)
Caption (required, single line input, placeholder “This will be first thing users will read about your app", max 80 chars, small helper “Short, punchy description shown under the name”)
About the App (required, textarea with markdown support, placeholder “Tell users more about your application.  what problem it solves and why it feels special.”)

Step 2 – Visuals
Title: “How it looks?"

App Icon: Compact square upload area (180×180 px recommended). Show instant square crop preview below. Dashed border, “Drop or click to upload” text.
Gallery: Horizontal row of up to 3 image slots. Starts with “+ Add images (up to 3)” button. Once added, show thumbnails with remove X. Drag-to-reorder supported. Helper text: “Up to 3 images. First one becomes featured.”
Demo Video URL: Single input field below gallery

Step 3 – Platforms & Tech
Title: “Where it runs & how it’s built”
(platforms):

Three toggle switches with icons: Web (pre-checked), Android, iOS.
Below the toggles: Dynamic URL input fields..
When user enables Android, a new “Android URL / Play Store link” input appears.
When user enables iOS, a new “iOS URL / App Store link” input appears.
At least one platform is required.

Tech Stack: Tag input with autocomplete suggestions (React, Flutter, Next.js, Node.js, Supabase, Tailwind, etc.). While typing, show dropdown suggestions. If user presses Enter on a non-suggested value, add it as a custom tag. Display as small rounded bubbles with remove X.
Tags: Same behavior as Tech Stack but with vibe-specific suggestions (productivity, health, sports, ai, social, fun, minimal, creative, etc.). Max 8 tags. Also show as small rounded bubbles.

Step 4 – Links & Finish
Title: “Final details & publish”
Fields:

GitHub Repository URL (optional)
Live Demo / Website URL (optional)
Social Media Links: Repeatable section. Start with one row. Each row has:
Dropdown (with icons): Twitter/X, Discord, LinkedIn, Instagram, YouTube, Other
URL input field
“+ Add another link” button below the last row.

Privacy Policy URL (optional): First show a toggle “Does your app have a privacy policy?” → If Yes, show the URL input field.
at the end give a confirmation text and a tick button -> the app follows all the community guidelines. (this will be the required filed from the step 4, marking this will complete it to 100%)

Final actions on Step 4:

When user clicks “Publish App” (bottom or top button), show a beautiful short confetti animation (2 seconds) with centered text “Your app is live!” and a "back to profile” button which takes user to their profile page..

Additional premium details:

All inputs have generous but tight padding.
Make the white card feel dense and full — never leave large empty areas.
Mobile responsive: on mobile the card takes full width, bottom bar becomes safe-area friendly.
Use clean sans-serif fonts, subtle shadows, and smooth hover/focus states.

MOST IMPORTANT, THE WHITE CARD SIZE REMAINS SAME FOR ALL THE STEPS even if it has more details of less. the buttons next and back will be exactly on the same spot. if the page is inceasing vertically due to user inputs, make the inside scrollable. but never move the position of the buttons and the card. make sure that the scroll bar is also mathcing the theme of the page.
the white card will update according to the dark mode when user uses dark mode.