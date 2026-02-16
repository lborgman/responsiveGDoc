// @ts-check
// throw Error("just me");

// @ts-ignore
const mkElt = window.mkElt;
// @ts-ignore
const importFc4i = window.importFc4i;

const paramUrlName = "url";
const initialSearchParams = (new URL(location)).searchParams;
console.log({ initialSearchParams });
const getOurUrl = () => initialSearchParams.get(paramUrlName);
{
    const s = getOurUrl();
    console.log({ s });
}

export async function mkPage() {
    const modFixer = await importFc4i("css-fixer");

    const h2 = mkElt("h2", undefined, [
        mkLogoImg(),
        "G Doc - Mobile View"
    ]);
    h2.id = "main-header";

    const eltNotGoogle = mkElt("div", undefined, `
        This web page is not from Google!
        `);
    eltNotGoogle.id = "not-google";
    const eltWhy = mkElt("div", undefined, `
        Google Docs is a free document editor.
        You can publish a document as a (readonly) web page.
        Unfortunately that web page is hard to view on a mobile phone.
        This web page fixes that.
        `);
    const eltHow = mkElt("div", undefined, [
        mkElt("div", { style: "font-weight:bold;" }, "How this web page works: "),
        mkElt("ol", undefined, [
            mkElt("li", undefined, [
                "Your web browser fetches ",
                mkElt("a", {
                    href: "https://www.youtube.com/watch?v=NSWtJqeAIV4",
                    target: "_blank",
                    style: "color:currentColor; font-style:italic;"
                }, "the 'Publish to Web'-link"),
                " from Google Docs."
            ]),
            mkElt("li", undefined, "The style is changed a bit before displaying it here."),
        ]),
        mkElt("div", undefined,
            `
            Nothing is changed at Google Docs.
            It all happens here in your web browser.
            `)
    ]);
    const divInfo = mkElt("div", undefined, [
        eltWhy,
        eltHow,
        eltNotGoogle,
    ]);
    divInfo.id = "explain-info";

    const eltSummary = mkElt("summary", undefined, "What is this?");
    const eltDetails = mkElt("details", undefined, [
        eltSummary,
        divInfo,
    ]);
    const eltInfo = mkElt("p", undefined, eltDetails);

    const inp = mkElt("input", { type: "text", name: "url", required: true })
    inp.id = "inp-url";
    const lbl = mkElt("label", undefined, [
        "'Publish to Web'-link from your Google Doc:", inp
    ]);

    const btnSubmit = mkElt("button", { type: "submit" }, "Show it");
    btnSubmit.id = "btn-submit";
    const divSubmit = mkElt("div", undefined, btnSubmit);

    const eltStatus = mkElt("div");
    eltStatus.id = "elt-status";
    // eltStatus.style.color = "red";
    const form = mkElt("form", undefined, [
        lbl, eltStatus, divSubmit
    ]);
    form.id = "form";
    form.classList.add("invalid-url");
    lbl.style = `
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;
    form.style = `
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;
    const divContent = mkElt("div", undefined, [
        h2,
        eltInfo,
        form,
        // eltStatus
    ]);

    const realUrl = getOurUrl();
    if (realUrl) inp.value = realUrl;

    inp.setAttribute("placeholder", "Link from Google Docs 'Publish to Web'");
    if (true) {
        // FIX-ME: remove this after testing
        try {
            const testUrl = "https://docs.google.com/document/d/e/2PACX-1vSXcTjJ9L34DmAK5JIt77V3moMAFFLc3U5mm9xh-Ol8ff3TjVPjioFcDOljdKwigYuc4eyMW7fyLBEA/pub";
            await navigator.clipboard.writeText(testUrl);
            inp.setAttribute("placeholder", "Test url is on clipboard");
        } catch (err) {
            console.log(err)
        }
    }


    // FIX-ME: DEBUG
    setTimeout(() => {
        // const val = getOurUrl() || testUrl
        // inp.value = val;
        checkInp();
    }, 2000);

    const funInp = debounce(checkInp, 2 * 1000);
    // @ts-ignore
    inp.addEventListener("input", _evt => {
        inp.setCustomValidity('');
        inp.reportValidity();
        funInp();
    });
    form.addEventListener("submit", evt => {
        evt.preventDefault();
        console.log("check submit");
        // debugger;
        const url = inp.value;
        if (!isGoogleDocPublishedWebUrl(url)) {
            throw Error("inp.value is not g doc web");
        }
        fetchAndRedisplay(url);
        return false;
    });
    /**
     * 
     * @param {string} url 
     */
    async function fetchAndRedisplay(url) {
        let resp;
        try {
            resp = await fetch(url);
        } catch (err) {
            console.error(url);
            debugger;
            throw err;
        }
        let html;
        try {
            html = await resp.text();
        } catch (err) {
            console.error(url);
            debugger;
            throw err;
        }
        const { html: betterHtml, title: oldTitle } = modFixer.fixHtml(html);

        function fixBanner() {
            const idBanner = "our-banner";
            const ourBanner = document.getElementById(idBanner);
            console.log({ ourBanner });
            if (!ourBanner) throw Error(`Did not find #${idBanner}`);
            const btnShare = mkIconButton("share");
            // const btnAdd = mkIconButton("add");
            const btnAdd2 = mkIconButton("add_2");
            const spanButtons = mkElt("span", undefined, [
                btnShare,
                // btnAdd,
                // btnAdd2,
            ]);
            spanButtons.id = "our-banner-span-buttons";

            ourBanner.appendChild(spanButtons);
            {
                const u = new URL(location);
                u.search = "";
                const urlHome = u.href;
                console.log({ urlHome });
                const imgLogo = mkLogoImg();
                imgLogo.style = `
                    aspect-ratio: 1 / 1;
                    height: 32px;
                    `;
                const aLogo = mkElt("a", { href: urlHome }, imgLogo);
                aLogo.title = "G Doc - mobile view";
                ourBanner.insertBefore(aLogo, ourBanner.firstChild);
            }


            btnShare.addEventListener("click", evt => {
                evt.stopPropagation();
                // debugger;
                const urlDoc = inp.value.trim();
                const u = new URL(location.href);
                u.searchParams.set("url", urlDoc);
                const shareOpts = {
                    title: oldTitle,
                    text: `our text, ${u.href}`,
                    url: u.href
                };
                // if (confirm(`Share?\n\nJSON.stringify(shareOpts)`)) {
                // navigator.share(shareOpts);
                shareByOS(removeHTMLTagsAndEntities(oldTitle), "our text", u.href);
                // }
            });
            btnAdd2.addEventListener("click", evt => {
                alert("Not ready yet");
            });
            return;
            function mkIconButton(iconName) {
                const btn = mkElt("button");
                // btn.style.maskImage= `url(./img/${iconName}.svg)`;
                btn.style.setProperty('--icon-url', `url(./img/${iconName}.svg)`);
                btn.classList.add("icon-button");
                return btn;
            }
            ourBanner.style.opacity = "0";
            setTimeout(() => { ourBanner.remove(); }, 4 * 1000);
        }
        let timeoutId;
        const afterFix = () => {
            console.log("afterFix");
            fixBanner();
        }
        // FIX-ME: Not sure about UI
        // await showDialog();
        async function showDialog() {
            const divInfo = mkElt("div", undefined, "info");
            // divInfo.style.padding = "1rem";
            const dialog = mkElt("dialog", undefined, [
                divInfo,
            ]);
            dialog.id = "the-dialog";
            document.body.appendChild(dialog);
            dialog.addEventListener("click", evt => {
                evt.stopPropagation();
                const target = evt.target;
                const a = target === dialog;
                debugger;
                if (!a) return;
                dialog.close();
            })
            dialog.showModal();
            const ans = await new Promise((resolve => {
                dialog.onclose = (event) => {
                    console.log(
                        `Closed with return value: %c${dialog.returnValue}`,
                        `font-weight: bold ; color: red ;`
                    );
                    resolve("closed");
                };
                dialog.oncancel = (event) => {
                    console.log("Modal canceled");
                    resolve("canceled");
                };
            }));
            console.log({ ans });
            debugger;
        }

        const observer = new MutationObserver(() => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                observer.disconnect();
                afterFix();
            }, 10); // Small delay for mutations to settle
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        document.documentElement.innerHTML = betterHtml;
    }

    if (document.body) {
        document.body.appendChild(divContent);
    } else {
        document.addEventListener("DOMContentLoaded", _evt => {
            console.log("hi, i am here now 2", document.body);

            document.body.appendChild(divContent);
            // debugger;
        });
    }

    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Checks if a URL is a modern standard Google Docs "Publish to the Web" link
     *
     * @param {string} url - The URL to check
     * @returns {boolean} True if it matches the strict criteria
     */
    function isGoogleDocPublishedWebUrl(url) {
        const tofUrl = typeof url;
        if (tofUrl !== 'string') {
            throw Error(`typeof url == "${tofUrl}"`);
        }
        const regex = /^https:\/\/docs\.google\.com\/document\/d\/e\/2PACX-[^\/]*\/pub$/;
        return regex.test(url);
    }
    // https://docs.google.com/document/d/1k0CIHztlfdZRSbsvPUkT4Snf9MmlReRXrj_QvzeWRzg/edit?tab=t.0#heading=h.a6mh3qmz792r
    function isGoogleDocUrl(url) {
        const regex = /^https:\/\/docs\.google\.com\/document\/d\/[^\/]{10,}\/[^\/]*$/;
        return regex.test(url);
    }

    function checkInp() {
        console.log("checkInp");
        const url = inp.value;
        if (url.trim().length == 0) {
            // form.classList.remove("invalid-url");
            inp.setCustomValidity('');
            inp.reportValidity();
            return;
        }
        if (!isValidUrl(url)) {
            inp.setCustomValidity('MY Please enter a valid URL');
            inp.reportValidity();
            return;
        }
        if (isGoogleDocUrl(url)) {
            form.classList.add("invalid-url");
            eltStatus.textContent = "This is the Google Doc, not the 'Publish to Web'-link";
            inp.setCustomValidity('');
            inp.reportValidity();
            return;
        }
        if (!isGoogleDocPublishedWebUrl(url)) {
            eltStatus.textContent = "This link is not such a link";
            form.classList.add("invalid-url");
            inp.setCustomValidity('');
            inp.reportValidity();
            return;
        }
        eltStatus.textContent = "";
        form.classList.remove("invalid-url");
        inp.setCustomValidity('');
        inp.reportValidity();
    }

    function debounce(func, waitMS = 200) {
        /** @type {ReturnType<typeof setTimeout> | undefined} */
        let timeoutId;
        /**
         * @this {any}
         * @param {...any} args
         */
        return function (...args) {
            const context = this
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                // console.log("timeout", waitMS);
                timeoutId = undefined;
                func.call(context, ...args)
            }, waitMS);
        };
    };

    /*
    // ────────────────────────────────────────────────
    // Example usage / tests
    // ────────────────────────────────────────────────

    const tests = [
        // True - valid clean URLs
        "https://docs.google.com/document/d/e/2PACX-1vT...longstring.../pub",
        "https://docs.google.com/document/d/e/2PACX-abc123DEFxyz789/pub",

        // False - has query parameters
        "https://docs.google.com/document/d/e/2PACX-.../pub?embedded=true",
        "https://docs.google.com/document/d/e/2PACX-.../pub?start=true",
        "https://docs.google.com/document/d/e/2PACX-.../pub?",

        // False - wrong ending or format
        "https://docs.google.com/document/d/e/2PACX-.../pub/",
        "https://docs.google.com/document/d/e/2PACX-.../preview",
        "https://docs.google.com/document/d/1aBcDeFgHiJkLmN/pub",          // old format (no /e/2PACX-)
        "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub",         // not document
        "http://docs.google.com/document/d/e/2PACX-.../pub",              // not https
        "https://docs.google.com/document/d/e/2PACX-.../pub/extra",       // extra after /pub
        "https://example.com/document/d/e/2PACX-.../pub"
    ];

    // tests.forEach(url => { console.log(`${url}\n  → ${isGoogleDocsPublishedWebUrl(url)}`); });
    */

}

