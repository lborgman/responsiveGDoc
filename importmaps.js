// @ts-check
const MM4I_IMPORTMAPS_VER = "0.2.6";
/** @param {string} _msg */
window["logConsoleHereIs"](`here is mm4i-importmaps ${MM4I_IMPORTMAPS_VER}`);

const importFc4i_nocachenames = {};
const noCache = (() => {
    return false;
    const sp = new URLSearchParams(location.search);
    return !sp.has("cachemodules");
    const defaultNoCache = true;
    const getPWADisplayMode = () => {
        if (document.referrer.startsWith('android-app://'))
            return 'twa';
        if (window.matchMedia('(display-mode: browser)').matches)
            return 'browser';
        if (window.matchMedia('(display-mode: standalone)').matches)
            return 'standalone';
        if (window.matchMedia('(display-mode: minimal-ui)').matches)
            return 'minimal-ui';
        if (window.matchMedia('(display-mode: fullscreen)').matches)
            return 'fullscreen';
        if (window.matchMedia('(display-mode: window-controls-overlay)').matches)
            return 'window-controls-overlay';

        return 'unknown';
    }
    const displayMode = getPWADisplayMode();
    if (displayMode == "browser") return defaultNoCache;
    return false;
})();

if (noCache) {
    console.log("%cimportFc4i is avoiding browser caching", "background:yellow; color:red; font-size:18px;");
    document.addEventListener("DOMContentLoaded", _evt => {
        const eltSlow = document.createElement("div");
        eltSlow.style = `
        position: fixed;
        top: 70px;
        left: 20px;
        z-index: 9999;
        width: 200px;
        padding: 20px;
        background: blue;
        color: white;
        border: 2px solid currentColor;
        border-radius: 10px;
        display: flex;
        align-content: center;
        flex-wrap: wrap;
    `;
        eltSlow.textContent = "Slow loading because develper debugging is on for Mindmaps 4 Internet ...";
        document.body.appendChild(eltSlow);
        const msRemoveSlow = window.location.hostname == "localhost" ? 1000 : 4000;
        setTimeout(() => eltSlow.remove(), msRemoveSlow);
    });
}
const baseUrl = (() => {
    const b = [...document.getElementsByTagName("base")][0]
    if (b) {
        const bHref = b.href;
        // const wlOrigin = window.location.origin;
        // console.log({ bHref, wlOrigin });
        return bHref;
    }
    return window.location.origin;
})();
// console.log({ baseUrl });
// debugger;


/*
*/
/**
 * Tip from Grok. Using a cache for import().
 * Grok initually thought that this may save 200-250 ms on a modern laptop.
 * But actually it will only save a couple of ms.
 * However I do not think it can harm.
 * 
 * Cache of dynamically imported modules.
 * Keys: importFc4i keys (strings)
 * Values: Promises that resolve to the module namespace object
 * @type {Map<string, Promise<Object>}
 */
const cacheImportFc4i = new Map();



