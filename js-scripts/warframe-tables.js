const jsonFilePath = "/public/warframe_drops.json";

$(document).ready(function() {
    // Print out categories loaded from JSON file // Debug
    $.getJSON(jsonFilePath, function(data) {
        const categories = Object.keys(data);
        console.log("Categories loaded from JSON file:", categories);

        
    });
});