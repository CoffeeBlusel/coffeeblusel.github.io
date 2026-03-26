const jsonFilePath = "/public/warframe_drops.json";

$(document).ready(function() {
    // Print out categories loaded from JSON file // Debug
    $.getJSON(jsonFilePath, function(data) {
        const categories = Object.keys(data);   // Get the categories (arrays) from the JSON data
        const values = Object.values(data);     // Get the values (arrays of items) from the JSON data
        const items = Object.entries(data);     // Get the entries (key-value pairs) from the JSON data

        console.log("Categories loaded from JSON file:", categories);
        console.log("Values loaded from JSON file:", values);
        console.log("Items loaded from JSON file:", items);
    }).fail(function(jqxhr, textStatus, error) {
        console.error("Failed to load JSON:", textStatus, error);
    });
});