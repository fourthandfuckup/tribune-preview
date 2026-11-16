# Tribune production upgrade — preparation only

Status: NOT APPROVED FOR DEPLOYMENT. The live repository main branch and live published data must remain unchanged.

## Confirmed scope
- Preview test edition "The Scandal Edition", Volume I Issue 002, is test-only. Never copy its content, article drafts, comic images, crossword, or preview publication rows to production.
- Preserve all current live front-page stories, design, comics, crossword, archives, circulation and Frank's Office content.
- Preserve live read/write table `tribune_live_published_editions`. Preview uses `tribune_published_editions`. Never copy preview's table selection into live code.
- Production requires a separate explicit two-step publish approval, distinct from approval of this preparation document.

## Source comparison (2026-11-16)
Preview and live differ in: index.html, script.js, comics.js, office.html, office.js, edition-manager.html, edition-manager.js, preview-editions.js and published-crossword.js. Do not bulk-copy them.
- Live office.html and office.js contain circulation/subscriber features; reconcile individually.
- Preview edition-manager.js contains private proof, comic reuse, crossword and preview publish logic; production needs a targeted adaptation with live table and production-specific confirmation language.
- Front page, department layouts, comics and crossword should be tested against live content fixtures, not preview test edition data.
- Archive and reader links need a production-safe route audit.

## Predeployment checks
1. Inventory live baseline files, scripts, public content, image URLs, navigation and Supabase table/storage access.
2. Prepare selective code changes in a separate production feature branch or pull request, never live main.
3. Verify no reference to the preview publication table in production publishing or reading code.
4. Verify no Scandal Edition identifiers, draft articles, test comics or test crossword appear in the production change set.
5. Confirm archived content remains readable and no existing live publication is overwritten.
6. Review production two-step confirmation and rollback plan.
7. Obtain explicit final user approval before any merge, deployment, or production publication.

## Preview test results (reported by editor)
- New front page: passed.
- Three selected comics in correct order: passed.
- New playable crossword: passed.
- Frank's Office circulation/slogan parity: outstanding.
- Full department-page acceptance: outstanding.

This document is a deployment plan, not an authorization or a release.