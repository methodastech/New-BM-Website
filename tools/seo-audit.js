const fs = require('fs');
const path = require('path');

const root = process.cwd();
const htmlFiles = [
  ...fs.readdirSync(root).filter((file) => file.endsWith('.html')),
  ...fs.readdirSync(path.join(root, 'blog')).filter((file) => file.endsWith('.html')).map((file) => `blog/${file}`),
];

const sitemap = fs.existsSync('sitemap.xml') ? fs.readFileSync('sitemap.xml', 'utf8') : '';
const suspiciousText = ['Ã', 'Â', 'â', 'ð', '�'];
let issueCount = 0;

const report = (message) => {
  issueCount += 1;
  console.log(message);
};

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
  const description = html.match(/<meta name="description" content="(.*?)"/)?.[1] ?? '';
  const canonical = html.match(/rel="canonical" href="(.*?)"/)?.[1] ?? '';
  const h1Count = html.match(/<h1\b/g)?.length ?? 0;
  const ogImage = html.match(/property="og:image" content="(.*?)"/)?.[1] ?? '';
  const twitterImage = html.match(/name="twitter:image" content="(.*?)"/)?.[1] ?? '';
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  const missingAlt = imgs.filter((tag) => !/\salt=/.test(tag)).length;
  const missingDecoding = imgs.filter((tag) => !/\sdecoding=/.test(tag)).length;
  const lazyCandidates = imgs.slice(1);
  const missingLazyLoading = lazyCandidates.filter((tag) => !/\sloading=/.test(tag)).length;
  const suspiciousHits = suspiciousText.filter((text) => html.includes(text));

  if (!title) report(`${file}: missing title`);
  if (title.length > 60) report(`${file}: title is ${title.length} chars`);
  if (!description) report(`${file}: missing meta description`);
  if (description.length > 160) report(`${file}: description is ${description.length} chars`);
  if (!canonical) report(`${file}: missing canonical`);
  if (h1Count !== 1) report(`${file}: expected 1 H1, found ${h1Count}`);
  if (!ogImage) report(`${file}: missing og:image`);
  if (!twitterImage) report(`${file}: missing twitter:image`);
  if (missingAlt) report(`${file}: ${missingAlt} image(s) missing alt`);
  if (missingDecoding) report(`${file}: ${missingDecoding} image(s) missing decoding attribute`);
  if (missingLazyLoading) report(`${file}: ${missingLazyLoading} non-first image(s) missing lazy loading`);
  if (suspiciousHits.length) report(`${file}: suspicious text markers ${suspiciousHits.join(', ')}`);

  const expectedUrl = file === 'index.html' ? 'https://brandmethod.co/' : `https://brandmethod.co/${file}`;
  if (!sitemap.includes(expectedUrl)) report(`${file}: missing from sitemap`);

  for (const json of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json[1]);
    } catch (error) {
      report(`${file}: invalid JSON-LD (${error.message})`);
    }
  }
}

if (!fs.existsSync('robots.txt')) report('robots.txt: missing');
if (!sitemap) report('sitemap.xml: missing');

if (issueCount === 0) {
  console.log(`SEO audit passed across ${htmlFiles.length} pages.`);
} else {
  console.log(`SEO audit found ${issueCount} issue(s) across ${htmlFiles.length} pages.`);
  process.exitCode = 1;
}
