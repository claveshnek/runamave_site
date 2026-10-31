# Writing a new blog post

No code, no local setup — do this straight on github.com:

1. Go to this folder on GitHub: `blog-posts/`
2. **Add file → Create new file**
3. Name it something like `my-new-post.md`
4. Paste this template at the top, fill it in, then write the post below in
   plain text / Markdown (blank line = new paragraph, `## heading`,
   `**bold**`, `*italic*`, `[link text](https://example.com)`, `- item` for
   lists):

```
---
title: Your Post Title Here
date: 2026-11-20
excerpt: One or two sentences — shows on the blog index and in Google search results.
---

Your post text starts here. Blank lines separate paragraphs.

## A subheading if you want one

More text. You can **bold** things, *italicize*, and [link to a video](/videos/some-slug.html)
or a [category](/categories/amateur-stepsister.html).
```

5. Scroll down → **Commit changes directly to the `main` branch** → Commit.
6. That's it. GitHub Actions picks it up automatically, builds the page, and
   pushes it — it shows up on `/blog/` within about a minute (plus however
   long it takes Netlify to deploy, once that's connected).

Notes:
- `date` controls sort order on the blog index (newest first) — use `YYYY-MM-DD`.
- The filename becomes the URL (`my-new-post.md` → `/blog/my-new-post.html`),
  unless you add a `slug:` line in the frontmatter to override it.
- To edit or delete a post later, just edit/delete its `.md` file the same way.
