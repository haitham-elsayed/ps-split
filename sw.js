// غيّر رقم النسخة عند أي تعديل كبير لو حبيت تفرض تحديث الكاش
const V='ps-split-v1';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // الصفحة: النت الأول (عشان التحديثات توصل)، ولو مفيش نت من الكاش
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put('index.html',c));return res}).catch(()=>caches.match('index.html')));
    return;
  }
  // باقي الملفات والخطوط: من الكاش فوراً وتتحدّث في الخلفية
  if(u.origin===location.origin||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(V).then(c=>c.match(r).then(hit=>{
      const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>hit);
      return hit||net;
    })));
  }
});