/**
 * 
 * @param {string} title 
 * @param {string} text 
 * @param {string} url 
 * @returns 
 */
async function shareByOS(title, text, url) {
    const ua = navigator.userAgent;
    const isWindows = /Windows NT/i.test(ua);
    const objShare = { title, text, url };
    const merged = [title, text, url].filter(Boolean).join("\n\n");

    // If no Web Share API → fallback immediately
    if (typeof navigator.share !== "function") {
        await dialogCopyToClipboard();
        return;
    }

    try {
        // Windows → merge everything into text
        if (isWindows) {
            // await navigator.share({ text: merged });
            await dialogCopyToClipboard();
            return;
        }
    } catch (err) {
        // Fallback if share fails (Windows often fails)
        debugger;
        // await navigator.clipboard.writeText(objShare);
    }

    // Android, iOS, macOS → full support
    await navigator.share(objShare);

    async function dialogCopyToClipboard() {
        const eltToCopy = mkElt("div", undefined, merged);
        eltToCopy.style = `
            border-width: 1px;
            border-radius: 3px;
            overflow: hidden;
            overflow-wrap: normal;
            white-space: pre-line;
            padding: 10px;
            background: aqua !important;
            color: black !important;
            position: relative;
        `;
        const eltInfo =
            mkElt("p", undefined, `
                Your computer does not support a share dialog.
                So you must copy to clipboard and paste it where you need.
                `);
        eltInfo.style.margin = "1rem 0";
        const btnCopy = mkElt("button", undefined, "Copy");
        btnCopy.addEventListener("click", evt => {
            evt.stopPropagation();
            safeCopyToClipboard(merged);
            const eltTell = mkElt("span", undefined, "Copied");
            eltTell.style = `
                position: absolute;
                top: 10px;
                left: 10px;
                background: red;
                color: black;
                padding: 1rem;
                display: flex;
            `;
            eltToCopy.appendChild(eltTell);
            console.log({ eltTell });
            // return;
            setTimeout(() => {
                const d = btnCopy.closest("dialog");
                d.close();
            }, 4 * 1000);
        })
        const btnCancel = mkElt("button", undefined, "Close");
        btnCancel.addEventListener("click", evt => {
            evt.stopPropagation();
            const d = btnCancel.closest("dialog");
            d.requestClose();
        })
        const divButtons = mkElt("div", undefined, [btnCopy, btnCancel]);
        divButtons.style = `
            display: flex;
            justify-content: center;
            gap: 10px;
            padding-top: 20px;
        `;
        divButtons.classList.add("dialog-buttons");
        const body = mkElt("div", undefined, [
            mkElt("h2", undefined, "Copy to clipboard"),
            eltInfo,
            eltToCopy,
            divButtons
        ]);
        if (await showDialog(body)) {
            await navigator.clipboard.writeText(merged);
        }
    }
}

