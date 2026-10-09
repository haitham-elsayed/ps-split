// غيّر رقم النسخة لو عايز تفرض مسح الكاش القديم
const V='ps-split-v2';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-180.png'];
const notify=()=>self.clients.matchAll({type:'window'}).then(l=>l.forEach(c=>c.postMessage('upd')));
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:'reload'}))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){
    // الصفحة تفتح فوراً من الكاش، والنسخة الجديدة تتحمّل في الخلفية وتظهر رسالة "فيه نسخة جديدة"
    const net=fetch(r,{cache:'no-cache'}).then(async res=>{
      if(res.ok){
        const c=await caches.open(V),old=await c.match('index.html');
        const o=old&&(old.headers.get('etag')||old.headers.get('last-modified')),n=res.headers.get('etag')||res.headers.get('last-modified');
        await c.put('index.html',res.clone());
        if(old&&o&&n&&o!==n)notify();
      }
      return res;
    }).catch(()=>null);
    e.waitUntil(net);
    e.respondWith(caches.match('index.html').then(hit=>hit||net.then(x=>x||Response.error())));
    return;
  }
  if(u.origin===location.origin||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(V).then(c=>c.match(r).then(hit=>{
      const net=fetch(r,{cache:u.origin===location.origin?'no-cache':'default'}).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>hit);
      return hit||net;
    })));
  }
});
