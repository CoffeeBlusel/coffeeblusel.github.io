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

// Extract tables grouped by h3[id]
$("h3[id]").each((_, h3) => {
    const category = $(h3).attr("id");
    drops_data[category] = [];

    console.log(`Producing raw data for category: ${category}`);

    let el = $(h3).next();

    // Only grab tables UNTIL next h3
    while (el.length && el[0].tagName !== "h3") {
        if (el[0].tagName === "table") {
            drops_data[category].push(parseTable($, el));
        }
        el = el.next();
    }

    console.log(`Finished producing raw data for category: ${category}`);
});

function normalizeCategoryDynamic(rawTables, categoryName) {
    const normalized = [];

    for (const table of rawTables) {
        let currentGroup = null;

        for (const row of table) {
            if (row.length === 1) {
                // Header row
                currentGroup = { header: row[0], rows: [] };
                normalized.push(currentGroup);
                continue;
            }

            if (currentGroup) {
                currentGroup.rows.push(row);
            }
        }
    }

    return normalized;
}

// Normalize all categories
for (const category in drops_data) {
    drops_data[category] = normalizeCategoryDynamic(drops_data[category], category);
}

// Ensure output folder exists
fs.mkdirSync("./public", { recursive: true });

// Write JSON
fs.writeFileSync(
    "./public/warframe_drops.json",
    JSON.stringify(drops_data, null, 2)
);

console.log("Drops JSON length:", JSON.stringify(drops_data).length);
console.log("Scraping process completed! Data saved to public/warframe_drops.json");