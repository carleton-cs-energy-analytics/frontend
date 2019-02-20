function displaySearchResults(type, values) {
    if (type === ":type 2 or :type 3") {
        d3.selectAll('#visualization svg').remove();
        buildTrendViz([values]);
    } else {
        d3.selectAll('#visualization svg').remove();
        buildHeatmapViz(values);
    }
}