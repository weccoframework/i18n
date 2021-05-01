"use strict"

import { m, loadingPromise } from "./i18n.js"

document.addEventListener("DOMContentLoaded", async () => {
    await loadingPromise

    const h1 = document.querySelector("#app").appendChild(document.createElement("h1"))
    h1.innerText = m("greeting")
})