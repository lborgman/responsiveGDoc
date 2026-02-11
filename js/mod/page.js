// throw Error("just me");
export async function mkPage() {
    const modFixer = await importFc4i("css-fixer");

    const h2 = mkElt("h2", undefined, "Some header");
    const eltInfo = mkElt("p", undefined, `Some info`);

    const inp = mkElt("input", { type: "text", name: "url", required: true })
    inp.id = "inp-url";
    const lbl = mkElt("label", undefined, [
        "The url:", inp
    ]);

    const btnSubmit = mkElt("button", { type: "submit" }, "Go");
    btnSubmit.id = "btn-submit";
    const divSubmit = mkElt("div", undefined, btnSubmit);

    const form = mkElt("form", undefined, [
        lbl, divSubmit
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
    const eltErrors = mkElt("p");
    eltErrors.id = "elt-errors";
    eltErrors.style.color = "red";
    const divContent = mkElt("div", undefined, [
        h2,
        eltInfo,
        form,
        eltErrors
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
        // debugger;
        try {
            resp = await fetch(url);
        } catch (err) {
            console.error(url);
            debugger;
        }
        const html = await resp.text();
        debugger;
        const betterHtml = modFixer.fixHtml(html);
        // const parser = new DOMParser();
        // const eltHtml = parser.parseFromString(html, "text/html");
        // document.documentElement.remove();
        // document.appendChild(eltHtml);
        // debugger;

        ///// https://chat.deepseek.com/a/chat/s/514a6132-6b11-4782-9a41-9f928c58c676
        // document.open();
        // document.write(betterHtml);
        // document.close();
        ///// But document.write is depreciated!
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
            form.classList.remove("invalid-url");
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
            eltErrors.textContent = "url is g doc";
            inp.setCustomValidity('g doc');
            inp.reportValidity();
            return;
        }
        if (!isGoogleDocPublishedWebUrl(url)) {
            eltErrors.textContent = "url is NOT g doc web";
            form.classList.add("invalid-url");
            inp.setCustomValidity('Not g doc');
            inp.reportValidity();
            return;
        }
        eltErrors.textContent = "";
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