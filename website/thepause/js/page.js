/* ============================================================
   THE PAUSE : Static page bootstrap (chrome + motion)
   ============================================================ */

import { mountHeader, mountFooter, bindAddButtons } from "./components.js";
import { hydrateIcons } from "./icons.js";
import * as cart from "./cart.js";
import { initMotion } from "./motion.js";

const header = mountHeader();
mountFooter();
cart.mountDrawer();
document.querySelector("[data-open-cart]").addEventListener("click", cart.openDrawer);
cart.bindCountBadge(document.querySelector(".cart-count"));
bindAddButtons(document.body, cart);
hydrateIcons();
initMotion({ header });
