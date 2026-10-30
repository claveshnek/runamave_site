# larunamave.com — auto stats: handoff notes (2026-10-30)

## Goal
Totals of subscribers + views from 3 profiles are summed and shown on the site, updated monthly.
Currently MANUAL: `node update_stats.mjs` -> `node build_site.mjs` -> drag folder with index.html into Netlify.
Planned later: GitHub repo + Netlify Git deploy, `.github/workflows/monthly-stats.yml` (already written, untested) runs both scripts on the 1st of each month and commits.

## Files
- update_stats.mjs   scraper (Node 18+, no deps). Writes stats.json. Keeps OLD value + saves debug_*.html if a number isn't found.
- build_site.mjs     larunamave.template.html + stats.json -> index.html (replaces {{PLACEHOLDERS}}: VIEWS, VIEWS_M, VIEWS_JA, VIEWS_ZH, SUBS, SUBS_JA, SUBS_ZH, PH_V, XV_V, XH_V, PH_S, XV_S, XH_S).
- larunamave.template.html  site source with placeholders (6 langs EN/RU/JA/ZH/HI/ES, bio added, Person schema with height/weight).
- stats.json         last result. index.html = built page.
- .github/workflows/monthly-stats.yml

## Where the numbers are (verified on live pages 2026-10-30; sandbox cannot reach these sites, only the user's PC can)
- PornHub  https://www.pornhub.com/pornstar/larunamave
  views: data-title="Video views: 217,057,612"   subs: data-title="Subscribers: 323,225"
- XVideos  https://www.xv-ru.com/channels/myschoollife
  <p id="pinfo-subscribers"> ... <span>157 392</span>   <p id="pinfo-videos-views"> ... <span>364 432 587</span>  (nbsp separators)
- xHamster subs: https://xhamster.com/users/larunamave -> data-tooltip="144,748"><b>144.7K</b> subscribers
- xHamster VIEWS come from the creators ranking, NOT the profile (profile "profile views" = 487K, not wanted):
  https://xhamster.com/shemale/creators/contest -> card of creators/laruna-mave -> <div class="views"> 413.6M views </div>
  (she was #2; if she leaves page 1 the regex fails -> add paging)
Result 2026-10-30: subs 625,365; views 995,090,199 (site shows 625K / 995M+).

## Decisions / notes
- Site itself has no adult content -> no adult meta tag (user decision).
- Numbers are baked into static HTML (not fetched by JS) so Google sees them.
- Static "98%" PornHub rating is still hardcoded; not scraped.
- If the site is redesigned: keep the placeholders (or re-add them), keep build_site.mjs mapping in sync.
- Pages may change markup -> if update_stats prints NOT FOUND, send the debug_*.html and retune regexes in PLATFORMS.
- Backlog: second site top10amateurmodels.com (top10models.html), Search Console sitemaps, IAFD fix, indexxx profile, Reddit, cross-links.

## Design / content decisions made after the first notes (2026-10-30, same session)
Hero buttons (all in larunamave.template.html; brand COLORS only, no logos):
- Row 1 (.cta, largest, 68px): "Watch on PornHub" orange #FF9000 black text (wider, 1.5fr) + "All Links" (outlined). Mobile: stacked full width.
- Row 2 (.brands, 4 cols; 2x2 on mobile <=640px): OnlyFans #00AFF0, ManyVids #E8174F, Instagram (gradient), Twitch #9146FF.
- Row 3 (.brands.brands2, 2 cols): xHamster (white, red text #E8321D), XVideos #D8161C.
- All buttons lift 3px on hover (translateY). Small text link row (.socials: PornHub, Instagram, X, LinkTree) stays below.
- Link URLs: OnlyFans https://onlyfans.com/myschoollife/c14 · ManyVids https://myschoollife.manyvids.com · Instagram https://www.instagram.com/larunamave/ · Twitch https://www.twitch.tv/larunamave · xHamster https://xhamster.com/users/myschoollife · XVideos https://www.xvideos.com/channels/myschoollife#_tabVideos · PornHub https://www.pornhub.com/model/larunamave · LinkTree https://linktr.ee/LarunaMave · X https://x.com/LarunaMave
- YouTube was on the old live site; user asked to replace it with Instagram (YouTube removed everywhere incl. schema).
- IMPORTANT lesson: the live larunamave.com had OnlyFans/ManyVids/YouTube/Twitch buttons that were NOT in the local source -> a redeploy erased them once. Always re-read the live site (or ask) before redeploying from an older local copy.

Content:
- Russia removed EVERYWHERE (stat card "Russia", tagline, About, schema nationality, keywords). Wording used instead: "of Slavic descent" (ethnic meaning, not a country; EN/RU/ES/HI say descent/происхождения/origen/मूल, JA スラブ系, ZH 斯拉夫裔). The "RU" language-switch button stays (it is the Russian language, not the country).
- Hero stats bar now has 4 cards: views, subscribers, rating (98% static), platforms.
- Bio added in About in 6 languages (always wanted to be on camera, started after a friend said amateur modeling is trendy, films for herself not popularity, loves RPG games / motorcycles / space / dogs) + measurements line 173 cm / 54 kg / 94-59-89. Schema Person has height, weight, knowsAbout.
- Platform cards lower on the page also use placeholders (PH_V/PH_S etc.), so they update with stats.json.

Deploy: Netlify project incredible-lolly-df2cd6 -> Deploys -> drag index.html (must be named index.html) into the drop box at the bottom. Output copy kept in /deploy/index.html.
