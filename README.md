# eric-gitonga-links

The hub for [ericgitonga.com](https://www.ericgitonga.com/) — four cards, in alphabetical
order:

| Card | Where it lives | What it is |
|---|---|---|
| Daguerreotypes | `ericgitonga.com/daguerreotypes` | Photography — landscapes, portraits, documentary moments. Placeholder page (`daguerreotypes.html`) for now. |
| Daubs | `ericgitonga.com/daubs` | Drawings, watercolours, and marks made for their own sake. Placeholder page (`daubs.html`) for now. |
| Diffs | `ericgitonga.com/diffs` | Software and systems — Eric's technical practice. Live content (`diffs.html`): the "how fast you can expect this" stats and the Software & AI products list. |
| Dudus | `ericgitonga.com/dudus` | Kenya's tiniest wildlife. This page (`dudus.html`) links out to the two real separate deployments: [dudus-app](https://dudus.ericgitonga.com) (identification companion) and [dudu-merchandise](https://shop.dudus.ericgitonga.com) (shop, nested under it as `shop.dudus.ericgitonga.com`). |

Card names are each a term of art specific to their craft, not a generic label —
Daguerreotypes (the historic photographic process), Daubs (the painter's own word for informal
work), Diffs (the developer's word for comparing versions), Dudus (Kenyan slang for insects).

Every card is a path on this one repo — Dudus is the only one whose page exists purely to link
onward to real external deployments, rather than being content in itself.

Daguerreotypes, Daubs, and Diffs are paths on this one static site, not subdomains — they're just
pages in this repo, not separate deployments, so there's no real infrastructure behind a
`daguerreotypes.ericgitonga.com`-style hostname yet. (An earlier draft tried host-based
`vercel.json` rewrites to fake real subdomains for these three; that mechanism is
[documented as unreliable in production](https://community.vercel.com/t/vercel-json-the-has-condition-on-host-doesnt-seem-to-work/9863),
and it didn't fire in local testing either, so it was dropped in favor of plain paths — reliable,
and honest about what's actually deployed.) If any of them grows into its own real app someday,
it can graduate to a real subdomain then, the same way dudus-app and dudu-merchandise already
have — those are genuinely separate deployments, just reached via a link from `/dudus` rather
than directly from the hub card.

Static HTML, no build step, deployed straight to Vercel. `vercel.json` sets `cleanUrls: true`
so `/diffs` serves `diffs.html` (etc.) without the extension — no framework/router needed. Bio,
Blog, and Contact are reached from the top nav on the hub page (`index.html`), not from a card —
Bio and Contact are modal dialogs, Blog is a real page (`/blog`). The Contact modal's form POSTs
to `/api/contact` (a Vercel serverless function using Resend's REST API directly, no SDK)
instead of a `mailto:` link, so a visitor's message reaches `gitonga@gmail.com` without them
needing their own mail client open — requires `RESEND_API_KEY` (and optionally `FROM_EMAIL`) set
as a Vercel env var on this project.

## Blog

`/blog` and `/blog/<slug>` — same brand kit and breadcrumb as the rest of the site, so "back to
ericgitonga.com" actually works (this replaced an external link to a Substack blog for exactly
that reason: no way back into the rest of the site from there).

No CMS. Posts are Markdown with YAML frontmatter in `blog/posts/*.md`, rendered to static HTML
by `scripts/build_blog.py` (Python's `markdown` + `yaml`, both already in the `ds` conda env — no
new dependency). Run it locally after adding/editing a post and commit the generated
`blog.html`/`blog/<slug>.html` alongside the source, same as everything else here:

```bash
conda run -n ds python scripts/build_blog.py
```

See `blog/MIGRATION.md` for bringing the existing Substack archive (~12 posts, 2018–2025) across.

Design: a shared brand kit across `eric-gitonga-links`, `dudus-app`, and `dudu-merchandise` —
warm paper-cream ground, dark ink, one verdigris accent, Newsreader/Archivo Narrow/IBM Plex Mono
type pairing, catalogue-plate numbering (PLATE I–IV), and a standardized top-left breadcrumb
(`← ERIC GITONGA / <PAGE>`) on every page across all three sites. Reference:
`extras/personal/me/eric-hub-concept.html` in the wider `Develop/projects` tree (not part of
this repo).

## Media (Daguerreotypes / Dudus galleries)

Photo/entomology media for the Daguerreotypes and Dudus plates is sourced from Eric's Angry
Hosting account, not this repo — uploading a new photo there is enough to make it appear on the
site, no code change or redeploy needed. Folder convention on Angry Hosting (one level of albums,
no further nesting): `Daguerreotypes/<album>/<image>` and `Dudus/<album>/<image>`, hyphenated
album slugs, an optional `cover.<ext>` file per album to set its grid thumbnail (defaults to the
first image alphabetically otherwise).

`api/sync-media.js` is a Vercel Serverless Function, triggered once daily by Vercel Cron
(`vercel.json`), that connects to Angry Hosting over FTP(S) (`basic-ftp`), walks both plates'
albums, and publishes a JSON manifest to Vercel Blob (`@vercel/blob`) — this is the first
`package.json` this repo has needed (the contact form calls Resend's REST API directly with
`fetch`, no dependency). `api/media-manifest.js` is a thin same-origin proxy the static gallery
pages read from, so client code never needs to know the actual Blob URL. The album-grid + modal
image viewer UI itself is a separate follow-up (see open issues).

Requires these Vercel env vars: `ANGRYHOSTING_FTP_HOST`, `ANGRYHOSTING_FTP_USER`,
`ANGRYHOSTING_FTP_PASSWORD`, `MEDIA_BASE_URL` (currently `http://media.ericgitonga.com` — **switch
to `https://` the moment Angry Hosting issues a certificate for that subdomain**, env var change
only), `CRON_SECRET` (so `/api/sync-media` can't be triggered by anyone else). Optional:
`ANGRYHOSTING_FTP_BASE_PATH` if the FTP account's login root isn't already the
`media.ericgitonga.com` webroot.

## Updating

See `ONBOARDING.md` — issue first, then branch + PR, same as every other repo in this family.
`main` is branch-protected; Vercel redeploys on push to `main` once a PR merges.
