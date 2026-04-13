const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = require('path').join(__dirname, 'dist');
const PORT = 3001;

const MIME = {
  html: 'text/html',
  js:   'application/javascript',
  json: 'application/json',
  png:  'image/png',
  svg:  'image/svg+xml',
  css:  'text/css',
  webp: 'image/webp',
};

// Injected at the top of <head> — activates the app's built-in ?preview=1 mode.
// preview=1 is handled in auth.js: it sets _supaUser to a local stub, calls
// show('home') + buildHome() + _dismissSplash() synchronously, bypassing Supabase entirely.
// We clear any cached Supabase session so onAuthStateChange doesn't fire with a fake user
// and trigger a remote data pull that times out.
const DEV_AUTH_INJECT = `<script>
(function(){
  var PROJ = 'omjegwtzirskgmgeojdn';
  // Clear any stale Supabase session so it fires INITIAL_SESSION with null user.
  // Without this, a leftover token causes Supabase to try validating remotely → pull_timeout.
  try { localStorage.removeItem('sb-' + PROJ + '-auth-token'); } catch(e){}
  // Redirect to ?preview=1 so auth.js runs its local preview branch.
  if(!location.search.includes('preview=1')){
    location.replace(location.pathname + '?preview=1');
  }
})();
</script>`;

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.resolve(ROOT, '.' + urlPath);
  // Prevent path traversal — resolved path must stay inside dist/
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) {
      // SPA fallback — serve index.html for unknown paths so client-side routing works
      fs.readFile(path.join(ROOT, 'index.html'), (e2, html) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        const injected = html.toString().replace('<head>', '<head>' + DEV_AUTH_INJECT);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(injected);
      });
      return;
    }
    const ext = path.extname(file).slice(1);
    const ct = MIME[ext] || 'text/plain';
    if (ext === 'html') {
      // Inject dev auth bypass immediately after <head>
      const html = data.toString().replace('<head>', '<head>' + DEV_AUTH_INJECT);
      res.writeHead(200, { 'Content-Type': ct });
      res.end(html);
    } else {
      res.writeHead(200, { 'Content-Type': ct });
      res.end(data);
    }
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log('\n🔧 DEV MODE — auto-logged in as testuser@mymathroots.com');
  console.log(`   Local:  http://localhost:${PORT}`);
  console.log(`   Phone:  http://192.168.1.237:${PORT}\n`);
});
