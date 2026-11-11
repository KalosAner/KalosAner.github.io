/* ===========================================================
 * sw.js
 * ===========================================================
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0
 * service worker scripting
 * ========================================================== */

// CACHE_NAMESPACE
// CacheStorage is shared between all sites under same domain.
// A namespace can prevent potential name conflicts and mis-deletion.
//
// The trailing version is what actually retires stale assets. Two problems came
// from leaving it out:
//
//  1. `activate` only deletes names in DEPRECATED_CACHES, so a new worker kept
//     writing into the *same* bucket as the old one. `install` re-added the
//     precache list on top of the existing entries, and any file whose add
//     failed (a 404, a flaky network) left the previous copy in place forever.
//     Bumping the version makes the new worker start from an empty bucket, so
//     every precached file is re-fetched from the network exactly once.
//
//  2. index.html is precached as "./" and served from that bucket, so a page
//     could pair an old HTML shell with new CSS/JS (or the reverse) and render
//     broken. A new version keeps HTML and assets in step.
//
// Bump this whenever sw.js or PRECACHE_LIST meaningfully changes.
const CACHE_VERSION = 'v6';
const CACHE_NAMESPACE = 'main-' + CACHE_VERSION + '-'

const CACHE = CACHE_NAMESPACE + 'precache-then-runtime';
const PRECACHE_LIST = [
  "./",
  "./offline.html",
  "./js/jquery.min.js",
  "./js/bootstrap.min.js",
  "./js/hux-blog.min.js?v=2",
  "./js/snackbar.js",
  "./img/icon_wechat.png",
  "./img/avatar-hux.jpg",
  "./img/home-bg-o.jpg",
  "./img/404-bg.jpg",
  "./css/hux-blog.min.css?v=2",
  "./css/bootstrap.min.css"
  // "//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css",
  // "//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/fonts/fontawesome-webfont.woff2?v=4.6.3",
  // "//cdnjs.cloudflare.com/ajax/libs/fastclick/1.0.6/fastclick.min.js"
]
// Hosts whose requests the worker is allowed to intercept and cache.
//
// `huangxuan.me` and `yanshuo.io` used to be listed here because they were the
// theme author's other sites; nothing on this blog is served from them, and
// leaving them in had the worker claim requests to domains it does not own.
//
// cdnjs stays: head.html, footer.html and the post/keynote layouts still load
// Font Awesome, fastclick, anchor-js and MathJax from it.
const HOSTNAME_WHITELIST = [
  self.location.hostname,
  "cdnjs.cloudflare.com"
]
const DEPRECATED_CACHES = ['precache-v1', 'runtime', 'main-precache-v1', 'main-runtime']


// The Util Function to hack URLs of intercepted requests
const getCacheBustingUrl = (req) => {
  var now = Date.now();
  url = new URL(req.url)

  // 1. fixed http URL
  // Just keep syncing with location.protocol
  // fetch(httpURL) belongs to active mixed content.
  // And fetch(httpRequest) is not supported yet.
  url.protocol = self.location.protocol

  // 2. add query for caching-busting.
  // Github Pages served with Cache-Control: max-age=600
  // max-age on mutable content is error-prone, with SW life of bugs can even extend.
  // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
  // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
  url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
  return url.href
}

// The Util Function to detect and polyfill req.mode="navigate"
// request.mode of 'navigate' is unfortunately not supported in Chrome
// versions older than 49, so we need to include a less precise fallback,
// which checks for a GET request with an Accept: text/html header.
const isNavigationReq = (req) => (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept').includes('text/html')))

// The Util Function to detect if a req is end with extension
// Accordin to Fetch API spec <https://fetch.spec.whatwg.org/#concept-request-destination>
// Any HTML's navigation has consistently mode="navigate" type="" and destination="document"
// including requesting an img (or any static resources) from URL Bar directly.
// So It ends up with that regExp is still the king of URL routing ;)
// P.S. An url.pathname has no '.' can not indicate it ends with extension (e.g. /api/version/1.2/)
const endWithExtension = (req) => Boolean(new URL(req.url).pathname.match(/\.\w+$/))

// Redirect in SW manually fixed github pages arbitray 404s on things?blah
// what we want:
//    repo?blah -> !(gh 404) -> sw 302 -> repo/?blah
//    .ext?blah -> !(sw 302 -> .ext/?blah -> gh 404) -> .ext?blah
// If It's a navigation req and it's url.pathname isn't end with '/' or '.ext'
// it should be a dir/repo request and need to be fixed (a.k.a be redirected)
// Tracking https://twitter.com/Huxpro/status/798816417097224193
const shouldRedirect = (req) => (isNavigationReq(req) && new URL(req.url).pathname.substr(-1) !== "/" && !endWithExtension(req))

// The Util Function to get redirect URL
// `${url}/` would mis-add "/" in the end of query, so we use URL object.
// P.P.S. Always trust url.pathname instead of the whole url string.
const getRedirectUrl = (req) => {
  url = new URL(req.url)
  url.pathname += "/"
  return url.href
}


/**
 *  @Lifecycle Install
 *  Precache anything static to this version of your app.
 *  e.g. App Shell, 404, JS/CSS dependencies...
 *
 *  waitUntil() : installing ====> installed
 *  skipWaiting() : waiting(installed) ====> activating
 */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(PRECACHE_LIST)
        .then(self.skipWaiting())
        .catch(err => console.log(err))
    })
  )
});


