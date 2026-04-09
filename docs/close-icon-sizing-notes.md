# SVG Icon Integration Notes

Date: 2026-04-09

This file is intentionally generic.

Use it when discussing any future SVG icon swap, not just the close icon.

## Purpose

When a new SVG icon looks good in one place but wrong in another, the icon file itself is often not the real problem.

Usually the mismatch comes from the UI context around it:

- Rendered size
- Hit area
- Padding
- Color and contrast
- Visual weight of nearby controls
- The amount of empty space built into the SVG shape itself

## Plain-English rule

The same SVG should not automatically get the same treatment everywhere.

A shared icon asset is good.
A shared icon treatment is not always good.

We should usually reuse:

- The icon shape
- The `currentColor` approach
- The shared icon component when possible

But we should still tune per context:

- Size
- Color
- Button chrome
- Spacing

## What commonly makes a new SVG feel “off”

1. The icon is rendered too small.
   - A shape that looks crisp at `18px` or `20px` can feel weak at `12px`.

2. The icon color is too soft for the surface.
   - `text-ai-text-secondary` can feel fine in one area and too faint on a bright white surface.

3. The SVG has more built-in breathing room than the old icon.
   - Some icons visually occupy less of their viewBox.
   - Those icons often need to be rendered larger to feel equally strong.

4. The hit area and the visible icon are mismatched.
   - A control can technically be clickable, but still feel visually timid if the icon inside it is too small.

5. Nearby controls have different visual weight.
   - If one control is bold and another is tiny, the lighter one can feel accidental even when it is technically correct.

## Why one context can work while another fails

An icon may look great in one component because that component gives it:

- More size
- More padding
- Better contrast
- More visual importance in the layout
- Better balance with adjacent controls

That does not mean the icon is universally correct at every other size and weight.

## UX implication

If we want icon updates to feel polished, we should review them in-context instead of assuming a file swap is enough.

Especially important to check:

- Headers
- Dialog close controls
- Inline dismiss controls
- Floating controls
- Dark surfaces versus light surfaces
- Mobile versus desktop

## System implication

The best long-term pattern is usually:

1. Keep one reusable SVG shape or icon component.
2. Use `currentColor` so hover, disabled, and theme states work naturally.
3. Tune size and color by context instead of forcing one universal treatment.

## Default checklist for future SVG swaps

When a new SVG icon is introduced, review:

1. Does it use `currentColor` instead of a hardcoded black or gray?
2. Does it still read clearly at the smallest size we use?
3. Does it need a larger rendered size because of internal whitespace in the shape?
4. Does the surrounding button size still feel balanced?
5. Is the contrast strong enough on light and dark surfaces?
6. Does it feel visually balanced next to neighboring controls?

## Practical guideline

If a new icon looks too small or too light, the first things to try are:

1. Increase the rendered icon size.
2. Increase the button hit area if needed.
3. Strengthen the color on light surfaces.
4. Re-check spacing before deciding the SVG itself is wrong.

## Example from this project

We saw this with the shared close icon:

- It looked good in voice mode because it had more size, padding, and layout importance.
- It looked weak in some lighter header/dialog/prompt contexts because it was smaller and softer there.

The fix was not to abandon the shared SVG.
The fix was to keep the shared shape and tune the treatment by context.
