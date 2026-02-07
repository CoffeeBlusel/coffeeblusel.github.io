import * as cheerio from 'cheerio';
import fs from 'fs';

const URL = "https://warframe-web-assets.nyc3.cdn.digitaloceanspaces.com/uploads/cms/hnfvc0o3jnfvc873njb03enrf56.html";

console.log("Starting the scraping process...");
const res = await fetch(URL);
const html = await res.text();

const $ = cheerio.load(html);

let drops_data = {}; // Holds categories

$("h3[id]").each((_, h3) => {
    const category = $(h3).attr("id");
    drops_data[category] = [];

    let el = $(h3).next();

    while (el.length && el[0].tagName !== "H3") {
        if (el[0].tagName === "TABLE") {
            drops_data[category].push(parseTable($, el));
        }

        el = el.next();
    }
});

fs.writeFileSync(
    "./public/warframe_drops.json",
    JSON.stringify(drops_data, null, 2)
);

console.log("Scraping process completed! Data saved to warframe_drops.json");