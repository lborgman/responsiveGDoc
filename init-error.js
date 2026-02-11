// @ts-check
const INIT_ERROR_VER = "0.1.7";

/** @global */
window.logConsoleHereIs = (() => {
    /**
     * @param {string} _msg
     * @returns {void}
     */
    function logConsoleHereIs(_msg) {
        console.log(`%c${_msg}`, "color:white; background-color:blue; padding: 0px 5px;");
    }
    return logConsoleHereIs;
});

window.logConsoleHereIs(`here is init-error.js ${INIT_ERROR_VER}`);

{
    let numErrors = 0;

    /**
     * 
     * @param {Event} evt 
     */
    const doDisplay = (evt) => {
        // @ts-ignore
        if (window["in-app-screen"]) return;
        if (numErrors++ > 0) return; // Only display one error
        console.log("in doDisplay", evt);
        if (evt instanceof ErrorEvent) {
            console.log("ErrorEvent", evt);
        } else if (evt instanceof PromiseRejectionEvent) {
            console.log("PromisRejectionEvent", evt);
        } else {
            console.log("Unknown event class", evt);
        }
        // @ts-ignore
        if (evt.reason) {
            console.log("had reason");
        } else {
            console.log("had NO reason");
        }
        // @ts-ignore
        const ourError = evt.reason ? evt.reason : evt;
        // @ts-ignore
        const { type, message, reason, filename, lineno } = ourError;
        // @ts-ignore
        const stack = ourError.stack;

        // @ts-ignore
        if (window["NOalertError"]) {
            // @ts-ignore
            window["alertError"](type, evt);
            return;
        }
        // const msg = `${type}: ${message || reason}, ${filename || ""}:${lineno || ""} `;
        const msg = `${message || reason}`;

        const divHints = document.createElement("div");
        // Uncaught SyntaxError: Unexpected token 'export'
        if (/SyntaxError/.test(msg)) {
            const p = document.createElement("p");
            p.textContent = "The file did not parse.";
            divHints.appendChild(p);
            if (/export/.test(msg)) {
                const p = document.createElement("p");
                p.textContent = "The file should probably be loaded as a module.";
                divHints.appendChild(p);
            }
        }

        const dlg = document.createElement("dialog");
        const h2 = document.createElement("h2");
        dlg.appendChild(h2);
        const p1 = document.createElement("p");
        dlg.appendChild(p1);
        const pre = document.createElement("pre");
        // @ts-ignore
        pre.style = `
            background: orange;
            padding: 4px;
            text-wrap: wrap;
            overflow-wrap: break-word;
        `;
        dlg.appendChild(pre);
        let txtPre = location.href;
        txtPre += "\n\n";
        if (stack) {
            txtPre += stack;
        } else {
            txtPre += `${filename || "No filename"}:${lineno || "No line number"} `;
        }
        pre.textContent = txtPre;

        dlg.appendChild(divHints);

        const btn = document.createElement("button");
        const pBtn = document.createElement("p");
        pBtn.appendChild(btn);
        dlg.appendChild(pBtn);

        h2.textContent = "Error";
        p1.textContent = msg;
        btn.textContent = "Close";

        // @ts-ignore
        dlg.style = `
            background: red;
            color: black;
            font-size: 1rem;
            max-width: 90vw;
        `;
        btn.addEventListener("click", _evt => dlg.close());
        document.body.appendChild(dlg);
        dlg.showModal();
    };

    /**
     * 
     * @param {ErrorEvent} evtError 
     * @returns 
     */
    const displayError = (evtError) => {
        if (document.readyState != "loading") { doDisplay(evtError); return; }
        document.addEventListener("DOMContentLoaded", () => { doDisplay(evtError); });
    }
    window.addEventListener("error", evt => {
        displayError(evt);
    });
    window.addEventListener("unhandledrejection", evt => {
        // @ts-ignore
        console.log("in unhandledrejection", window["useRejection"], evt);
        // displayError(evt);
        // https://stackoverflow.com/questions/76230924/get-location-information-for-promiserejectionevent
        reportError(evt.reason);
    });

    if (!document.currentScript) throw Error("init-error.js must not be loaded as a module");
}

/**
 * From Grok. Not sure why this works??
 * 
 * A JavaScript object with dynamic string keys (unquoted in syntax) and string values.
 * @typedef {Object.<string, string>} DynamicStringObject
 * @property {string} [key: string] - A string value associated with a string key.
 * @example
 * {
 *   userId: "12345",
 *   status: "active",
 *   department: "engineering"
 * }
 */
/** @type {DynamicStringObject} */
const _dynamicObject = {
    // 5: "test",
    userId: "12345",
    status: "active",
    department: "engineering",
};



/** @global */
window.mkElt = (() => {
    /**
     * @param {string} type 
     * @param {DynamicStringObject} [attrib]
     * @param {string|string[]|HTMLElement|HTMLElement[]} [inner]
     * @returns {HTMLElement}
     */
    function mkElt(type, attrib, inner) {
        const elt = document.createElement(type);

        /**
         * 
         * @param {HTMLElement | HTMLElement[] | string | string[]} inr 
         */
        function addInner(inr) {
            if (inr instanceof Element) {
                elt.appendChild(inr);
            } else {
                const txt = document.createTextNode(inr.toString());
                elt.appendChild(txt);
            }
        }
        if (inner) {
            if (Array.isArray(inner) && inner.length && typeof inner != "string") {
                for (var i = 0; i < inner.length; i++)
                    if (inner[i])
                        addInner(inner[i]);
            } else
                addInner(inner);
        }
        for (var x in attrib) {
            elt.setAttribute(x, attrib[x]);
        }
        return elt;
    }
    return mkElt;
})();


// https://stackoverflow.com/questions/61080783/handling-errors-in-async-event-handlers-in-javascript-in-the-web-browser
/** @global */
window.errorHandlerAsyncEvent = (() => {
    // Error handling with Async/Await in JS - ITNEXT
    // https://itnext.io/error-handling-with-async-await-in-js-26c3f20bc06a
    /**
     * 
     * @param {function} asyncFun 
     * @returns 
     */
    function errorHandlerAsyncEvent(asyncFun) {
        return function (evt) {
            asyncFun(evt).catch(err => {
                console.log("handler", err);
                throw err;
            })
        }
    }
    return errorHandlerAsyncEvent;
})();

/**
 * 
 * @param {string} relLink 
 * @returns {string}
 */
// eslint-disable-next-line no-unused-vars
function makeAbsLink(relLink) {
    if (relLink.startsWith("/")) throw Error(`relLink should not start with "/" "${relLink}`);
    const u = new URL(relLink, document.baseURI);
    return u.href;
}
// window.makeAbsLink = makeAbsLink;

// throw "Test error";