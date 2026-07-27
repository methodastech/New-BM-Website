/* ============================================================
   THE PAUSE : Catalog data
   Single source of truth for shop, cards, PDP, cart, quiz.
   Prices in MYR (RM). Images live in /assets.
   ============================================================ */

export const MOODS = [
  {
    id: "slower-nights",
    name: "For Slower Nights",
    short: "Slower Nights",
    line: "Warm, low, and quiet. Scents that dim the room before you do.",
    note: "Amber, sandalwood, soft resin.",
    accent: "#8a8174",
  },
  {
    id: "focus",
    name: "For Work & Focus",
    short: "Work & Focus",
    line: "Clean and awake. A clear head for the hours that ask for one.",
    note: "Pine, mint, cool cedar.",
    accent: "#6f7a5f",
  },
  {
    id: "clear-space",
    name: "For a Clear Space",
    short: "Clear Space",
    line: "Air that feels rinsed. Room to think, room to breathe.",
    note: "Citrus, vetiver, white tea.",
    accent: "#9a948a",
  },
  {
    id: "soft-reset",
    name: "For a Soft Reset",
    short: "Soft Reset",
    line: "A gentle turning of the page. Begin again, slowly.",
    note: "Rose, fig, powder.",
    accent: "#b08b7a",
  },
];

export const CATEGORIES = [
  { id: "candles",         name: "Candles",         icon: "candle",  line: "Slow light, hours long.",   img: "assets/products/nornorm-eggshell-candle-life.webp" },
  { id: "diffusers",       name: "Diffusers",       icon: "diffuser",line: "A scent that simply stays.", img: "assets/brand/hetkinen-card.webp" },
  { id: "incense",         name: "Incense",         icon: "incense", line: "Smoke, ritual, a pause.",   img: "assets/brand/tribe-earth-card.webp" },
  { id: "incense-holders", name: "Incense Holders", icon: "holder",  line: "Carved to hold the flame.", img: "assets/products/jade-pear-green-white.webp", tone: "light" },
  { id: "room-spray",      name: "Room Sprays",     icon: "spray",   line: "A quick change of air.",    img: "assets/products/hetkinen-aelm-spray-hero.webp", tone: "light" },
];

export const BRANDS = [
  {
    id: "hetkinen",
    name: "Hetkinen",
    origin: "Finland",
    tagline: "A moment, in Finnish.",
    story: "Born in the Finnish forest, Hetkinen distills the calm of the North. Cold air, still water, resin and pine. Each blend is a held breath, made slowly by hand.",
    card: "assets/brand/hetkinen-card.webp",
  },
  {
    id: "tribe-earth",
    name: "Tribe Earth",
    origin: "Australia",
    tagline: "Incense as ceremony.",
    story: "Tribe Earth presses native botanicals into slow burning planks. Marri gum, sandalwood, palo santo. Fragrance drawn from the land, made to be lit with intention.",
    card: "assets/brand/tribe-earth-card.webp",
  },
  {
    id: "jade-deco",
    name: "Jade Deco",
    origin: "China",
    tagline: "Stone, carved to hold smoke.",
    story: "Hand carved jade holders in the shape of quiet fruit. Each piece is cool to the touch, marked by the stone's own history. Objects first, tools second.",
    card: "assets/brand/jade-deco-card.webp",
  },
  {
    id: "project-element",
    name: "Project Element",
    origin: "Singapore",
    tagline: "Scent, reduced to essentials.",
    story: "Project Element builds fragrance like architecture. Clean lines, honest materials, nothing spare. Candles for people who notice the details.",
    card: "assets/products/project-element-candle-life.webp",
  },
  {
    id: "nornorm",
    name: "nornōrm",
    origin: "Scandinavia",
    tagline: "The egg, reimagined.",
    story: "nornōrm shapes fragrance into soft, ovoid forms. Eggshell candles and crated diffusers, playful and precise, made to sit like sculpture on a shelf.",
    card: "assets/products/nornorm-eggshell-candle-life.webp",
  },
  {
    id: "common-sense",
    name: "Common Sense",
    origin: "Japan",
    tagline: "Three times a day, a pause.",
    story: "Common Sense treats scent as daily practice. Morning, noon, night. Incense measured to the rhythm of an ordinary day, made extraordinary by attention.",
    card: "assets/lifestyle/common-sense-incense-life.webp",
  },
];

/* helper for image objects */
const img = (front, hover, gallery = []) => ({ front, hover: hover || front, gallery: gallery.length ? gallery : [front, hover || front] });

