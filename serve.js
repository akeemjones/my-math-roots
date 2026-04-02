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

// Injected at the top of <head> — fakes Supabase auth so the app boots fully logged in
const DEV_AUTH_INJECT = `<script>
(function(){
  var PROJ = 'omjegwtzirskgmgeojdn';
  var USER = {
    id:'9a71d5a6-4d5f-4d6a-9710-4287b8604be4',
    aud:'authenticated', role:'authenticated',
    email:'testuser@mymathroots.com',
    email_confirmed_at:'2026-01-01T00:00:00.000Z',
    user_metadata:{name:'Test Student',display_name:'Test Student'},
    app_metadata:{provider:'email',providers:['email']},
    created_at:'2026-01-01T00:00:00.000Z',
    updated_at:'2026-01-01T00:00:00.000Z'
  };
  var SESSION = {
    access_token:'dev_access_token_' + Date.now(),
    token_type:'bearer', expires_in:3600,
    expires_at: Math.floor(Date.now()/1000) + 3600,
    refresh_token:'dev_refresh_' + Date.now(),
    user: USER
  };
  // Pre-populate localStorage so Supabase finds a session on startup
  try { localStorage.setItem('sb-' + PROJ + '-auth-token', JSON.stringify(SESSION)); } catch(e){}

  // Intercept fetch: return fake user for validation calls, fake session for refresh
  var _orig = window.fetch;
  window.fetch = function() {
    var url = typeof arguments[0]==='string' ? arguments[0] : (arguments[0]&&(arguments[0].url||arguments[0]))||'';
    if(typeof url !== 'string') url = '';
    if(url.includes('/auth/v1/user') && !url.includes('token')) {
      return Promise.resolve(new Response(JSON.stringify(USER), {status:200, headers:{'Content-Type':'application/json'}}));
    }
    if(url.includes('/auth/v1/token')) {
      SESSION.access_token = 'dev_access_token_' + Date.now();
      SESSION.expires_at = Math.floor(Date.now()/1000) + 3600;
      return Promise.resolve(new Response(JSON.stringify(SESSION), {status:200, headers:{'Content-Type':'application/json'}}));
    }
    return _orig.apply(this, arguments);
  };
})();
</script>`;

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.resolve(ROOT, '.' + urlPath);
  // Prevent path traversal — resolved path must stay inside dist/
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
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
