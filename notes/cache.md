# Implement Caching for GitHub Pages

You mentioned you will be deploying the `dist` folder to **GitHub Pages**. This significantly changes the approach.

## The GitHub Pages Limitation

Unlike hosting providers like Netlify, Vercel, or a custom Express server, **GitHub Pages does not support custom HTTP response headers**. They enforce their own static caching policy:
- GitHub Pages typically forces a `Cache-Control: max-age=600` (10 minutes) for all requested files.
- You *cannot* add a config file to GitHub Pages to change headers to `immutable` for assets or `max-age=300` for HTML. Adding `<meta http-equiv="Cache-Control">` tags to HTML is also ineffective because modern browsers and CDNs ignore them in favor of true HTTP headers.

## The Solution: Client-Side Caching (Service Worker)

To achieve the "instant load" performance the Request Metrics article talks about, we can bypass GitHub Pages' network limitations using a **Service Worker**. 

Service Workers run in the background of the browser and intercept network requests. They utilize the browser's **Cache API** (which behaves identically to HTTP caching but is controlled by our code, not the server's headers). 

We can easily configure this via the `vite-plugin-pwa` tool.

### Proposed Changes

#### [MODIFY] `package.json`
- Install `vite-plugin-pwa` as a dev dependency.

#### [MODIFY] [vite.config.js](file:///c:/Users/goofy/Documents/School/Non%20Academics/Funtasia/funtasia_app/vite.config.js)
- Add the `VitePWA` plugin to our pipeline.
- Configure Workbox (the brain behind the PWA) to cache the outputted assets permanently (similar to the `immutable` header), while ensuring the `index.html` and `map.html` are re-fetched properly.

#### [MODIFY] [index.html](file:///c:/Users/goofy/Documents/School/Non%20Academics/Funtasia/funtasia_app/index.html) & [map.html](file:///c:/Users/goofy/Documents/School/Non%20Academics/Funtasia/funtasia_app/map.html)
- We will include an automatic script to register the generated Service Worker on load. 

## User Review Required
> [!IMPORTANT]
> Because GitHub Pages blocks true HTTP caching configuration, adding a Service Worker (PWA plugin) is the standard modern workaround for static hosting. This won't change your HTTP headers from GitHub, but it *will* achieve the exact same performance outcome for end users on repeated visits.
> 
> Are you okay with adding a Service Worker (`vite-plugin-pwa`) to handle the caching?
