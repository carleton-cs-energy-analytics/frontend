/**
 * Builds line graph for point selection with type numeric, float, or integer
 * Builds heatmap for other point selections that have enumeration types
 * @param  {string} type  html form element for point selector
 * @param {object} values js object with point names and values associated with selected time range
 */
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