export const PRODUCTS = [
  /* ---------- HETKINEN ---------- */
  {
    id: "hetkinen-aelm-candle", name: "Aelm Scented Candle", brand: "hetkinen",
    category: "candles", price: 219, badge: "Best Seller",
    moods: ["slower-nights", "soft-reset"],
    notes: ["Amber", "Cardamom", "Soft Wood"],
    blurb: "A low amber warmth, like lamplight through linen.",
    story: "Aelm is the scent of a room settling for the night. Amber and cardamom over a soft bed of wood, poured into hand finished glass. Burns clean for close to fifty hours.",
    image: img("assets/products/hetkinen-aelm-candle-hero.webp", "assets/products/hetkinen-aelm-candle-detail.webp"),
  },
  {
    id: "hetkinen-biofilia-candle", name: "Biofilia Scented Candle", brand: "hetkinen",
    category: "candles", price: 239,
    moods: ["clear-space", "focus"],
    notes: ["Green Leaf", "Fig", "Moss"],
    blurb: "Cut stems and cool morning air, held in wax.",
    story: "Biofilia carries the green of a garden just after rain. Fig leaf and moss over a cotton wick that whispers as it burns. A little of the outside, kept close.",
    image: img("assets/products/hetkinen-biofilia-candle-hero.webp", "assets/products/hetkinen-biofilia-candle-detail.webp"),
  },
  {
    id: "hetkinen-ikigai-diffuser", name: "Ikigai Scent Diffuser", brand: "hetkinen",
    category: "diffusers", price: 289, badge: "Best Seller",
    moods: ["soft-reset", "clear-space"],
    notes: ["Yuzu", "White Tea", "Vetiver"],
    blurb: "A reason for being, drawn up slowly through reed.",
    story: "Ikigai holds citrus and white tea over a quiet vetiver base. Set the reeds and forget them. The scent stays low and constant for months, a soft reason to breathe.",
    image: img("assets/products/hetkinen-ikigai-diffuser-hero.webp", "assets/products/hetkinen-ikigai-diffuser-detail.webp"),
  },
  {
    id: "hetkinen-pine-forest-diffuser", name: "Pine Forest Scent Diffuser", brand: "hetkinen",
    category: "diffusers", price: 289,
    moods: ["focus", "clear-space"],
    notes: ["Pine", "Cedar", "Cold Air"],
    blurb: "Standing among tall trees, without leaving the room.",
    story: "Pine Forest is the Finnish wood in a bottle. Fresh pine and cedar with a note of cold, clean air. It clears the head and holds the space for thinking.",
    image: img("assets/products/hetkinen-pine-forest-diffuser-hero.webp", "assets/products/hetkinen-pine-forest-diffuser-detail.webp"),
  },
  {
    id: "hetkinen-aelm-spray", name: "Aelm Room Spray", brand: "hetkinen",
    category: "room-spray", price: 159,
    moods: ["slower-nights", "soft-reset"],
    notes: ["Amber", "Cardamom", "Soft Wood"],
    blurb: "The Aelm warmth, in a single breath.",
    story: "The Aelm blend, made instant. Two presses over a bed, a sofa, a coat, and the room turns warm. Amber and cardamom that settle within seconds.",
    image: img("assets/products/hetkinen-aelm-spray-hero.webp", "assets/products/hetkinen-aelm-spray-detail.webp"),
  },
  {
    id: "hetkinen-pine-hyss-spray", name: "Pine Hyss Room Spray", brand: "hetkinen",
    category: "room-spray", price: 159,
    moods: ["focus", "clear-space"],
    notes: ["Pine", "Hyssop", "Resin"],
    blurb: "A clean, resinous lift for a heavy room.",
    story: "Pine Hyss cuts through a stale afternoon. Sharp pine and herbal hyssop over a trace of resin. A quick reset for the air around your desk.",
    image: img("assets/products/hetkinen-pine-hyss-spray-hero.webp", "assets/products/hetkinen-pine-hyss-spray-detail.webp"),
  },
  {
    id: "hetkinen-flir-spray", name: "Flir Room Spray", brand: "hetkinen",
    category: "room-spray", price: 159,
    moods: ["clear-space", "soft-reset"],
    notes: ["Bergamot", "Lilac", "Musk"],
    blurb: "A flirtation of citrus and soft flower.",
    story: "Flir is light on its feet. Bright bergamot and lilac over a clean musk. The room feels a little brighter, a little kinder, right away.",
    image: img("assets/products/hetkinen-flir-spray-hero.webp", "assets/products/hetkinen-flir-spray-detail.webp"),
  },
  {
    id: "hetkinen-psipsina-spray", name: "Psipsina Room Spray", brand: "hetkinen",
    category: "room-spray", price: 159,
    moods: ["soft-reset", "slower-nights"],
    notes: ["Fig", "Powder", "Amber"],
    blurb: "Soft as a cat asleep in the sun.",
    story: "Psipsina, a small Greek endearment. Fig and powder over warm amber, gentle and close. The scent of a slow Sunday that refuses to end.",
    image: img("assets/products/hetkinen-psipsina-spray-hero.webp", "assets/products/hetkinen-psipsina-spray-detail.webp"),
  },

  /* ---------- TRIBE EARTH ---------- */
  {
    id: "tribe-earth-ceremony", name: "Ceremony Incense Plank", brand: "tribe-earth",
    category: "incense", price: 49, badge: "Best Seller",
    moods: ["soft-reset", "slower-nights"],
    notes: ["Palo Santo", "Sweet Resin"],
    blurb: "Palo santo, pressed to a slow burning plank.",
    story: "Ceremony is palo santo drawn out slow. One plank clears a room and marks a moment. Light the tip, let it catch, then set it down and watch the smoke find the ceiling.",
    image: img("assets/products/tribe-earth-ceremony-front.webp", "assets/products/tribe-earth-ceremony-detail.webp"),
  },
  {
    id: "tribe-earth-gratitude", name: "Gratitude Incense Plank", brand: "tribe-earth",
    category: "incense", price: 49,
    moods: ["soft-reset", "clear-space"],
    notes: ["Palo Santo", "Citrus Peel"],
    blurb: "A brighter palo santo, lifted with citrus.",
    story: "Gratitude softens palo santo with a thread of citrus peel. Warm but awake, it suits the morning as easily as the evening. A plank for beginning, not only ending.",
    image: img("assets/products/tribe-earth-gratitude-front.webp", "assets/products/tribe-earth-gratitude-detail.webp"),
  },
  {
    id: "tribe-earth-bushwalk", name: "Bushwalk Incense Plank", brand: "tribe-earth",
    category: "incense", price: 49,
    moods: ["focus", "clear-space"],
    notes: ["Marri Gum", "Eucalyptus", "Dry Earth"],
    blurb: "The Australian bush, still warm from the sun.",
    story: "Bushwalk is native marri gum and eucalyptus over dry earth. It smells like a long walk through open country. Grounding, green, quietly wild.",
    image: img("assets/products/tribe-earth-bushwalk-front.webp", "assets/products/tribe-earth-bushwalk-detail.webp"),
  },
  {
    id: "tribe-earth-mystic", name: "Mystic Incense Plank", brand: "tribe-earth",
    category: "incense", price: 49,
    moods: ["slower-nights", "soft-reset"],
    notes: ["Sandalwood", "Amber", "Myrrh"],
    blurb: "Deep sandalwood for the darker hours.",
    story: "Mystic is sandalwood laid over amber and myrrh. Rich and low, it belongs to late evenings and long thoughts. The smoke hangs, unhurried.",
    image: img("assets/products/tribe-earth-mystic-front.webp", "assets/products/tribe-earth-mystic-detail.webp"),
  },
  {
    id: "tribe-earth-prayer", name: "Prayer Incense Plank", brand: "tribe-earth",
    category: "incense", price: 49,
    moods: ["slower-nights", "soft-reset"],
    notes: ["Sandalwood", "Frankincense"],
    blurb: "Sandalwood and frankincense, for stillness.",
    story: "Prayer is the oldest pairing, sandalwood and frankincense. Made for quiet rooms and quiet minds. Light it when you want the day to slow to a stop.",
    image: img("assets/products/tribe-earth-prayer-front.webp", "assets/products/tribe-earth-prayer-detail.webp"),
  },
  {
    id: "tribe-earth-atlas-rose", name: "Atlas Rose Incense Plank", brand: "tribe-earth",
    category: "incense", price: 49, badge: "New",
    moods: ["soft-reset", "slower-nights"],
    notes: ["Sandalwood", "Rose", "Cedar"],
    blurb: "A rose in the wood, soft and deep.",
    story: "Atlas Rose folds rose into sandalwood and cedar. Floral but never sweet, it warms a room the way a low fire does. A gentle turning of the page.",
    image: img("assets/products/tribe-earth-atlas-rose-front.webp", "assets/products/tribe-earth-atlas-rose-detail.webp"),
  },
  {
    id: "tribe-earth-reverence", name: "Reverence Incense Plank", brand: "tribe-earth",
    category: "incense", price: 49,
    moods: ["slower-nights", "soft-reset"],
    notes: ["Sandalwood", "Agarwood"],
    blurb: "A bow of the head, in smoke.",
    story: "Reverence is sandalwood deepened with agarwood, made for the moments that ask for stillness. Light it when the day deserves a quiet ending.",
    image: img("assets/products/tribe-earth-reverence-front.webp", "assets/products/tribe-earth-reverence-detail.webp"),
  },

  /* ---------- JADE DECO (holders) ---------- */
  {
    id: "jade-pear-green-white", name: "Pear Green White Jade Incense Holder", brand: "jade-deco",
    category: "incense-holders", price: 339, badge: "Best Seller",
    moods: ["clear-space"],
    notes: ["Object", "Hand carved"],
    blurb: "A pear in green and white jade, carved by hand.",
    story: "Cut from a single piece of green and white jade, this pear holds a single incense stick and a lifetime of use. Cool to the touch, quietly heavy, marked by the stone's own veins.",
    image: img("assets/products/jade-pear-green-white.webp", "assets/products/jade-pear-green-white-life.webp"),
  },
  {
    id: "jade-pear-white", name: "Pear White Jade Incense Holder", brand: "jade-deco",
    category: "incense-holders", price: 319,
    moods: ["clear-space"],
    notes: ["Object", "Hand carved"],
    blurb: "The pear in pale, milk white jade.",
    story: "The same pear, cut from white jade the color of morning milk. Soft, luminous, almost translucent at the edge. An object first, an incense holder second.",
    image: img("assets/products/jade-pear-white.webp", "assets/products/jade-pear-white.webp"),
  },
  {
    id: "jade-pear-yellow", name: "Pear Yellow Jade Incense Holder", brand: "jade-deco",
    category: "incense-holders", price: 329, badge: "New",
    moods: ["clear-space", "soft-reset"],
    notes: ["Object", "Hand carved"],
    blurb: "Warm yellow jade, like late afternoon.",
    story: "This pear takes on the honey warmth of yellow jade. It holds the light differently, glowing where the white stays cool. A small warmth for the shelf.",
    image: img("assets/products/jade-pear-yellow.webp", "assets/products/jade-pear-yellow.webp"),
  },
  {
    id: "jade-pear-ancient-green", name: "Pear Ancient Green Jade Incense Holder", brand: "jade-deco",
    category: "incense-holders", price: 339,
    moods: ["clear-space", "slower-nights"],
    notes: ["Object", "Hand carved"],
    blurb: "Deep green jade, old as a riverbed.",
    story: "The pear in ancient green jade, the darkest stone in the set. Its veins run deep and no two pieces match. A quiet weight that anchors a shelf.",
    image: img("assets/products/jade-pear-ancient-green.webp", "assets/products/jade-pear-ancient-green.webp"),
  },
  {
    id: "jade-apple-green-white", name: "Apple Green White Jade Incense Holder", brand: "jade-deco",
    category: "incense-holders", price: 339,
    moods: ["clear-space"],
    notes: ["Object", "Hand carved"],
    blurb: "An apple in green and white jade.",
    story: "The apple, round and sure, carved from green and white jade. It sits in the palm like a cool stone from a river. Holds a stick of incense, holds attention longer.",
    image: img("assets/products/jade-apple-green-white.webp", "assets/products/jade-apple-green-white-life.webp"),
  },
  {
    id: "jade-mini-pear", name: "Mini Pear Jade Incense Holder", brand: "jade-deco",
    category: "incense-holders", price: 219,
    moods: ["clear-space", "soft-reset"],
    notes: ["Object", "Hand carved"],
    blurb: "The pear, smaller, for a quiet corner.",
    story: "A smaller pear for a smaller space. The same hand carving, the same cool jade, scaled to sit beside a stack of books or on the lip of a windowsill.",
    image: img("assets/products/jade-mini-pear-green-white.webp", "assets/products/jade-mini-pear-life.webp"),
  },

  /* ---------- PROJECT ELEMENT ---------- */
  {
    id: "project-element-candle", name: "Château Evening Scented Candle", brand: "project-element",
    category: "candles", price: 249,
    moods: ["slower-nights", "soft-reset"],
    notes: ["Black Tea", "Oak", "Tobacco Leaf"],
    blurb: "A dark, quiet evening in a French room.",
    story: "Château Evening is black tea and oak with a curl of tobacco leaf. Poured with an architect's restraint. It fills a room without ever raising its voice.",
    image: img("assets/products/project-element-candle-front.webp", "assets/products/project-element-candle-life.webp"),
  },

  /* ---------- NORNORM ---------- */
  {
    id: "nornorm-eggshell-candle", name: "Eggshell Scented Candle", brand: "nornorm",
    category: "candles", price: 199, badge: "Best Seller",
    moods: ["soft-reset", "clear-space"],
    notes: ["Sea Salt", "Neroli", "Musk"],
    blurb: "A candle shaped like an egg, scented like the coast.",
    story: "Poured into a real eggshell form, this candle carries sea salt and neroli over clean musk. When the wax is gone, the shell stays, a small white sculpture.",
    image: img("assets/products/nornorm-eggshell-candle-front.webp", "assets/products/nornorm-eggshell-candle-life.webp"),
  },
  {
    id: "nornorm-tomato-eggshell", name: "Tomato Eggshell Scented Candle", brand: "nornorm",
    category: "candles", price: 199,
    moods: ["clear-space", "soft-reset"],
    notes: ["Tomato Leaf", "Green Stem", "Earth"],
    blurb: "A kitchen garden, held in an eggshell.",
    story: "Tomato leaf is the smell of a greenhouse in the sun: green, sharp, a little wild. Poured into the eggshell form, it brings the garden indoors without raising its voice.",
    image: img("assets/products/nornorm-mini-egg-combo-life.webp", "assets/products/nornorm-eggshell-candle-life.webp"),
  },
  {
    id: "nornorm-mini-egg-combo", name: "Mini Egg Combo Gift Set", brand: "nornorm",
    category: "candles", price: 339, badge: "Gift",
    moods: ["soft-reset"],
    notes: ["Set of three", "Assorted"],
    blurb: "Three small eggs, three small moods.",
    story: "A set of three mini egg candles in a crated box, each a different scent. Made for giving, or for keeping one and giving two. A soft, complete gesture.",
    image: img("assets/products/nornorm-mini-egg-combo-front.webp", "assets/products/nornorm-mini-egg-combo-life.webp"),
  },
  {
    id: "nornorm-black-egg-diffuser", name: "Bamboo Black Egg Crate Diffuser", brand: "nornorm",
    category: "diffusers", price: 299,
    moods: ["focus", "slower-nights"],
    notes: ["Hinoki", "Black Pepper", "Cedar"],
    blurb: "A dark egg in a bamboo crate, quietly diffusing.",
    story: "A black ceramic egg cradled in a bamboo crate, drawing up hinoki and black pepper. Object and diffuser at once. It anchors a shelf and scents the room for months.",
    image: img("assets/products/nornorm-black-egg-diffuser-front.webp", "assets/products/nornorm-black-egg-diffuser-life.webp"),
  },
  {
    id: "nornorm-egg-diffuser", name: "Bamboo Egg Crate Diffuser", brand: "nornorm",
    category: "diffusers", price: 289,
    moods: ["clear-space", "soft-reset"],
    notes: ["White Musk", "Bamboo", "Lily"],
    blurb: "The pale egg, for a lighter room.",
    story: "The same crated egg in soft white, drawing up bamboo and white musk. Clean and light, it suits a bright room and a fresh start. Refillable, made to last.",
    image: img("assets/products/nornorm-egg-diffuser-front.webp", "assets/products/nornorm-egg-diffuser-life.webp"),
  },

  /* ---------- COMMON SENSE ---------- */
  {
    id: "common-sense-three-times", name: "Three Times Incense Set", brand: "common-sense",
    category: "incense", price: 149, badge: "New",
    moods: ["focus", "soft-reset", "slower-nights"],
    notes: ["Morning", "Noon", "Night"],
    blurb: "One scent for each turn of the day.",
    story: "Three Times gives you three incenses, one for morning, one for noon, one for night. A small structure for an ordinary day. Light the right one and let it mark the hour.",
    image: img("assets/products/common-sense-three-times-incense.webp", "assets/lifestyle/common-sense-incense-life.webp"),
  },
];

/* ---------- Derived helpers ---------- */
export const money = (n) => "RM " + Number(n).toFixed(0);
export const byId = (id) => PRODUCTS.find((p) => p.id === id);
export const brandById = (id) => BRANDS.find((b) => b.id === id);
export const moodById = (id) => MOODS.find((m) => m.id === id);
export const catById = (id) => CATEGORIES.find((c) => c.id === id);
export const bestSellers = () => PRODUCTS.filter((p) => p.badge === "Best Seller");
export const byMood = (mood) => PRODUCTS.filter((p) => p.moods.includes(mood));
export const byCategory = (cat) => PRODUCTS.filter((p) => p.category === cat);
export const byBrand = (b) => PRODUCTS.filter((p) => p.brand === b);
