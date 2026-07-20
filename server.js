// BrandMethod dev server — serves the static site + a ToyyibPay (sandbox) payment API.
// Zero dependencies. Run:  node server.js   (Node 18+ for fetch; 20.12+/22 for .env loading)
//
// Prices and the ToyyibPay secret key live HERE (server-side) — never in the browser.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ---- load .env (built-in on Node 20.12+/22; manual fallback otherwise) ----
try { process.loadEnvFile(path.join(__dirname, '.env')); }
catch (_) {
  try {
    fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  } catch (_) {}
}

const PORT     = process.env.PORT || 8000;
const TB_BASE  = (process.env.TOYYIBPAY_BASE || 'https://dev.toyyibpay.com').replace(/\/+$/, '');
const TB_KEY   = process.env.TOYYIBPAY_SECRET_KEY || '';
const TB_CAT   = process.env.TOYYIBPAY_CATEGORY_CODE || '';
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');

// ---- Authoritative prices (server-side; the browser can NOT change these) ----
// amount is in cents (RM * 100). Add more packages here as you enable them.
const PACKAGES = {
  logo_starter: { name: 'Logo Starter', amount: 29000  },   // RM290
  logo_growth:  { name: 'Logo Growth',  amount: 199000 },   // RM1,990
};

const MIME = { '.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.webm':'video/webm','.mp4':'video/mp4','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain','.md':'text/markdown','.pdf':'application/pdf','.glb':'model/gltf-binary' };

function send(res, code, body, headers) { res.writeHead(code, Object.assign({ 'Cache-Control': 'no-cache' }, headers || {})); res.end(body); }
function json(res, code, obj) { send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json' }); }
function readBody(req) { return new Promise(r => { let d = ''; req.on('data', c => { d += c; if (d.length > 1e6) req.destroy(); }); req.on('end', () => r(d)); }); }

// ---- ToyyibPay: create a bill and return its payment URL ----
async function createBill(pkg, cust) {
  const p = PACKAGES[pkg];
  if (!p) throw new Error('Unknown package');
  if (!TB_KEY || !TB_CAT) throw new Error('Server not configured — set TOYYIBPAY_SECRET_KEY and TOYYIBPAY_CATEGORY_CODE in .env');
  const ref = pkg + '-' + Date.now();
  const params = new URLSearchParams({
    userSecretKey: TB_KEY,
    categoryCode: TB_CAT,
    billName: p.name.slice(0, 30),
    billDescription: (p.name + ' order').slice(0, 100),
    billPriceSetting: '1',                              // 1 = fixed price
    billPayorInfo: '1',                                 // collect payer info
    billAmount: String(p.amount),                       // in cents
    billReturnUrl: SITE_URL + '/pay/return',            // browser returns here after paying
    billCallbackUrl: SITE_URL + '/api/toyyibpay/callback', // server-to-server (needs a public URL in prod)
    billExternalReferenceNo: ref,
    billTo: (cust.name || '').slice(0, 30),
    billEmail: cust.email || '',
    billPhone: (cust.phone || '').slice(0, 20),
    billPaymentChannel: '2',                            // 0=FPX 1=card 2=both
    billContentEmail: 'Thank you for your order with BrandMethod.',
  });
  const r = await fetch(TB_BASE + '/index.php/api/createBill', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params,
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch (_) { throw new Error('ToyyibPay error: ' + text.slice(0, 200)); }
  const code = Array.isArray(data) && data[0] && data[0].BillCode;
  if (!code) throw new Error('ToyyibPay did not return a bill: ' + text.slice(0, 200));
  return { url: TB_BASE + '/' + code, ref, billCode: code };
}

// ---- static file serving (no traversal) ----
function serveStatic(res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/') rel = '/index.html';
  const filePath = path.join(__dirname, path.normalize(rel).replace(/^([/\\.]+)/, ''));
  if (!filePath.startsWith(__dirname)) return send(res, 403, 'Forbidden');
  fs.stat(filePath, (err, st) => {
    if (err) return send(res, 404, 'Not found');
    const fp = st.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    fs.readFile(fp, (e, buf) => {
      if (e) return send(res, 404, 'Not found');
      send(res, 200, buf, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    });
  });
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = u.pathname;

  // create a payment bill
  // production is PHP (Cloudways), so the page calls the .php path — accept both
  // here so local `npm start` exercises the exact same URL the live site uses.
  if (/^\/api\/toyyibpay\/create-bill(\.php)?$/.test(pathname) && req.method === 'POST') {
    try {
      const b = JSON.parse((await readBody(req)) || '{}');
      if (!b.pkg || !PACKAGES[b.pkg]) return json(res, 400, { error: 'Invalid package' });
      if (!b.name || !b.phone)        return json(res, 400, { error: 'Name and phone are required' });
      const out = await createBill(b.pkg, { name: b.name, phone: b.phone, email: b.email });
      return json(res, 200, { url: out.url, ref: out.ref });
    } catch (e) { console.error('[create-bill]', e.message); return json(res, 500, { error: e.message }); }
  }

  // ToyyibPay server-to-server callback (verify + fulfill here in production)
  if (/^\/api\/toyyibpay\/callback(\.php)?$/.test(pathname) && req.method === 'POST') {
    console.log('[toyyibpay callback]', await readBody(req));
    return send(res, 200, 'OK');
  }

  // return page after payment
  if (pathname === '/pay/return' || pathname === '/pay/return.php') {
    const status = u.searchParams.get('status_id');       // 1=success 2=pending 3=fail
    const bill = u.searchParams.get('billcode') || '';
    const ok = status === '1', pending = status === '2';
    const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Payment ${ok ? 'received' : 'status'}</title><body style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:12vh auto;padding:0 20px;text-align:center;color:#15161A"><div style="font-size:54px">${ok ? '✅' : pending ? '⏳' : '❌'}</div><h1 style="font-family:Fraunces,Georgia,serif;font-weight:500">${ok ? 'Payment received' : pending ? 'Payment pending' : 'Payment not completed'}</h1><p style="color:#54565d;line-height:1.6">${ok ? "Thank you — we'll be in touch shortly to start your project." : pending ? 'Your payment is being processed.' : "If money was deducted, contact us and we'll sort it out."}</p><p style="font-size:12px;color:#8a8c86">Ref: ${bill}</p><a href="/pricing.html" style="display:inline-block;margin-top:18px;background:#1a26de;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px">Back to pricing</a></body>`;
    return send(res, 200, html, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(res, pathname);
  send(res, 405, 'Method not allowed');
});

server.listen(PORT, () => {
  console.log(`\n  BrandMethod dev server → http://localhost:${PORT}`);
  console.log(`  ToyyibPay: ${TB_BASE}  key:${TB_KEY ? 'set ✓' : '⚠ MISSING'}  category:${TB_CAT || '⚠ MISSING'}`);
  if (!TB_KEY || !TB_CAT) console.log('  → add TOYYIBPAY_SECRET_KEY + TOYYIBPAY_CATEGORY_CODE to .env, then restart.\n');
  else console.log('');
});
