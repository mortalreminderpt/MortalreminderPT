# MortalreminderPT Next.js

This project faithfully migrates https://github.com/mortalreminderpt/MortalreminderPT to Next.js. Preserve the original appearance, responsive breakpoints, bilingual URLs, article content, and interactions.

- Original reference commit: `6bf3cee258799cfe83a9e24a5c8cd6643f72aa31`.
- Edit React components, original SCSS, and Markdown content. Do not redesign.
- `content/rendered/` preserves the exact original Kramdown/TeX output for unchanged articles. Source Markdown remains in `content/posts/` and is editable. Changed Markdown is compiled by the JavaScript content pipeline.
- All generated routes must remain statically exportable and usable on GitHub Pages.
- Keep credentials, runtime caches, builds, and browser artifacts out of Git.
- Use `npm run build`, `npm run typecheck`, `npm run test:content`, and the browser suite before handoff.
