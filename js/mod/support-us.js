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
    const divBMCimage = mkElt("div", undefined, eltBMCimage);
    divBMCimage.style = `
        padding: 10px;
        background: white;
        border-radius: 8px;
    `;
    const eltBMC = mkElt("div", undefined, [
        mkElt("div", undefined, "Buy me a chocolate"),
        divBMCimage
    ]);
    eltBMC.style = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        background: chocolate;
        color: white;
        text-decoration: none;
        border-radius: 12px;
        NOborder: 1px red;
        aspect-ratio: 378 / 572;
    `;
    const aBMC = mkElt("a", { href: "https://buymeacoffee.com/mm4i", target: "_blank" }, eltBMC);
    aBMC.style.display = "flex";
    aBMC.style.fontSize = "1rem";
    aBMC.id = "donate-bmc";

    const eltSwish = mkElt("img", { src: "./img/swish-QR-20kr.png" });
    eltSwish.id = "donate-swish";


    const mkDonateChoice = (idDonate, label) => {
        const inp = mkElt("input", { type: "radio", name: "donate-name", value: idDonate });
        const lbl = mkElt("label", undefined, [inp, label]);
        return lbl;
    }
    const eltDonateChoice = mkElt("div", undefined, [
        mkDonateChoice("donate-bmc", "Buy me a chocolate"),
        mkDonateChoice("donate-swish", "Swish"),
    ]);
    eltDonateChoice.addEventListener("change", evt => {
        evt.stopPropagation();
        const newChoice = evt.target.value;
        selectDonationChoice(newChoice);
    });
    eltDonateChoice.style = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    const eltDonationAlts = mkElt("p", undefined, [
        aBMC,
        eltSwish,
    ]);
    eltDonationAlts.id = "elt-donation";
    eltDonationAlts.style = `
        display: flex;
        justify-content: center;
        height: 250px;
        gap: 20px;
    `;

    selectDonationChoice("donate-bmc");
    eltDonateChoice.firstElementChild.querySelector("input").checked = true;

    function selectDonationChoice(id) {
        console.log(eltDonationAlts);
        // debugger;
        eltDonationAlts.childNodes.forEach(elt => {
            if (elt.id == id) {
                elt.style.display = "unset";
            } else {
                elt.style.display = "none";
            }
        })
    }

    const eltDonationOuter = mkElt("div", undefined, [eltDonateChoice, eltDonationAlts]);

    const eltNotYet = mkElt("p", undefined, "Please do not donate yet!");
    eltNotYet.style = `
        background: red;
        color: black;
        font-size: 1.5rem;
        padding: 8px;
        border: 4px solid yellow;
        border-radius: 8px;
    `;
    const dialog = mkElt("dialog", undefined, [
        mkElt("div", undefined, [
            eltNotYet,
            mkElt("h2", undefined, "A little support"),
            mkElt("p", undefined, `
                We pay for some web services each month.
                A small donation for those will be welcome!
            `),
            eltDonationOuter,
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