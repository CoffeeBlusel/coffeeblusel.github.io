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
        const cells = $(tr).children("th, td").map((_, cell) => $(cell).text().trim()).get();
        if (cells.length > 0) rows.push(cells);
    });
    return rows;
}

$("h3[id]").each((_, h3) => {
    const category = $(h3).attr("id");
    drops_data[category] = [];

    let el = $(h3).nextAll("table").first();

    console.log(`Producing raw data for category: ${category}`); // Logging

    while (el.length && el[0].tagName === "table") {
        drops_data[category].push(parseTable($, el));
        el = el.nextAll("table").first();
    }

    console.log(`Finished producing raw data!`); // Logging
});

function normalizeCategoryDynamic(rawTables, categoryName) {
    const normalized = [];

    for (const table of rawTables) {
        let currentHeader = null;
        let currentGroup = null;

        for (const row of table) {
            if (row.length === 1) {
                // single-cell row = new header
                currentHeader = row[0];
                currentGroup = { header: currentHeader, rows: [] };
                normalized.push(currentGroup);
                continue;
            }

            // multi-cell row → add to current group
            if (currentGroup) currentGroup.rows.push(row);
        }
    }

    return normalized;
}

for (const category in drops_data) {
    drops_data[category] = normalizeCategoryDynamic(drops_data[category], category);
}


fs.mkdirSync("./public", { recursive: true });
fs.writeFileSync("./public/warframe_drops.json", JSON.stringify(drops_data, null, 2));

console.log("Drops JSON length:", JSON.stringify(drops_data).length);
console.log("Scraping process completed! Data saved to public/warframe_drops.json");
