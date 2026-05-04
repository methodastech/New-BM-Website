const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const root = process.cwd();
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlFiles = [
  ...fs.readdirSync(root).filter((file) => file.endsWith('.html')),
  ...fs.readdirSync(path.join(root, 'blog'))
    .filter((file) => file.endsWith('.html'))
    .map((file) => `blog/${file}`),
].sort();

const viewports = [
  { name: 'desktop', width: 1440, height: 1000, mobile: false },
  { name: 'mobile', width: 390, height: 844, mobile: true },
];

const requestJson = (url) => new Promise((resolve, reject) => {
  http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  }).on('error', reject);
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fileUrl = (file) => {
  const fullPath = path.resolve(root, file).replace(/\\/g, '/');
  return `file:///${encodeURI(fullPath)}`;
};

async function createCdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 0;
  const pending = new Map();

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  };

  return {
    send(method, params = {}) {
      const messageId = ++id;
      ws.send(JSON.stringify({ id: messageId, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject });
      });
    },
    close() {
      ws.close();
    },
  };
}

async function waitForChrome(port) {
  for (let i = 0; i < 50; i += 1) {
    try {
      await requestJson(`http://127.0.0.1:${port}/json/version`);
      return;
    } catch {
      await wait(200);
    }
  }
  throw new Error(`Chrome did not start on port ${port}.`);
}

async function auditPage(file, viewport, browserClient, port) {
  const { targetId } = await browserClient.send('Target.createTarget', { url: 'about:blank' });
  const targets = await requestJson(`http://127.0.0.1:${port}/json/list`);
  const targetInfo = targets.find((target) => target.id === targetId);
  const client = await createCdpClient(targetInfo.webSocketDebuggerUrl);

  try {
    await client.send('Runtime.enable');
    await client.send('Page.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.mobile,
    });
    await client.send('Page.navigate', { url: fileUrl(file) });
    await wait(700);

    const result = await client.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const doc = document.documentElement;
        const body = document.body;
        const navLinks = [...document.querySelectorAll('.nav-links a')].map((link) => link.textContent.trim());
        const mobileLinks = [...document.querySelectorAll('.nav-mobile a')].map((link) => link.textContent.trim());
        const desktopNav = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.nav-hamburger');

        return {
          title: document.title,
          textLength: (body && body.innerText || '').trim().length,
          scrollWidth: Math.max(doc.scrollWidth, body ? body.scrollWidth : 0),
          clientWidth: doc.clientWidth,
          navLinks,
          mobileLinks,
          desktopNavVisible: desktopNav ? getComputedStyle(desktopNav).display !== 'none' : false,
          hamburgerVisible: hamburger ? getComputedStyle(hamburger).display !== 'none' : false,
        };
      })()`,
    });

    return result.result.value;
  } finally {
    client.close();
    await browserClient.send('Target.closeTarget', { targetId }).catch(() => {});
  }
}

async function main() {
  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome not found: ${chromePath}`);
  }

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'brandmethod-chrome-'));
  const port = Number(process.env.CHROME_DEBUG_PORT || 9223);
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: 'ignore' });

  const issues = [];

  try {
    await waitForChrome(port);
    const version = await requestJson(`http://127.0.0.1:${port}/json/version`);
    const browserClient = await createCdpClient(version.webSocketDebuggerUrl);

    for (const viewport of viewports) {
      for (const file of htmlFiles) {
        const data = await auditPage(file, viewport, browserClient, port);

        if (!data.title || data.textLength < 20) {
          issues.push(`${viewport.name} ${file}: page rendered with little or no content`);
        }
        if (data.scrollWidth > data.clientWidth + 2) {
          issues.push(`${viewport.name} ${file}: horizontal overflow ${data.scrollWidth}/${data.clientWidth}`);
        }
        if (!data.navLinks.includes('Work')) {
          issues.push(`${viewport.name} ${file}: desktop nav missing Work`);
        }
        if (!data.mobileLinks.includes('Work')) {
          issues.push(`${viewport.name} ${file}: mobile nav missing Work`);
        }
        if (viewport.mobile && !data.hamburgerVisible) {
          issues.push(`${viewport.name} ${file}: mobile hamburger is not visible`);
        }
        if (!viewport.mobile && !data.desktopNavVisible) {
          issues.push(`${viewport.name} ${file}: desktop nav is not visible`);
        }
      }
    }
    browserClient.close();
  } finally {
    chrome.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // Chrome can hold profile files briefly on Windows; the OS temp folder can clean them later.
    }
  }

  if (issues.length) {
    console.log(`Viewport audit found ${issues.length} issue(s) across ${htmlFiles.length} pages.`);
    console.log(issues.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`Viewport audit passed across ${htmlFiles.length} pages at desktop and mobile widths.`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
