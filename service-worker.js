const CACHE='store-management-demo-v22';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;

  const request=event.request;
  const isNavigation=request.mode==='navigate' || request.destination==='document';

  if(isNavigation){
    event.respondWith(
      fetch(request)
        .then(resp=>{
          const copy=resp.clone();
          caches.open(CACHE).then(cache=>cache.put('./index.html',copy));
          return resp;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(hit=>
      hit || fetch(request).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE).then(cache=>cache.put(request,copy));
        return resp;
      })
    )
  );
});
