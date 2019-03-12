function displaySearchResults(values, type) {
    console.log("visualization display results called");
    if (type === ":type 2 or :type 3" || type === ":type 2" || type === ":type 3") {
        d3.selectAll('#visualization svg').remove();
        buildTrendViz([values]);
    } else {
        d3.selectAll('#visualization svg').remove();
        buildHeatmapViz(values);
    }
}