function displaySearchResults(values) {
    let viz_choice = $('input[name=visualization]:checked').val();

    if (viz_choice === 'graph') {
        d3.selectAll('#visualization svg').remove();
        $("#anomalous-points").remove();
        let pointDict = findAnomalyLines(values);
        console.log("this is point dict before it is passed: " )
        console.log(pointDict);
        buildAnomalyViz([values], pointDict);
        fillAnomalousPoints(pointDict);
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

function fillAnomalousPoints(pointDict) {
    for (let key in pointDict) {
        if (pointDict[key] === true) {
            
        }

    }

}

function findAnomalyLines(values) {
    console.log("findAnomalyLines()");
    let pointDict = {}
    for (let i = 0; i < values.length; i++) {
       let point_name = values[i]["point_name"];
       let point_match = values[i]["matches"];
       if (point_name in pointDict) {
           if (point_match === true) {
               pointDict[point_name] = point_match
           }
       } else {
           pointDict[point_name] = point_match
       }
    }

    return pointDict;
}