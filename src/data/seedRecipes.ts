/**
 * 30 curated seed recipes for Homebrew Haven.
 * Insert these into Supabase via the SQL file or a client script.
 *
 * References / sources are included in the description field.
 */

export interface SeedRecipe {
  title: string;
  type: "beer" | "cider" | "mead" | "kombucha" | "wine" | "sourdough" | "ferment";
  style: string;
  difficulty: 1 | 2 | 3;
  batch_size: number;
  abv: number;
  ibu: number | null;
  srm: number | null;
  estimated_days: number;
  target_og: number;
  target_fg: number;
  description: string;
  ingredients: {
    malts?: string[];
    hops?: string[];
    yeast?: string[];
    water?: string[];
    adjuncts?: string[];
  };
  steps: { instruction: string }[];
}

export const seedRecipes: SeedRecipe[] = [
  // ─── BEER (15) ───────────────────────────────────────────────────────────
  {
    title: "Classic American IPA",
    type: "beer",
    style: "IPA",
    difficulty: 2,
    batch_size: 5,
    abv: 7.2,
    ibu: 65,
    srm: 8,
    estimated_days: 21,
    target_og: 1.065,
    target_fg: 1.010,
    description:
      "A balanced West-Coast-style IPA with firm bitterness and citrus-pine aroma. Adapted from Brewing Classic Styles by Jamil Zainasheff.",
    ingredients: {
      malts: ["11 lb 2-Row Pale Malt", "1 lb Crystal 40L"],
      hops: [
        "1.5 oz Centennial @ 60 min",
        "1 oz Citra @ 10 min",
        "1 oz Amarillo @ 5 min",
        "2 oz Citra dry hop",
      ],
      yeast: ["Safale US-05"],
    },
    steps: [
      { instruction: "Heat 7.5 gal water to 154°F" },
      { instruction: "Mash grains for 60 minutes" },
      { instruction: "Sparge with 170°F water to collect 6.5 gal wort" },
      { instruction: "Boil for 60 minutes, adding hops per schedule" },
      { instruction: "Chill to 65°F, pitch yeast, ferment 14 days" },
    ],
  },
  {
    title: "Robust Porter",
    type: "beer",
    style: "Porter",
    difficulty: 2,
    batch_size: 5,
    abv: 5.6,
    ibu: 35,
    srm: 25,
    estimated_days: 28,
    target_og: 1.055,
    target_fg: 1.012,
    description:
      "Rich chocolate and coffee notes with a smooth finish. Based on Sierra Nevada Porter clone recipe.",
    ingredients: {
      malts: ["9 lb Pale Malt", "1 lb Chocolate Malt", "8 oz Crystal 60L", "4 oz Black Patent"],
      hops: ["1 oz Northern Brewer @ 60 min", "0.5 oz Cascade @ 15 min"],
      yeast: ["Wyeast 1056 American Ale"],
    },
    steps: [
      { instruction: "Mash at 152°F for 60 minutes" },
      { instruction: "Sparge to collect 6.5 gal" },
      { instruction: "Boil 60 minutes with hop additions" },
      { instruction: "Chill to 65°F and pitch yeast" },
      { instruction: "Primary ferment 14 days, then package" },
    ],
  },
  {
    title: "German Pilsner",
    type: "beer",
    style: "Pilsner",
    difficulty: 3,
    batch_size: 5,
    abv: 5.0,
    ibu: 40,
    srm: 3,
    estimated_days: 42,
    target_og: 1.048,
    target_fg: 1.010,
    description:
      "Crisp, clean, and refreshingly bitter. Requires cool fermentation. From German Brewing Traditions, BJCP Style 5D.",
    ingredients: {
      malts: ["10 lb German Pilsner Malt"],
      hops: ["1.5 oz Hallertauer Mittelfrüh @ 60 min", "1 oz Tettnang @ 15 min"],
      yeast: ["Wyeast 2124 Bohemian Lager"],
    },
    steps: [
      { instruction: "Mash at 148°F for 90 minutes (step mash preferred)" },
      { instruction: "Sparge to collect 6.5 gal, boil 90 minutes" },
      { instruction: "Chill to 50°F, pitch yeast" },
      { instruction: "Primary ferment at 50°F for 14 days" },
      { instruction: "Lager at 35°F for 4 weeks before packaging" },
    ],
  },
  {
    title: "Belgian Saison",
    type: "beer",
    style: "Saison",
    difficulty: 2,
    batch_size: 5,
    abv: 6.8,
    ibu: 28,
    srm: 5,
    estimated_days: 21,
    target_og: 1.060,
    target_fg: 1.008,
    description:
      "Rustic farmhouse ale with peppery spice and dry finish. Adapted from Farmhouse Ales by Phil Markowski.",
    ingredients: {
      malts: ["10 lb Belgian Pilsner Malt", "1 lb Wheat Malt"],
      hops: ["1.5 oz Styrian Goldings @ 60 min", "0.5 oz Saaz @ 10 min"],
      yeast: ["Wyeast 3724 Belgian Saison"],
      adjuncts: ["1 lb Cane Sugar (boil)"],
    },
    steps: [
      { instruction: "Mash at 148°F for 60 minutes" },
      { instruction: "Sparge and collect 6.5 gal wort" },
      { instruction: "Boil 90 minutes, add sugar in last 15 min" },
      { instruction: "Chill to 75°F, pitch yeast and ferment warm (75-80°F)" },
      { instruction: "Primary ferment 14 days, then package" },
    ],
  },
  {
    title: "Oatmeal Stout",
    type: "beer",
    style: "Stout",
    difficulty: 1,
    batch_size: 5,
    abv: 5.4,
    ibu: 30,
    srm: 35,
    estimated_days: 28,
    target_og: 1.055,
    target_fg: 1.014,
    description:
      "Creamy and roasty with a silky mouthfeel. Inspired by Samuel Smith's Oatmeal Stout.",
    ingredients: {
      malts: ["8 lb Maris Otter", "1 lb Flaked Oats", "12 oz Roast Barley", "8 oz Chocolate Malt"],
      hops: ["1.5 oz East Kent Goldings @ 60 min"],
      yeast: ["Wyeast 1084 Irish Ale"],
    },
    steps: [
      { instruction: "Mash at 154°F for 60 minutes" },
      { instruction: "Sparge and collect 6.5 gal" },
      { instruction: "Boil 60 minutes" },
      { instruction: "Chill to 65°F, pitch yeast" },
      { instruction: "Primary ferment 14 days, allow to condition 14 more days" },
    ],
  },
  {
    title: "American Wheat Beer",
    type: "beer",
    style: "Wheat",
    difficulty: 1,
    batch_size: 5,
    abv: 4.6,
    ibu: 18,
    srm: 4,
    estimated_days: 14,
    target_og: 1.045,
    target_fg: 1.010,
    description:
      "Light, refreshing, and perfect for summer. From How to Brew by John Palmer.",
    ingredients: {
      malts: ["5 lb 2-Row Pale Malt", "5 lb Wheat Malt"],
      hops: ["0.75 oz Cascade @ 60 min", "0.5 oz Cascade @ 15 min"],
      yeast: ["Wyeast 1010 American Wheat"],
    },
    steps: [
      { instruction: "Mash at 152°F for 60 minutes" },
      { instruction: "Sparge and collect 6.5 gal" },
      { instruction: "Boil 60 minutes with hop additions" },
      { instruction: "Chill to 65°F, pitch yeast" },
      { instruction: "Primary ferment 10 days, then keg or bottle" },
    ],
  },
  {
    title: "Berliner Weisse",
    type: "beer",
    style: "Sour",
    difficulty: 3,
    batch_size: 5,
    abv: 3.8,
    ibu: 5,
    srm: 2,
    estimated_days: 30,
    target_og: 1.035,
    target_fg: 1.006,
    description:
      "Tart, effervescent German sour wheat beer. Requires kettle souring or mixed fermentation. Based on traditional Berliner Weisse methods.",
    ingredients: {
      malts: ["5 lb German Pilsner Malt", "5 lb Wheat Malt"],
      hops: ["0.5 oz Hallertauer @ 60 min"],
      yeast: ["Wyeast 1007 German Ale", "Lactobacillus brevus (kettle sour)"],
    },
    steps: [
      { instruction: "Mash at 148°F for 60 minutes" },
      { instruction: "Collect wort and kettle sour with Lactobacillus at 100°F for 24-48 hours until pH 3.4" },
      { instruction: "Boil 15 minutes to kill bacteria" },
      { instruction: "Chill to 65°F, pitch ale yeast" },
      { instruction: "Ferment 14 days, then package" },
    ],
  },
  {
    title: "Amber Ale",
    type: "beer",
    style: "Amber",
    difficulty: 1,
    batch_size: 5,
    abv: 5.0,
    ibu: 28,
    srm: 15,
    estimated_days: 21,
    target_og: 1.050,
    target_fg: 1.012,
    description:
      "Malty backbone with moderate hop bitterness. Bell's Amber Ale inspired recipe.",
    ingredients: {
      malts: ["9 lb Pale Malt", "1 lb Crystal 60L", "4 oz Victory Malt"],
      hops: ["1 oz Centennial @ 60 min", "0.5 oz Cascade @ 15 min"],
      yeast: ["Safale US-05"],
    },
    steps: [
      { instruction: "Mash at 152°F for 60 minutes" },
      { instruction: "Sparge and collect 6.5 gal" },
      { instruction: "Boil 60 minutes with hop additions" },
      { instruction: "Chill to 65°F, pitch yeast" },
      { instruction: "Primary ferment 14 days, then package" },
    ],
  },
  {
    title: "West Coast IPA",
    type: "beer",
    style: "IPA",
    difficulty: 2,
    batch_size: 5,
    abv: 7.6,
    ibu: 70,
    srm: 7,
    estimated_days: 21,
    target_og: 1.068,
    target_fg: 1.010,
    description:
      "Resinous, piney, and assertively bitter. Adapted from Pliny the Elder clone.",
    ingredients: {
      malts: ["12 lb 2-Row Pale Malt", "1 lb Crystal 40L"],
      hops: [
        "1.5 oz Columbus @ 90 min",
        "1 oz Simcoe @ 45 min",
        "1 oz Centennial @ 15 min",
        "2 oz Simcoe dry hop",
        "1 oz Centennial dry hop",
      ],
      yeast: ["White Labs WLP001 California Ale"],
    },
    steps: [
      { instruction: "Mash at 150°F for 60 minutes" },
      { instruction: "Sparge to collect 7 gal, boil 90 minutes" },
      { instruction: "Add hops per schedule; whirlpool 1 oz Simcoe at flameout" },
      { instruction: "Chill to 65°F, pitch yeast" },
      { instruction: "Primary ferment 10 days, dry hop 5 days, then package" },
    ],
  },
  {
    title: "Irish Red Ale",
    type: "beer",
    style: "Amber",
    difficulty: 1,
    batch_size: 5,
    abv: 4.7,
    ibu: 22,
    srm: 14,
    estimated_days: 21,
    target_og: 1.048,
    target_fg: 1.012,
    description:
      "Toasty malt character with a hint of caramel. Smithwick's Irish Ale inspired recipe.",
    ingredients: {
      malts: ["8 lb Maris Otter", "1 lb Crystal 40L", "4 oz Roasted Barley"],
      hops: ["1 oz East Kent Goldings @ 60 min", "0.5 oz Fuggles @ 15 min"],
      yeast: ["Wyeast 1084 Irish Ale"],
    },
    steps: [
      { instruction: "Mash at 152°F for 60 minutes" },
      { instruction: "Sparge and collect 6.5 gal" },
      { instruction: "Boil 60 minutes with hop additions" },
      { instruction: "Chill to 65°F, pitch yeast" },
      { instruction: "Ferment 14 days, then package" },
    ],
  },
  {
    title: "Milk Stout",
    type: "beer",
    style: "Stout",
    difficulty: 2,
    batch_size: 5,
    abv: 5.2,
    ibu: 25,
    srm: 32,
    estimated_days: 28,
    target_og: 1.058,
    target_fg: 1.018,
    description:
      "Sweet, roasty, and creamy with lactose smoothness. Left Hand Milk Stout inspired clone.",
    ingredients: {
      malts: ["9 lb Pale Malt", "1 lb Flaked Barley", "8 oz Chocolate Malt", "4 oz Black Patent"],
      hops: ["1 oz Fuggles @ 60 min"],
      yeast: ["Wyeast 1056 American Ale"],
      adjuncts: ["1 lb Lactose (add at end of boil)"],
    },
    steps: [
      { instruction: "Mash at 154°F for 60 minutes" },
      { instruction: "Sparge and collect 6.5 gal" },
      { instruction: "Boil 60 minutes, add lactose in last 10 min" },
      { instruction: "Chill to 65°F, pitch yeast" },
      { instruction: "Ferment 14 days, condition 14 days" },
    ],
  },
  {
    title: "Hefeweizen",
    type: "beer",
    style: "Wheat",
    difficulty: 1,
    batch_size: 5,
    abv: 5.0,
    ibu: 14,
    srm: 4,
    estimated_days: 14,
    target_og: 1.050,
    target_fg: 1.012,
    description:
      "Classic German wheat beer with banana and clove notes. From German Wheat Beer by Eric Warner.",
    ingredients: {
      malts: ["6 lb German Wheat Malt", "4 lb German Pilsner Malt"],
      hops: ["1 oz Hallertauer Mittelfrüh @ 60 min"],
      yeast: ["Wyeast 3068 Weihenstephan Weizen"],
    },
    steps: [
      { instruction: "Mash at 152°F for 60 minutes" },
      { instruction: "Sparge and collect 6.5 gal" },
      { instruction: "Boil 60 minutes" },
      { instruction: "Chill to 62°F, pitch yeast" },
      { instruction: "Ferment at 62°F for 10 days to emphasize clove" },
    ],
  },
  {
    title: "Imperial IPA",
    type: "beer",
    style: "IPA",
    difficulty: 3,
    batch_size: 5,
    abv: 8.2,
    ibu: 85,
    srm: 8,
    estimated_days: 28,
    target_og: 1.075,
    target_fg: 1.012,
    description:
      "Massive hop aroma and higher alcohol with a sturdy malt backbone. Bell's Two Hearted Ale inspired recipe.",
    ingredients: {
      malts: ["14 lb 2-Row Pale Malt", "1 lb Crystal 40L"],
      hops: [
        "2 oz Centennial @ 60 min",
        "1 oz Centennial @ 30 min",
        "2 oz Centennial @ 10 min",
        "3 oz Centennial dry hop",
      ],
      yeast: ["Wyeast 1272 American Ale II"],
    },
    steps: [
      { instruction: "Mash at 150°F for 60 minutes" },
      { instruction: "Sparge and collect 7 gal, boil 90 minutes" },
      { instruction: "Add hops per schedule" },
      { instruction: "Chill to 65°F, pitch yeast with starter" },
      { instruction: "Primary ferment 14 days, dry hop 7 days, then package" },
    ],
  },
  {
    title: "Czech Dark Lager",
    type: "beer",
    style: "Lager",
    difficulty: 3,
    batch_size: 5,
    abv: 5.0,
    ibu: 22,
    srm: 18,
    estimated_days: 35,
    target_og: 1.052,
    target_fg: 1.014,
    description:
      "Toasty, malt-driven Czech tmavé pivo with low bitterness. BJCP 3D Czech Dark Lager guidelines.",
    ingredients: {
      malts: ["7 lb Pilsner Malt", "2 lb Munich Malt", "1 lb Caramel Malt", "4 oz Debittered Black Malt"],
      hops: ["1.5 oz Saaz @ 60 min", "0.5 oz Saaz @ 15 min"],
      yeast: ["Wyeast 2124 Bohemian Lager"],
    },
    steps: [
      { instruction: "Mash at 152°F for 60 minutes" },
      { instruction: "Sparge and collect 6.5 gal, boil 90 minutes" },
      { instruction: "Chill to 50°F, pitch yeast" },
      { instruction: "Ferment at 50°F for 14 days" },
      { instruction: "Lager at 35°F for 3 weeks before packaging" },
    ],
  },
  {
    title: "Flanders Red Ale",
    type: "beer",
    style: "Sour",
    difficulty: 3,
    batch_size: 5,
    abv: 5.8,
    ibu: 18,
    srm: 15,
    estimated_days: 365,
    target_og: 1.056,
    target_fg: 1.012,
    description:
      "Complex sour red ale aged for a year with mixed cultures. Rodenbach inspired long sour recipe.",
    ingredients: {
      malts: ["8 lb Vienna Malt", "2 lb Munich Malt", "1 lb Crystal 60L", "4 oz Special B"],
      hops: ["1 oz East Kent Goldings @ 60 min"],
      yeast: ["Wyeast 3763 Roeselare Blend", "Brettanomyces bruxellensis"],
    },
    steps: [
      { instruction: "Mash at 152°F for 60 minutes" },
      { instruction: "Sparge and collect 6.5 gal, boil 90 minutes" },
      { instruction: "Chill to 70°F, pitch Roeselare blend" },
      { instruction: "Primary ferment 2 weeks, then rack to secondary" },
      { instruction: "Age in secondary for 12 months before packaging" },
    ],
  },

  // ─── CIDER (4) ───────────────────────────────────────────────────────────
  {
    title: "Traditional Dry Cider",
    type: "cider",
    style: "Dry Cider",
    difficulty: 1,
    batch_size: 5,
    abv: 6.5,
    ibu: null,
    srm: 3,
    estimated_days: 30,
    target_og: 1.050,
    target_fg: 1.000,
    description:
      "Crisp, tart, and bone-dry apple cider. From The New Cider Maker's Handbook by Claude Jolicoeur.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["White Labs WLP775 English Cider"],
      adjuncts: ["5 gal fresh-pressed apple juice (no preservatives)"],
    },
    steps: [
      { instruction: "Sanitize fermenter and all equipment" },
      { instruction: "Pour apple juice into fermenter" },
      { instruction: "Pitch yeast at room temperature (65°F)" },
      { instruction: "Ferment 14 days until gravity stabilizes" },
      { instruction: "Rack, condition 14 days, then bottle with priming sugar" },
    ],
  },
  {
    title: "Apple Pear Cyser",
    type: "cider",
    style: "Cyser",
    difficulty: 2,
    batch_size: 5,
    abv: 7.2,
    ibu: null,
    srm: 4,
    estimated_days: 60,
    target_og: 1.065,
    target_fg: 1.010,
    description:
      "A cider-mead hybrid with honey sweetness and pear aroma. Adapted from Homebrew Talk community recipe.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["Lalvin D-47"],
      adjuncts: ["3 gal apple juice", "2 gal pear juice", "3 lb Orange Blossom Honey"],
    },
    steps: [
      { instruction: "Mix juices and honey in sanitized fermenter" },
      { instruction: "Aerate well and pitch rehydrated yeast" },
      { instruction: "Ferment at 62°F for 21 days" },
      { instruction: "Rack to secondary, age 30 days" },
      { instruction: "Bottle and condition 30 days" },
    ],
  },
  {
    title: "Berry Cider",
    type: "cider",
    style: "Fruit Cider",
    difficulty: 1,
    batch_size: 5,
    abv: 6.5,
    ibu: null,
    srm: 8,
    estimated_days: 30,
    target_og: 1.055,
    target_fg: 1.005,
    description:
      "Rosé-hued cider with bright raspberry notes. Raspberry cider inspired by Craft Cider Making by Andrew Lea.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["Safale S-04"],
      adjuncts: ["5 gal apple juice", "3 lb frozen raspberries"],
    },
    steps: [
      { instruction: "Add apple juice to fermenter" },
      { instruction: "Pitch yeast and ferment 7 days" },
      { instruction: "Add thawed raspberries to primary" },
      { instruction: "Ferment another 10 days until stable" },
      { instruction: "Rack off fruit, condition 14 days, then bottle" },
    ],
  },
  {
    title: "Barrel-Aged Cider",
    type: "cider",
    style: "Oak Cider",
    difficulty: 2,
    batch_size: 5,
    abv: 7.8,
    ibu: null,
    srm: 5,
    estimated_days: 90,
    target_og: 1.060,
    target_fg: 1.000,
    description:
      "Smooth cider with vanilla and tannin depth from oak aging. Oak-aged cider methods from Cider Planet.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["Lalvin EC-1118"],
      adjuncts: ["5 gal apple juice", "2 oz medium-toast oak cubes"],
    },
    steps: [
      { instruction: "Ferment apple juice with EC-1118 at 65°F for 14 days" },
      { instruction: "Rack to secondary on oak cubes" },
      { instruction: "Age on oak for 4 weeks, tasting weekly" },
      { instruction: "Rack off oak, bulk age another 4 weeks" },
      { instruction: "Bottle and condition 30 days" },
    ],
  },

  // ─── MEAD (5) ────────────────────────────────────────────────────────────
  {
    title: "Traditional Sweet Mead",
    type: "mead",
    style: "Sweet Mead",
    difficulty: 1,
    batch_size: 5,
    abv: 9.8,
    ibu: null,
    srm: 2,
    estimated_days: 90,
    target_og: 1.100,
    target_fg: 1.025,
    description:
      "Rich honey sweetness with floral aromatics. From The Compleat Meadmaker by Ken Schramm.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["Lalvin D-47"],
      adjuncts: ["15 lb Clover Honey", "Water to 5 gal", "Yeast Nutrient & Energizer"],
    },
    steps: [
      { instruction: "Mix honey with warm water (~100°F) to dissolve" },
      { instruction: "Aerate and add nutrients per staggered schedule" },
      { instruction: "Pitch rehydrated yeast at 65°F" },
      { instruction: "Ferment at 62°F for 21 days" },
      { instruction: "Rack, age 60 days, then bottle" },
    ],
  },
  {
    title: "Orange Blossom Melomel",
    type: "mead",
    style: "Melomel",
    difficulty: 2,
    batch_size: 5,
    abv: 10.5,
    ibu: null,
    srm: 4,
    estimated_days: 120,
    target_og: 1.095,
    target_fg: 1.015,
    description:
      "Orange blossom honey fermented with fresh orange zest. BJCP M3B Orange Blossom Mead guidelines.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["Lalvin 71B-1122"],
      adjuncts: ["14 lb Orange Blossom Honey", "Zest of 4 oranges", "Yeast Nutrient"],
    },
    steps: [
      { instruction: "Dissolve honey in warm water, add orange zest" },
      { instruction: "Aerate and pitch yeast" },
      { instruction: "Ferment at 65°F for 21 days" },
      { instruction: "Rack off zest after 2 weeks in primary" },
      { instruction: "Age in secondary 3 months, then bottle" },
    ],
  },
  {
    title: "Viking Blod Clone",
    type: "mead",
    style: "Metheglin",
    difficulty: 2,
    batch_size: 5,
    abv: 10.5,
    ibu: 25,
    srm: 12,
    estimated_days: 120,
    target_og: 1.090,
    target_fg: 1.010,
    description:
      "High-ABV mead with hibiscus and hops — a modern Danish classic. Dansk Mjød Viking Blod inspired recipe.",
    ingredients: {
      malts: [],
      hops: ["1 oz Hallertauer (dry hop in secondary)"],
      yeast: ["Lalvin EC-1118"],
      adjuncts: ["14 lb Wildflower Honey", "4 oz dried hibiscus flowers"],
    },
    steps: [
      { instruction: "Dissolve honey in warm water" },
      { instruction: "Aerate and pitch yeast with nutrient" },
      { instruction: "Ferment at 65°F for 21 days" },
      { instruction: "Rack onto hibiscus and hops for 14 days" },
      { instruction: "Age 3 months, then bottle" },
    ],
  },
  {
    title: "Blackcurrant Melomel",
    type: "mead",
    style: "Melomel",
    difficulty: 2,
    batch_size: 5,
    abv: 9.8,
    ibu: null,
    srm: 8,
    estimated_days: 120,
    target_og: 1.085,
    target_fg: 1.010,
    description:
      "Deep purple mead with tart blackcurrant character. From The Big Book of Mead Recipes by Robb Walker.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["Lalvin 71B-1122"],
      adjuncts: ["13 lb Wildflower Honey", "4 lb blackcurrants (frozen)"],
    },
    steps: [
      { instruction: "Mix honey with water, aerate well" },
      { instruction: "Pitch yeast and nutrients" },
      { instruction: "After 7 days, add thawed blackcurrants" },
      { instruction: "Ferment another 14 days, then rack off fruit" },
      { instruction: "Age 3 months, then bottle" },
    ],
  },
  {
    title: "Traditional Metheglin",
    type: "mead",
    style: "Metheglin",
    difficulty: 2,
    batch_size: 5,
    abv: 10.5,
    ibu: null,
    srm: 3,
    estimated_days: 90,
    target_og: 1.090,
    target_fg: 1.010,
    description:
      "Spiced mead with cinnamon, clove, and ginger. Based on historical metheglin recipes from GotMead.com.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["Red Star Premier Blanc"],
      adjuncts: ["14 lb Wildflower Honey", "2 cinnamon sticks", "4 cloves", "1 oz fresh ginger"],
    },
    steps: [
      { instruction: "Dissolve honey in warm water" },
      { instruction: "Add spices in a muslin bag" },
      { instruction: "Pitch yeast and ferment at 65°F for 21 days" },
      { instruction: "Remove spice bag after 2 weeks" },
      { instruction: "Age 2 months, then bottle" },
    ],
  },

  // ─── KOMBUCHA (3) ────────────────────────────────────────────────────────
  {
    title: "Classic Black Tea Kombucha",
    type: "kombucha",
    style: "Traditional",
    difficulty: 1,
    batch_size: 1,
    abv: 0.5,
    ibu: null,
    srm: 4,
    estimated_days: 14,
    target_og: 1.020,
    target_fg: 1.010,
    description:
      "The original tart and effervescent probiotic tea. Based on The Kombucha Shop traditional recipe.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["SCOBY + 1 cup starter kombucha"],
      adjuncts: ["8 cups filtered water", "4 bags black tea", "1 cup white sugar"],
    },
    steps: [
      { instruction: "Boil 4 cups water, steep tea 10 min, remove bags" },
      { instruction: "Dissolve sugar in hot tea" },
      { instruction: "Add remaining 4 cups cold water, cool to room temp" },
      { instruction: "Add SCOBY and starter liquid" },
      { instruction: "Cover and ferment at 75°F for 7-14 days" },
    ],
  },
  {
    title: "Ginger Lemon Kombucha",
    type: "kombucha",
    style: "Flavored",
    difficulty: 1,
    batch_size: 1,
    abv: 0.8,
    ibu: null,
    srm: 3,
    estimated_days: 14,
    target_og: 1.025,
    target_fg: 1.008,
    description:
      "Zesty second-fermentation kombucha with fresh ginger and lemon. From The Big Book of Kombucha by Hannah Crum.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["SCOBY + 1 cup starter kombucha"],
      adjuncts: ["Basic kombucha base", "2 tbsp grated ginger", "Juice of 1 lemon", "1 tsp sugar per bottle"],
    },
    steps: [
      { instruction: "Brew primary kombucha for 7 days" },
      { instruction: "Bottle with ginger, lemon juice, and pinch of sugar" },
      { instruction: "Seal bottles and ferment 3-5 days at room temp" },
      { instruction: "Burp bottles daily to prevent over-carbonation" },
      { instruction: "Refrigerate when fizzy; enjoy within 2 weeks" },
    ],
  },
  {
    title: "Hibiscus Berry Kombucha",
    type: "kombucha",
    style: "Flavored",
    difficulty: 1,
    batch_size: 1,
    abv: 0.8,
    ibu: null,
    srm: 8,
    estimated_days: 14,
    target_og: 1.025,
    target_fg: 1.008,
    description:
      "Vibrant ruby kombucha with berry tartness. Second fermentation method from Kombucha Kamp.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["SCOBY + 1 cup starter kombucha"],
      adjuncts: ["Basic kombucha base", "2 tbsp dried hibiscus", "1/4 cup mashed mixed berries", "1 tsp sugar per bottle"],
    },
    steps: [
      { instruction: "Brew primary kombucha for 7 days" },
      { instruction: "Steep hibiscus in a little hot water, cool" },
      { instruction: "Bottle with hibiscus tea, berries, and sugar" },
      { instruction: "Ferment 3-5 days at room temperature" },
      { instruction: "Refrigerate when carbonated" },
    ],
  },

  // ─── WINE (3) ────────────────────────────────────────────────────────────
  {
    title: "Cabernet Sauvignon Style",
    type: "wine",
    style: "Red Wine",
    difficulty: 2,
    batch_size: 5,
    abv: 12.3,
    ibu: null,
    srm: 6,
    estimated_days: 180,
    target_og: 1.090,
    target_fg: 0.996,
    description:
      "Full-bodied red wine with dark fruit and tannin structure. Adapted from Winemaking Step by Step by Peter Duncan.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["Lalvin EC-1118"],
      adjuncts: ["18 lb Cabernet Sauvignon grapes (crushed)", "Campden tablets", "Pectic enzyme", "Yeast nutrient"],
    },
    steps: [
      { instruction: "Crush grapes and add Campden tablet, wait 24h" },
      { instruction: "Add pectic enzyme, yeast nutrient, and yeast" },
      { instruction: "Primary ferment 7 days, punching cap twice daily" },
      { instruction: "Press and rack into secondary, attach airlock" },
      { instruction: "Age 6 months, rack every 6 weeks, then bottle" },
    ],
  },
  {
    title: "Pinot Grigio Style",
    type: "wine",
    style: "White Wine",
    difficulty: 2,
    batch_size: 5,
    abv: 11.8,
    ibu: null,
    srm: 2,
    estimated_days: 150,
    target_og: 1.085,
    target_fg: 0.995,
    description:
      "Crisp, light-bodied white wine with citrus and green apple notes. From Winemaker's Academy classic white wine guide.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["Lalvin D-47"],
      adjuncts: ["16 lb Pinot Grigio grapes (pressed)"],
    },
    steps: [
      { instruction: "Press grapes to extract juice" },
      { instruction: "Add Campden tablet, wait 24 hours" },
      { instruction: "Pitch yeast and ferment at 60°F for 14 days" },
      { instruction: "Rack off lees into secondary" },
      { instruction: "Age 4 months, stabilize, then bottle" },
    ],
  },
  {
    title: "Blueberry Wine",
    type: "wine",
    style: "Fruit Wine",
    difficulty: 2,
    batch_size: 5,
    abv: 12.5,
    ibu: null,
    srm: 8,
    estimated_days: 180,
    target_og: 1.095,
    target_fg: 1.000,
    description:
      "Deep indigo fruit wine with jammy blueberry flavor. Berry wine methods from The Joy of Home Winemaking by Terry Garey.",
    ingredients: {
      malts: [],
      hops: [],
      yeast: ["Lalvin K1-V1116"],
      adjuncts: ["15 lb fresh blueberries", "10 lb sugar", "Pectic enzyme", "Yeast nutrient"],
    },
    steps: [
      { instruction: "Mash blueberries, add sugar and pectic enzyme" },
      { instruction: "Add water to 5 gallons, add Campden tablet" },
      { instruction: "After 24h, pitch yeast" },
      { instruction: "Primary ferment 7 days, stirring daily" },
      { instruction: "Rack, press, and age 5 months before bottling" },
    ],
  },
];

