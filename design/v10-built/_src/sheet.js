// Contact sheets: each built screen next to its v8 (or v9 Scrub) mockup.
// usage: node sheet.js <playwright> <design dir> [flow]
const { chromium } = require(process.argv[2]);
const fs = require('fs'), path = require('path');
const D = path.resolve(process.argv[3]), B = D + '/v10-built', only = process.argv[4];
const TITLES = { '1-start': 'Start', '2-today': 'Today and builder', '3-player': 'Workout player', '4-library': 'Library', '5-profiles': 'Profiles', '6-log': 'Log', '7-edge': 'Edge states' };
const V9 = { '2-today/02-adjust-time': '02-adjust-time', '2-today/03-adjust-more': '03-adjust-more', '2-today/04-ready': '04-ready', '3-player/02-work': '05-player' };
(async () => {
  const b = await chromium.launch();
  const flows = fs.readdirSync(B).filter(f => TITLES[f] && (!only || f === only)).sort();
  const all = [];
  for(const flow of flows){
    const shots = fs.readdirSync(`${B}/${flow}`).filter(f => /^\d\d-.*\.png$/.test(f)).sort();
    const cells = shots.map(f => {
      const slug = f.replace('.png', ''), key = `${flow}/${slug}`;
      const mock = V9[key] ? `${D}/v9/direction-1/${V9[key]}.png` : `${D}/v8/${flow}/${slug}.png`;
      const has = fs.existsSync(mock);
      return `<div class="c"><div class="pr">${has ? `<figure><img src="file://${mock}"><figcaption>Mockup${V9[key] ? ' (v9 Scrub)' : ''}</figcaption></figure>` : ''}<figure><img src="file://${B}/${flow}/${f}"><figcaption>Built</figcaption></figure></div><div class="l"><b>${slug.slice(0, 2)}</b> ${slug.slice(3).replace(/-/g, ' ')}</div></div>`;
    }).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      @font-face{font-family:S;font-weight:900;src:url(file://${D}/../fonts/saira-extra-condensed-900-latin.woff2)}
      @font-face{font-family:F;font-weight:400 700;src:url(file://${D}/../fonts/familjen-grotesk-latin.woff2)}
      body{margin:0;background:#CFCBC4;font-family:F;color:#0B0B0B;padding:40px;width:${3 * 440 + 40}px}
      h1{font-family:S;font-style:italic;font-weight:900;text-transform:uppercase;font-size:72px;line-height:.85;margin:0 0 6px}
      .s{font-size:15px;margin:0 0 28px}.g{display:flex;flex-wrap:wrap;gap:28px 40px}
      .c{width:400px}.pr{display:flex;gap:10px}figure{margin:0;width:195px}img{width:195px;display:block;border-radius:20px}
      figcaption{font-size:12px;font-weight:700;text-transform:uppercase;margin-top:4px}.l{font-size:14px;margin-top:6px}</style></head><body>
      <h1>${flow[0]}. ${TITLES[flow]}</h1><p class="s">Round 10, built app (Playwright, 390x844). Each pair: mockup left, real app right.</p><div class="g">${cells}</div></body></html>`;
    fs.writeFileSync(`${B}/${flow}/sheet.html`, html);
    const p = await b.newPage({ viewport: { width: 1400, height: 800 } });
    await p.goto(`file://${B}/${flow}/sheet.html`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: `${B}/${flow}/sheet.png`, fullPage: true }); await p.close();
    all.push(flow);
  }
  console.log('sheets', all.join(' '));
  await b.close();
})();
