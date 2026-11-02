# Source snapshot record

## Update 2026-11-02 — rule-check progress

- Live homepage: WebsitePublisher version 74, hash `4c348a52`, at https://project29280.websitepublisher.ai/index.html.
- Replaced existing assets: `css/kavanah-design-v3.css` hash `68c5a312`; `js/contract-check-ui-v7.js` hash `25553b54`; `js/kavanah-ai-hr-v2.js` hash `a425389f`. Asset count remains 24/25.
- `site/pages/index.html` matches the live v74 page. The branch also brings the repository's older homepage into line with live v73: the GitHub-hosted tutorial video and the disabled AI Cloud control. No AI Cloud code was published.
- The rule checker shows a minimum five-second progress sequence for valid input, then reveals the report. Empty or invalid input gets immediate guidance. Editing the text or changing contract type cancels the pending result.
- Live checks: desktop and 390px mobile; waiting state, result timing, cancellation, invalid input, and a finding with optional HR prompt. Browser error log was empty. The checks used invented contract text.

Captured: 2026-10-26  
Source platform: WebsitePublisher project `29280`  
Live website: https://project29280.websitepublisher.ai/index.html  
Repository branch: `codex/import-websitepublisher-source`

## Pages

- `site/pages/index.html`: WebsitePublisher version 71, hash `9924324c`, 60035 characters
- `site/pages/tra-cuu-phap-luat.html`: WebsitePublisher version 7, hash `5291f4e8`, 13357 characters
- `site/pages/quyen-rieng-tu.html`: WebsitePublisher version 5, hash `711f48f0`, 7625 characters

## Referenced/current assets copied

- `site/assets/js/contract-check-v7.js`: WebsitePublisher hash `a9a2c217`, 13501 characters
- `site/assets/js/contract-check-ui-v7.js`: WebsitePublisher hash `048e67a8`, 10204 characters
- `site/assets/js/pdf-text-extraction.js`: WebsitePublisher hash `f937671a`, 2441 characters
- `site/assets/js/commercial-check.js`: WebsitePublisher hash `f72f054b`, 4655 characters
- `site/assets/js/kavanah-ai-hr-v2.js`: WebsitePublisher hash `a6186d5c`, 8338 characters
- `site/assets/css/kavanah-design-v3.css`: WebsitePublisher hash `5c714301`, 18220 characters
- `site/assets/css/kavanah-showcase-v1.css`: WebsitePublisher hash `4d7705cb`, 11657 characters
- `site/assets/css/kavanah-pages.css`: WebsitePublisher hash `1dec263a`, 8896 characters
- `site/assets/images/kavanah-app-icon-v2.svg`: WebsitePublisher hash `7ee1e946`, 441 characters
- `site/assets/images/kavanah-monogram-v2.svg`: WebsitePublisher hash `ef90156a`, 503 characters

## Shared fragments

- `site/fragments/kavanah-header.html`: version 5, hash `e7f41ffe`
- `site/fragments/kavanah-footer.html`: version 9, hash `a58f60fd`

## Scope and verification

- Files are copied as source snapshots; they are not rewritten into a standalone application.
- HTML retains WebsitePublisher fragment directives and CDN references.
- A targeted source scan was run before commit for private-key headers and common API-token formats/assignments. No matches were found in the files selected for this snapshot. This is not a guarantee of exhaustive secret detection; review all future changes before publishing.
- Historical/older JavaScript variants and the unreferenced WebP asset were not copied, to avoid mixing old variants into the active source snapshot.
- No contract samples, private answer keys, `.env` files, or Vault secret values were included.
