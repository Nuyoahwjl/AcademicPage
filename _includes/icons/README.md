# Sidebar icons

All currently displayed sidebar icons are SVG includes in this directory:


- `email.svg`: email envelope.
- `graduation-cap.svg`: Google Scholar graduation cap.
- `github.svg`: GitHub brand mark, Simple Icons v14.0.0 (CC0-1.0).
- `rednote.svg`: Xiaohongshu (RedNote) wordmark knocked out of a filled circle; wordmark geometry from Simple Icons (CC0-1.0), downloaded from https://cdn.simpleicons.org/xiaohongshu.
- `x.svg`: X brand mark, Simple Icons v14.0.0 (CC0-1.0).

The email and graduation cap geometry is authored for this site. Simple Icons sources are linked in the corresponding SVG comments: https://github.com/simple-icons/simple-icons/tree/14.0.0/icons

`LICENSE-lucide.txt` is retained for the retired Lucide `book-open` glyph that an earlier `rednote.svg` used; no current icon depends on it.

These SVGs are decorative next to visible link labels, so they use `aria-hidden="true"` and `focusable="false"`. Their shared size, spacing and color are controlled by `.author__svg-icon` in `assets/css/main.css`.
