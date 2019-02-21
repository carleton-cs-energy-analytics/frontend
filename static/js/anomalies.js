function displaySearchResults(values) {
    let viz_choice = $('input[name=visualization]:checked').val();

    if (viz_choice === 'graph') {
        d3.selectAll('#visualization svg').remove();
        buildTrendViz([values]);
    } else {
        buildTable(values)
    }
}

function buildTable(values) {
    let tbody = $("#result-table > table > tbody");
    tbody.empty();
    for (let i = 0; i < values.length; i++) {
        tbody.append($("<tr><th>" + values[i].point_name + "</th><td>" +
            values[i].timestamp + "</td><td>" + values[i].value + "</td></tr>"));
    }
}