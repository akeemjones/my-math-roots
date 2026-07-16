#!/usr/bin/env node
// ════════════════════════════════════════
//  My Math Roots — Build Script
//  Stitches src/ files, obfuscates JS, minifies HTML
//  Output: dist/index.html (and supporting files)
//
//  Source layout:
//    index.html          — HTML skeleton with <!--STYLES--> and <!--SCRIPT--> placeholders
//    src/styles.css      — main stylesheet
//    src/styles-fonts.css — base64 font faces (fonts-inline block)
//    src/data.js         — q() factory + _ICO + UNITS_DATA
//    src/app.js          — all application logic
// ════════════════════════════════════════

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const { minify: minifyHtml } = require('html-minifier-terser');
const JavaScriptObfuscator = require('javascript-obfuscator');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const DEV_MODE = process.argv.includes('--dev');

// Supporting files to copy into dist unchanged
const COPY_FILES = [
  'sw.js',
  'health.json',
  // netlify.toml is templated with CSP hash below, not copied verbatim
  'manifest.json',
  'manifest-v5.1.json',
  'icon-192-v5.1.png',
  'icon-512-v5.1.png',
  'icon-192.png',
  'icon-512.png',
  'privacy.html', // SEC-8: COPPA privacy policy (linked from Soft Gate consent form)
  'terms.html',   // Terms of Service
  'robots.txt',   // SEO — crawler directives
];

// Files that MUST NOT ship in a production build (see end of build() for the
// cleanup + assertion step). `unlock.html` is a dev cheat page that flips all
// K lesson localStorage flags to 100% complete; `app.js.map` is only emitted
// by --dev builds but stale copies persist across rebuilds.
const FORBIDDEN_PROD_ARTIFACTS = ['unlock.html', 'app.js.map'];

