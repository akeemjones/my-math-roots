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
];

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
  // JS source files — concatenated in dependency order (all share one global scope)
  const SRC_FILES = [
    'data/shared.js','util.js','state.js','auth.js','nav.js','home.js','unit.js',
    'visuals.js','quiz.js','settings.js','ui.js','tour.js','profile-switcher.js','events.js','boot.js','dashboard.js'
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
    .replace(/%%GOOGLE_CLIENT_ID%%/g, process.env.GOOGLE_CLIENT_ID || '');

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

  // ── Copy per-unit data files to dist/data/ ──
  const DATA_DIR = path.join(DIST, 'data');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  for (let n = 1; n <= 10; n++) {
    const uSrc = path.join(ROOT, 'src', 'data', 'u' + n + '.js');
    fs.copyFileSync(uSrc, path.join(DATA_DIR, 'u' + n + '.js'));
    console.log(`📋 Copied:  data/u${n}.js`);
  }

  // dashboard/ is now bundled into app.js as src/dashboard.js — no separate copy needed

  console.log('\n🚀 Build complete → dist/');
}

build().catch(e => {
  console.error('❌ Build failed:', e);
  process.exit(1);
});
