# eric-gitonga-links

The hub for [ericgitonga.com](https://www.ericgitonga.com/) — four cards, in alphabetical
order, each its own ecosystem on its own subdomain:

| Card | Subdomain | What it is |
|---|---|---|
| Darkroom | `darkroom.ericgitonga.com` | Photography — landscapes, portraits, documentary moments. Placeholder page (`darkroom.html`) for now. |
| Dev | `dev.ericgitonga.com` | Software and systems — Eric's technical practice. Live content (`dev.html`): the "how fast you can expect this" stats and the Software & AI products list. |
| Doodles | `doodles.ericgitonga.com` | Drawings and marks. Placeholder page (`doodles.html`) for now. |
| Dudus | `dudus.ericgitonga.com` | Kenya's tiniest wildlife — the `dudus-app` project, a separate repo/deployment. `shop.dudus.ericgitonga.com` (`dudu-merchandise`, also separate) nests under it. |

Static HTML, no build step, deployed straight to Vercel. All four subdomains (plus the
apex and `www`) are added as domains on this one Vercel project — `vercel.json` routes each
subdomain's `/` request to its own HTML file via a host-based rewrite, since there's no
framework/router here. Bio and contact are reached from the top nav on the hub page
(`index.html#bio`, `#contact`), not from a card.

Design: a shared brand kit across `eric-gitonga-links`, `dudus-app`, and `dudu-merchandise` —
warm paper-cream ground, dark ink, one verdigris accent, Newsreader/Archivo Narrow/IBM Plex Mono
type pairing, catalogue-plate numbering (PLATE I–IV). Reference: `extras/personal/me/eric-hub-concept.html`
in the wider `Develop/projects` tree (not part of this repo).

## Updating

Edit the relevant `.html` file directly and push — Vercel redeploys on push to `main`. No
branch protection on this repo; for a change of any size, pushing straight to `main` is the
normal workflow here (unlike the other projects in this family, which require branch + PR).
