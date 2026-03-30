#!/usr/bin/env node
// ════════════════════════════════════════
//  My Math Roots — Build Script
//  Minifies HTML/CSS + obfuscates JS
//  Output: dist/index.html (and supporting files)
// ════════════════════════════════════════

const fs   = require('fs');
const path = require('path');
const { minify: minifyHtml } = require('html-minifier-terser');
const JavaScriptObfuscator = require('javascript-obfuscator');

const SRC  = path.join(__dirname, 'index.html');
const DIST = path.join(__dirname, 'dist');

// Supporting files to copy into dist unchanged
const COPY_FILES = [
  'sw.js',
  'health.json',
  'netlify.toml',
  'manifest.json',
  'manifest-v5.1.json',
  'icon-192-v5.1.png',
  'icon-512-v5.1.png',
  'icon-192.png',
  'icon-512.png',
];

async function build(){
  console.log('🔨 Building My Math Roots...\n');

  // ── Ensure dist/ exists ──
  if(!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

  // ── Read source ──
  const source = fs.readFileSync(SRC, 'utf8');
  console.log(`📄 Source:  ${(source.length / 1024).toFixed(1)} KB`);

  // ── Step 1: Extract and obfuscate inline <script> blocks ──
  // We obfuscate each <script>...</script> block individually
  // before passing to html-minifier-terser
  let processed = source.replace(
    /<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/gi,
    (match, attrs, jsCode) => {
      // Skip empty scripts
      if(!jsCode.trim()) return match;
      try {
        const obfuscated = JavaScriptObfuscator.obfuscate(jsCode, {
          compact: true,
          simplify: true,
          identifierNamesGenerator: 'mangled', // a,b,c... names — very hard to read
          renameGlobals: false,         // keep global fn names (onclick= etc need them)
          renameProperties: false,      // don't rename object properties (breaks DOM)
          stringArray: false,           // skip — adds large decoding overhead
          deadCodeInjection: false,     // skip — increases file size
          controlFlowFlattening: false, // skip — doubles file size
          selfDefending: false,         // skip — breaks strict CSP
          debugProtection: false,       // skip
          disableConsoleOutput: false,  // keep — needed for error logging
          log: false,
        }).getObfuscatedCode();
        return `<script${attrs}>${obfuscated}</script>`;
      } catch(e){
        console.warn('  ⚠️  Obfuscation failed for a script block, keeping original:', e.message);
        return match;
      }
    }
  );

  // ── Step 2: Minify HTML + inline CSS ──
  const minified = await minifyHtml(processed, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,     // minify inline <style> blocks
    minifyJS: true,      // compress obfuscated JS further with Terser
    sortAttributes: true,
    sortClassName: true,
  });

  // ── Write dist/index.html ──
  const outPath = path.join(DIST, 'index.html');
  fs.writeFileSync(outPath, minified, 'utf8');
  console.log(`✅ Output:  ${(minified.length / 1024).toFixed(1)} KB  →  dist/index.html`);
  console.log(`📉 Saved:   ${((1 - minified.length / source.length) * 100).toFixed(1)}% smaller\n`);

  // ── Copy supporting files ──
  for(const file of COPY_FILES){
    const src = path.join(__dirname, file);
    if(fs.existsSync(src)){
      fs.copyFileSync(src, path.join(DIST, file));
      console.log(`📋 Copied:  ${file}`);
    }
  }

  // ── Copy dashboard/ subdirectory ──
  const dashSrc = path.join(__dirname, 'dashboard');
  const dashDst = path.join(DIST, 'dashboard');
  if(fs.existsSync(dashSrc)){
    if(!fs.existsSync(dashDst)) fs.mkdirSync(dashDst, { recursive: true });
    for(const file of fs.readdirSync(dashSrc)){
      fs.copyFileSync(path.join(dashSrc, file), path.join(dashDst, file));
      console.log(`📋 Copied:  dashboard/${file}`);
    }
  }

  console.log('\n🚀 Build complete → dist/');
}

build().catch(e => {
  console.error('❌ Build failed:', e);
  process.exit(1);
});
