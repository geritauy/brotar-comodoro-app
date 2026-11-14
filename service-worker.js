const CACHE='brotar-pwa-v1';
const APP_SHELL=['./','./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
const EXTERNAL_ASSETS=[
 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@500;600;700&display=swap'
];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(APP_SHELL);
  await Promise.all(EXTERNAL_ASSETS.map(async url=>{
   try{const req=new Request(url,{mode:'no-cors'});const res=await fetch(req);await cache.put(req,res);}catch(e){/* Se intentará guardar cuando el recurso se use online. */}
  }));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin===self.location.origin){
  if(req.mode==='navigate'){
   event.respondWith((async()=>{try{const fresh=await fetch(req);const c=await caches.open(CACHE);c.put('./index.html',fresh.clone());return fresh;}catch(e){return (await caches.match(req))||(await caches.match('./index.html'));}})());
  }else{
   event.respondWith((async()=>{const cached=await caches.match(req);if(cached)return cached;try{const fresh=await fetch(req);if(fresh.ok){const c=await caches.open(CACHE);c.put(req,fresh.clone());}return fresh;}catch(e){return cached;}})());
  }
 }else{
  event.respondWith((async()=>{const cached=await caches.match(req);if(cached)return cached;try{const fresh=await fetch(req);const c=await caches.open(CACHE);c.put(req,fresh.clone());return fresh;}catch(e){return cached||Response.error();}})());
 }
});
