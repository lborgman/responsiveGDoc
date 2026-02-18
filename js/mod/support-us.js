// @ts-check

// @ts-ignore
const mkElt = window.mkElt;
// ts-ignore
// const importFc4i = window.importFc4i;

export async function popupSupport() {
    const eltBMCimage = mkElt("div");
    eltBMCimage.style = `
        background-image: url(./img/qr-bmc.png);
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        aspect-ratio: 1 / 1;
    `;
    const eltBMC = mkElt("div", undefined, [
        mkElt("div", undefined, "Buy me a chocolate"),
        eltBMCimage
    ]);
    eltBMC.style = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        background: chocolate;
        color: white;
        border: 1px red;
        NOwidth: 378px;
        NOheight: 572px;
        aspect-ratio: 378 / 572;
    `;
    const aBMC = mkElt("a", { href: "https://buymeacoffee.com/mm4i", target: "_blank" }, eltBMC);
    aBMC.style.display = "flex";
    aBMC.style.fontSize = "1rem";


    const eltDonation = mkElt("p", undefined, [
        aBMC,
        mkElt("img", { src: "./img/swish-QR-20kr.png" })
    ]);
    eltDonation.id = "elt-donation";
    eltDonation.style = `
        display: flex;
        justify-content: center;
        height: 250px;
        gap: 20px;
    `;
    const dialog = mkElt("dialog", undefined, [
        mkElt("div", undefined, [
            mkElt("h2", undefined, "A little support"),
            mkElt("p", undefined, `
                We pay for some web services.
                A small donation for those will be welcome!
            `),
            eltDonation
        ])
    ]);
    dialog.id = "dialog-support";
    document.body.appendChild(dialog);
    dialog.addEventListener("click", evt => {
        const target = evt.target;
        // debugger;
        if (target.closest("div")) return;
        // const a = target === dialog; if (!a) return;
        evt.stopPropagation();
        dialog.close();
    })
    dialog.showModal();
}