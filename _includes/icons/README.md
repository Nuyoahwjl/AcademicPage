# Sidebar icons

All currently displayed sidebar icons are SVG includes in this directory:


- `email.svg`: email envelope.
- `graduation-cap.svg`: Google Scholar graduation cap.
- `github.svg`: GitHub brand mark, Simple Icons v14.0.0 (CC0-1.0).
- `rednote.svg`: monochrome square book symbol adapted from Lucide's `book-open` v0.468.0; not an official brand mark. License: `LICENSE-lucide.txt`.
- `x.svg`: X brand mark, Simple Icons v14.0.0 (CC0-1.0).

The email and graduation cap geometry is authored for this site. Simple Icons sources are linked in the corresponding SVG comments: https://github.com/simple-icons/simple-icons/tree/14.0.0/icons

These SVGs are decorative next to visible link labels, so they use `aria-hidden="true"` and `focusable="false"`. Their shared size, spacing and color are controlled by `.author__svg-icon` in `assets/css/main.css`.
