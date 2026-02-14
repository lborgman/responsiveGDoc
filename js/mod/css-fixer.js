// @ts-check
const CSS_FIXER_VERSION = "0.58";
const FIXER_VERSION = ourVersion();
consoleLog(`=============== css-fixer.js ${CSS_FIXER_VERSION}`);
function consoleLog(...msg) {
    console.log(...msg);
}

// export default async function handler(req, res) {
export function fixHtml(html) {

    // const posScript1 = html.search("<script");
    // consoleLog("posScript1", posScript1);
    html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, "");
    // const posScript2 = html.search("<script");
    // consoleLog("posScript2", posScript2);

    // const arrClasses = getBackgroundClassesFromHtml(html);
    // consoleLog("arrClasses:", arrClasses);

    /** @type {string[]} */
    const arrStyles = [];

    html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (match, cssContent) => {
        arrStyles.push(cssContent);
        const sanitizedCss = cssContent
            .replace(/([-+]?\d+(?:\.\d+)?)(pt|px)/gi, (m, value, unit) => {
                const numValue = parseFloat(value);

                // If the value is 0, no unit is needed
                if (numValue === 0) return '0';

                /* THE RATIO:
                   Google Docs uses 12pt as the standard '100%' font size.
                   In browsers, 1rem is the '100%' font size.
                   Therefore: Value / 12 = rem
                */
                const remValue = (numValue / 12).toFixed(3);

                return `${remValue}rem`;
            });

        return `<style>${sanitizedCss}</style>`;
    });

    // const arrClassesOld = getBackgroundClassesFromHtml(html);
    // consoleLog("arrClassesOld:", arrClassesOld);

    /** @type {string[]} */
    const arrClasses = [];

    arrStyles.forEach(strStyle => getBackgroundClassesFromStyle(strStyle, arrClasses));
    consoleLog("arrClasses:", arrClasses);

    html = html.replace("<head>",
        `
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark light">

    `
    );

    const colorClassSelector = arrClasses.map(c => `span.${c}`).join(", ");
    consoleLog("before </head>", colorClassSelector);
    html = html.replace("</head>",
        `
        <style>
        /* BASIC FOUNDATION - Adjust these details yourself! */

        ${colorClassSelector} {
          padding: 2px;
          border-radius: 3px;
        }

        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
            /* Adjust highlighted text for dark mode */
            /* filter as suggested by Microsoft Copilot */
            ${colorClassSelector} {
              filter: invert(1) hue-rotate(160deg) brightness(0.95) contrast(1.05);
            }

            body {
                background-color: #1a1a1a !important;
                color: #e8e8e8 !important;
            }

            /* Main content area */
            #contents {
                background-color: #1a1a1a !important;
                color: #e8e8e8 !important;
            }

            .doc-content {
                background-color: #2a2a2a !important;
                color: #e8e8e8 !important;
            }

            /* Force all text elements to light colors */
            p,
            li,
            span,
            div {
                color: #e8e8e8 !important;
            }

            /* All headings */
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
                color: #ffffff !important;
            }

            /* Tables */
            th,
            td {
                border-color: #444 !important;
            }

            /* Adjust highlighted text for dark mode */
            [class*='c'][style*='background-color'] {
              filter: brightness(0.7) saturate(0.8);
              color: #e8e8e8 !important; /* Make text light colored */
            }

            /* Banners and footer */
            #banners,
            #banners #title-banner {
                background: #2a2a2a !important;
                border-bottom-color: #444 !important;
                color: #e8e8e8 !important;
            }

            #footer {
                background: #2a2a2a !important;
                border-bottom-color: #444 !important;
                color: #e8e8e8 !important;
            }
        }


        body {
            /* No font-size defined: respects user/browser choice */
            max-width: 42rem;
            margin: 0 auto;
            padding: 1.5rem;
            NOline-height: 1.6;
            NOfont-family: system-ui, -apple-system, sans-serif;
            NOcolor: #1a1a1a;
            NOword-wrap: break-word;
        }

        /* Responsive Images & Tables */
        img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            display: block;
            overflow-x: auto;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
        }


        /* Google docs fixes */
        html body #banners {
            display: none !important;
        }

        NOhtml body #contents {
            padding: unset !important;
        }

        :root .doc-content {
            padding: unset !important;
            background-color: unset !important;
            color: unset !important;
        }

        :root #contents {
            padding: unset !important;
            background-color: unset !important;
            color: unset !important;
        }


        /* Our banner */
        :root #our-banner {
            display: flex;
            justify-content: space-between;
            background-color: yellowgreen !important;
            color: darkgreen !important;
            padding: 8px !important;
            position: fixed;
            left: 0;
            top: 0;
            width: calc(100vw - 2 * 8px - 12px);
            opacity: 1;
            transition: opacity 1s 3s;
        }
        :root #our-banner button {
            aspect-ration: 1 / 1;
        }
        :root #our-banner #our-banner-span-buttons {
            display: flex;
            height: 32px;
            gap: 10px;
        }
        :root #our-banner #our-banner-span-buttons button {
            aspect-ratio: 1 / 1;
            background-repeat: no-repeat;
            background-size: contain;
            outline: 1px dotted red;
        }

        dialog {
            box-shadow: black 10px 10px 10px;
        }
        dialog::backdrop {
            backdrop-filter: blur(2px);
            background-color: #99999966;
        }
    </style>
    <script>
        window.addEventListener('DOMContentLoaded', function () {
            const eltBanner = document.getElementById('our-banner');
            eltBanner.style.opacity = "0";

            const contents = document.getElementById('contents');
            const docContent = document.querySelector('.doc-content');
            if (!contents) {
                console.warn('Warning: #contents element not found - Google Docs structure may have changed');
            }
            if (!docContent) {
                console.warn('Warning: .doc-content element not found - Google Docs structure may have changed');
            }
            if (!contents || !docContent) {
              alert("Google Docs HTML output have changed format. (So clean.js must be updated.))");
            }
        });
    </script>
</head>
    `
    );

    let oldTitle = "no title";
    const mTitle = html.match(/<title>(.*?)<\/title>/);
    if (mTitle) {
        oldTitle = mTitle[1];
        const newTitle = `view: ${oldTitle}`
        html = html.replace(/<title>(.*?)<\/title>/, `<title>${newTitle}</title>`);
    }

    consoleLog("before <body>");
    html = html.replace("<body>",
        `
    <body>
    <div id="our-banner">
      GDocs html ver: ${FIXER_VERSION}
    </div>
    `
    );

    consoleLog("before ok return");
    // res.setHeader('Content-Type', 'text/html');
    // return res.status(200).send(html);
    return { html, title: oldTitle };




    /**
     * 
     * @param {string} googleStyle 
     * @param {string[]} bgClasses 
     */
    function getBackgroundClassesFromStyle(googleStyle, bgClasses) {
        // Google Docs does not always add ";" so scan until "}"
        const regex = /\.(c\d+)\s*{[^}]*background-color:\s*([^}]+)/g;
        let match;
        while (match = regex.exec(googleStyle)) {
            bgClasses.push(match[1]); // e.g., 'c4'
        }

    }


}