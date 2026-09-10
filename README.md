# eric-gitonga-links

The hub for [ericgitonga.com](https://www.ericgitonga.com/) — four cards, in alphabetical
order:

| Card | Where it lives | What it is |
|---|---|---|
| Darkroom | `ericgitonga.com/darkroom` | Photography — landscapes, portraits, documentary moments. Placeholder page (`darkroom.html`) for now. |
| Dev | `ericgitonga.com/dev` | Software and systems — Eric's technical practice. Live content (`dev.html`): the "how fast you can expect this" stats and the Software & AI products list. |
| Doodles | `ericgitonga.com/doodles` | Drawings and marks. Placeholder page (`doodles.html`) for now. |
| Dudus | `dudus.ericgitonga.com` | Kenya's tiniest wildlife — the `dudus-app` project, a **separate repo/deployment**, hence a real subdomain rather than a path here. `shop.dudus.ericgitonga.com` (`dudu-merchandise`, also separate) nests under it. |

Darkroom, Dev, and Doodles are paths on this one static site, not subdomains — they're just
pages in this repo, not separate deployments, so there's no real infrastructure behind a
`darkroom.ericgitonga.com`-style hostname yet. (An earlier draft tried host-based `vercel.json`
rewrites to fake real subdomains for these three; that mechanism is
[documented as unreliable in production](https://community.vercel.com/t/vercel-json-the-has-condition-on-host-doesnt-seem-to-work/9863),
and it didn't fire in local testing either, so it was dropped in favor of plain paths — reliable,
and honest about what's actually deployed.) If any of them grows into its own real app someday,
it can graduate to a real subdomain then, the same way Dudus already has one.

Static HTML, no build step, deployed straight to Vercel. `vercel.json` sets `cleanUrls: true`
so `/dev` serves `dev.html` (etc.) without the extension — no framework/router needed. Bio and
contact are reached from the top nav on the hub page (`index.html#bio`, `#contact`), not from a
card.

Design: a shared brand kit across `eric-gitonga-links`, `dudus-app`, and `dudu-merchandise` —
warm paper-cream ground, dark ink, one verdigris accent, Newsreader/Archivo Narrow/IBM Plex Mono
type pairing, catalogue-plate numbering (PLATE I–IV). Reference: `extras/personal/me/eric-hub-concept.html`
in the wider `Develop/projects` tree (not part of this repo).

## Updating

Edit the relevant `.html` file directly and push — Vercel redeploys on push to `main`. No
branch protection on this repo; for a change of any size, pushing straight to `main` is the
normal workflow here (unlike the other projects in this family, which require branch + PR).