export const seedUserId = "00000000-0000-0000-0000-000000000001";

/**
 * Generate recipe_stages rows for a given recipe id.
 * Returns an array of stage objects ready for insert into recipe_stages.
 */
export function generateRecipeStages(recipeId: string, recipe: SeedRecipe) {
  // Simple heuristic: create 3-4 standard stages based on brew type
  const stages: { recipe_id: string; day: number; action: string; notes: string | null; sort_order: number }[] = [];

  if (recipe.type === "beer") {
    stages.push(
      { recipe_id: recipeId, day: 0, action: "Pitch yeast", notes: null, sort_order: 1 },
      { recipe_id: recipeId, day: 3, action: "Check gravity and fermentation activity", notes: "Should see krausen forming", sort_order: 2 },
      { recipe_id: recipeId, day: recipe.estimated_days > 20 ? 10 : 5, action: "Dry hop or transfer to secondary", notes: null, sort_order: 3 },
      { recipe_id: recipeId, day: recipe.estimated_days, action: "Package or cold crash", notes: "Verify final gravity before packaging", sort_order: 4 }
    );
  } else if (recipe.type === "cider") {
    stages.push(
      { recipe_id: recipeId, day: 0, action: "Pitch yeast", notes: null, sort_order: 1 },
      { recipe_id: recipeId, day: 7, action: "Check gravity", notes: null, sort_order: 2 },
      { recipe_id: recipeId, day: 14, action: "Rack to secondary", notes: null, sort_order: 3 },
      { recipe_id: recipeId, day: recipe.estimated_days, action: "Bottle with priming sugar", notes: null, sort_order: 4 }
    );
  } else if (recipe.type === "mead") {
    stages.push(
      { recipe_id: recipeId, day: 0, action: "Pitch yeast and add nutrient", notes: "Degas daily for first week", sort_order: 1 },
      { recipe_id: recipeId, day: 7, action: "Add second nutrient addition", notes: null, sort_order: 2 },
      { recipe_id: recipeId, day: 21, action: "Rack to secondary", notes: null, sort_order: 3 },
      { recipe_id: recipeId, day: recipe.estimated_days, action: "Bottle", notes: "Age further in bottle for best results", sort_order: 4 }
    );
  } else if (recipe.type === "kombucha") {
    stages.push(
      { recipe_id: recipeId, day: 0, action: "Start primary fermentation", notes: null, sort_order: 1 },
      { recipe_id: recipeId, day: 7, action: "Taste for tartness", notes: "Should be tangy but not vinegary", sort_order: 2 },
      { recipe_id: recipeId, day: recipe.estimated_days, action: "Bottle for second fermentation or drink", notes: null, sort_order: 3 }
    );
  } else if (recipe.type === "wine") {
    stages.push(
      { recipe_id: recipeId, day: 0, action: "Pitch yeast and start primary", notes: null, sort_order: 1 },
      { recipe_id: recipeId, day: 7, action: "Press and rack to secondary", notes: null, sort_order: 2 },
      { recipe_id: recipeId, day: 30, action: "First racking off lees", notes: null, sort_order: 3 },
      { recipe_id: recipeId, day: recipe.estimated_days, action: "Stabilize and bottle", notes: null, sort_order: 4 }
    );
  }

  return stages;
}