/**
 *  @Lifecycle Activate
 *  New one activated when old isnt being used.
 *
 *  waitUntil(): activating ====> activated
 */
self.addEventListener('activate', event => {
  // Drop every cache except the current one.
  //
  // Filtering on DEPRECATED_CACHES alone meant caches from earlier versions
  // survived forever, because they were never named in that array (every past
  // version used the same name, "main-precache-then-runtime"). Deleting
  // anything that is not CACHE also covers those, and CACHE_NAMESPACE is a
  // prefix of every name this site has ever written, so unrelated caches on
  // the same origin are left alone.
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(name => name !== CACHE && name.startsWith('main-'))
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
      .then(() => console.log('service worker activated, cache =', CACHE))
  );
});


var fetchHelper = {

  fetchThenCache: function(request){
    // Requests with mode "no-cors" can result in Opaque Response,
    // Requests to Allow-Control-Cross-Origin: * can't include credentials.
    const init = { mode: "cors", credentials: "omit" } 

    const fetched = fetch(request, init)
    const fetchedCopy = fetched.then(resp => resp.clone());

    // NOTE: Opaque Responses have no hedaders so [[ok]] make no sense to them
    //       so Opaque Resp will not be cached in this case.
    Promise.all([fetchedCopy, caches.open(CACHE)])
      .then(([response, cache]) => response.ok && cache.put(request, response))
      .catch(_ => {/* eat any errors */})
    
    return fetched;
  },

  cacheFirst: function(url){
    return caches.match(url) 
      .then(resp => resp || this.fetchThenCache(url))
      .catch(_ => {/* eat any errors */})
  }
}


/**
 *  @Functional Fetch
 *  All network requests are being intercepted here.
 *
 *  void respondWith(Promise<Response> r);
 */
self.addEventListener('fetch', event => {
  // logs for debugging
  //console.log(`fetch ${event.request.url}`)
  //console.log(` - type: ${event.request.type}; destination: ${event.request.destination}`)
  //console.log(` - mode: ${event.request.mode}, accept: ${event.request.headers.get('accept')}`)

  // Skip some of cross-origin requests, like those for Google Analytics.
  if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {

    // Redirect in SW manually fixed github pages 404s on repo?blah
    if (shouldRedirect(event.request)) {
      event.respondWith(Response.redirect(getRedirectUrl(event.request)))
      return;
    }

    // Cache-only Startgies for ys.static resources
    if (event.request.url.indexOf('ys.static') > -1){
      event.respondWith(fetchHelper.cacheFirst(event.request.url))
      return;
    }

    // Stale-while-revalidate for possiblily dynamic content
    // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
    // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
    const cached = caches.match(event.request);
    const fetched = fetch(getCacheBustingUrl(event.request), { cache: "no-store" });
    const fetchedCopy = fetched.then(resp => resp.clone());
    
    // Call respondWith() with whatever we get first.
    // Promise.race() resolves with first one settled (even rejected)
    // If the fetch fails (e.g disconnected), wait for the cache.
    // If there’s nothing in cache, wait for the fetch.
    // If neither yields a response, return offline pages.
    event.respondWith(
      Promise.race([fetched.catch(_ => cached), cached])
        .then(resp => resp || fetched)
        .catch(_ => caches.match('offline.html'))
    );

    // Update the cache with the version we fetched (only for ok status)
    event.waitUntil(
      Promise.all([fetchedCopy, caches.open(CACHE)])
        .then(([response, cache]) => response.ok && cache.put(event.request, response))
        .catch(_ => {/* eat any errors */ })
    );

    // If one request is a HTML naviagtion, checking update!
    if (isNavigationReq(event.request)) {
      // you need "preserve logs" to see this log
      // cuz it happened before navigating
      console.log(`fetch ${event.request.url}`)
      event.waitUntil(revalidateContent(cached, fetchedCopy))
    }
  }
});


/**
 * Broadcasting all clients with MessageChannel API
 */
function sendMessageToAllClients(msg) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      console.log(client);
      client.postMessage(msg)
    })
  })
}

/**
 * Broadcasting all clients async
 */
function sendMessageToClientsAsync(msg) {
  // waiting for new client alive with "async" setTimeout hacking
  // https://twitter.com/Huxpro/status/799265578443751424
  // https://jakearchibald.com/2016/service-worker-meeting-notes/#fetch-event-clients
  setTimeout(() => {
    sendMessageToAllClients(msg)
  }, 1000)
}

/**
 * if content modified, we can notify clients to refresh
 * TODO: Gh-pages rebuild everything in each release. should find a workaround (e.g. ETag with cloudflare)
 * 
 * @param  {Promise<response>} cachedResp  [description]
 * @param  {Promise<response>} fetchedResp [description]
 * @return {Promise}
 */
function revalidateContent(cachedResp, fetchedResp) {
  // revalidate when both promise resolved
  return Promise.all([cachedResp, fetchedResp])
    .then(([cached, fetched]) => {
      const cachedVer = cached.headers.get('last-modified')
      const fetchedVer = fetched.headers.get('last-modified')
      console.log(`"${cachedVer}" vs. "${fetchedVer}"`);
      if (cachedVer !== fetchedVer) {
        sendMessageToClientsAsync({
          'command': 'UPDATE_FOUND',
          'url': fetched.url
        })
      }
    })
    .catch(err => console.log(err))
}
