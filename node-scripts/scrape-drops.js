import * as cheerio from 'cheerio';
import fs from 'fs';

const URL = "https://warframe-web-assets.nyc3.cdn.digitaloceanspaces.com/uploads/cms/hnfvc0o3jnfvc873njb03enrf56.html";

console.log("Starting the scraping process...");
const res = await fetch(URL);
const html = await res.text();

const $ = cheerio.load(html);

let drops_data = {}; 

function parseTable($, table) {
    const rows = [];
    $(table).find("tbody tr").each((_, tr) => {
        const cells = $(tr)
            .children("th, td")
            .map((_, cell) => $(cell).text().trim())
            .get();

        if (cells.length > 0) rows.push(cells);
    });
    return rows;
}

$("h3[id]").each((_, h3) => {
    const category = $(h3).attr("id");
    drops_data[category] = [];

    let el = $(h3).next();

    console.log(`Producing raw data for category: ${category}`);

    while (el.length && el[0].tagName !== "h3") {
        if (el[0].tagName === "table") {
            drops_data[category].push(parseTable($, el));
        }
        el = el.next();
    }

    console.log(`Finished producing raw data!`);
});

function normalizeCategoryDynamic(rawTables) {
    const normalized = [];

    for (const table of rawTables) {
        let currentGroup = null;

        for (const row of table) {
            if (row.length === 1) {
                currentGroup = { header: row[0], rows: [] };
                normalized.push(currentGroup);
                continue;
            }

            if (currentGroup) currentGroup.rows.push(row);
        }
    }

    return normalized;
}

// Apply grouping
for (const category in drops_data) {
    drops_data[category] = normalizeCategoryDynamic(drops_data[category]);
}

// Flatten the data into a more usable format
function flattenDrops(data) {
    const final = [];

    for (const category in data) {
        for (const group of data[category]) {
            const header = group.header;
            const hasColumnHeader = group.rows[0]?.includes("Source");

            let currentSource = null;

            for (let i = 0; i < group.rows.length; i++) {
                const row = group.rows[i];

                if (hasColumnHeader && i === 0) continue;

                // STANDARD TABLE
                if (row.length >= 3) {
                    const [source, dropChance, chance] = row;
                    const match = chance?.match(/(.+)\s\((.+)\)/);

                    final.push({
                        category,
                        item: header,
                        source,
                        dropChance,
                        rarity: match?.[1] || null,
                        rarityChance: match?.[2] || null
                    });
                }

                // GROUPED TABLE
                else if (row.length === 2) {
                    const [maybeSource, maybeChance] = row;

                    if (maybeChance.includes("Drop Chance")) {
                        currentSource = maybeSource;
                    } else {
                        const match = maybeChance?.match(/(.+)\s\((.+)\)/);

                        final.push({
                            category,
                            item: maybeSource,
                            source: currentSource || header,
                            dropChance: "100%",
                            rarity: match?.[1] || null,
                            rarityChance: match?.[2] || null
                        });
                    }
                }
            }
        }
    }

    return final;
}

// Save flattened data to JSON file
const flatDrops = flattenDrops(drops_data);

fs.mkdirSync("./public", { recursive: true });

fs.writeFileSync(
    "./public/warframe_drops.json",
    JSON.stringify(flatDrops, null, 2)
);

console.log("Flat JSON length:", flatDrops.length);
console.log("Scraping completed! Saved to warframe_drops.json");