// ── Load .env file (key=value pairs) ──
function loadEnv(){
  const envPath = path.join(ROOT, '.env');
  if(!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
    if(m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
}
loadEnv();

// ── VLQ encoding for source maps (no dependencies) ──
const _VLQ_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function _vlqEncode(value) {
  let vlq = value < 0 ? ((-value) << 1) | 1 : value << 1;
  let encoded = '';
  do {
    let digit = vlq & 0x1F;
    vlq >>>= 5;
    if (vlq > 0) digit |= 0x20; // continuation bit
    encoded += _VLQ_CHARS[digit];
  } while (vlq > 0);
  return encoded;
}

async function build(){
  console.log(`🔨 Building My Math Roots${DEV_MODE ? ' (DEV MODE)' : ''}...\n`);

  // ── Ensure dist/ exists ──
  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

  // ── Read source files ──
  const skeleton   = fs.readFileSync(path.join(ROOT,         'index.html'),             'utf8');
  const mainCss    = fs.readFileSync(path.join(ROOT, 'src',  'styles.css'),             'utf8');
  const fontsCss   = fs.readFileSync(path.join(ROOT, 'src',  'styles-fonts.css'),       'utf8');
  // ── Grade 3: dev-only curriculum ──────────────────────────────────────────
  // Grade 3 is unfinished (81 questions across 8 of 97 lessons; the other 89 are
  // empty shells) and is not offered to customers. Its source stays in the repo
  // and dev builds still carry it, but a production build must not ship
  // unfinished curriculum: leaving it in means a manipulated client state could
  // reach it, and it is dead weight for every K-2 family.
  //
  // Excluding these three drops the globals _UNITS_DATA_G3 / _mergeG3UnitData /
  // _loadG3Unit / _applyGrade3Grade / _G3_CBE_BANK / _g3CbeGateOpen /
  // _G3_UNIT0_DIAGNOSTIC from the prod bundle. Every consumer outside the G3
  // data files already typeof-guards them, except boot.js's grade dispatch,
  // which is guarded alongside this change. _G3_UNITS_META (dashboard.js) is
  // defined locally and is unaffected.
  const G3_FILES = DEV_MODE
    ? ['data/shared_g3.js', 'data/g3/cbe.js', 'data/g3/unit0_diagnostic.js']
    : [];

  // JS source files — concatenated in dependency order (all share one global scope)
  const SRC_FILES = [
    'app-config.js',
    'data/shared.js','data/shared_k.js','data/shared_g1.js',
    // Grade 3 — DEV BUILDS ONLY (see G3_FILES below).
    ...G3_FILES,
    'util.js','quiz-helpers.js','quiz-config.js','analytics.js','state.js','auth.js','nav.js','home.js','unit.js',
    'visuals.js','key-ideas.js','question-engine.js','quiz.js','settings.js','ui.js','profile-switcher.js','events.js','boot.js','dashboard.js'
  ];
  const jsFiles = SRC_FILES.map(f => ({
    name: f,
    content: fs.readFileSync(path.join(ROOT, 'src', f), 'utf8')
  }));
  const jsTotal = jsFiles.reduce((n, f) => n + f.content.length, 0);

  const totalSrcKb = (skeleton.length + mainCss.length + fontsCss.length + jsTotal) / 1024;
  console.log(`📄 Source:  ${totalSrcKb.toFixed(1)} KB total across ${2 + SRC_FILES.length} files`);

  // ── Step 1: Stitch CSS ──
  // Write fonts CSS to a separate file for lazy loading (saves ~1MB from initial HTML)
  fs.writeFileSync(path.join(DIST, 'fonts.css'), fontsCss, 'utf8');
  console.log(`📝 Fonts:   ${(fontsCss.length / 1024).toFixed(1)} KB  →  dist/fonts.css`);
  const cssBlock = `<style>${mainCss}</style>\n<style id="fonts-inline">/* lazy-loaded from fonts.css */</style>`;

  // ── Step 2: Stitch and obfuscate JS ──
  let combinedJs = jsFiles.map(f => f.content).join('\n\n');
  // Inject env vars (replace %%VAR%% placeholders)
  if(!process.env.SUPA_URL) console.warn('⚠️  SUPA_URL not set — Supabase will not initialize. Check .env file.');
  if(!process.env.SUPA_KEY) console.warn('⚠️  SUPA_KEY not set — Supabase will not initialize. Check .env file.');
  if(!process.env.GOOGLE_CLIENT_ID) console.warn('⚠️  GOOGLE_CLIENT_ID not set — Google Sign-In will not work. Check .env file.');
  combinedJs = combinedJs
    .replace(/%%SUPA_URL%%/g, process.env.SUPA_URL || '')
    .replace(/%%SUPA_KEY%%/g, process.env.SUPA_KEY || '')
    .replace(/%%GOOGLE_CLIENT_ID%%/g, process.env.GOOGLE_CLIENT_ID || '')
    // Build mode: the production/development boundary. This is what authorizes
    // app-config's dev flag overrides, so it must be decided HERE, at build
    // time, and never from client-controlled state. `node build.js` => 'prod';
    // `node build.js --dev` => 'dev'. app-config fails closed on any other
    // value, including an unsubstituted placeholder.
    .replace(/%%BUILD_MODE%%/g, DEV_MODE ? 'dev' : 'prod');

  // Post-replacement check: warn if any %%...%% placeholders remain
  const remainingPlaceholders = combinedJs.match(/%%[A-Z_]+%%/g);
  if (remainingPlaceholders) {
    const unique = [...new Set(remainingPlaceholders)];
    console.warn(`⚠️  Unreplaced placeholders in JS: ${unique.join(', ')} — check .env file or build.js replacements.`);
  }

  let finalJs;
  if (DEV_MODE) {
    // ── Dev mode: skip obfuscation, generate source map ──
    finalJs = combinedJs;

    // Build a v3 source map with line-level mappings
    const sourceMapFile = 'app.js.map';
    const sources = SRC_FILES;
    const sourcesContent = jsFiles.map(f => f.content);

    // Compute line offsets: which output line maps to which source file + source line
    // Each file is joined with '\n\n' (2 separators = 1 blank line between files)
    const mappingSegments = [];
    let outLine = 0;
    for (let fi = 0; fi < jsFiles.length; fi++) {
      const lines = jsFiles[fi].content.split('\n');
      for (let sl = 0; sl < lines.length; sl++) {
        // VLQ-encode a segment: [outCol=0, sourceIdx, sourceLine, sourceCol=0]
        // For line-level mapping, we emit one segment per output line at column 0
        if (outLine === 0 && fi === 0 && sl === 0) {
          // First segment: all values are absolute
          mappingSegments.push(_vlqEncode(0) + _vlqEncode(fi) + _vlqEncode(sl) + _vlqEncode(0));
        } else if (sl === 0 && fi > 0) {
          // First line of a new file: sourceIdx changes
          mappingSegments.push(_vlqEncode(0) + _vlqEncode(1) + _vlqEncode(-jsFiles[fi - 1].content.split('\n').length + 1) + _vlqEncode(0));
        } else {
          // Continuation within same file: col=0, same source (+0), next line (+1), col=0
          mappingSegments.push(_vlqEncode(0) + _vlqEncode(0) + _vlqEncode(1) + _vlqEncode(0));
        }
        outLine++;
      }
      // Account for the '\n\n' joiner (blank line between files, except after last)
      if (fi < jsFiles.length - 1) {
        mappingSegments.push(''); // blank line has no mapping
        outLine++;
      }
    }

    const sourceMap = {
      version: 3,
      file: 'app.js',
      sources: sources.map(s => 'src/' + s),
      sourcesContent,
      mappings: mappingSegments.join(';'),
    };

    fs.writeFileSync(path.join(DIST, sourceMapFile), JSON.stringify(sourceMap), 'utf8');
    console.log(`🗺️  Source map: dist/${sourceMapFile}`);

    // Append sourceMappingURL to the inline script
    finalJs += '\n//# sourceMappingURL=/' + sourceMapFile;
  } else {
    // ── Production: obfuscate ──
    try {
      finalJs = JavaScriptObfuscator.obfuscate(combinedJs, {
        compact: true,
        simplify: false,  // true breaks const declarations at global scope
        identifierNamesGenerator: 'mangled', // a,b,c... — hard to read
        renameGlobals: false,         // keep global fn names (onclick= handlers need them)
        renameProperties: false,      // don't rename object properties (breaks DOM)
        stringArray: false,           // skip — adds large decoding overhead
        deadCodeInjection: false,     // skip — increases file size
        controlFlowFlattening: false, // skip — doubles file size
        selfDefending: false,         // skip — breaks strict CSP
        debugProtection: false,
        disableConsoleOutput: false,  // keep — needed for error logging
        log: false,
      }).getObfuscatedCode();
    } catch (e) {
      if (!DEV_MODE) {
        console.error('  ❌  Obfuscation failed:', e.message);
        process.exit(1);
      }
      console.warn('  ⚠️  Obfuscation failed, using unobfuscated JS:', e.message);
      finalJs = combinedJs;
    }
  }

  // ── Write dist/app.js (JS bundle as a separate cacheable file) ──
  const appJsPath = path.join(DIST, 'app.js');
  fs.writeFileSync(appJsPath, finalJs, 'utf8');
  console.log(`📦 App JS:  ${(finalJs.length / 1024).toFixed(1)} KB  →  dist/app.js`);

  // HTML references app.js externally — no inline script needed.
  // defer: executes after HTML is parsed (better FCP) and enables parser parallelism.
  const scriptBlock = `<script src="/app.js" defer></script>`;

  // ── Step 3: Inject into skeleton ──
  let processed = skeleton
    .replace('<!--STYLES-->', cssBlock)
    .replace('<!--SCRIPT-->',  scriptBlock);

  if (processed.includes('<!--STYLES-->')) throw new Error('<!--STYLES--> placeholder was not replaced');
  if (processed.includes('<!--SCRIPT-->'))  throw new Error('<!--SCRIPT--> placeholder was not replaced');

  // ── Step 4: Minify HTML + inline CSS ──
  // No stub trick needed — external <script src> has no inline content to confuse html-minifier.
  const minified = await minifyHtml(processed, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: false,
    sortAttributes: true,
    sortClassName: true,
  });

  const minifiedFinal = minified;

  // ── Write dist/index.html ──
  const outPath = path.join(DIST, 'index.html');
  fs.writeFileSync(outPath, minifiedFinal, 'utf8');
  console.log(`✅ Output:  ${(minifiedFinal.length / 1024).toFixed(1)} KB  →  dist/index.html`);
  console.log(`📉 Saved:   ${((1 - minifiedFinal.length / (totalSrcKb * 1024)) * 100).toFixed(1)}% smaller than source\n`);

  // ── Step 5: Copy netlify.toml ──
  // JS is now an external file (/app.js) served from 'self', so no inline sha256 hash is needed.
  // 'unsafe-inline' is kept in script-src for HTML onclick= event handler attributes.
  // Strip the [build] block — dist/ is the pre-built output; Netlify should serve it
  // directly without re-running a build. The root netlify.toml [build] config is for v2.
  const netlifyTomlRaw = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
  const netlifyTomlDist = netlifyTomlRaw.replace(/^\[build\][^\[]+/m, '').trimStart();
  fs.writeFileSync(path.join(DIST, 'netlify.toml'), netlifyTomlDist, 'utf8');
  console.log(`🔒 CSP:     script-src 'self' (app.js external, onclick= requires unsafe-inline)`);

  // ── Copy supporting files ──
  for (const file of COPY_FILES) {
    const src = path.join(ROOT, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST, file));
      console.log(`📋 Copied:  ${file}`);
    }
  }

  // ── Copy hosted email assets (referenced by the Supabase Confirm-signup template) ──
  // Only PNGs ship — the _render-*.html sources stay out of the deploy.
  const EMAIL_SRC = path.join(ROOT, 'email');
  if (fs.existsSync(EMAIL_SRC)) {
    const EMAIL_DIST = path.join(DIST, 'email');
    if (!fs.existsSync(EMAIL_DIST)) fs.mkdirSync(EMAIL_DIST, { recursive: true });
    for (const f of fs.readdirSync(EMAIL_SRC)) {
      if (!/\.png$/i.test(f)) continue;
      fs.copyFileSync(path.join(EMAIL_SRC, f), path.join(EMAIL_DIST, f));
      console.log(`📋 Copied:  email/${f}`);
    }
  }

  // ── Copy per-unit data files to dist/data/ ──
  const DATA_DIR = path.join(DIST, 'data');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  for (let n = 1; n <= 10; n++) {
    const uSrc = path.join(ROOT, 'src', 'data', 'u' + n + '.js');
    fs.copyFileSync(uSrc, path.join(DATA_DIR, 'u' + n + '.js'));
    console.log(`📋 Copied:  data/u${n}.js`);
  }

  // ── Copy K unit data files to dist/data/k/ ──
  const K_DATA_DIR = path.join(DIST, 'data', 'k');
  if (!fs.existsSync(K_DATA_DIR)) fs.mkdirSync(K_DATA_DIR, { recursive: true });
  const K_UNIT_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 10]; // extend as new K units are added
  for (const n of K_UNIT_NUMS) {
    const kSrc = path.join(ROOT, 'src', 'data', 'k', 'u' + n + '.js');
    if (fs.existsSync(kSrc)) {
      fs.copyFileSync(kSrc, path.join(K_DATA_DIR, 'u' + n + '.js'));
      console.log(`📋 Copied:  data/k/u${n}.js`);
    }
  }

  // Named-file shared deps for K units (lazy-loaded by _loadKUnit before sources)
  const K_NAMED_DEPS = ['coin_assets'];
  for (const name of K_NAMED_DEPS) {
    const src = path.join(ROOT, 'src', 'data', 'k', name + '.js');
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(K_DATA_DIR, name + '.js'));
      console.log(`📋 Copied:  data/k/${name}.js`);
    }
  }

  // ── Build G1 unit data files → dist/data/g1/ ──────────────────────────────
  // The source files use ES module syntax (export const / export default) for the
  // spec validator.  We strip those keywords and append _mergeG1UnitData(idx, …)
  // so the browser can load them as plain scripts.
  const G1_DATA_DIR = path.join(DIST, 'data', 'g1');
  if (!fs.existsSync(G1_DATA_DIR)) fs.mkdirSync(G1_DATA_DIR, { recursive: true });
  const G1_UNIT_MAP = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7 }; // source file number → _UNITS_DATA_G1 index
  for (const [fileNum, mergeIdx] of Object.entries(G1_UNIT_MAP)) {
    const g1Src = path.join(ROOT, 'src', 'data', 'g1', 'u' + fileNum + '.js');
    if (fs.existsSync(g1Src)) {
      let g1Content = fs.readFileSync(g1Src, 'utf8');
      // Strip ES module keywords: 'export const' → 'const', 'export default …;' → removed
      g1Content = g1Content.replace(/^export const /mg, 'const ');
      g1Content = g1Content.replace(/^export default\s+\S+;\s*$/m, '');
      // Append the runtime registration call (spec variable follows G1_U{N}_SPEC naming convention)
      g1Content += '\n_mergeG1UnitData(' + mergeIdx + ', G1_U' + fileNum + '_SPEC);\n';
      fs.writeFileSync(path.join(G1_DATA_DIR, 'u' + fileNum + '.js'), g1Content, 'utf8');
      console.log(`📋 Built:   data/g1/u${fileNum}.js`);
    }
  }

  // ── Copy G3 unit data files to dist/data/g3/ — DEV BUILDS ONLY ────────────
  // Grade 3 files are plain JS (legacy compact schema, same as Grade 2 / K) —
  // no ES-module stripping needed; copy them as-is.
  //
  // A production build ships no Grade 3 curriculum at all: the loader
  // (_loadG3Unit) is not in the prod bundle, and these files are not served, so
  // there is nothing to fetch even with a hand-crafted request. The source
  // stays in src/data/g3/.
  if (!DEV_MODE) {
    // Remove any G3 data left behind by a previous dev build, so a prod build
    // never publishes stale unfinished curriculum from a dirty dist/.
    const staleG3 = path.join(DIST, 'data', 'g3');
    if (fs.existsSync(staleG3)) {
      fs.rmSync(staleG3, { recursive: true, force: true });
      console.log('🚫 Excluded: data/g3/ (unfinished — prod build)');
    }
  } else {
  const G3_DATA_DIR = path.join(DIST, 'data', 'g3');
  if (!fs.existsSync(G3_DATA_DIR)) fs.mkdirSync(G3_DATA_DIR, { recursive: true });
  for (let n = 1; n <= 10; n++) {
    const g3Src = path.join(ROOT, 'src', 'data', 'g3', 'u' + n + '.js');
    if (fs.existsSync(g3Src)) {
      fs.copyFileSync(g3Src, path.join(G3_DATA_DIR, 'u' + n + '.js'));
      console.log(`📋 Copied:  data/g3/u${n}.js`);
    }
  }
  }

  // dashboard/ is now bundled into app.js as src/dashboard.js — no separate copy needed

  // ── Tag-to-lesson static index (Phase 2B) ─────────────────────────────────
  // Scans the just-built dist/data/ files and emits a static {errTag → {lessonId: count}}
  // index used by the Parent Dashboard Learning Insights as a FALLBACK lesson
  // resolver. Live student activity always wins; this index helps when the
  // student hasn't yet attempted the lesson where the tag is most prevalent.
  //
  // Coverage:
  //   - G1: variable-name → 'err_*' map + diagnostics.errorTags arrays per lesson.
  //   - K and G2: per-question option { tag: 'err_*' } with proximity-based
  //     attribution to the question's lessonId (best-effort regex scan).
  //
  // Output: dist/data/tag_lesson_index.json — typically ~10–30 KB uncompressed.
  buildTagLessonIndex(DIST);

  // ── Admin analytics dashboard (standalone, not in app.js bundle) ──────────

  // ── Admin analytics dashboard (standalone, not in app.js bundle) ──────────
  const adminHtmlSrc = path.join(ROOT, 'admin-analytics.html');
  const adminJsSrc   = path.join(ROOT, 'src', 'admin-analytics.js');
  if (fs.existsSync(adminHtmlSrc)) {
    fs.copyFileSync(adminHtmlSrc, path.join(DIST, 'admin-analytics.html'));
    console.log('📋 Copied:  admin-analytics.html');
  }
  if (fs.existsSync(adminJsSrc)) {
    let adminJs = fs.readFileSync(adminJsSrc, 'utf8');
    adminJs = adminJs
      .replace(/%%SUPA_URL%%/g, process.env.SUPA_URL || '')
      .replace(/%%SUPA_KEY%%/g, process.env.SUPA_KEY || '');
    fs.writeFileSync(path.join(DIST, 'admin-analytics.js'), adminJs, 'utf8');
    console.log('📋 Copied:  admin-analytics.js (tokens substituted)');
  }

  // ── Production cleanup: drop cheat/debug artifacts that must never ship ──
  // build.js itself does not write these in prod, but stale copies from
  // earlier --dev builds (app.js.map) or hand-placed dev helpers (unlock.html
  // — a K-lessons "unlock everything" cheat page) can linger in dist/ and
  // ship via Netlify. Remove every prod build and assert they're gone.
  if (!DEV_MODE) {
    for (const name of FORBIDDEN_PROD_ARTIFACTS) {
      const p = path.join(DIST, name);
      try {
        fs.unlinkSync(p);
        console.log(`🧹 Removed:  ${name} (must not ship in prod)`);
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
    }
    for (const name of FORBIDDEN_PROD_ARTIFACTS) {
      if (fs.existsSync(path.join(DIST, name))) {
        throw new Error(`Production build assertion failed: dist/${name} still present`);
      }
    }
  }

  console.log('\n🚀 Build complete → dist/');
}

