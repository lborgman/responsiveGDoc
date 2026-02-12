// throw Error("just me");
export async function mkPage() {
    const modFixer = await importFc4i("css-fixer");

    const h2 = mkElt("h2", undefined, "Responsive Google Doc Link");
    const divInfo = mkElt("div", undefined, [
        mkElt("div", undefined, "why"),
        mkElt("div", undefined, "how"),
    ]);
    divInfo.id = "explain-info";

    const eltSummary = mkElt("summary", undefined, "What is this???");
    const eltDetails = mkElt("details", undefined, [
        eltSummary,
        divInfo,
    ]);
    const eltInfo = mkElt("p", undefined, eltDetails);

    const inp = mkElt("input", { type: "text", name: "url", required: true })
    inp.id = "inp-url";
    const lbl = mkElt("label", undefined, [
        "Google Doc 'Published to Web':", inp
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

    const funInp = debounce(checkInp, 2 * 1000);
    inp.addEventListener("input", evt => {
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
        const betterHtml = modFixer.fixHtml(html);

        function fixBanner() {
            const idBanner = "our-banner";
            const ourBanner = document.getElementById(idBanner);
            console.log({ ourBanner });
            if (!ourBanner) throw Error(`Did not find #${idBanner}`);
            // ourBanner.textContent = "this is our banner";
            const btnShare = mkElt("button", undefined, "Share");
            ourBanner.appendChild(btnShare);
            btnShare.addEventListener("click", evt => {
                evt.stopPropagation();
                debugger;
                const urlDoc = inp.value.trim();
                const u = new URL(location);
                u.searchParams.set("url", urlDoc);
                navigator.share({
                    title: "test share",
                    text: "our text",
                    url: url.href
                });
            })
            return;
            ourBanner.style.opacity = "0";
            setTimeout(() => { ourBanner.remove(); }, 4 * 1000);
        }
        let timeoutId;
        const afterFix = () => {
            console.log("afterFix");
            fixBanner();
        }
        await showDialog();
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
            eltStatus.textContent = "url is g doc";
            inp.setCustomValidity('g doc');
            inp.reportValidity();
            return;
        }
        if (!isGoogleDocPublishedWebUrl(url)) {
            eltStatus.textContent = "url is NOT g doc web";
            form.classList.add("invalid-url");
            inp.setCustomValidity('Not g doc');
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