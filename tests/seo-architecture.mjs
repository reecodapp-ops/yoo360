import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const origin='https://www.theyoo360.com';
const sitemap=await readFile('dist/sitemap.xml','utf8');
const routes=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1].slice(origin.length));
assert.equal(new Set(routes).size,routes.length);
assert.equal(routes.length,18);
assert.ok(!routes.some(p=>/campaigns-market|checkout|payment-status|project-brief|admin/.test(p)));
const titles=new Set(),descriptions=new Set(),links=new Map();
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#x27;',"'");
for(const route of routes){
 const html=await readFile(route==='/'?'dist/index.html':'dist'+route+'/index.html','utf8');
 const title=decode(html.match(/<title>([^<]+)<\/title>/)[1]);
 const desc=decode(html.match(/name="description" content="([^"]+)"/)[1]);
 assert.ok(desc.length<160,route+': '+desc.length);
 assert.ok(!titles.has(title));assert.ok(!descriptions.has(desc));titles.add(title);descriptions.add(desc);
 assert.equal((html.match(/<h1(?: |\>)/g)||[]).length,1,route);
 assert.ok(html.includes(`rel="canonical" href="${origin+route}"`));
 assert.ok(!html.includes('noindex'));
 links.set(route,[...html.matchAll(/href="([^"#]+)[^"]*"/g)].map(x=>decode(x[1]).split(/[?#]/)[0]).filter(x=>routes.includes(x)));
 for(const m of html.matchAll(/(?:src|href)="(\/[^"?#]+\.(?:webp|jpg|png|svg|ttf|css|js))"/g))await access('dist'+m[1]);
 for(const m of html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)){
  const schema=JSON.parse(m[1]);const graph=schema['@graph']||[schema];
  assert.ok(!graph.some(x=>x.potentialAction?.['@type']==='SearchAction'));
  for(const person of graph.filter(x=>x['@type']==='Person')){assert.equal(person.worksFor['@id'],origin+'/#organization');assert.ok(person.sameAs.length>0);}
 }
}
const distances=new Map([['/',0]]), queue=['/'];
while(queue.length){const p=queue.shift();for(const next of links.get(p)||[])if(!distances.has(next)){distances.set(next,distances.get(p)+1);queue.push(next);}}
for(const p of routes)assert.ok(distances.get(p)<=3,`${p} reachable within three clicks, distance=${distances.get(p)}`);
const robots=await readFile('dist/robots.txt','utf8');for(const bot of ['Googlebot','GPTBot','OAI-SearchBot','CCBot'])assert.ok(robots.includes('User-agent: '+bot+'\nAllow: /'));
const home=await readFile('dist/index.html','utf8');assert.ok(!home.split('<body>')[1].includes('$2,000'));
const about=await readFile('dist/about/index.html','utf8');assert.ok(about.includes('ContactPoint'));assert.ok(about.includes('Berton Ruposo Mwisha'));
const config=JSON.parse(await readFile('vercel.json','utf8'));assert.ok(config.redirects.some(x=>x.source==='/campaigns-market-launches'&&x.destination==='/marketing-partnerships'&&x.permanent));
console.log('PASS 18 public static pages: unique titles/descriptions <160, one H1, canonical tags, local assets, JSON-LD associations, sitemap exclusions, four crawler rules and all public pages within three clicks.');