// ── buildTagLessonIndex (Phase 2B) ──────────────────────────────────────────
// Walks the just-built dist/data/ tree and emits a static tag-to-lesson index
// to dist/data/tag_lesson_index.json. The Parent Dashboard's Learning
// Insights consumes this as a fallback lesson resolver when live activity
// events don't include a lessonId for a given error tag.
function buildTagLessonIndex(DIST) {
  const indexPath = path.join(DIST, 'data', 'tag_lesson_index.json');
  const byTag = {};

  function bump(tag, lessonId, n) {
    if (!byTag[tag]) byTag[tag] = {};
    byTag[tag][lessonId] = (byTag[tag][lessonId] || 0) + (n || 1);
  }

  // ── G1: parse variable map + per-lesson diagnostics.errorTags arrays ────
  const g1Dir = path.join(DIST, 'data', 'g1');
  if (fs.existsSync(g1Dir)) {
    fs.readdirSync(g1Dir).filter(f => /^u\d+\.js$/.test(f)).forEach(f => {
      const text = fs.readFileSync(path.join(g1Dir, f), 'utf8');
      // 1. Variable-name → err_* string map (e.g. `var _83NL = 'err_now_later_confusion';`).
      const varMap = {};
      const varRe = /var\s+(_\w+)\s*=\s*['"](err_[^'"]+)['"]/g;
      let m;
      while ((m = varRe.exec(text)) !== null) varMap[m[1]] = m[2];
      // 2. Per-lesson diagnostics blocks: `lessonId: 'g1-u8-l3', ... errorTags: [_83SS, _83SD, ...]`.
      //    We allow up to a few hundred chars of fluff between the two markers.
      const lessonRe = /lessonId\s*:\s*['"](g1-u\d+-l\d+)['"][\s\S]{0,3000}?errorTags\s*:\s*\[([^\]]*)\]/g;
      while ((m = lessonRe.exec(text)) !== null) {
        const lessonId = m[1];
        const tagListRaw = m[2];
        // Split the array body and resolve each entry against varMap.
        tagListRaw.split(',').forEach(token => {
          const t = token.trim().replace(/^['"]|['"]$/g, '');
          if (!t) return;
          const resolved = varMap[t] || (/^err_/.test(t) ? t : null);
          if (resolved) bump(resolved, lessonId, 1);
        });
      }
    });
  }

  // ── K and G2: per-question option { tag: 'err_*' } scanned with proximity
  //    attribution to the closest preceding `lessonId: '...'` token.
  function scanKOrG2(filePath) {
    const text = fs.readFileSync(filePath, 'utf8');
    const tokens = [];
    let m;
    // K files use JS object literals: lessonId: 'ku1l1'
    // G2 files use JSON: "lessonId":"u1l1". Allow either form.
    // K: 'ku1l1'  G2: 'u1l1'  G3: 'g3-u1-l1' (hyphenated). All proximity-scanned.
    const lessonIdRe = /['"]?lessonId['"]?\s*:\s*['"]((?:ku|u)\d+l\d+|g3-u\d+-l\d+)['"]/g;
    while ((m = lessonIdRe.exec(text)) !== null) tokens.push({ type: 'lesson', value: m[1], pos: m.index });
    const tagRe = /['"]?tag['"]?\s*:\s*['"](err_[^'"]+)['"]/g;
    while ((m = tagRe.exec(text)) !== null) tokens.push({ type: 'tag', value: m[1], pos: m.index });
    tokens.sort((a, b) => a.pos - b.pos);
    // K and G2 minified files use field order { ..., tag, ... lessonId } per question.
    // For each tag token, attribute it to the NEXT lessonId within the same question
    // (or the PREVIOUS one if no next lessonId is within 4KB). Both directions tried.
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type !== 'tag') continue;
      let attributed = null;
      // Look forward for the next lessonId within 4 KB
      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].pos - t.pos > 4000) break;
        if (tokens[j].type === 'lesson') { attributed = tokens[j].value; break; }
      }
      // Fall back to the most recent lessonId within 4 KB
      if (!attributed) {
        for (let j = i - 1; j >= 0; j--) {
          if (t.pos - tokens[j].pos > 4000) break;
          if (tokens[j].type === 'lesson') { attributed = tokens[j].value; break; }
        }
      }
      if (attributed) bump(t.value, attributed, 1);
    }
  }

  const kDir = path.join(DIST, 'data', 'k');
  if (fs.existsSync(kDir)) {
    fs.readdirSync(kDir).filter(f => /^u\d+\.js$/.test(f)).forEach(f => {
      scanKOrG2(path.join(kDir, f));
    });
  }
  // G2/default lives directly at dist/data/u*.js
  const g2Dir = path.join(DIST, 'data');
  if (fs.existsSync(g2Dir)) {
    fs.readdirSync(g2Dir).filter(f => /^u\d+\.js$/.test(f)).forEach(f => {
      scanKOrG2(path.join(g2Dir, f));
    });
  }
  // G3 lives at dist/data/g3/u*.js (plain JS, hyphenated lessonId g3-u<n>-l<m>)
  const g3Dir = path.join(DIST, 'data', 'g3');
  if (fs.existsSync(g3Dir)) {
    fs.readdirSync(g3Dir).filter(f => /^u\d+\.js$/.test(f)).forEach(f => {
      scanKOrG2(path.join(g3Dir, f));
    });
  }

  const out = {
    schemaVersion: 1,
    generatedAt:   new Date().toISOString(),
    byTag:         byTag,
  };
  fs.writeFileSync(indexPath, JSON.stringify(out));
  const sizeKB = (fs.statSync(indexPath).size / 1024).toFixed(1);
  const tagCount = Object.keys(byTag).length;
  console.log(`📋 Built:   data/tag_lesson_index.json (${tagCount} tags, ${sizeKB} KB)`);
}

build().catch(e => {
  console.error('❌ Build failed:', e);
  process.exit(1);
});
