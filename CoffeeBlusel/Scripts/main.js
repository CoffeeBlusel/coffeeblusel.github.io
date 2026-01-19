$(document).ready(function() {
    console.log("Document is ready!"); // Page is fully loaded

    const navListItem = $("nav.top-nav div.nav-area ul li a");

    navListItem.on("mouseenter", function() {
        $(this).siblings(".slider-select").animate({ width: "100%" }, "fast");
    });

    navListItem.on("mouseleave", function() {
        $(this).siblings(".slider-select").animate({ width: "0%" }, "fast");
    });
});