// https://github.com/WICG/import-maps/issues/92
{
    // https://www.npmjs.com/package/three?activeTab=versions, Current Tags
    // const threeVersion = "0.167.1";
    const relImports = {
        "page": "./js/mod/page.js",
        "css-fixer": "./js/mod/css-fixer.js",
        "support-us": "./js/mod/support-us.js",

        // "toast-ui-helpers": "./js/mod/toast-ui-helpers.js",

        // "images": "./js/mod/images.js",
        // "is-displayed": "./js/mod/is-displayed.js",
        // "local-settings": "./js/mod/local-settings.js",
        // "my-svg": "./js/mod/my-svg.js",
        // "sharing-params": "./src/js/mod/sharing-params.js",
        // "toolsJs": "./js/mod/tools.js",
        // "util-mdc": "./js/mod/util-mdc.js",
        // "woff-codepoints": "./js/mod/woff-codepoints.js",
        // "woff2-mdc-symbols": "./js/mod/woff2-mdc-symbols.js",

        // Tests:
        // "no-ui-slider": "./ext/no-ui-slider/nouislider.mjs",
        "qrcode": "https://cdn.jsdelivr.net/npm/qrcode-esm/+esm",
        // "qr-scanner": "https://cdn.jsdelivr.net/npm/qr-scanner@latest/qr-scanner.min.js",

        // "shield-click": "./js/mod/shield-click.js",

        // "hashids": "https://esm.sh/hashids@2.3.0",
        // "css-specificity": "https://cdn.jsdelivr.net/npm/@bramus/specificity",
    };

    const isImporting = {};


    /** @param {string} idOrLink @returns {Promise<Object>} */
    async function importFc4i(idOrLink) {
        const oldModule = cacheImportFc4i.get(idOrLink);
        if (oldModule) return oldModule;
        // if (window["in-app-screen"]) return;
        // const webBrowserInfo = await window["promWebBrowserInfo"];
        // const isInApp = webBrowserInfo.isInApp;
        // const tofIsInApp = typeof isInApp;
        // if (tofIsInApp != "boolean") {
        //   debugger; // eslint-disable-line no-debugger
        //   throw Error(`tofIsInapp == "${tofIsInApp}"`);
        // }
        if (idOrLink.startsWith("https://")) {
            return await import(idOrLink);
        }
        if (idOrLink.startsWith("/")) {
            console.error(`idOrLink should not start with "/" "${idOrLink}"`);
            throw Error(`idOrLink should not start with "/" "${idOrLink}"`);
        }
        const getStackTrace = function () {
            var obj = {};
            // https://v8.dev/docs/stack-trace-api
            // @ts-ignore
            Error.captureStackTrace(obj, getStackTrace);
            const s = obj.stack;
            return s.split(/\n\s*/);
        };

        if (isImporting[idOrLink]) {
            const prevStack = isImporting[idOrLink];
            const prev = `\n>>>PREV "${idOrLink}" stack: ` + prevStack.join("\n  >>>prev ");
            const currStack = getStackTrace();
            const curr = `\nCURR "${idOrLink}" stack: ` + currStack.join("\n  >>>curr ");
            const getStackPoints = (stack) => {
                // Skip Error and importFc4i
                // FIX-ME: check skip
                const points = stack.slice(2).map(row => {
                    const m = row.match(/\((.*?)\)/);
                    // if (!m) throw Error(`row did not match: ${row}`);
                    if (!m) return row.slice(3); // skip "at "
                    const m1 = m[1];
                    return m1;
                });
                return points;
            }
            const prevPoints = getStackPoints(prevStack);
            const currPoints = getStackPoints(currStack);


            //// FIX-ME: how do I see if it is cyclic????

            // const setPrev = new Set(prevPoints);
            // let samePoint;
            // currPoints.forEach(p => { if (setPrev.has(p)) samePoint = p; });
            // console.log("samePoint", samePoint);

            // Is starting point for curr in prev?
            const currStartPoint = currPoints.slice(-1);
            const inPrev = prevPoints.indexOf(currStartPoint) > -1;
            // console.log("inPrev", inPrev);
            if (inPrev) {
                console.warn(`Probably cyclic import for ${idOrLink}`, prev, curr, isImporting);
                debugger; // eslint-disable-line no-debugger
                throw Error(`Cyclic import for ${idOrLink} at ${currStartPoint}`);
            }
        }
        let ourImportLink;
        if (idOrLink.startsWith(".")) {
            // FIX-ME: why is this necessary when using <base ...>? file issue?
            // return await import(makeAbsLink(idOrLink));
            throw Error(`Start with . not tested: ${idOrLink}`);
        }
        if (!ourImportLink) {
            const relUrl = relImports[idOrLink];
            if (relUrl == undefined) {
                console.error(`modId "${idOrLink}" is not known by importFc4i`);
                throw Error(`modId "${idOrLink}" is not known by importFc4i`);
            }
            // FIX-ME: Should baseUrl be used here already?
            ourImportLink = relUrl;
            // ourImportLink = new URL(relUrl, baseUrl);
        }
        const isInApp = false;
        if (noCache || isInApp) {
            ////// This is for non-PWA.
            // Unfortunately there is no standard yet to discover if running as PWA.
            // Same problem with in-app web browser!
            // let objNotCached = importFc4i_nocachenames[ourImportLink];
            let objNotCached = importFc4i_nocachenames[idOrLink];
            if (!objNotCached) {
                objNotCached = {};
                // console.log("%cimportFc4i new avoid caching", "background:yellow; color:red;", ourImportLink);
                const getRandomString = () => {
                    return encodeURIComponent(Math.random().toString(36).slice(2));
                }
                const urlNotCached = new URL(ourImportLink, baseUrl);
                urlNotCached.searchParams.set("nocacheRand", getRandomString());
                objNotCached.href = urlNotCached.href;
                // importFc4i_nocachenames[ourImportLink] = objNotCached;
                importFc4i_nocachenames[idOrLink] = objNotCached;
            }
            if (!objNotCached.mod) {
                isImporting[idOrLink] = getStackTrace();
                const mod = await import(objNotCached.href);
                isImporting[idOrLink] = false;
                // There is no way to discover if a module has been imported so cache the module here:
                objNotCached.mod = mod;
            } else {
                // console.log("%cimportFc4i using old avoid caching", "background:white; color:red;", ourImportLink);
            }
            return objNotCached.mod;
        }
        isImporting[idOrLink] = getStackTrace();


        const prom = import(ourImportLink);
        cacheImportFc4i.set(idOrLink, prom);
        const mod = await prom;


        isImporting[idOrLink] = false;
        {
            const objCached = { mod };
            importFc4i_nocachenames[idOrLink] = objCached;
        }
        return mod;
    }
    window["importFc4i"] = importFc4i;


}

/** @param {string} idOrLink @returns {Promise<Object>} */
window["importFc4i"];