async function showDialog(eltContent) {
    const dlg = mkElt("dialog", undefined, eltContent);
    dlg.style = `
        max-width: 300px;
        padding: 10px;
        border: 2px solid gray;
        border-radius: 4px;
        box-shadow: black 10px 10px 10px;
    `;
    dlg.id = "the-dialog";
    dlg.addEventListener("close", evt => {
        dlg.remove();
    });
    dlg.addEventListener("cancel", evt => {
        dlg.remove();
    });
    document.body.appendChild(dlg);
    dlg.showModal();
    const ans = await new Promise((resolve => {
        dlg.onclose = (event) => {
            dlg.remove();
            console.log(
                `Closed with return value: %c${dlg.returnValue}`,
                `font-weight: bold ; color: red ;`
            );
            resolve("closed");
        };
        dlg.oncancel = (event) => {
            dlg.remove();
            console.log("Modal canceled");
            resolve("canceled");
        };
    }));
    console.log({ ans });
    return ans == "closed";
}

// https://support.google.com/chrome/answer/114662?hl=en
async function safeCopyToClipboard(text, funPermissionsNeeded = undefined) {
    try {
        /// This query may fail in Firefox and Safari. That is not my problem.
        // @ts-ignore
        const perm = await navigator.permissions.query({ name: "clipboard-write" });
        console.log({ perm });

        if (perm.state === "denied") {
            debugger;
            if (!funPermissionsNeeded) {
                throw new Error("Clipboard write permission denied. User needs to reset it in site settings.");
            }
            funPermissionsNeeded();
        }

        // Even if "prompt", writeText() usually succeeds in active tab with user gesture
        await navigator.clipboard.writeText(text);
        console.log("Copied successfully!");
        return true;
    } catch (err) {
        console.error("Copy failed:", err);
        debugger;
        // Fallback (e.g. old execCommand way or tell user to Ctrl+C)
        return false;
    }
}

/*
// Call it from a button click (user gesture)
document.getElementById("copyBtn").addEventListener("click", () => {
    safeCopyToClipboard("Hello, clipboard!");
});

*/
function removeHTMLTagsAndEntities(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${htmlString}</div>`, 'text/html');
    const textContent = doc.body.textContent || "";
    return textContent.trim();
}

function mkLogoImg(sizePx) {
    const img = mkElt("img", {
        src: "./img/logo2.svg",
    });
    img.classList.add("logo");
    return img;
}